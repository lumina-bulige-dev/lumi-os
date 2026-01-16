// app/admin/page.tsx
export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: 22 }}>Admin</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        ここは管理者用。招待発行、鍵ローテ、失効、ログ確認などを集約する。
      </p>

      <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd" }}>
        次にやること：
        <ul>
          <li>招待 token 発行ボタン</li>
          <li>発行履歴</li>
          <li>失効（revocation）</li>
          <li>verify の監視</li>
        </ul>
      </div>
    </main>
  );
}
