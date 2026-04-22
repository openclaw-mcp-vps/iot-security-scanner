import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

import { saveScanRecord } from "@/lib/database";
import { getSeverityWeight, lookupVulnerabilitiesForDevice } from "@/lib/vulnerability-db";
import type { DeviceRecord, ScanRecord, ScanSummary, Severity } from "@/lib/types";

const execFileAsync = promisify(execFile);

const discoveredDeviceSchema = z.object({
  ip: z.string(),
  mac: z.string().optional().default("unknown"),
  hostname: z.string().optional().default("unknown"),
  vendor: z.string().optional().default("unknown"),
  model: z.string().optional().default("unknown"),
  type: z
    .enum(["router", "camera", "hub", "speaker", "assistant", "appliance", "unknown"])
    .optional()
    .default("unknown"),
  os: z.string().optional().default("unknown"),
  openPorts: z.array(z.number()).optional().default([]),
  scanSource: z.enum(["nmap", "arp", "sample"]).optional().default("sample")
});

const cliOutputSchema = z.object({
  target: z.string(),
  source: z.enum(["nmap", "arp", "sample"]),
  scannedAt: z.string(),
  devices: z.array(discoveredDeviceSchema)
});

function severityTotals(devices: DeviceRecord[]) {
  const totals: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  for (const device of devices) {
    for (const vulnerability of device.vulnerabilities) {
      totals[vulnerability.severity] += 1;
    }
  }

  return totals;
}

function scoreDevice(device: DeviceRecord) {
  const vulnerabilityScore = device.vulnerabilities
    .map((entry) => getSeverityWeight(entry.severity))
    .reduce((total, score) => total + score, 0);

  const exposedPortScore = [23, 1900, 7547]
    .filter((port) => device.openPorts.includes(port))
    .length;

  return Math.min(100, vulnerabilityScore + exposedPortScore * 7);
}

function recommendationSet(device: DeviceRecord) {
  const recommendations = new Set<string>([
    "Enable automatic firmware updates and review vendor security advisories monthly.",
    "Move IoT devices to a dedicated guest or VLAN segment to isolate them from work laptops."
  ]);

  for (const vulnerability of device.vulnerabilities) {
    recommendations.add(vulnerability.action);
  }

  return [...recommendations];
}

async function executeScannerCli(target?: string) {
  const scannerPath = path.join(process.cwd(), "scanner-cli", "index.js");
  const args = [scannerPath];

  if (target && target.trim()) {
    args.push("--target", target.trim());
  }

  const { stdout } = await execFileAsync(process.execPath, args, {
    timeout: 45_000,
    maxBuffer: 5 * 1024 * 1024
  });

  const parsed = cliOutputSchema.safeParse(JSON.parse(stdout));

  if (!parsed.success) {
    throw new Error("Scanner output did not match expected schema");
  }

  return parsed.data;
}

function buildSummary(devices: DeviceRecord[]): ScanSummary {
  const severity = severityTotals(devices);
  const vulnerableDevices = devices.filter((device) => device.vulnerabilities.length > 0).length;
  const avgRisk =
    devices.length > 0
      ? Math.round(devices.reduce((sum, device) => sum + device.riskScore, 0) / devices.length)
      : 0;

  return {
    totalDevices: devices.length,
    vulnerableDevices,
    criticalFindings: severity.critical,
    highFindings: severity.high,
    mediumFindings: severity.medium,
    lowFindings: severity.low,
    overallRiskScore: avgRisk
  };
}

export async function runNetworkScan(target?: string): Promise<ScanRecord> {
  const startedAt = new Date().toISOString();
  const output = await executeScannerCli(target);

  const enrichedDevices: DeviceRecord[] = await Promise.all(
    output.devices.map(async (device, index) => {
      const base: DeviceRecord = {
        id: `${device.ip}-${device.mac}-${index}`,
        ip: device.ip,
        mac: device.mac,
        hostname: device.hostname,
        vendor: device.vendor,
        model: device.model,
        type: device.type,
        os: device.os,
        openPorts: [...new Set(device.openPorts)].sort((a, b) => a - b),
        scanSource: device.scanSource,
        lastSeen: output.scannedAt,
        riskScore: 0,
        vulnerabilities: [],
        recommendations: []
      };

      const vulnerabilities = await lookupVulnerabilitiesForDevice(base);
      const withVulnerabilities: DeviceRecord = {
        ...base,
        vulnerabilities
      };

      return {
        ...withVulnerabilities,
        riskScore: scoreDevice(withVulnerabilities),
        recommendations: recommendationSet(withVulnerabilities)
      };
    })
  );

  const summary = buildSummary(enrichedDevices);

  return saveScanRecord({
    startedAt,
    completedAt: new Date().toISOString(),
    target: output.target,
    source: output.source,
    summary,
    devices: enrichedDevices
  });
}
