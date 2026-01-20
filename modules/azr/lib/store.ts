import { AzrEvent } from "./events";

export type DecisionBacklogItem = {
  id: string;
  title: string;
  env: "prod" | "stage";
  createdAt: string;
};

export const backlogSeed: DecisionBacklogItem[] = [
  {
    id: "dec_seed_001",
    title: "Maintenance window update",
    env: "stage",
    createdAt: new Date().toISOString(),
  },
];

export const auditTrailSeed: AzrEvent[] = [
  {
    type: "SYSTEM",
    name: "decision_requested",
    occurredAt: new Date().toISOString(),
    payload: { env: "stage" },
  },
];
