"use client";

import { useMemo, useState } from "react";
import { ScanSearch } from "lucide-react";

import { DeviceCard } from "@/components/DeviceCard";
import { ScanProgress } from "@/components/ScanProgress";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ScanRecord } from "@/lib/types";

function flattenVulnerabilities(scan: ScanRecord) {
  return scan.devices.flatMap((device) =>
    device.vulnerabilities.map((vulnerability) => ({
      ...vulnerability,
      deviceModel: device.model,
      deviceIp: device.ip
    }))
  );
}

export function ScanRunner() {
  const [target, setTarget] = useState("192.168.1.0/24");
  const [status, setStatus] = useState("Ready to start network scan");
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const vulnerabilities = useMemo(
    () => (scanResult ? flattenVulnerabilities(scanResult) : []),
    [scanResult]
  );

  async function startScan() {
    setError(null);
    setIsScanning(true);
    setScanResult(null);
    setStatus("Discovering active hosts on your subnet...");
    setProgress(12);

    const progressTimer = window.setInterval(() => {
      setProgress((previous) => (previous < 90 ? previous + 7 : previous));
    }, 450);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ target })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Scan failed");
      }

      setStatus("Correlating device models with vulnerability intelligence...");
      const payload = (await response.json()) as { scan: ScanRecord };
      setScanResult(payload.scan);
      setProgress(100);
      setStatus("Scan complete");
    } catch (scanError) {
      const message =
        scanError instanceof Error
          ? scanError.message
          : "Unable to run scan on this host";
      setError(message);
      setStatus("Scan failed");
      setProgress(0);
    } finally {
      window.clearInterval(progressTimer);
      setIsScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <ScanSearch className="h-5 w-5 text-cyan-300" />
            Network scan control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Run a local scan range in CIDR format to discover IoT devices and check their exposure profile.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="192.168.1.0/24"
              disabled={isScanning}
            />
            <Button onClick={startScan} disabled={isScanning}>
              {isScanning ? "Scanning..." : "Start scan"}
            </Button>
          </div>
          {(isScanning || progress > 0) && <ScanProgress progress={progress} status={status} />}
          {error ? (
            <p className="rounded-md border border-rose-800 bg-rose-950/30 p-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {scanResult ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-800 bg-slate-950/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Devices found</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">{scanResult.summary.totalDevices}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-950/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Vulnerable devices</p>
                <p className="mt-1 text-2xl font-bold text-amber-300">{scanResult.summary.vulnerableDevices}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-950/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Critical findings</p>
                <p className="mt-1 text-2xl font-bold text-rose-300">{scanResult.summary.criticalFindings}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-950/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400">Risk score</p>
                <p className="mt-1 text-2xl font-bold text-cyan-300">{scanResult.summary.overallRiskScore}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 font-[var(--font-heading)] text-2xl font-semibold text-slate-100">Detected devices</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scanResult.devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-[var(--font-heading)] text-2xl font-semibold text-slate-100">Priority vulnerability alerts</h2>
            <div className="space-y-3">
              {vulnerabilities.length > 0 ? (
                vulnerabilities
                  .slice(0, 8)
                  .map((vulnerability) => (
                    <VulnerabilityAlert
                      key={`${vulnerability.id}-${vulnerability.deviceIp}`}
                      vulnerability={vulnerability}
                    />
                  ))
              ) : (
                <Card className="border-slate-800 bg-slate-950/50">
                  <CardContent className="p-4 text-sm text-slate-300">
                    No high-confidence vulnerability matches were found for the detected devices.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
