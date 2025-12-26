// app/compare/page.tsx
export default function ComparePage() {
  return (
    <main style={{ padding: "24px", maxWidth: 840, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>他社 KYC / 信用スコアとの比較</h1>
      <p style={{ marginBottom: 24, opacity: 0.8, lineHeight: 1.7 }}>
        一般的な KYC や信用スコアリングは「本人確認」と「過去の金融履歴」に強く依存しています。
        LUMINA はそれらを否定するのではなく、
        <strong>「行動ログ」と「改ざん検知」と「本人主導の Trast / BULIG Rank」</strong>
        を重ねることで、別の軸の信用をつくることを狙っています。
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>1. 行動ログ × 改ざん検知</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          <strong>他社:</strong> 提出書類や既存の信用情報を前提に、単発の審査を行うことが多い。
          <br />
          <strong>LUMINA:</strong> 行動ログやイベントを CIA レイヤーで集約し、改ざん検知付きで保持します。
          どの時点のログをどの条件で評価したかをトレースしやすい設計です。
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>2. 本人主導の Trast / BULIG Rank</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          <strong>他社:</strong> スコアの算出ロジックがブラックボックスになりがちで、本人がコントロールしにくい。
          <br />
          <strong>LUMINA:</strong> BULIG Rank は 0–100 の加点方式インデックスとして設計され、
          何を積み上げれば信用が増えるのかを本人・企業の両方が説明しやすくなります。
          TrastPatey により、「本人が自分の証跡を束ねて提示する」ことを前提としています。
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>3. API ファーストで組み込み前提</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          <strong>他社:</strong> 独自画面・専用ポータル内で完結するケースが多く、他システムとの統合コストが高くなりがちです。
          <br />
          <strong>LUMINA:</strong> CIA / oKYC / Trast / BULIG Rank は API ベースで提供され、
          既存の会員基盤やウォレット、業務システムの中に「埋め込む」ことを前提としています。
        </p>
      </section>

      <p style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>
        ※ここでの比較は、一般的な KYC / 信用スコアサービスとのコンセプトレベルの違いを示したものであり、
        特定の事業者との機能比較・優劣を示すものではありません。
      </p>
    </main>
  );
}
