import HomeClient from "./HomeClient";

export default async function Page() {
  const homeState = await fetchHomeState();
  const ui = toHomeUiState(homeState);

  return <HomeClient ui={ui} />;
}
