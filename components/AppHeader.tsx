"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </span>
          <span className="font-[var(--font-heading)] text-sm font-semibold tracking-wide text-slate-100 sm:text-base">
            IoT Security Scanner
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/scan">Run Scan</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/devices">Devices</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
