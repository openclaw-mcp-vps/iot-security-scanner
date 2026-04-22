import { NextRequest, NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/lemonsqueezy";
import { lookupVulnerabilitiesForDevice } from "@/lib/vulnerability-db";
import type { DeviceRecord } from "@/lib/types";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("iot_access")?.value;
  if (!verifyAccessToken(token)) {
    return NextResponse.json(
      {
        error: "Paid access is required for vulnerability intelligence"
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const model = searchParams.get("model") ?? "unknown";
  const vendor = searchParams.get("vendor") ?? "unknown";
  const ip = searchParams.get("ip") ?? "0.0.0.0";
  const ports = (searchParams.get("ports") ?? "")
    .split(",")
    .map((port) => Number(port.trim()))
    .filter((port) => Number.isFinite(port));

  const virtualDevice: DeviceRecord = {
    id: `${ip}-${model}`,
    ip,
    mac: "unknown",
    hostname: model,
    vendor,
    model,
    type: "unknown",
    os: "unknown",
    openPorts: ports,
    scanSource: "sample",
    lastSeen: new Date().toISOString(),
    riskScore: 0,
    vulnerabilities: [],
    recommendations: []
  };

  const vulnerabilities = await lookupVulnerabilitiesForDevice(virtualDevice);

  return NextResponse.json({
    model,
    vendor,
    vulnerabilities,
    count: vulnerabilities.length
  });
}
