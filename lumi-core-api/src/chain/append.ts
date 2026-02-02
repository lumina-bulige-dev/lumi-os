function b64uFromBytes(bytes: Uint8Array): string {
  const bin = String.fromCharCode(...bytes);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256B64u(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return b64uFromBytes(new Uint8Array(digest));
}

// MVP用：安定化JSON（キーをソートして stringify）
// ※ RFC8785(JCS)の完全実装は後で重装備に移行でOK
function stableStringify(x: any): string {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return `[${x.map(stableStringify).join(",")}]`;
  const keys = Object.keys(x).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(x[k])).join(",")}}`;
}

function json(res: any, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function handleChainAppend(req: Request, env: any) {
  if (req.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);

  // 1) 入力（最小）
  // body: { chain_id, event: {type,name,body}, meta? }
  let input: any;
  try {
    input = await req.json();
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const chainId = String(input?.chain_id || "");
  const eventType = String(input?.event?.type || "");
  const eventName = String(input?.event?.name || "");
  const body = input?.event?.body ?? null;
  const meta = input?.meta ?? {};

  if (!chainId || !eventType || !eventName) {
    return json(
      { ok: false, error: "missing fields", need: ["chain_id", "event.type", "event.name"] },
      400
    );
  }

  // 2) 先頭情報を取得（なければ初期化）
  let headHeight = 0;
  let headHash = "";

  const head = await env.DB.prepare(
    `SELECT head_height, head_hash FROM user_chains WHERE chain_id = ?`
  ).bind(chainId).first();

  if (head) {
    headHeight = Number(head.head_height || 0);
    headHash = String(head.head_hash || "");
  } else {
    // 初回チェーン
    await env.DB.prepare(
      `INSERT INTO user_chains (chain_id, head_height, head_hash) VALUES (?, 0, '')`
    ).bind(chainId).run();
  }

  const height = headHeight + 1;
  const prevHash = headHash || "";

  // 3) ブロック生成
  const block = {
    v: 1,
    chain_id: chainId,
    height,
    prev_hash: prevHash,
    ts: new Date().toISOString(),
    event: {
      type: eventType,
      name: eventName,
      schema: 1,
      body,
    },
    meta,
  };

  const blockCanon = stableStringify(block);
  const blockHash = await sha256B64u(blockCanon);

  // 4) Receipt（MVP：署名は後で。まず“確定情報”を返す）
  const receipt = {
    v: 1,
    chain_id: chainId,
    height,
    block_hash: blockHash,
    prev_hash: prevHash,
    ts: block.ts,
    issuer: "lumi-core-api",
    note: "unsigned-receipt (MVP)",
  };

  // 5) INSERT（append-only）
  await env.DB.prepare(
    `INSERT INTO blocks
      (chain_id, height, block_hash, prev_hash, ts, event_type, event_name, body_json, meta_json, receipt_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      chainId,
      height,
      blockHash,
      prevHash,
      Date.now(),
      eventType,
      eventName,
      JSON.stringify(body ?? null),
      JSON.stringify(meta ?? {}),
      JSON.stringify(receipt)
    )
    .run();

  // 6) head更新
  await env.DB.prepare(
    `UPDATE user_chains SET head_height = ?, head_hash = ? WHERE chain_id = ?`
  ).bind(height, blockHash, chainId).run();

  return json({ ok: true, block_hash: blockHash, receipt });
}
