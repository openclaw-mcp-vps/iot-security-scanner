import Link from "next/link";
import { AlertTriangle, Shield } from "lucide-react";
import { DeviceList } from "@/components/DeviceList";
import { SecurityScore } from "@/components/SecurityScore";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidAccess } from "@/lib/auth";
import { calculateNetworkSecurityScore, getLatestScan, getStoredDevices } from "@/lib/scanner";

export default async function DashboardPage() {
  await requirePaidAccess();

  const [devices, latestScan] = await Promise.all([getStoredDevices(), getLatestScan()]);
  const score = calculateNetworkSecurityScore(devices);
  const topFindings = devices.flatMap((device) => device.vulnerabilities).slice(0, 5);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-sm text-[#9aa4af]">Track risky devices, vulnerability exposure, and overall network hygiene.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-md border border-[#30363d] px-4 py-2 text-sm hover:bg-[#161b22]" href="/scan">
            Run Scan
          </Link>
          <Link className="rounded-md border border-[#30363d] px-4 py-2 text-sm hover:bg-[#161b22]" href="/devices">
            Device Inventory
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Detected Devices</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{devices.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Critical Devices</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-400">
            {devices.filter((device) => device.riskLevel === "critical").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Scan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#9aa4af]">
            {latestScan ? new Date(latestScan.completedAt).toLocaleString() : "No scan has been run yet."}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <SecurityScore score={score} devices={devices.length} />
        <Card>
          <CardHeader>
            <CardTitle>Immediate Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#9aa4af]">
            <p className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-blue-400" />
              Disable remote admin access on routers unless a VPN is required.
            </p>
            <p className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-400" />
              Change default credentials on every camera, lock, and thermostat.
            </p>
            <p className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-blue-400" />
              Segment IoT devices away from work laptops using guest SSID or VLANs.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top Vulnerability Alerts</h2>
        {topFindings.length > 0 ? (
          <div className="grid gap-3">{topFindings.map((finding) => <VulnerabilityAlert key={finding.id} vulnerability={finding} />)}</div>
        ) : (
          <Card>
            <CardContent>No active alerts yet. Run a scan to analyze your environment.</CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Device Snapshot</h2>
        <DeviceList devices={devices.slice(0, 6)} />
      </section>
    </div>
  );
}
