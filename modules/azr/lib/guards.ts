export function isHumanRequest(headers: Headers): boolean {
  return Boolean(headers.get("x-azr-human"));
}

export const azrGuardMessage =
  "AZR surfaces require a human operator. Automated approval is disabled.";
