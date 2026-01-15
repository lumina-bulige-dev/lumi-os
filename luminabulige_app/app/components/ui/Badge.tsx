const p = resultPalette[result];

return {
  color: p.color,
  background: p.bg,
  border: `1px solid ${p.br}`,
};

// src/lib/ui.ts （UIテーマ設定ファイル）
export const ciaUi  = {
  color: {
    // ...（既存のカラー定義）...
    ok: '#22C55E',         // 例: 良好（緑系） - 定義済みと仮定
    okBg: '#DCFCE7',       // 例: 良好の背景（淡い緑）
    /** ↓不足していたカラー定義を追加 ↓ **/
    rev: '#F97316',        // 要確認状態（オレンジ系の警告色）
    revBg: '#FFEDD5',      // 要確認状態の背景色（薄いオレンジ）
    ng: '#EF4444',         // NG状態（問題あり・エラー時の赤色）
    ngBg: '#FEE2E2',       // NG状態の背景色（薄い赤）
    unknown: '#6B7280',    // 不明・未判定状態（中間的なグレー）
    unknownBg: '#F3F4F6',  // 不明状態の背景色（薄いグレー）
    // ...（他のカラー定義が続く）...
  },
  // ...（他のUI設定）...
};

    // ここを追加
  space: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40, // VClient.tsx が要求してるのはこれ
  },


 font: {
  ui: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
},
  // ...
  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.35)",
    card: "0 10px 30px rgba(0,0,0,0.35)", // もし card 参照があるならついでに
  },

  radius: {
  md: 12,
  lg: 16,
  pill: 999,
},
  
} as const;
