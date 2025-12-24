// lumi-core-api/src/mocks/home_state.ts
import SAFE from "../../lumi-core-web/mock/home_state/home_state.safe.json";
import WARNING from "../../lumi-core-web/mock/home_state/home_state.warning.json";
import DANGER from "../../lumi-core-web/mock/home_state/home_state.danger.json";

export const MOCK_HOME_STATE = {
  safe: SAFE,
  warning: WARNING,
  danger: DANGER,
} as const;
