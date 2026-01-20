import { NextResponse } from "next/server";
import { auditTrailSeed } from "@/modules/azr/lib/store";

export async function GET() {
  return NextResponse.json({ ok: true, audit: auditTrailSeed });
}
