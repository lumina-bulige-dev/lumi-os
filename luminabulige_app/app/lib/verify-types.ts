// app/lib/verify-types.ts
export type Result = "OK" | "NG" | "REVOKED" | "UNKNOWN";

export type ProofSummary = {
  proof_id?: string;
  created_at_ts?: number | string;
  range?: { from?: string | number | null; to?: string | number | null };
  counts?: { SAFE?: number; WARNING?: number; DANGER?: number; total?: number };
  ruleset_version?: string;
  payload_hash_b64u?: string;
  kid?: string;
  alg?: string;
  sig_ts?: number | string;
  status?: string;
};

export type VerifyResponse = {
  ok: boolean;
  result: Result | string;
  verified?: boolean;
  proof?: ProofSummary | null;
  kid?: string;
  alg?: string;
  payload_hash_b64u?: string;
  error?: string;
  message?: string;
  need?: string[];
  got?: any;
};
