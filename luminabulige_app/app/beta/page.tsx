// app/beta/page.tsx

import React from "react";

export default function BetaPage() {
  return (
    <main
      style={{
        padding: "24px",
        maxWidth: 840,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 8,
          fontWeight: 700,
          letterSpacing: "0.16em",
        }}
      >
        LUMINA CIA / oKYC β版 待機リスト
      </h1>

      <p
        style={{
          marginBottom: 24,
          opacity: 0.8,
          lineHeight: 1.7,
          fontSize: 14,
        }}
      >
        信用情報やスコアに頼りきらず、「行動ログ」と「本人主導の Trast /
        BULIG Rank」で人柄や信頼度を見える化するためのレイヤーです。
        日本在住の外国人・海外在住日本人、ならびに従来の与信に乗りにくい人を
        主なターゲットとしています。
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 22,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          β版で試せること
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.7,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          <li>CIA レポート（行動ログベースの監査ビュー）プレビュー</li>
          <li>oKYC（owner KYC）コンセプトの事前説明</li>
          <li>Trast / BULIG Rank の設計方針・利用イメージの共有</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 22,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          β版の位置づけ
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            opacity: 0.8,
          }}
        >
          2026年9月頃までの期間は、招待制の β 版としてテスト運用を行う予定です。
          仕様や表示内容は、検証の結果に応じて変更される前提です。
          本サービスはβ版のため、仕様は予告なく変更される場合があります。
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 22,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          想定している利用者像
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.7,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          <li>日本在住の外国人 / 海外在住の日本人</li>
          <li>従来の信用情報に乗りにくいフリーランス・個人事業主</li>
          <li>従業員やクライアントの「人柄・事前確認」をしたい企業・スタートアップ</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 22,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          今後のロードマップ（予定）
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.7,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          <li>2025年内：開発者・近い業界の知人向けクローズド β</li>
          <li>2026年前半：小規模企業・スタートアップ向けパートナー導入</li>
          <li>2026年9月頃：正式な企業向け提供の開始（予定）</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 22,
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          ご案内・問い合わせ
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            opacity: 0.8,
          }}
        >
          正式リリース時に案内を受け取りたい方や、β版への興味がある企業・個人の方は、
          まずはメールにてご連絡ください。
        </p>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            opacity: 0.9,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          お問い合わせ先： contact@luminabulige.com / info@luminabulige.com
        </p>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.7,
            opacity: 0.7,
            marginTop: 8,
          }}
        >
          問い合わせ返信は、当面{" "}
          <span
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              wordBreak: "break-all",
            }}
          >
            luminabulige@gmail.com
          </span>{" "}
          から行います。
        </p>
      </section>

      <section
        style={{
          fontSize: 12,
          lineHeight: 1.7,
          opacity: 0.65,
          borderTop: "1px solid rgba(148, 163, 184, 0.3)",
          paddingTop: 16,
          marginTop: 16,
        }}
      >
        <p>
          ※本ページおよび関連画面は、開発中のデモ／β版を前提としています。
          ここで表示される内容は、将来の正式サービスの仕様・提供範囲を保証するものではありません。
        </p>
        <p>
          ※ここで表示される指標は、法的な与信判断・雇用判断などの唯一の根拠とすることを
          意図したものではありません。
        </p>
      </section>
    </main>
  );
}
