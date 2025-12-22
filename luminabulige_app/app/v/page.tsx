import { Suspense } from "react";
import VClient from "./v-client";

export default function Page() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Proof Verification</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280", lineHeight: 1.5 }}>
          QR/URLに含まれる情報から署名検証を行い、改ざん有無を判定します。
        </p>
      </div>

      <Suspense fallback={<div>読み込み中…</div>}>
        <VClient />
      </Suspense>
    </main>
  );
}
