#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node 20+ and run again."
  exit 1
fi

if ! command -v nmap >/dev/null 2>&1; then
  echo "nmap is required. Install it first (brew install nmap / apt install nmap)."
  exit 1
fi

APP_URL="${1:-}"
AGENT_TOKEN="${2:-}"
NETWORK_RANGE="${3:-192.168.1.0/24}"

if [[ -z "$APP_URL" || -z "$AGENT_TOKEN" ]]; then
  echo "Usage: ./scripts/install-agent.sh <APP_URL> <AGENT_SHARED_SECRET> [NETWORK_RANGE]"
  echo "Example: ./scripts/install-agent.sh https://scanner.example.com supersecret 192.168.1.0/24"
  exit 1
fi

AGENT_DIR="$HOME/.iot-security-scanner-agent"
mkdir -p "$AGENT_DIR"

cat > "$AGENT_DIR/agent.js" <<'AGENT'
const { NmapScan } = require("node-nmap");

const appUrl = process.env.APP_URL;
const token = process.env.AGENT_TOKEN;
const networkRange = process.env.NETWORK_RANGE || "192.168.1.0/24";

if (!appUrl || !token) {
  console.error("APP_URL and AGENT_TOKEN are required.");
  process.exit(1);
}

function runScan() {
  return new Promise((resolve, reject) => {
    const scan = new NmapScan(networkRange, "-sV --open");

    scan.on("complete", (hosts) => {
      const devices = hosts.map((host) => ({
        ipAddress: host.ip || host.ipv4 || "unknown",
        macAddress: host.mac || null,
        hostname: host.hostname?.[0]?.name || host.hostname || null,
        vendor: host.vendor || null,
        model: host.osNmap || null,
        firmwareVersion: null,
        openPorts: Array.isArray(host.openPorts)
          ? host.openPorts.map((entry) => entry.port).filter(Boolean)
          : [],
      }));
      resolve(devices);
    });

    scan.on("error", reject);
    scan.startScan();
  });
}

async function submit() {
  try {
    const devices = await runScan();
    const response = await fetch(`${appUrl.replace(/\/$/, "")}/api/scans`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-agent-token": token,
      },
      body: JSON.stringify({ networkRange, devices }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Scan submit failed (${response.status}): ${text}`);
    }

    console.log(`[iot-agent] submitted ${devices.length} devices`);
  } catch (error) {
    console.error("[iot-agent]", error.message || error);
    process.exit(1);
  }
}

submit();
AGENT

cat > "$AGENT_DIR/run-agent.sh" <<RUNNER
#!/usr/bin/env bash
set -euo pipefail
APP_URL="$APP_URL" \
AGENT_TOKEN="$AGENT_TOKEN" \
NETWORK_RANGE="$NETWORK_RANGE" \
node "$AGENT_DIR/agent.js"
RUNNER

chmod +x "$AGENT_DIR/run-agent.sh"

if command -v npm >/dev/null 2>&1; then
  if [[ ! -f "$AGENT_DIR/package.json" ]]; then
    cat > "$AGENT_DIR/package.json" <<'PKG'
{
  "name": "iot-security-scanner-agent",
  "private": true,
  "dependencies": {
    "node-nmap": "^4.0.0"
  }
}
PKG
  fi
  (cd "$AGENT_DIR" && npm install --omit=dev >/dev/null)
fi

if command -v crontab >/dev/null 2>&1; then
  CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
  JOB="*/30 * * * * $AGENT_DIR/run-agent.sh >> $AGENT_DIR/agent.log 2>&1"
  if ! grep -F "$AGENT_DIR/run-agent.sh" <<<"$CURRENT_CRON" >/dev/null; then
    (echo "$CURRENT_CRON"; echo "$JOB") | crontab -
    echo "Installed cron job to run every 30 minutes."
  else
    echo "Cron job already exists."
  fi
fi

echo "Agent installed in $AGENT_DIR"
echo "Run once now: $AGENT_DIR/run-agent.sh"
