"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanProgress } from "@/components/ScanProgress";
import { DeviceCard } from "@/components/DeviceCard";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import type { DeviceRecord, VulnerabilityRecord } from "@/lib/types";

interface ScanResponse {
  scanId: string;
  devices: DeviceRecord[];
  vulnerabilities: VulnerabilityRecord[];
  recommendations: string[];
}

export function ScanRunner() {
  const [networkRange, setNetworkRange] = useState("192.168.1.0/24");
  const [stage, setStage] = useState("Ready to run a full network scan");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);

  const vulnerabilityByDevice = useMemo(() => {
    const map: Record<string, number> = {};
    for (const vulnerability of result?.vulnerabilities ?? []) {
      map[vulnerability.device_id] = (map[vulnerability.device_id] ?? 0) + 1;
    }
    return map;
  }, [result]);

  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setRunning(true);
    setStage("Discovering active hosts");
    setProgress(15);

    const progressTimer = setInterval(() => {
      setProgress((current) => {
        if (current > 88) return current;
        return current + Math.random() * 8;
      });
    }, 400);

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ networkRange }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Scan failed");
      }

      setStage("Correlating known vulnerabilities");
      const payload = (await response.json()) as ScanResponse;
      setResult(payload);
      setProgress(100);
      setStage("Scan completed");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unexpected scan error");
      setStage("Scan failed");
    } finally {
      clearInterval(progressTimer);
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={runScan} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-5">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">Start Network Scan</h2>
          <p className="text-sm text-slate-400">
            Enter your local subnet. For most homes this is <span className="font-mono">192.168.1.0/24</span>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={networkRange} onChange={(event) => setNetworkRange(event.target.value)} required />
          <Button type="submit" disabled={running}>
            {running ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
        <ScanProgress progress={progress} stage={stage} />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </form>

      {result ? (
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <h3 className="text-lg font-semibold text-slate-100">Priority Actions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {result.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>

          {result.vulnerabilities.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-100">Detected Vulnerabilities</h3>
              {result.vulnerabilities.map((vulnerability) => (
                <VulnerabilityAlert key={vulnerability.id} vulnerability={vulnerability} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-green-700/50 bg-green-950/20 p-4 text-sm text-green-200">
              No known vulnerabilities matched this scan. Keep continuous monitoring enabled to catch newly disclosed threats.
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">Discovered Devices</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  vulnerabilityCount={vulnerabilityByDevice[device.id] ?? 0}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
