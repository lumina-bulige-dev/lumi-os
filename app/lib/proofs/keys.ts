export const proofKvKeys = {
  report: (reportId: string) => `proof:v1:report:${reportId}`,
  share: (token: string) => `proof:v1:share:${token}`,
  consent: (subjectUserId: string, counterpartyHash: string) =>
    `proof:v1:consent:sub:${subjectUserId}:cp:${counterpartyHash}`,
};
