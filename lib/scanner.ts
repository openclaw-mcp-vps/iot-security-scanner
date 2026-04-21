import dns from "node:dns/promises";
import { networkInterfaces } from "node:os";
import net from "node:net";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import crypto from "node:crypto";
import { readJsonFile, writeJsonFile } from "@/lib/data-store";
import { buildRecommendations, computeRiskScore, getLocalVulnerabilities } from "@/lib/vulnerability-db";
import type { DeviceRecord, ScanRecord, Severity } from "@/lib/types";

const exec = promisify(execCallback);
const DEVICES_FILE = "devices.json";
const SCANS_FILE = "scans.json";

const COMMON_PORTS = [22, 23, 53, 80, 123, 443, 445, 554, 1883, 1900, 5353, 8080, 8443, 9100];

const serviceMap: Record<number, string> = {
  22: "ssh",
  23: "telnet",
  53: "dns",
  80: "http",
  123: "ntp",
  443: "https",
  445: "smb",
  554: "rtsp",
  1883: "mqtt",
  1900: "upnp",
  5353: "mdns",
  8080: "http-alt",
  8443: "https-alt",
  9100: "jetdirect"
};

const ouiVendors: Record<string, string> = {
  "b8:27:eb": "Raspberry Pi",
  "dc:a6:32": "Raspberry Pi",
  "44:65:0d": "Amazon",
  "f4:f5:d8": "Google Nest",
  "ec:fa:bc": "TP-Link",
  "18:b4:30": "Netgear",
  "00:1f:33": "Samsung",
  "3c:5a:b4": "Sonos",
  "ac:84:c6": "Ubiquiti",
  "d8:47:32": "Espressif",
  "60:01:94": "Wyze"
};

function asRiskLevel(score: number): Severity {
  if (score < 35) return "critical";
  if (score < 55) return "high";
  if (score < 75) return "medium";
  return "low";
}

function classifyDeviceType(ports: number[]): string {
  if (ports.includes(554)) return "camera";
  if (ports.includes(9100)) return "printer";
  if (ports.includes(1883)) return "iot-hub";
  if (ports.includes(53) && (ports.includes(80) || ports.includes(443))) return "router";
  if (ports.includes(1900) || ports.includes(5353)) return "smart-device";
  return "unknown";
}

function getLocalPrefix(): string | null {
  const interfaces = networkInterfaces();

  for (const values of Object.values(interfaces)) {
    for (const entry of values ?? []) {
      if (entry.family === "IPv4" && !entry.internal && entry.address && entry.address.includes(".")) {
        const parts = entry.address.split(".");
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
  }

  return null;
}

async function discoverViaArp(): Promise<Array<{ ip: string; mac?: string }>> {
  const records = new Map<string, { ip: string; mac?: string }>();

  const parsers: Array<(output: string) => void> = [
    (output) => {
      const lines = output.split("\n");
      for (const line of lines) {
        const match = line.match(/(\d+\.\d+\.\d+\.\d+).*lladdr\s+([0-9a-f:]{17})/i);
        if (match) {
          records.set(match[1], { ip: match[1], mac: match[2].toLowerCase() });
        }
      }
    },
    (output) => {
      const lines = output.split("\n");
      for (const line of lines) {
        const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-f:]{17})/i);
        if (match) {
          records.set(match[1], { ip: match[1], mac: match[2].toLowerCase() });
        }
      }
    }
  ];

  for (const command of ["ip neigh", "arp -an", "arp -a"]) {
    try {
      const { stdout } = await exec(command, { timeout: 3000 });
      for (const parser of parsers) {
        parser(stdout);
      }
    } catch {
      continue;
    }
  }

  return Array.from(records.values());
}

function fallbackCandidates(): Array<{ ip: string; mac?: string }> {
  const prefix = getLocalPrefix();
  if (!prefix) {
    return [];
  }

  const commonHosts = [1, 2, 10, 11, 20, 21, 30, 40, 50, 60, 100, 101, 110, 150, 200];
  return commonHosts.map((host) => ({ ip: `${prefix}.${host}` }));
}

