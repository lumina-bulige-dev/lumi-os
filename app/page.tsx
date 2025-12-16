import HomeClient from './HomeClient';
import { fetchHomeState } from "./lib/api";


export default async function Page() {
  const homeState = await fetchHomeState();
  const ui = toHomeUiState(homeState);

  return <HomeClient ui={ui} />;
}
