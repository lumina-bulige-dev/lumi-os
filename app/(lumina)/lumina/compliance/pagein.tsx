export default function LuminaCompliancePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Compliance Overview</h1>
      <p className="text-sm text-neutral-600">
        Public layer guidance. This view is informational only and does not grant approval rights.
      </p>
      <ul className="list-disc space-y-2 pl-6 text-sm text-neutral-600">
        <li>Proof receipts are the source of integrity checks.</li>
        <li>Approval and decision-making occur only in the AZR layer.</li>
        <li>External views are read-only.</li>
      </ul>
    </div>
  );
}
