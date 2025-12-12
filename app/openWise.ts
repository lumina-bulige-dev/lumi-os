// app/lib/openWise.ts
export async function openWise() {
  try {
    const res = await fetch("/api/v1/links/wise", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("WISE_LINK_FAILED");
    }

    const data: { url: string } = await res.json();

    // ★ これが無いと何も起きない
    window.location.href = data.url;

  } catch (e) {
    console.error(e);
    alert("Wise の画面を開けませんでした。時間をおいて再度お試しください。");
  }
}
