// app/beta/page.tsx
export default function BetaPage() {
  return (
    <main style={{ padding: "24px", maxWidth: 840, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>LUMINA CIA / oKYC β版 待機リスト</h1>
      <p style={{ marginBottom: 24, opacity: 0.8, lineHeight: 1.7 }}>
        信用情報やスコアに頼りきらず、
        「行動ログ × 改ざん検知 × oKYC」で自分の信用を自分の手に取り戻すためのレイヤーです。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>対象となる方</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 14 }}>
          <li>日本在住の外国人</li>
          <li>海外在住の日本人</li>
          <li>従来の信用情報・スコアリングに頼りたくない個人・事業者</li>
          <li>従業員やクライアントの「人柄の事前確認・準備」をしたい企業・スタートアップ</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>β版で提供予定のレイヤー</h2>

        <h3 style={{ fontSize: 18, marginTop: 12, marginBottom: 4 }}>CIAレポート</h3>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          行動ログや各種イベントをもとにした「監査ビュー」レポート。
          改ざん検知付きの JSON / PDF 出力（TrastPatey 連携）を前提とした設計です。
        </p>

        <h3 style={{ fontSize: 18, marginTop: 12, marginBottom: 4 }}>oKYC（Own KYC）</h3>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          既存の KYC に加えて、「本人が自分の履歴を提示する」ための補助レイヤー。
          国境やクレジットヒストリーに縛られにくい設計を目指しています。
        </p>

        <h3 style={{ fontSize: 18, marginTop: 12, marginBottom: 4 }}>Trast / BULIG Rank</h3>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          信用スコアではなく、「どのくらい任せられるか」を加点方式で示すインデックス。
          個人・企業のどちらにも利用できる、API ファーストの新しい信用レイヤーです。
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>開発ステータス</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          現在は一部機能のみ公開している <strong>開発者プレビュー / β版</strong> です。
          正式募集（一般ユーザー・企業向け）は <strong>2026年9月頃</strong> ごろの公開を予定しています。
          仕様・表示内容は、検証の結果に応じて変更される可能性があります。
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>待機リストのご案内</h2>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7 }}>
          正式リリース時に案内を受け取りたい方は、メールアドレスをご登録ください。
          β版・パートナー募集・本番リリースの順で、更新情報をお送りします。
          <br />
          登録フォームは現在準備中です。開発進捗にあわせて順次公開します。
        </p>
      </section>

      <p style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.6 }}>
        ※本ページおよび関連画面は、開発中のデモ・β版を前提とした情報です。
        <br />
        ※ここで表示される指標は、法的な与信判断・雇用判断・入居審査その他の決定を直接保証するものではありません。
      </p>
    </main>
  );
}
