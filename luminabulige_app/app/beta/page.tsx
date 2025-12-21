"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { loadDailyLogs, last30, summarize, type DailyLog } from "../lib/lumiStorage";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";


function getLast30Range() {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 29);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

function bytesToB64u(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Bytes(data: Uint8Array) {
  // Uint8Arrayの実データ部分だけを ArrayBuffer として渡す（型も実体も安全）
  const ab = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;

  const hash = await crypto.subtle.digest("SHA-256", ab);
  return new Uint8Array(hash);
}

async function createVerifiedPdf(payload: any) {
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadJson);
const { file, fileName } = await createVerifiedPdf(payload);
  const hashBytes = await sha256Bytes(payloadBytes);
  const hashB64u = bytesToB64u(hashBytes);

  const res = await fetch("/api/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hashB64u }),
  });
  if (!res.ok) throw new Error("sign api failed");
  const { sigB64u, kid, alg, ts } = await res.json();

  const pdf = await PDFDocument.create();

  // ★ここが重要：日本語フォントを登録
  pdf.registerFontkit(fontkit);

  // public/fonts からフォント読み込み
  const fontRes = await fetch("/fonts/NotoSansJP-Regular.otf");
  if (!fontRes.ok) throw new Error("font load failed");
  const fontBytes = new Uint8Array(await fontRes.arrayBuffer());
  const jpFont = await pdf.embedFont(fontBytes, { subset: true });

  const page = pdf.addPage([595, 842]);

  const lines = [
    "LUMI 30日ログ（Verified）",
    "",
    `alg: ${alg}  kid: ${kid}`,
    `ts: ${ts}`,
    "",
    `hashB64u: ${hashB64u}`,
    `sigB64u : ${sigB64u}`,
    "",
    "payload:",
    payloadJson,
  ];

  let y = 800;
  for (const line of lines) {
    // 日本語が混ざっても落ちない
    page.drawText(line.slice(0, 110), { x: 40, y, size: 10, font: jpFont });
    y -= 14;
    if (y < 40) break;
  }

  pdf.setSubject("LUMI Verified Log");
  pdf.setKeywords([`hash=${hashB64u}`, `sig=${sigB64u}`, `kid=${kid}`]);

  // Uint8Array -> ArrayBuffer(確実に ArrayBuffer) にコピー
function toArrayBuffer(u8: Uint8Array) {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

// ...

const pdfBytes = await pdf.save(); // Uint8Array
const ab = toArrayBuffer(pdfBytes);
const blob = new Blob([ab], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumi_verified_${payload?.range?.to || "log"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);

  return { hashB64u, sigB64u, kid };
}
function downloadFile(file: File, fileName: string) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const all = loadDailyLogs();
    setLogs(last30(all));
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);
  const range = useMemo(() => getLast30Range(), []);

  const onShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const payload = {
        share_to_label: "manual",
        range,
        counts: { SAFE: sum.safe, WARNING: sum.warning, DANGER: sum.danger },
        logs,
        url: window.location.href,
      };

      const { file, fileName } = await createVerifiedPdfFile(payload);

      // iPhone共有シート（対応してれば最優先）
      try {
        const nav: any = navigator;
        if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
          await nav.share({
            title: "LUMI 30日ログ（Verified）",
            text: `期間: ${range.from}〜${range.to}\nSAFE:${sum.safe} / WARNING:${sum.warning} / DANGER:${sum.danger}`,
            files: [file],
          });
          return;
        }
      } catch {
        // キャンセル含め握りつぶし
      }

      // フォールバック：DL
      downloadFile(file, fileName);
    } catch (e: any) {
      alert(`PDF生成に失敗: ${e?.message || e}`);
    } finally {
      setTimeout(() => setIsSharing(false), 400);
    }
  }, [isSharing, logs, range, sum.safe, sum.warning, sum.danger]);

  return (
    <main className="beta">
      <div className="page">
        <h1 className="h1">30日ログ（β）</h1>
        <div className="lead">
          Compareで「今日のログとして保存」を押すと、ここに集計が反映されます。
        </div>

        <div className="card">
          <div className="summary-title">30日のまとめ（直近30日）</div>

          <div className="pill-row">
            <div className="pill safe">SAFE : {sum.safe}日</div>
            <div className="pill warn">WARNING : {sum.warning}日</div>
            <div className="pill danger">DANGER : {sum.danger}日</div>
          </div>

          <div className="note">
            SAFE:{sum.safe} / WARNING:{sum.warning} / DANGER:{sum.danger}（記録:{sum.total}）
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" type="button" onClick={onShare}>
              {isSharing ? "PDFを生成中…" : "Verified PDF を作る"}
            </button>
          </div>

          <div className="note">※ 銀行ではありません／資金は預かりません／投資助言はしません</div>
        </div>

        <div className="card">
          <div className="summary-title">ログ一覧</div>
          <ul>
            {logs.map((l) => (
              <li key={l.date}>
                {l.date} / {l.level} / {Number(l.diffYen).toLocaleString()}円
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14 }}>
            <a href="/compare">Compareへ戻る</a>
          </div>
        </div>
      </div>
    </main>
  );
}
