import HomeClient from "./HomeClient";
import { fetchHomeState } from "./lib/api";

export default async function Page() {
  const state = await fetchHomeState();

  return <HomeClient state={state} />;
}
