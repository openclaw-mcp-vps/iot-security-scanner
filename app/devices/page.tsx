import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { DeviceCard } from "@/components/DeviceCard";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestDevices } from "@/lib/database";

export default async function DevicesPage() {
  const devices = await getLatestDevices();
  const sortedDevices = devices.slice().sort((a, b) => b.riskScore - a.riskScore);

  const topVulnerabilities = sortedDevices
    .flatMap((device) => device.vulnerabilities)
    .sort((a, b) => {
      const severityRank = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };
      return severityRank[b.severity] - severityRank[a.severity];
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">Device inventory</h1>
            <p className="mt-1 text-slate-400">Prioritize hardening based on each device's current risk score.</p>
          </div>
          <Button asChild>
            <Link href="/scan">Run new scan</Link>
          </Button>
        </div>

        {sortedDevices.length === 0 ? (
          <Card className="border-slate-800 bg-slate-950/50">
            <CardContent className="p-8 text-center text-slate-300">
              No devices found yet. Run your first scan to build an inventory.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
            <Card className="mt-8 border-slate-800 bg-slate-950/50">
              <CardHeader>
                <CardTitle className="text-slate-100">Highest-impact findings across all devices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topVulnerabilities.length > 0 ? (
                  topVulnerabilities.map((vulnerability, index) => (
                    <VulnerabilityAlert key={`${vulnerability.id}-${index}`} vulnerability={vulnerability} />
                  ))
                ) : (
                  <p className="text-sm text-slate-300">No vulnerability matches detected in the latest scan.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
