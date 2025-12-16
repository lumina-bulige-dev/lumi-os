// app/components/HomeStateUi.tsx
const data = await fetch(
  "https://api.luminabulige.com/api/v1/core/home_state",
  { cache: "no-store" }
).then(r => r.json());
