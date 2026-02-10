// app/(admin)/layout.tsx（概念）
export default function LuminaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* ① 認証・権限Provider（将来） */}
        {/* <AdminAuthProvider> */}

          {/* ② 通知（Sonner） */}
          {/* <Sonner /> */}

          {/* ③ Admin Shell */}
          {children}

        {/* </AdminAuthProvider> */}
      </body>
    </html>
  );
}
