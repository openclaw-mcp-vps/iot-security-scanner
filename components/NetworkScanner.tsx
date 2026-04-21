"use client";

import { useState } from "react";
import { LoaderCircle, RefreshCcw, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanRecord } from "@/lib/types";

export function NetworkScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST"
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Scan failed. Check permissions and try again.");
        return;
      }

      setResult(payload.scan as ScanRecord);
    } catch {
      setError("Could not reach scanner service. Ensure the app has local network access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <CardHeader className="mb-4 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Network Scanner</CardTitle>
          <p className="text-sm text-[#9aa4af]">Detects active devices, exposed ports, and immediate risk indicators.</p>
        </div>
        <Radar className="h-6 w-6 text-blue-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runScan} disabled={loading} className="w-full sm:w-auto">
          {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          {loading ? "Scanning local network..." : "Run Fresh Scan"}
        </Button>

        {error ? <p className="rounded-md border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</p> : null}

        {result ? (
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 text-sm">
            <p className="text-[#e6edf3]">Last scan completed in {(result.durationMs / 1000).toFixed(1)}s</p>
            <p className="mt-1 text-[#9aa4af]">Devices discovered: {result.deviceCount}</p>
            <p className="text-[#9aa4af]">Critical findings: {result.criticalCount}</p>
            <p className="text-[#9aa4af]">Network security score: {result.score}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
