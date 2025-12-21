export const onRequestPost = async ({ request, env }: any) => {
  const hasCrypto = typeof (globalThis as any).crypto !== "undefined";
  const hasSubtle = !!(globalThis as any).crypto?.subtle;
  const hasImportKey = !!(globalThis as any).crypto?.subtle?.importKey;

  // まずここで「実行環境」を確定させる
  if (!hasImportKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        step: "no-importKey",
        hasCrypto,
        hasSubtle,
        hasImportKey,
        note: "このリクエストは WebCrypto が無い環境で実行されている",
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // ここまで来たら importKey はある（＝Worker/Pages Functionsのはず）
  return new Response(JSON.stringify({ ok: true, step: "importKey-ok" }), {
    headers: { "content-type": "application/json" },
  });
};
