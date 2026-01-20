import { NextResponse } from "next/server";
import { reportStore } from "@/modules/lumina/lib/store";

export async function GET() {
  return NextResponse.json({ ok: true, reports: reportStore });
}
