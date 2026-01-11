const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN
  ?? (typeof window !== "undefined" ? `${location.origin}/api` : "");

// 例: verify 側は相対 /api でOK（同一オリジン）
//     app 側は .env で https://verify.luminabulige.com/api に上書き
const url = new URL("/verify", API_ORIGIN);
