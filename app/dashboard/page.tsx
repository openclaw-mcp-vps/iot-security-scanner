import { formatDistanceToNow } from "date-fns";
import { Activity, AlertTriangle, ShieldCheck, Wifi } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExposureChart } from "@/components/ExposureChart";
import { listDevices, listScans, listVulnerabilities } from "@/lib/database";
import { requirePaidAccess } from "@/lib/paywall";

export default async function DashboardPage() {
  await requirePaidAccess();

  const [scans, devices, vulnerabilities] = await Promise.all([listScans(8), listDevices(), listVulnerabilities()]);
  const critical = vulnerabilities.filter((entry) => entry.severity === "critical" || entry.severity === "high");

  const chartData = scans
    .slice()
    .reverse()
    .map((scan) => ({
      name: new Date(scan.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      devices: scan.device_count,
      critical: scan.high_severity_count,
    }));

  return (
    <>
      <TopNav showAppLinks showLogout />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-100">Security Dashboard</h1>
          <p className="text-sm text-slate-400">
            Real-time exposure summary for your home network, prioritized by exploitability and operational risk.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Devices</CardDescription>
              <CardTitle className="text-3xl">{devices.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-slate-400">
              <Wifi className="h-4 w-4 text-green-400" />
              Device inventory across latest scans
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Critical/High CVEs</CardDescription>
              <CardTitle className="text-3xl">{critical.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Immediate remediation recommended
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Scans</CardDescription>
              <CardTitle className="text-3xl">{scans.length}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="h-4 w-4 text-amber-400" />
              Includes local agent submissions
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Protection Status</CardDescription>
              <CardTitle className="text-3xl">{critical.length ? "At Risk" : "Hardened"}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              Based on latest threat correlation
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Risk Trend</CardTitle>
              <CardDescription>Device count and critical findings over recent scans.</CardDescription>
            </CardHeader>
            <CardContent>{chartData.length ? <ExposureChart data={chartData} /> : <p className="text-sm text-slate-400">Run your first scan to populate trend data.</p>}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Most recent scanner activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scans.length === 0 ? (
                <p className="text-sm text-slate-400">No scans yet. Go to Scan and start your first check.</p>
              ) : (
                scans.slice(0, 6).map((scan) => (
                  <div key={scan.id} className="rounded-md border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">{scan.network_range}</p>
                      <Badge variant={scan.status === "completed" ? "success" : "warning"}>{scan.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {scan.device_count} devices • {scan.high_severity_count} critical/high findings
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDistanceToNow(new Date(scan.started_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
