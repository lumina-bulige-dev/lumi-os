import HomeClient from "./HomeClient";
import { fetchHomeState } from "./lib/api";
import { toHomeUiState } from "./lib/homeStateUi";

export default async function Page() {
  const homeState = await fetchHomeState();
  const ui = toHomeUiState(homeState);

  return <HomeClient ui={ui} />;
}
