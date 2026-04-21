import Link from "next/link";
import { ShieldCheck, ShieldAlert, Wifi, BellRing } from "lucide-react";
import { hasPaidAccess } from "@/lib/auth";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";

export default async function HomePage() {
  const unlocked = await hasPaidAccess();
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <div className="space-y-16 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[#9aa4af]">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          IoT Security Scanner
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-[#9aa4af] hover:text-white" href="#faq">
            FAQ
          </Link>
          <Link className="text-[#9aa4af] hover:text-white" href="#pricing">
            Pricing
          </Link>
          {unlocked ? (
            <Link href="/dashboard" className="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-400">
              Open Dashboard
            </Link>
          ) : (
            <a
              href={stripePaymentLink}
              className="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-400"
              target="_blank"
              rel="noreferrer"
            >
              Start Protection
            </a>
          )}
        </div>
      </header>

      <section className="grid gap-8 rounded-2xl border border-[#30363d] bg-gradient-to-br from-[#1c2635] via-[#0f1722] to-[#0d1117] p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
        <div>
          <p className="mb-3 inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
            Scan home IoT devices for security vulnerabilities
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            See exactly which smart devices are putting your network at risk.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#9aa4af] md:text-lg">
            IoT Security Scanner maps your local network, detects exposed services, and checks device fingerprints against known
            vulnerability data so you can lock down weak cameras, routers, and hubs before attackers find them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={stripePaymentLink}
              className="rounded-md bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
              target="_blank"
              rel="noreferrer"
            >
              Buy Access - $12/month
            </a>
            <Link href="/scan" className="rounded-md border border-[#30363d] px-6 py-3 font-semibold text-[#e6edf3] hover:bg-[#161b22]">
              View Scanner UI
            </Link>
          </div>
          {!unlocked ? <UnlockAccessForm /> : null}
        </div>
        <div className="space-y-4 rounded-xl border border-[#30363d] bg-[#0d1117]/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#9aa4af]">What you get</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Wifi className="mt-0.5 h-4 w-4 text-blue-400" />
              <p>Rapid local scan to enumerate active devices and exposed management ports.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-red-400" />
              <p>Per-device risk scoring with known vulnerability correlation and prioritized fixes.</p>
            </div>
            <div className="flex items-start gap-3">
              <BellRing className="mt-0.5 h-4 w-4 text-yellow-400" />
              <p>Ongoing threat tracking so new CVEs targeting your detected models trigger alerts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" id="problem">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="text-lg font-semibold">Hidden Device Sprawl</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            Most homes now run 20+ connected devices, but owners usually can’t name half of what is online.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="text-lg font-semibold">Default Credential Risk</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            Smart cameras and DVRs still ship with weak defaults that botnets probe continuously.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
          <h3 className="text-lg font-semibold">Patch Blind Spots</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            Firmware updates are irregular, leaving critical CVEs unpatched for months or years.
          </p>
        </div>
      </section>

      <section id="solution" className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8">
        <h2 className="text-2xl font-bold">Solution Workflow</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <p className="text-xs uppercase tracking-wide text-blue-300">Step 1</p>
            <h3 className="mt-1 font-semibold">Scan Local Network</h3>
            <p className="mt-2 text-sm text-[#9aa4af]">Discover active IoT endpoints and enumerate security-relevant ports.</p>
          </div>
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <p className="text-xs uppercase tracking-wide text-blue-300">Step 2</p>
            <h3 className="mt-1 font-semibold">Correlate Vulnerabilities</h3>
            <p className="mt-2 text-sm text-[#9aa4af]">Match detected device fingerprints with known CVE patterns and severity.</p>
          </div>
          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
            <p className="text-xs uppercase tracking-wide text-blue-300">Step 3</p>
            <h3 className="mt-1 font-semibold">Apply Hardening Plan</h3>
            <p className="mt-2 text-sm text-[#9aa4af]">Follow prioritized fixes: segmentation, firmware updates, and service lockdown.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="rounded-2xl border border-blue-500/40 bg-[#111a28] p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-blue-300">Simple Pricing</p>
        <h2 className="mt-2 text-3xl font-bold">$12/month</h2>
        <p className="mt-3 text-[#9aa4af]">Unlimited scans, device-level risk scores, vulnerability tracking, and alert-ready recommendations.</p>
        <a
          href={stripePaymentLink}
          className="mt-6 inline-flex rounded-md bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
          target="_blank"
          rel="noreferrer"
        >
          Buy with Stripe Checkout
        </a>
      </section>

      <section id="faq" className="space-y-4">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <h3 className="font-semibold">Does this scan leave my network?</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            No. Device discovery runs from your app server against your local network range. Only vulnerability metadata queries
            leave your network.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <h3 className="font-semibold">How is access enforced after payment?</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            Payment completion is recorded through a Stripe webhook. You claim access once using your checkout session ID, and the
            app sets a signed HTTP-only cookie to unlock scanner routes.
          </p>
        </div>
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <h3 className="font-semibold">Who is this best for?</h3>
          <p className="mt-2 text-sm text-[#9aa4af]">
            Smart-home owners, remote workers, and home-office operators who need practical visibility without enterprise tooling.
          </p>
        </div>
      </section>
    </div>
  );
}
