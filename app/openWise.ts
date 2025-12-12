export async function openWise() {
  const res = await fetch("/api/v1/links/wise");
  if (!res.ok) {
    alert("Wise を開けませんでした");
    return;
  }
  const { wise_referral_url } = await res.json();
  window.location.href = wise_referral_url;
}
