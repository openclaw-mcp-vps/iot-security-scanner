import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Radar,
  Router,
  Shield,
  ShieldAlert,
  Wifi
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Scan home IoT devices for security vulnerabilities",
  description:
    "Identify every smart device on your network, map known vulnerabilities by model, and get practical actions to reduce attack surface in your home office."
};

const faq = [
  {
    question: "Will this scan devices outside my home network?",
    answer:
      "No. The scanner is designed for your local network segment and only inspects reachable LAN devices and their exposed services."
  },
  {
    question: "Does this replace antivirus software?",
    answer:
      "No. It complements endpoint security by focusing on unmanaged IoT equipment such as cameras, routers, hubs, and smart appliances."
  },
  {
    question: "How quickly are new vulnerabilities surfaced?",
    answer:
      "The dashboard checks known vulnerability feeds and flags newly relevant CVEs for your detected device models after each scan."
  },
  {
    question: "Can I use this for a small home office?",
    answer:
      "Yes. It is built for prosumer and home-office setups where enterprise SOC tooling is excessive but risk is still real."
  }
];

const stats = [
  "Most smart homes run 20+ connected endpoints.",
  "Default credentials remain one of the most exploited IoT weaknesses.",
  "Botnet campaigns routinely target consumer routers and IP cameras."
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-900/30 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200">
              <Shield className="h-3.5 w-3.5" />
              Security tools for smart homes and home offices
            </p>
            <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight text-slate-100 sm:text-5xl">
              Scan home IoT devices for security vulnerabilities before attackers do.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              IoT Security Scanner discovers devices on your local network, checks their model families against known CVEs, and gives concrete hardening steps you can apply immediately.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="font-semibold">
                <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}>Start protecting your network for $12/mo</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/access/success">I already purchased</Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Hosted Stripe checkout. No card data touches your app.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-950/60">
            <CardHeader>
              <CardTitle className="text-slate-100">What you get in each scan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Radar className="mt-0.5 h-4 w-4 text-cyan-300" />
                <p>Device discovery across local subnets with host fingerprinting and service exposure mapping.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-300" />
                <p>Vulnerability matching against known IoT weaknesses and model-specific CVE intelligence.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-emerald-300" />
                <p>Actionable recommendations prioritized by exploitability, not generic security advice.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="border-y border-slate-800/80 bg-slate-900/30">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {stats.map((item) => (
              <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                <AlertTriangle className="mb-2 h-4 w-4 text-amber-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">Why this matters now</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Home networks have become hybrid work infrastructure. A compromised camera, router, or smart assistant can become a foothold into laptops containing client files, payroll access, or confidential communications.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card className="border-slate-800 bg-slate-950/50">
              <CardHeader>
                <CardTitle className="text-lg">1. Discover</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                Scan your live network and inventory every detected IoT endpoint, including devices you forgot were online.
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-950/50">
              <CardHeader>
                <CardTitle className="text-lg">2. Assess</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                Correlate open services and device models with vulnerability data to prioritize practical risk.
              </CardContent>
            </Card>
            <Card className="border-slate-800 bg-slate-950/50">
              <CardHeader>
                <CardTitle className="text-lg">3. Harden</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                Follow model-specific remediation steps: firmware updates, admin lock-down, and safer network segmentation.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <Card className="border-emerald-700/40 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-950">
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <h3 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">Simple pricing for ongoing protection</h3>
                <p className="mt-3 text-slate-300">
                  <span className="text-4xl font-bold text-emerald-300">$12</span>
                  <span className="ml-2 text-slate-400">/ month</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-200">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Unlimited scans and device inventory</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />New vulnerability alerts mapped to your device models</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Action plans for high-risk exposures</li>
                </ul>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-300">Paywall-protected dashboard with cookie-based access after successful checkout.</p>
                <Button asChild className="mt-4 w-full" size="lg">
                  <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}>Buy with Stripe</a>
                </Button>
                <Button asChild variant="secondary" className="mt-3 w-full">
                  <Link href="/access/success">Activate existing purchase</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="font-[var(--font-heading)] text-3xl font-semibold text-slate-100">FAQ</h2>
          <Separator className="my-6" />
          <div className="grid gap-4 md:grid-cols-2">
            {faq.map((entry) => (
              <Card key={entry.question} className="border-slate-800 bg-slate-950/50">
                <CardContent className="p-5">
                  <p className="font-semibold text-slate-100">{entry.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{entry.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm text-slate-400">
            <Wifi className="h-4 w-4" />
            Built for tech-savvy homeowners, remote workers, and small home-office operators.
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <Router className="h-4 w-4" />
            Scan locally. Keep visibility over the devices that actually exist on your network.
          </div>
        </section>
      </main>
    </div>
  );
}
