import { getRequestContext } from "@cloudflare/next-on-pages";
import { ShareView } from "@/modules/lumina/components/report/share-view";

async function getReceipt(token: string) {
  const { env } = getRequestContext();
  const kv = env.LUMI_PROOFS as KVNamespace | undefined;
  if (!kv) {
    return undefined;
  }
  return kv.get(token);
}

export default async function LuminaSharePage({ params }: { params: { token: string } }) {
  const receipt = await getReceipt(params.token);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <ShareView token={params.token} receipt={receipt ?? undefined} />
      <p className="text-xs text-neutral-500">
        Proof receipts are read-only and do not imply approval or endorsement.
      </p>
    </div>
  );
}
