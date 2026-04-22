import { TopNav } from "@/components/TopNav";
import { DeviceCard } from "@/components/DeviceCard";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import { listDevices, getDeviceVulnerabilityCounts, listVulnerabilities } from "@/lib/database";
import { requirePaidAccess } from "@/lib/paywall";

export default async function DevicesPage() {
  await requirePaidAccess();

  const [devices, vulnerabilityCounts, vulnerabilities] = await Promise.all([
    listDevices(),
    getDeviceVulnerabilityCounts(),
    listVulnerabilities(),
  ]);

  return (
    <>
      <TopNav showAppLinks showLogout />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-3xl font-semibold text-slate-100">Device Inventory</h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete device roster with risk scoring and matched vulnerability advisories.
          </p>
        </header>

        {devices.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-sm text-slate-400">
            No devices recorded yet. Run a scan from the Scan page to populate this inventory.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} vulnerabilityCount={vulnerabilityCounts[device.id] ?? 0} />
            ))}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-100">Latest Vulnerability Intelligence</h2>
          {vulnerabilities.length === 0 ? (
            <p className="text-sm text-slate-400">No vulnerability alerts yet. This section updates automatically after each scan.</p>
          ) : (
            vulnerabilities.slice(0, 12).map((vulnerability) => <VulnerabilityAlert key={vulnerability.id} vulnerability={vulnerability} />)
          )}
        </section>
      </main>
    </>
  );
}
