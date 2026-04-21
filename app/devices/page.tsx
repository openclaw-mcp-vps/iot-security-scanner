import Link from "next/link";
import { DeviceList } from "@/components/DeviceList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidAccess } from "@/lib/auth";
import { getStoredDevices } from "@/lib/scanner";

export default async function DevicesPage() {
  await requirePaidAccess();
  const devices = await getStoredDevices();

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Device Inventory</h1>
          <p className="text-sm text-[#9aa4af]">Detailed view of discovered endpoints and risk indicators.</p>
        </div>
        <Link className="rounded-md border border-[#30363d] px-4 py-2 text-sm hover:bg-[#161b22]" href="/dashboard">
          Back to Dashboard
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[#9aa4af]">
          {devices.length} total devices discovered. Focus first on entries marked high or critical.
        </CardContent>
      </Card>

      <DeviceList devices={devices} />
    </div>
  );
}
