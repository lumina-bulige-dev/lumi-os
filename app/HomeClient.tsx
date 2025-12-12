"use client";

import { openWise } from "./lib/openWise";

export default function HomeClient({ ui }) {
  return (
    <>
      <p>残高: {ui.balanceText}</p>

      <button onClick={openWise}>
        Wise で送金する
      </button>
    </>
  );
}
