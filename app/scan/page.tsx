import { TopNav } from "@/components/TopNav";
import { ScanRunner } from "@/components/ScanRunner";
import { requirePaidAccess } from "@/lib/paywall";

export default async function ScanPage() {
  await requirePaidAccess();

  return (
    <>
      <TopNav showAppLinks showLogout />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-100">Run Active Scan</h1>
          <p className="mt-2 text-sm text-slate-400">
            Trigger an immediate network assessment and correlate discovered services with known IoT vulnerabilities.
          </p>
        </div>
        <ScanRunner />
      </main>
    </>
  );
}
