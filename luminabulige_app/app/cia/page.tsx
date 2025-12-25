// app/cia/page.tsx
// 既存の verify UI があるならここで import して差し替え
// import { VerifyPanel } from "@/components/verify-panel";

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
