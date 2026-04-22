import Link from "next/link";
import { AlertTriangle, Gauge, ShieldCheck, Wifi } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { RiskTrendChart } from "@/components/RiskTrendChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestScanRecord, getRecentScans } from "@/lib/database";

export default async function DashboardPage() {
  const [latestScan, recentScans] = await Promise.all([
    getLatestScanRecord(),
    getRecentScans(8)
  ]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">Security Dashboard</h1>
            <p className="mt-1 text-slate-400">Track risk posture across all detected IoT devices.</p>
          </div>
          <Button asChild>
            <Link href="/scan">Run fresh scan</Link>
          </Button>
        </div>

        {!latestScan ? (
          <Card className="border-slate-800 bg-slate-950/50">
            <CardContent className="p-8 text-center">
              <Wifi className="mx-auto h-8 w-8 text-cyan-300" />
              <h2 className="mt-3 text-xl font-semibold text-slate-100">No scan data yet</h2>
              <p className="mt-2 text-sm text-slate-400">
                Run your first network scan to generate an inventory and vulnerability report.
              </p>
              <Button asChild className="mt-5">
                <Link href="/scan">Start first scan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-100">{latestScan.summary.totalDevices}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Vulnerable devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-300">{latestScan.summary.vulnerableDevices}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Critical findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-rose-300">{latestScan.summary.criticalFindings}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Overall risk score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-300">{latestScan.summary.overallRiskScore}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <Gauge className="h-5 w-5 text-cyan-300" />
                    Risk trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskTrendChart scans={recentScans} />
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950/50">
                <CardHeader>
                  <CardTitle className="text-slate-100">Top priorities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {latestScan.summary.criticalFindings > 0 ? (
                    <div className="rounded-lg border border-rose-800 bg-rose-950/30 p-3 text-rose-200">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Patch critical vulnerabilities first
                      </div>
                      <p className="mt-1 text-xs text-rose-100/80">
                        Address internet-facing routers and cameras with known exploit chains before lower-severity findings.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-emerald-800 bg-emerald-950/25 p-3 text-emerald-200">
                      <div className="flex items-center gap-2 font-medium">
                        <ShieldCheck className="h-4 w-4" />
                        No critical findings in latest scan
                      </div>
                      <p className="mt-1 text-xs text-emerald-100/80">
                        Keep weekly scans enabled so new CVEs tied to your models are flagged quickly.
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-slate-300">
                    <p className="font-medium text-slate-200">Last scan</p>
                    <p className="mt-1 text-xs">{new Date(latestScan.completedAt).toLocaleString()}</p>
                    <Badge className="mt-2" variant="secondary">
                      Source: {latestScan.source.toUpperCase()}
                    </Badge>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/devices">Review device inventory</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
