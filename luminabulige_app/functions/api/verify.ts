// functions/api/verify.ts
export const onRequestPost = async ({ request }: { request: Request }) => {
  return handleVerify(request);
};

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function envInfo() {
  const g: any = globalThis as any;
  const hasCrypto = typeof g.crypto !== "undefined";
  const hasSubtle = !!g.crypto?.subtle;
  const hasImportKey = !!g.crypto?.subtle?.importKey;
  const runtime =
    typeof (g as any).WebSocketPair !== "undefined" && typeof (g as any).caches !== "undefined"
      ? "cloudflare-workers-like"
      : typeof process !== "undefined"
      ? `node:${process.version}`
      : "unknown";
  return { hasCrypto, hasSubtle, hasImportKey, runtime };
}

async function handleVerify(request: Request): Promise<Response> {
  // 1) メソッド制御
  if (request.method !== "POST") {
    return json(
      {
        ok: false,
        error: "method_not_allowed",
        note: "Use POST",
        env: envInfo(),
      },
      { status: 405 }
    );
  }

  // 2) 実行環境チェック
  const env = envInfo();
  if (!env.hasCrypto || !env.hasSubtle || !env.hasImportKey) {
    return json(
      {
        ok: false,
        step: "no-importKey",
        note: "WebCrypto（subtle.importKey）が無い環境です",
        env,
      },
      { status: 500 }
    );
  }

  // 3) 入力パース
  let input: any = null;
  try {
    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return json(
        {
          ok: false,
          error: "unsupported_content_type",
          note: "Content-Type: application/json を指定してください",
          env,
        },
        { status: 415 }
      );
    }
    input = await request.json();
  } catch (e: any) {
    return json(
      {
        ok: false,
        error: "bad_json",
        message: e?.message || String(e),
        env,
      },
      { status: 400 }
    );
  }

  // 4) 必須パラメータ（例：Ed25519検証）
  const payload = input?.payload; // 署名対象（仕様に合わせてハッシュにするなど調整）
  const signature_b64u = input?.signature_b64u;
  const public_key_ssh = input?.public_key_ssh;

  if (!payload || !signature_b64u || !public_key_ssh) {
    return json(
      {
        ok: false,
        error: "missing_params",
        need: ["payload", "signature_b64u", "public_key_ssh"],
        got: Object.keys(input || {}),
        env,
      },
      { status: 400 }
    );
  }

  // 5) 署名・鍵をデコード（base64url / OpenSSH）
  try {
    const sig = b64uToBytes(signature_b64u);
    const { algo, rawKey } = parseOpenSshEd25519(public_key_ssh);

    if (algo !== "ssh-ed25519") {
      return json(
        {
          ok: false,
          error: "unsupported_key_algo",
          message: `expected ssh-ed25519, got ${algo}`,
          env,
        },
        { status: 400 }
      );
    }

    // 6) WebCrypto で importKey → verify
    const key = await crypto.subtle.importKey(
      "raw",
      rawKey, // 32 bytes
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    // payloadは仕様に応じてエンコード
    // - そのまま文字列署名なら UTF-8 bytes
    // - 事前にSHA-256した値に署名なら、そのbytes
    const payloadBytes = toUtf8(payload);

    const verified = await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      sig,
      payloadBytes
    );

    return json({
      ok: true,
      verified,
      algo,
      env,
    });
  } catch (e: any) {
    return json(
      {
        ok: false,
        error: "verify_failed",
        message: e?.message || String(e),
        env,
      },
      { status: 500 }
    );
  }
}

/* ----------------- 小さなユーティリティ群 ----------------- */

/** base64url → Uint8Array */
function b64uToBytes(s: string): Uint8Array {
  // padding 調整して標準base64へ
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad !== 0) throw new Error("invalid base64url");

  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/** UTF-8エンコード */
function toUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/**
 * OpenSSH形式の公開鍵（ssh-ed25519 AAAA... [comment]）を raw 32bytes に変換
 * OpenSSHの構造: base64部は "string 'ssh-ed25519' + string pubkey(32)" の連結。
 */
function parseOpenSshEd25519(line: string): { algo: string; rawKey: Uint8Array } {
  const [algo, b64, ..._rest] = line.trim().split(/\s+/);
  if (!algo || !b64) throw new Error("invalid ssh public key line");

  const blob = b64ToBytesStrict(b64);
  // blob = 4byte(len) + "ssh-ed25519" + 4byte(len) + pubkey(32)
  let off = 0;

  const readU32 = () => {
    const v = (blob[off] << 24) | (blob[off + 1] << 16) | (blob[off + 2] << 8) | blob[off + 3];
    off += 4;
    return v >>> 0;
  };
  const readBytes = (n: number) => {
    const out = blob.slice(off, off + n);
    off += n;
    return out;
  };

  const len1 = readU32();
  const type = new TextDecoder().decode(readBytes(len1));
  if (type !== "ssh-ed25519") throw new Error(`unexpected key type: ${type}`);

  const len2 = readU32();
  if (len2 !== 32) throw new Error(`unexpected ed25519 key length: ${len2}`);
  const rawKey = readBytes(len2);

  return { algo, rawKey };
}

/** 標準base64のみ（OpenSSHのblob用） */
function b64ToBytesStrict(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
