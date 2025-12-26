import HomeStateUi from "./HomeStateUi";

export default function BetaPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">LUMI β デモ</h1>
      <p className="text-sm text-slate-300">
        行動ログから「どのくらい安全っぽいか」をざっくり眺めるためのテスト画面です。
        ここではダミーの残高だけを表示します。
      </p>
      <HomeStateUi balance={123456} />
    </main>
  );
}
