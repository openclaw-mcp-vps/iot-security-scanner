import { NextResponse } from "next/server";
import { hasPaidAccess } from "@/lib/auth";
import { getLatestScan, persistScan, runNetworkScan } from "@/lib/scanner";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasPaidAccess())) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  const latest = await getLatestScan();
  return NextResponse.json({ scan: latest });
}

export async function POST() {
  if (!(await hasPaidAccess())) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  try {
    const scan = await runNetworkScan();
    await persistScan(scan);
    return NextResponse.json({ scan });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Failed to scan";
    return NextResponse.json({ error: details }, { status: 500 });
  }
}
