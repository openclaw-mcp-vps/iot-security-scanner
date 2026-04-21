import Link from "next/link";
import { NetworkScanner } from "@/components/NetworkScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidAccess } from "@/lib/auth";
import { getLatestScan } from "@/lib/scanner";

export default async function ScanPage() {
  await requirePaidAccess();
  const latest = await getLatestScan();

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Network Scan</h1>
          <p className="text-sm text-[#9aa4af]">Run active discovery and refresh your vulnerability profile.</p>
        </div>
        <Link className="rounded-md border border-[#30363d] px-4 py-2 text-sm hover:bg-[#161b22]" href="/dashboard">
          Back to Dashboard
        </Link>
      </header>

      <NetworkScanner />

      <Card>
        <CardHeader>
          <CardTitle>Scanner Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[#9aa4af]">
          <p>- Discovery first inspects ARP/neighbor tables, then probes common IoT service ports.</p>
          <p>- Results are stored locally in JSON files under `data/` for historical tracking.</p>
          <p>
            - Most recent scan:{" "}
            {latest ? `${new Date(latest.completedAt).toLocaleString()} (${latest.deviceCount} devices)` : "not available yet."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
