"use client";

import { useEffect } from "react";

export default function HomeClient({ ui }) {
  useEffect(() => {
    console.log("🔥 HomeClient mounted (useEffect)");
  }, []);

  return (
    <button
      onClick={() => {
        console.log("🔥 CLICKED");
        alert("clicked");
      }}
    >
      TEST CLICK
    </button>
  );
}
