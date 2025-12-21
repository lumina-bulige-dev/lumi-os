import "./globals.css";

export const metadata = {
  title: "LUMINA BULIGE",
  description: "Money Flow Stabilizer OS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
