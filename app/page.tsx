import Link from "next/link";
import { CheckCircle2, Radar, ShieldAlert, Router, LockKeyhole, BellRing } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { UnlockForm } from "@/components/UnlockForm";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faqItems = [
  {
    value: "faq-1",
    trigger: "How is this different from a one-time nmap scan?",
    content:
      "A one-time scan gives raw ports. IoT Security Scanner continuously correlates your device models against known exploited CVEs, highlights what attackers are actively using, and gives prioritized fixes.",
  },
  {
    value: "faq-2",
    trigger: "Do I need enterprise networking gear?",
    content:
      "No. Install the lightweight local agent on any always-on machine in your home network. It scans your local subnet and syncs findings to your dashboard.",
  },
  {
    value: "faq-3",
    trigger: "Will this break my smart home setup?",
    content:
      "The scanner is non-intrusive and focuses on discovery plus vulnerability correlation. It does not exploit devices or change network settings automatically.",
  },
  {
    value: "faq-4",
    trigger: "Can I use it for a home office with client data?",
    content:
      "Yes. The dashboard is designed for remote workers and solo operators who need practical risk visibility without enterprise security tooling complexity.",
  },
];

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.18),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="space-y-6">
              <Badge variant="warning" className="w-fit">
                Home Network Attack Surface Monitoring
              </Badge>
              <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
                Scan home IoT devices before they become your weakest security link.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Discover every connected camera, router, lock, speaker, and hub on your network. Match each device model to
                current CVEs and get a prioritized remediation plan you can apply in one evening.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                  className="rounded-md bg-green-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-green-400"
                >
                  Protect My Network - $12/month
                </a>
                <Link
                  href="#paywall"
                  className="rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Already Purchased? Unlock
                </Link>
              </div>
              <p className="text-sm text-slate-400">Trusted by smart-home users, remote workers, and home-office consultants.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/65 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-slate-100">What you get immediately</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <Radar className="mt-0.5 h-4 w-4 text-green-300" />
                  Full subnet discovery with open port mapping for IoT endpoints.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-red-300" />
                  CVE correlation against known exploited vulnerabilities.
                </li>
                <li className="flex items-start gap-2">
                  <BellRing className="mt-0.5 h-4 w-4 text-amber-300" />
                  Continuous threat monitoring for your exact device vendors/models.
                </li>
                <li className="flex items-start gap-2">
                  <LockKeyhole className="mt-0.5 h-4 w-4 text-sky-300" />
                  Actionable hardening checklist with priority and effort guidance.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-xl border border-slate-700 bg-slate-900/45 p-6">
              <h3 className="text-lg font-semibold text-slate-100">The Problem</h3>
              <p className="mt-2 text-sm text-slate-300">
                Most homes now run 20+ connected devices, many shipped with weak defaults and long-unpatched firmware.
                Attackers target these devices because they are always on and rarely monitored.
              </p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-900/45 p-6">
              <h3 className="text-lg font-semibold text-slate-100">The Solution</h3>
              <p className="mt-2 text-sm text-slate-300">
                Install a local scanning agent, visualize your real exposure in the dashboard, then apply targeted fixes for
                high-risk devices first.
              </p>
            </article>
            <article className="rounded-xl border border-slate-700 bg-slate-900/45 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Who It Protects</h3>
              <p className="mt-2 text-sm text-slate-300">
                Built for tech-savvy homeowners, remote professionals with client data obligations, and home-office small
                businesses without a dedicated IT security team.
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-950/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-slate-100">Security outcomes, not vanity metrics</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Find unknown devices",
                  description:
                    "Detect unmanaged smart plugs, DVRs, and cameras that were quietly added and never hardened.",
                  icon: Router,
                },
                {
                  title: "Prioritize high-risk CVEs",
                  description:
                    "Surface vulnerabilities actively exploited in the wild so you can fix the biggest risks first.",
                  icon: ShieldAlert,
                },
                {
                  title: "Reduce lateral movement risk",
                  description:
                    "Get segmentation recommendations to isolate IoT from laptops, NAS storage, and work systems.",
                  icon: LockKeyhole,
                },
                {
                  title: "Track risk over time",
                  description:
                    "Monitor whether your exposure is improving after firmware updates and configuration changes.",
                  icon: CheckCircle2,
                },
              ].map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-700 bg-slate-900/45 p-5">
                  <item.icon className="h-5 w-5 text-green-400" />
                  <h3 className="mt-3 text-base font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-green-600/40 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl">
            <h2 className="text-3xl font-semibold text-slate-50">Simple pricing for serious protection</h2>
            <p className="mt-2 text-slate-300">One plan, full visibility for your home network and office devices.</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-50">$12</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>Unlimited scans for one home network</li>
              <li>Continuous CVE monitoring by device model</li>
              <li>Remediation guidance with severity-based prioritization</li>
              <li>Threat trend dashboard and historical scan records</li>
            </ul>
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
              className="mt-8 inline-flex rounded-md bg-green-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-green-400"
            >
              Buy Secure Access
            </a>
          </div>
        </section>

        <section id="paywall" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-6">
            <h2 className="text-2xl font-semibold text-slate-100">Already subscribed?</h2>
            <p className="mt-2 text-sm text-slate-300">
              Use your checkout email to issue a secure access cookie and open the scanner dashboard.
            </p>
            <div className="mt-6">
              <UnlockForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-100">FAQ</h2>
          <Accordion items={faqItems} />
        </section>
      </main>
    </>
  );
}
