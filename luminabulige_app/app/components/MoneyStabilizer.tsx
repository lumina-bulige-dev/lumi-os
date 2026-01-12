"use client";

import { useState } from "react";

type PlaceTag = "home" | "work" | "move" | "other";

export default function MoneyStabilizer() {
  const [placeTag, setPlaceTag] = useState<PlaceTag>("other");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <label className="text-xs text-slate-300">場所</label>
        <select
          className="mt-1 w-full rounded-lg bg-slate-950/60 border border-white/10 px-3 py-2"
          value={placeTag}
          onChange={(e) => setPlaceTag((e.target.value || "other") as PlaceTag)}
        >
          <option value="home">home</option>
          <option value="work">work</option>
          <option value="move">move</option>
          <option value="other">other</option>
        </select>
      </div>

      {/* 他のUI断片はここに順次復帰させていけばOK */}
    </div>
  );
}

