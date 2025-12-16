import HomeClient from "./HomeClient";
import { fetchHomeState } from "./lib/api";

export default async function Page() {
  const homeState = await fetchHomeState();

  return <HomeClient state={homeState} />;
}
