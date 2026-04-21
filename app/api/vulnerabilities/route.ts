import { NextResponse } from "next/server";
import { hasPaidAccess } from "@/lib/auth";
import { getStoredDevices } from "@/lib/scanner";
import { getLiveThreatsForDevices, startBackgroundThreatMonitor, trackNewThreats } from "@/lib/vulnerability-db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await hasPaidAccess())) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 402 });
  }

  const devices = await getStoredDevices();
  startBackgroundThreatMonitor(getStoredDevices);

  const [liveThreats, newThreats] = await Promise.all([getLiveThreatsForDevices(devices), trackNewThreats(devices)]);

  const byDevice = devices.map((device) => ({
    deviceId: device.id,
    ip: device.ip,
    hostname: device.hostname,
    deviceType: device.deviceType,
    localMatches: device.vulnerabilities,
    liveMatches: liveThreats[device.id] ?? []
  }));

  return NextResponse.json({
    devices: byDevice,
    newThreats,
    summary: {
      deviceCount: devices.length,
      totalLocalVulnerabilities: devices.reduce((acc, device) => acc + device.vulnerabilities.length, 0),
      totalLiveMatches: Object.values(liveThreats).reduce((acc, list) => acc + list.length, 0)
    }
  });
}
