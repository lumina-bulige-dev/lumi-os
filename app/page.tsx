import { fetchHomeState } from "./lib/api";
import HomeClient from "./HomeClient";

export default async function Page() {
  const homeState = await fetchHomeState();
  return <HomeClient state={homeState} />;
}
