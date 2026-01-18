// features/money-stabilizer/components/MoneyStabilizer.tsx
"use client";

import { useEffect, useId, useMemo, useState } from "react";
// MoneyStabilizer.tsx
type PlaceTag = (typeof PLACE_TAGS)[number];


// 1) 値はタプル定義 → 型を自動生成（唯一の真実）
const PLACE_TAGS = ["home", "work", "move", "other"] as const;
export type PlaceTag = (typeof PLACE_TAGS)[number];

const PLACE_LABEL: Record<PlaceTag, string> = {
  home: "home",
  work: "work",
  move: "move",
  other: "other",
};

// 型ガード（外部からの value を安全に受ける用）
function isPlaceTag(x: unknown): x is PlaceTag {
  return typeof x === "string" && (PLACE_TAGS as readonly string[]).includes(x);
}

const SAVE_KEY = "ms.placeTag";

type Props = {
  /** 外部制御したい場合に渡す（渡さないと内部stateで動作） */
  value?: PlaceTag;
  /** 内部stateで使う初期値（未指定 = "other"） */
  defaultValue?: PlaceTag;
  /** 値が変わった時（外部制御／内部どちらでも通知） */
  onChange?: (v: PlaceTag) => void;
  /** 内部state利用時のみ localStorage に保存・復元（既定: true） */
  persist?: boolean;
  /** ラベル表示文言（任意） */
  label?: string;
  /** 補助説明（任意） */
  helpText?: string;
  /** クラス追加（Tailwindなどを外から足したい時） */
  className?: string;
};

export default function MoneyStabilizer({
  value,
  defaultValue = "other",
  onChange,
  persist = true,
  label = "場所",
  helpText,
  className,
}: Props) {
  const selectId = useId();
  const describedById = useId();

  // 2) 外部からの value が無いときだけ内部stateを持つ（ハイブリッド）
  const isControlled = typeof value !== "undefined";

  const [inner, setInner] = useState<PlaceTag>(defaultValue);

  // 3) 初期復元（内部state利用時 & persist=true のときだけ）
  useEffect(() => {
    if (isControlled || !persist) return;
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved && isPlaceTag(saved)) {
        setInner(saved);
      }
    } catch {
      // 失敗しても無視（プライベートモード等）
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, persist]);

  // 4) 変更時：外部通知＋保存（内部stateのときのみ）
  const current = isControlled ? (value as PlaceTag) : inner;

  useEffect(() => {
    if (!persist || isControlled) return;
    try {
      localStorage.setItem(SAVE_KEY, current);
    } catch {
      // 失敗しても無視
    }
  }, [current, persist, isControlled]);

  const handleChange = (next: string) => {
    const normalized = isPlaceTag(next) ? next : "other";
    if (!isControlled) setInner(normalized);
    onChange?.(normalized);
  };

  // 5) コンテキストに応じた補助ヒント（必要に応じて増やせる拡張点）
  const hint = useMemo(() => {
    switch (current) {
      case "home":
        return "自宅では“固定費の見直し”が効きます（サブスク/通信/電気）。";
      case "work":
        return "職場では“平日ルーティン”の最適化（ランチ/自販機/カフェ）。";
      case "move":
        return "移動中は“衝動買い対策”（ペイ上限/リマインド）を。";
      default:
        return "状況タグを決めておくと、後から支出の傾向を読み解きやすいです。";
    }
  }, [current]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className ?? ""}`}>
      <div className="md:col-span-1">
        <label
          htmlFor={selectId}
          className="text-xs text-slate-300 block"
        >
          {label}
        </label>

        <select
          id={selectId}
          aria-describedby={helpText ? describedById : undefined}
          className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200/20"
          value={current}
          onChange={(e) => handleChange(e.target.value)}
        >
          {PLACE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {PLACE_LABEL[tag]}
            </option>
          ))}
        </select>

        <p
          id={describedById}
          className="mt-2 text-[11px] leading-5 text-slate-400"
        >
          {helpText ?? hint}
        </p>
      </div>

      {/* 他のUI断片はここに順次復帰させていけばOK */}
      {/* 例）タグごとにルールセットを切り替える、サジェストを出す等 */}
    </div>
  );
}
