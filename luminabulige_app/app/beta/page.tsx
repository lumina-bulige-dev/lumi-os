"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { loadDailyLogs, last30, summarize, type DailyLog } from "../lib/lumiStorage";

function getLast30Range() {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 29);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}
import { PDFDocument, StandardFonts } from "pdf-lib";

function bytesToB64u(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sha256Bytes(data: Uint8Array) {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

async function createVerifiedPdfFile(payload: any) {
  const payloadJson = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(payloadJson);

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
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

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
    page.drawText(line.slice(0, 110), { x: 40, y, size: 10, font });
    y -= 14;
    if (y < 40) break;
  }

  pdf.setSubject("LUMI Verified Log");
  pdf.setKeywords([`hash=${hashB64u}`, `sig=${sigB64u}`, `kid=${kid}`]);

  const pdfBytes = await pdf.save();

  const fileName = `lumi_verified_${payload?.range?.to || "log"}.pdf`;
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const file = new File([blob], fileName, { type: "application/pdf" });

  return { file, fileName, hashB64u, sigB64u, kid };
}

function downloadFile(file: File, fileName: string) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
  return { hashB64u, sigB64u, kid };
}
export default function BetaPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const all = loadDailyLogs();
    const viewLogs = last30(all);
    setLogs(viewLogs);
  }, []);

  const sum = useMemo(() => summarize(logs), [logs]);
  const range = useMemo(() => getLast30Range(), []);

  const onShare = useCallback(async () => {
  if (isSharing) return;
  setIsSharing(true);

  try {
    const payload = {
      v: 1,
      kind: "lumi_30day_verified",
      generatedAt: new Date().toISOString(),
      range,
      summary: sum,
      logs: logs.map((l) => ({
        date: l.date,
        level: l.level,
        diffYen: l.diffYen,
        balanceYen: l.balanceYen,
        floorYen: l.floorYen,
      })),
      disclaimer: "銀行ではありません／資金は預かりません／投資助言はしません",
    };

    const { file, fileName } = await createVerifiedPdfFile(payload);

    // iPhone共有（ファイル共有できる環境なら最優先）
    try {
      if (navigator.share && (navigator as any).canShare?.({ files: [file] })) {
        await navigator.share({
          title: "LUMI 30日ログ（Verified PDF）",
          files: [file],
          text: "LUMIが生成した改ざん検出つきPDFです。",
        });
        return;
      }
    } catch {
      // キャンセル等は無視してDLへ
    }

    // フォールバック：ダウンロード
    downloadFile(file, fileName);
  } finally {
    setTimeout(() => setIsSharing(false), 400);
  }
}, [isSharing, logs, range, sum]);

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
              {isSharing ? "共有を起動中…" : "シェアする"}
            </button>
          </div>

          <div className="note">
            ※ 銀行ではありません／資金は預かりません／投資助言はしません
          </div>
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
