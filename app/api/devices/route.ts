import { NextResponse } from "next/server";
import { hasPaidAccess } from "@/lib/auth";
import { calculateNetworkSecurityScore, getStoredDevices } from "@/lib/scanner";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasPaidAccess())) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  const devices = await getStoredDevices();
  return NextResponse.json({
    devices,
    total: devices.length,
    score: calculateNetworkSecurityScore(devices)
  });
}
