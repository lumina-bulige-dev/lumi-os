// app/cia/page.tsx
// 既存の verify UI があるならここで import して差し替え
// import { VerifyPanel } from "@/components/verify-panel";
// app/cia/page.tsx

type KycRecord = {
  userId: string;
  displayName: string;
  kycVendor: string;
  kycStatus: string;
  kycLevel: string;
  kycReferenceId: string;
  kycVerifiedAt: number; // UNIX秒（さっきの 1766708172）
};

// いったん DB の中身をそのまま「モック」としてハードコード
const MOCK_KYC: KycRecord = {
  userId: "demo-user-001",
  displayName: "デモ太郎",
  kycVendor: "TrastDock",
  kycStatus: "VERIFIED",
  kycLevel: "LEVEL_2",
  kycReferenceId: "TDK-REF-0001",
  kycVerifiedAt: 1766708172,
};

function formatUnixToJst(ts: number) {
  // Cloudflare Pages でも動くように、シンプルに Date だけ
  return new Date(ts * 1000).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
}

export default function CiaPage() {
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

      {/* カード1: Verify（既存プレースホルダ） */}
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

      {/* カード2: KYC / TrastDock ステータス（モック） */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm space-y-3">
        <h2 className="text-base font-medium text-slate-50">
          KYC ステータス（TrastDock モック）
        </h2>

        <p className="text-xs text-slate-400">
          ※ 今は SQLite に入れてあるデモレコードを、そのままハードコード表示しています。
          あとで API / DB 連携に差し替え予定。
        </p>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-slate-500">ユーザーID</dt>
            <dd className="text-slate-100">{MOCK_KYC.userId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">表示名</dt>
            <dd className="text-slate-100">{MOCK_KYC.displayName}</dd>
          </div>

          <div>
            <dt className="text-slate-500">KYCベンダー</dt>
            <dd className="text-slate-100">{MOCK_KYC.kycVendor}</dd>
          </div>
          <div>
            <dt className="text-slate-500">KYCステータス</dt>
            <dd className="text-emerald-300 font-medium">
              {MOCK_KYC.kycStatus}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">レベル</dt>
            <dd className="text-slate-100">{MOCK_KYC.kycLevel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">参照ID</dt>
            <dd className="text-slate-100">{MOCK_KYC.kycReferenceId}</dd>
          </div>

          <div className="col-span-2">
            <dt className="text-slate-500">確認日時（JST）</dt>
            <dd className="text-slate-100">
              {formatUnixToJst(MOCK_KYC.kycVerifiedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="text-[11px] text-slate-500">
        CIA レイヤーは、「この人にどこまで任せていいか？」を
        行動ログ・KYC・レポートで一体化して説明するためのハブです。
      </p>
    </section>
  );
}
export default function CiaPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">CIA / Verify Proof</h1>
      <p className="text-sm text-slate-300">
        LUMINA の行動ログ・レポートに対する署名付き証跡を検証するページです。
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
        {/* VerifyPanel をここに */}
        <p className="text-slate-400">
          ここに <code>VerifyPanel</code> を差し込む。
          <br />
          ひとまず JSON 貼り付け → 検証 → SAFE / WARNING / DANGER 表示。
        </p>
      </div>
    </section>
  );
}
