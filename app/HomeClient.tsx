"use client";

console.log("🔥 HomeClient mounted");

export default function HomeClient({ ui }) {
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
