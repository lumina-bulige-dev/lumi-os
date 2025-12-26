"use client";

import { useEffect, useState } from "react";

type KycRecord = {
  userId: string;
  displayName: string;
  kycVendor: string | null;
  kycStatus: string | null;
  kycLevel: string | null;
  kycReferenceId: string | null;
  kycVerifiedAt: number | null;
};

type CiaResponse = {
  ok: boolean;
  userId: string;
  kyc?: KycRecord | null;
  error?: string;
};

function formatUnixToJst(ts: number | null) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
}

export default function CiaPage() {
  const [data, setData] = useState<CiaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const userId = "demo-user-001";

    (async () => {
      try {
        const res = await fetch(`/api/cia?userId=${encodeURIComponent(userId)}`);
        const json: CiaResponse = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }

        setData(json);
      } catch (err) {
        console.error("CIA fetch error", err);
        setErrorMsg("KYC / CIA 情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kyc = data?.kyc || null;

  return (
    <section className="space-y-6">
      {/* ヘッダ */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">LUMI CIA Center</h1>
        <p className="text-sm text-slate-300">
          行動ログ・改ざん検証・本人確認（KYC）をまとめて扱う
          「監査ビュー」レイヤーです。
        </p>
      </header>

      {/* カード1: Verify（プレースホルダのまま） */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm space-y-2">
        <h2 className="text-base font-medium text-slate-50">
          改ざん検証（Verify）
        </h2>
        <p className="text-slate-400">
          ここに <code>VerifyPanel</code> を差し込む予定。
          <br />
          ひとまず JSON 貼り付け → 検証 → SAFE / WARNING / DANGER 表示。
        </p>
      </div>

      {/* カード2: KYC / TrastDock ステータス（DBから取得） */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm space-y-3">
        <h2 className="text-base font-medium text-slate-50">
          KYC ステータス（TrastDock）
        </h2>

        {loading && (
          <p className="text-xs text-slate-400">読み込み中…</p>
        )}

        {errorMsg && !loading && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        {!loading && !errorMsg && kyc && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-slate-500">ユーザーID</dt>
              <dd className="text-slate-100">{kyc.userId}</dd>
            </div>
            <div>
              <dt className="text-slate-500">表示名</dt>
              <dd className="text-slate-100">{kyc.displayName}</dd>
            </div>

            <div>
              <dt className="text-slate-500">KYCベンダー</dt>
              <dd className="text-slate-100">{kyc.kycVendor}</dd>
            </div>
            <div>
              <dt className="text-slate-500">KYCステータス</dt>
              <dd className="text-emerald-300 font-medium">
                {kyc.kycStatus}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">レベル</dt>
              <dd className="text-slate-100">{kyc.kycLevel}</dd>
            </div>
            <div>
              <dt className="text-slate-500">参照ID</dt>
              <dd className="text-slate-100">{kyc.kycReferenceId}</dd>
            </div>

            <div className="col-span-2">
              <dt className="text-slate-500">確認日時（JST）</dt>
              <dd className="text-slate-100">
                {formatUnixToJst(kyc.kycVerifiedAt)}
              </dd>
            </div>
          </dl>
        )}

        {!loading && !errorMsg && !kyc && (
          <p className="text-xs text-slate-400">
            該当ユーザーの KYC レコードが見つかりませんでした。
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        CIA レイヤーは、「この人にどこまで任せていいか？」を
        行動ログ・KYC・レポートで一体化して説明するためのハブです。
      </p>
    </section>
  );
}
