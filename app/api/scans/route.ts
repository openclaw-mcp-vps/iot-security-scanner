import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { completeScan, createScan, listDevices, saveDevices, saveVulnerabilities } from "@/lib/database";
import { getAccessSession } from "@/lib/paywall";
import { computeRiskScore, runNetworkScan } from "@/lib/scanner";
import { fetchKnownExploitedCves, findVulnerabilitiesForDevice, generateSecurityRecommendations } from "@/lib/vulnerability-db";
import type { DeviceRecord, VulnerabilityRecord } from "@/lib/types";

const scanSchema = z.object({
  networkRange: z.string().regex(/^[0-9./]+$/, "Use CIDR format like 192.168.1.0/24"),
  devices: z
    .array(
      z.object({
        ipAddress: z.string(),
        macAddress: z.string().nullable().optional(),
        hostname: z.string().nullable().optional(),
        vendor: z.string().nullable().optional(),
        model: z.string().nullable().optional(),
        firmwareVersion: z.string().nullable().optional(),
        openPorts: z.array(z.number().int().nonnegative()),
      }),
    )
    .optional(),
});

function mapSeverityCount(vulnerabilities: Omit<VulnerabilityRecord, "id">[]) {
  return vulnerabilities.filter((entry) => entry.severity === "critical" || entry.severity === "high").length;
}

export async function GET() {
  const session = await getAccessSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const devices = await listDevices();
  return NextResponse.json({ devices });
}

export async function POST(request: Request) {
  const agentToken = request.headers.get("x-agent-token");
  const session = await getAccessSession();

  if (!session && (!agentToken || agentToken !== process.env.AGENT_SHARED_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = scanSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.errors[0]?.message || "Invalid request body" }, { status: 400 });
  }

  const payload = parsedBody.data;

  const scan = await createScan({
    networkRange: payload.networkRange,
    initiatedBy: session ? "web" : "agent",
    status: "running",
  });

  try {
    const scanOutput = payload.devices
      ? {
          networkRange: payload.networkRange,
          scannedAt: new Date().toISOString(),
          devices: payload.devices,
        }
      : await runNetworkScan(payload.networkRange);

    const scannedDevices: Omit<DeviceRecord, "id" | "scan_id" | "last_seen_at">[] = scanOutput.devices.map((device) => {
      const normalizedDevice = {
        ipAddress: device.ipAddress,
        macAddress: device.macAddress ?? null,
        hostname: device.hostname ?? null,
        vendor: device.vendor ?? null,
        model: device.model ?? null,
        firmwareVersion: device.firmwareVersion ?? null,
        openPorts: device.openPorts,
      };

      return {
        ip_address: normalizedDevice.ipAddress,
        mac_address: normalizedDevice.macAddress,
        hostname: normalizedDevice.hostname,
        vendor: normalizedDevice.vendor,
        model: normalizedDevice.model,
        firmware_version: normalizedDevice.firmwareVersion,
        open_ports: normalizedDevice.openPorts,
        risk_score: computeRiskScore(normalizedDevice),
      };
    });

    await saveDevices(scan.id, scannedDevices);

    const savedDevices = (await listDevices()).filter((device) => device.scan_id === scan.id);
    const vulnerabilities: Omit<VulnerabilityRecord, "id">[] = [];
    const recommendations = new Set<string>();

    const knownExploited = await fetchKnownExploitedCves();

    for (const device of savedDevices) {
      const found = findVulnerabilitiesForDevice({
        ipAddress: device.ip_address,
        macAddress: device.mac_address,
        hostname: device.hostname,
        vendor: device.vendor,
        model: device.model,
        firmwareVersion: device.firmware_version,
        openPorts: device.open_ports,
      });

      const enhanced = found.map((entry) => {
        const isKnownExploited = knownExploited.has(entry.cve_id.toUpperCase());
        return {
          ...entry,
          severity:
            isKnownExploited && entry.severity !== "critical"
              ? ("high" as const)
              : entry.severity,
          summary: isKnownExploited
            ? `${entry.summary} This CVE is listed in CISA's Known Exploited Vulnerabilities catalog.`
            : entry.summary,
        };
      });

      vulnerabilities.push(
        ...enhanced.map((entry) => ({
          ...entry,
          device_id: device.id,
        })),
      );

      for (const recommendation of generateSecurityRecommendations(device.open_ports, enhanced.length)) {
        recommendations.add(recommendation);
      }
    }

    if (vulnerabilities.length > 0) {
      await saveVulnerabilities(vulnerabilities);
    }

    await completeScan(scan.id, {
      deviceCount: savedDevices.length,
      highSeverityCount: mapSeverityCount(vulnerabilities),
      status: "completed",
    });

    return NextResponse.json({
      scanId: scan.id,
      devices: savedDevices,
      vulnerabilities: vulnerabilities.map((entry) => ({
        ...entry,
        id: randomUUID(),
      })),
      recommendations: [...recommendations],
    });
  } catch (error) {
    await completeScan(scan.id, {
      deviceCount: 0,
      highSeverityCount: 0,
      status: "failed",
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Scan execution failed",
      },
      { status: 500 },
    );
  }
}
