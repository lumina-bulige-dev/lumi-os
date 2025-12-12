"use client";

import { useEffect, useState } from "react";
import { fetchHomeState } from "./lib/api";

export default function HomeClient() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    fetchHomeState()
      .then((data) => {
        console.log("🔥 home_state", data);
        setState(data);
      })
      .catch(console.error);
  }, []);

  if (!state) return <p>Loading...</p>;

  return (
    <div>
      <h2>{state.floor_status}</h2>
      <p>残高: ¥{state.balance_total}</p>
      <p>リスク: {state.heart.risk_mode}</p>
    </div>
  );
}
