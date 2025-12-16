// app/components/HomeStateUi.tsx

import { fetchHomeState, fetchWiseReferral } from "./lib/homeState";
import { toHomeUiState } from "./lib/homeStateUi";

export default async function HomePage() {
  // Worker からデータ取得
  const homeState = await fetchHomeState();
  const wise = await fetchWiseReferral();

  // UI 用の形に整形
  const ui = toHomeUiState(homeState);

  return (
    <main>
      <h1>LUMINA BULIGE HOME</h1>

      <section>
        <h2>きょうの状態</h2>
        <p>残高: {ui.balanceText}</p>
        <p>パケット: {ui.paketText}</p>
        <p>
          フロア:
          <span>{ui.floorLabel}</span>
        </p>
        <p>リスクモード: {ui.riskLabel}</p>
      </section>

      <section>
        <h2>Wise 紹介リンク</h2>
       <button onClick={openWise}>
  Wise で送金する
</button>
      </section>
    </main>
  );
}