function probePort(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const close = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(450);
    socket.once("connect", () => close(true));
    socket.once("timeout", () => close(false));
    socket.once("error", () => close(false));

    socket.connect(port, ip);
  });
}

async function reverseLookup(ip: string): Promise<string | undefined> {
  try {
    const names = await dns.reverse(ip);
    return names[0];
  } catch {
    return undefined;
  }
}

function vendorFromMac(mac?: string): string | undefined {
  if (!mac) return undefined;
  const prefix = mac.slice(0, 8).toLowerCase();
  return ouiVendors[prefix];
}

async function scanHost(candidate: { ip: string; mac?: string }): Promise<DeviceRecord | null> {
  const checks = await Promise.all(COMMON_PORTS.map((port) => probePort(candidate.ip, port)));
  const openPorts = COMMON_PORTS.filter((_, idx) => checks[idx]);

  if (openPorts.length === 0) {
    return null;
  }

  const hostname = await reverseLookup(candidate.ip);
  const deviceType = classifyDeviceType(openPorts);
  const services = openPorts.map((port) => serviceMap[port]).filter((value): value is string => Boolean(value));

  const base: DeviceRecord = {
    id: crypto.createHash("sha1").update(`${candidate.ip}-${candidate.mac ?? ""}`).digest("hex").slice(0, 16),
    ip: candidate.ip,
    mac: candidate.mac,
    hostname,
    vendor: vendorFromMac(candidate.mac),
    model: hostname?.split(".")[0],
    deviceType,
    openPorts,
    services,
    riskScore: 100,
    riskLevel: "low",
    vulnerabilities: [],
    recommendations: [],
    lastSeen: new Date().toISOString()
  };

  const vulnerabilities = getLocalVulnerabilities(base);
  const recommendations = buildRecommendations(base, vulnerabilities);
  const riskScore = computeRiskScore(base, vulnerabilities);

  return {
    ...base,
    vulnerabilities,
    recommendations,
    riskScore,
    riskLevel: asRiskLevel(riskScore)
  };
}

async function mapWithConcurrency<T, U>(items: T[], limit: number, worker: (item: T) => Promise<U>): Promise<U[]> {
  const output: U[] = [];
  let index = 0;

  async function run(): Promise<void> {
    while (index < items.length) {
      const current = items[index++];
      output.push(await worker(current));
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return output;
}

function securityScore(devices: DeviceRecord[]): number {
  if (devices.length === 0) return 100;
  const sum = devices.reduce((acc, device) => acc + device.riskScore, 0);
  return Math.round(sum / devices.length);
}

export async function runNetworkScan(): Promise<ScanRecord> {
  const startedAt = Date.now();

  const viaArp = await discoverViaArp();
  const targets = viaArp.length > 0 ? viaArp : fallbackCandidates();

  const scanned = await mapWithConcurrency(targets, 24, scanHost);
  const devices = scanned.filter((item): item is DeviceRecord => Boolean(item));

  const dedupDevices = Array.from(new Map(devices.map((device) => [device.ip, device])).values());
  const score = securityScore(dedupDevices);

  return {
    id: crypto.randomUUID(),
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    deviceCount: dedupDevices.length,
    criticalCount: dedupDevices.filter((device) => device.riskLevel === "critical").length,
    score,
    devices: dedupDevices
  };
}

export async function persistScan(scan: ScanRecord): Promise<void> {
  const history = await readJsonFile<ScanRecord[]>(SCANS_FILE, []);
  history.unshift(scan);
  await writeJsonFile(SCANS_FILE, history.slice(0, 40));
  await writeJsonFile(DEVICES_FILE, scan.devices);
}

export async function getStoredDevices(): Promise<DeviceRecord[]> {
  return readJsonFile<DeviceRecord[]>(DEVICES_FILE, []);
}

export async function getLatestScan(): Promise<ScanRecord | null> {
  const history = await readJsonFile<ScanRecord[]>(SCANS_FILE, []);
  return history[0] ?? null;
}

export function calculateNetworkSecurityScore(devices: DeviceRecord[]): number {
  return securityScore(devices);
}
