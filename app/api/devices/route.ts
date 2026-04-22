import { NextResponse } from "next/server";
import { getAccessSession } from "@/lib/paywall";
import { getDeviceVulnerabilityCounts, listDevices } from "@/lib/database";

export async function GET() {
  const session = await getAccessSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [devices, vulnerabilityCounts] = await Promise.all([listDevices(), getDeviceVulnerabilityCounts()]);

  return NextResponse.json({
    devices: devices.map((device) => ({
      ...device,
      vulnerabilityCount: vulnerabilityCounts[device.id] ?? 0,
    })),
  });
}
