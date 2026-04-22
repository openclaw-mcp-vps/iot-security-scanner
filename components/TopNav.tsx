import Link from "next/link";
import { Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  showAppLinks?: boolean;
  showLogout?: boolean;
}

export function TopNav({ showAppLinks = false, showLogout = false }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0d1117]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
          <Shield className="h-5 w-5 text-green-400" />
          iot-security-scanner
        </Link>
        <nav className="flex items-center gap-2">
          {showAppLinks ? (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Dashboard
              </Link>
              <Link href="/scan" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Scan
              </Link>
              <Link href="/devices" className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Devices
              </Link>
            </>
          ) : (
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
              className="inline-flex items-center gap-2 rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-green-400"
            >
              <Activity className="h-4 w-4" />
              Start Protected Home Network
            </a>
          )}
          {showLogout ? (
            <form action="/api/access/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
