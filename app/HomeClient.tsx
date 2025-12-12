"use client";

export default function HomeClient({ ui }) {
  return (
    <div>
      <h2>{ui.floorStatus}</h2>
      <p>残高: ¥{ui.balanceTotal}</p>
      <p>リスク: {ui.riskMode}</p>
    </div>
  );
}
