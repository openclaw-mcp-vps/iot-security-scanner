import { AppHeader } from "@/components/AppHeader";
import { ScanRunner } from "@/components/ScanRunner";

export default function ScanPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">Run a network scan</h1>
          <p className="mt-1 text-slate-400">
            Discover IoT devices, inspect exposed services, and check model-level vulnerabilities.
          </p>
        </div>
        <ScanRunner />
      </main>
    </div>
  );
}
