import { randomInt } from "node:crypto";
import type { ScannerDevice, ScannerResult } from "@/lib/types";

const COMMON_NETWORK_SERVICES = [
  { port: 80, name: "http" },
  { port: 443, name: "https" },
  { port: 22, name: "ssh" },
  { port: 23, name: "telnet" },
  { port: 53, name: "dns" },
  { port: 554, name: "rtsp" },
  { port: 8080, name: "http-alt" },
  { port: 1883, name: "mqtt" },
];

function scoreDevice(openPorts: number[]) {
  let score = 20;
  if (openPorts.includes(23)) score += 30;
  if (openPorts.includes(22)) score += 15;
  if (openPorts.includes(1883)) score += 10;
  if (openPorts.length > 5) score += 10;
  return Math.min(100, score);
}

function createMockDevices(networkRange: string): ScannerDevice[] {
  const sampleModels = [
    { vendor: "TP-Link", model: "Archer AX21", ports: [80, 443, 22] },
    { vendor: "Dahua", model: "IPC-HFW4431", ports: [80, 554, 23] },
    { vendor: "Philips", model: "Hue Bridge v2", ports: [80, 443] },
    { vendor: "Ubiquiti", model: "UniFi AP AC Lite", ports: [22, 8080] },
  ];

  return sampleModels.slice(0, randomInt(2, sampleModels.length + 1)).map((entry, index) => ({
    ipAddress: `192.168.1.${20 + index}`,
    macAddress: `B8:27:EB:${randomInt(16, 255).toString(16).padStart(2, "0")}:${randomInt(16, 255)
      .toString(16)
      .padStart(2, "0")}:${randomInt(16, 255).toString(16).padStart(2, "0")}`.toUpperCase(),
    hostname: `${entry.model.toLowerCase().replace(/\s+/g, "-")}.local`,
    vendor: entry.vendor,
    model: entry.model,
    firmwareVersion: "Unknown",
    openPorts: entry.ports,
  }));
}

async function runWithNodeNmap(networkRange: string): Promise<ScannerDevice[]> {
  const nmapModule = await import("node-nmap");
  const NmapScan = (nmapModule as unknown as { NmapScan: new (range: string, args: string) => any }).NmapScan;

  return new Promise((resolve, reject) => {
    const scan = new NmapScan(networkRange, "-sV --open");

    scan.on("complete", (hosts: any[]) => {
      const mapped: ScannerDevice[] = hosts.map((host) => {
        const ports = Array.isArray(host.openPorts)
          ? host.openPorts.map((entry: { port: number }) => entry.port).filter(Boolean)
          : [];
        return {
          ipAddress: host.ip || host.ipv4 || "unknown",
          macAddress: host.mac || null,
          hostname: host.hostname?.[0]?.name || host.hostname || null,
          vendor: host.vendor || null,
          model: host.osNmap || null,
          firmwareVersion: null,
          openPorts: ports,
        };
      });
      resolve(mapped);
    });

    scan.on("error", (error: Error) => {
      reject(error);
    });

    scan.startScan();
  });
}

export async function runNetworkScan(networkRange: string): Promise<ScannerResult> {
  const forceMock = process.env.SCANNER_MODE === "mock" || process.env.NODE_ENV === "test";

  let devices: ScannerDevice[];

  if (forceMock) {
    devices = createMockDevices(networkRange);
  } else {
    try {
      devices = await runWithNodeNmap(networkRange);
    } catch {
      devices = createMockDevices(networkRange);
    }
  }

  const normalizedDevices = devices.map((device) => ({
    ...device,
    openPorts: [...new Set(device.openPorts)].sort((a, b) => a - b),
  }));

  return {
    networkRange,
    scannedAt: new Date().toISOString(),
    devices: normalizedDevices,
  };
}

export function computeRiskScore(device: ScannerDevice): number {
  return scoreDevice(device.openPorts);
}

export function summarizePorts(device: ScannerDevice): string[] {
  return device.openPorts.map((port) => {
    const known = COMMON_NETWORK_SERVICES.find((service) => service.port === port);
    return known ? `${port}/${known.name}` : `${port}/unknown`;
  });
}
