const os = require("node:os");
const { exec } = require("node:child_process");
const { promisify } = require("node:util");
const nmap = require("node-nmap");

const execAsync = promisify(exec);
const SCAN_PORTS = "22,23,53,80,443,554,1883,1900,5353,7547,8080,8443";

nmap.nmapLocation = process.env.NMAP_PATH || "nmap";

const vendorLookup = {
  "00:1a:79": "Cisco",
  "00:1f:90": "Google",
  "00:1d:6a": "Apple",
  "18:b4:30": "TP-Link",
  "20:aa:4b": "Amazon",
  "dc:a6:32": "Ring",
  "ec:71:db": "Xiaomi",
  "fc:db:b3": "Ubiquiti",
  "44:65:0d": "D-Link",
  "3c:84:6a": "Hikvision"
};

function getDefaultTarget() {
  const interfaces = os.networkInterfaces();

  for (const list of Object.values(interfaces)) {
    if (!list) {
      continue;
    }

    for (const details of list) {
      if (details.family !== "IPv4" || details.internal) {
        continue;
      }

      if (details.address.startsWith("192.168.") || details.address.startsWith("10.")) {
        const octets = details.address.split(".");
        return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
      }

      if (details.address.startsWith("172.")) {
        const octets = details.address.split(".");
        const second = Number(octets[1]);
        if (second >= 16 && second <= 31) {
          return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
        }
      }
    }
  }

  return "192.168.1.0/24";
}

function normalizeMac(mac) {
  if (!mac) {
    return "unknown";
  }

  return mac.toLowerCase().replace(/-/g, ":");
}

function inferVendor(mac, fallbackVendor) {
  if (fallbackVendor && fallbackVendor !== "unknown") {
    return fallbackVendor;
  }

  const normalizedMac = normalizeMac(mac);
  const prefix = normalizedMac.slice(0, 8);
  return vendorLookup[prefix] || "unknown";
}

function inferType(hostname, vendor, ports) {
  const descriptor = `${hostname} ${vendor}`.toLowerCase();

  if (
    descriptor.includes("router") ||
    descriptor.includes("gateway") ||
    ports.includes(53) ||
    ports.includes(7547)
  ) {
    return "router";
  }

  if (
    descriptor.includes("cam") ||
    descriptor.includes("ring") ||
    descriptor.includes("hik") ||
    ports.includes(554)
  ) {
    return "camera";
  }

  if (descriptor.includes("homepod") || descriptor.includes("echo") || descriptor.includes("speaker")) {
    return "speaker";
  }

  if (
    descriptor.includes("hub") ||
    descriptor.includes("bridge") ||
    descriptor.includes("home assistant")
  ) {
    return "hub";
  }

  if (descriptor.includes("alexa") || descriptor.includes("google nest")) {
    return "assistant";
  }

  if (
    descriptor.includes("tv") ||
    descriptor.includes("fridge") ||
    descriptor.includes("washer") ||
    descriptor.includes("plug")
  ) {
    return "appliance";
  }

  return "unknown";
}

function inferModel(vendor, hostname, type) {
  if (hostname && hostname !== "unknown") {
    return hostname;
  }

  if (vendor && vendor !== "unknown") {
    return `${vendor} ${type === "unknown" ? "device" : type}`;
  }

  return "unknown";
}

function normalizeHost(rawHost, source) {
  const ip = rawHost.ip || rawHost.ipv4 || rawHost.address || "unknown";
  const mac = normalizeMac(rawHost.mac || rawHost.macAddress || rawHost.macaddr);
  const hostname = rawHost.hostname || rawHost.host || rawHost.name || "unknown";
  const vendor = inferVendor(mac, rawHost.vendor || rawHost.macVendor || "unknown");

  const ports = Array.isArray(rawHost.openPorts)
    ? rawHost.openPorts
        .map((entry) =>
          typeof entry === "number"
            ? entry
            : Number(entry.port || entry.number || entry.servicePort)
        )
        .filter((port) => Number.isFinite(port))
    : [];

  const type = inferType(hostname, vendor, ports);

  return {
    ip,
    mac,
    hostname,
    vendor,
    model: inferModel(vendor, hostname, type),
    type,
    os: rawHost.osNmap || rawHost.os || "unknown",
    openPorts: [...new Set(ports)].sort((a, b) => a - b),
    scanSource: source
  };
}

function discoverWithNmap(target) {
  return new Promise((resolve, reject) => {
    const quickScan = new nmap.QuickScan(target, SCAN_PORTS);

    quickScan.on("complete", (data) => {
      const normalized = Array.isArray(data)
        ? data
            .map((host) => normalizeHost(host, "nmap"))
            .filter((host) => host.ip !== "unknown")
        : [];
      resolve(normalized);
    });

    quickScan.on("error", (error) => {
      reject(error);
    });

    quickScan.startScan();
  });
}

function parseArpOutput(stdout) {
  const devices = [];
  const lines = stdout.split(/\r?\n/);

  for (const line of lines) {
    const unixMatch = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-fA-F:-]{11,17})\s+/);
    if (unixMatch) {
      const [, ip, macRaw] = unixMatch;
      const mac = normalizeMac(macRaw);
      const vendor = inferVendor(mac, "unknown");
      const type = inferType("unknown", vendor, []);

      devices.push({
        ip,
        mac,
        hostname: "unknown",
        vendor,
        model: inferModel(vendor, "unknown", type),
        type,
        os: "unknown",
        openPorts: [],
        scanSource: "arp"
      });
      continue;
    }

    const windowsMatch = line.match(/\s*(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]{11,17})\s+(dynamic|static)/);
    if (windowsMatch) {
      const [, ip, macRaw] = windowsMatch;
      const mac = normalizeMac(macRaw);
      const vendor = inferVendor(mac, "unknown");
      const type = inferType("unknown", vendor, []);

      devices.push({
        ip,
        mac,
        hostname: "unknown",
        vendor,
        model: inferModel(vendor, "unknown", type),
        type,
        os: "unknown",
        openPorts: [],
        scanSource: "arp"
      });
    }
  }

  const unique = new Map();
  for (const device of devices) {
    unique.set(device.ip, device);
  }

  return [...unique.values()];
}

async function discoverWithArp() {
  try {
    const { stdout } = await execAsync("arp -a", { timeout: 10000 });
    return parseArpOutput(stdout);
  } catch {
    return [];
  }
}

async function discoverDevices(target) {
  let devices = [];
  let source = "sample";

  try {
    devices = await discoverWithNmap(target);
    if (devices.length > 0) {
      source = "nmap";
    }
  } catch {
    devices = [];
  }

  if (devices.length === 0) {
    const arpDevices = await discoverWithArp();
    if (arpDevices.length > 0) {
      devices = arpDevices;
      source = "arp";
    }
  }

  if (devices.length === 0) {
    devices = [
      {
        ip: "192.168.1.1",
        mac: "44:65:0d:11:22:33",
        hostname: "home-gateway",
        vendor: "D-Link",
        model: "D-Link router",
        type: "router",
        os: "embedded-linux",
        openPorts: [80, 443, 1900],
        scanSource: "sample"
      },
      {
        ip: "192.168.1.22",
        mac: "3c:84:6a:11:22:44",
        hostname: "front-door-cam",
        vendor: "Hikvision",
        model: "Hikvision camera",
        type: "camera",
        os: "embedded-linux",
        openPorts: [80, 554],
        scanSource: "sample"
      }
    ];
    source = "sample";
  }

  return {
    target,
    source,
    scannedAt: new Date().toISOString(),
    devices
  };
}

module.exports = {
  discoverDevices,
  getDefaultTarget
};
