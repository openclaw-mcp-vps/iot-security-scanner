"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AccessActivation() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSessionId = useMemo(
    () => searchParams.get("session_id") ?? "",
    [searchParams]
  );

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Waiting for activation");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSessionId(initialSessionId);
  }, [initialSessionId]);

  async function activateBySession() {
    if (!sessionId) {
      setStatus("Missing session ID. Paste it from your Stripe success URL or use email activation.");
      return;
    }

    setBusy(true);
    setStatus("Checking purchase status...");

    try {
      const response = await fetch("/api/access/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(payload.error ?? "Purchase not found yet. If you just paid, wait 10-20 seconds and retry.");
        return;
      }

      setStatus("Access activated. Redirecting to your dashboard...");
      router.push("/dashboard");
    } catch {
      setStatus("Unable to activate right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function activateByEmail() {
    if (!email.trim()) {
      setStatus("Enter the same email used during checkout.");
      return;
    }

    setBusy(true);
    setStatus("Looking up your purchase by email...");

    try {
      const response = await fetch("/api/access/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus(payload.error ?? "No active purchase found for this email.");
        return;
      }

      setStatus("Access activated. Redirecting to your dashboard...");
      router.push("/dashboard");
    } catch {
      setStatus("Activation failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-950/60">
      <CardHeader>
        <CardTitle className="text-slate-100">Activate your paid access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <p>
          After checkout, activate your cookie-based access token to unlock <code>/dashboard</code>, <code>/scan</code>, and <code>/devices</code>.
        </p>
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Stripe session ID
          </label>
          <Input
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            placeholder="cs_test_..."
            disabled={busy}
          />
          <Button onClick={activateBySession} disabled={busy}>
            Activate by session
          </Button>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">No session ID in your redirect URL?</p>
          <div className="space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@domain.com"
              disabled={busy}
            />
            <Button onClick={activateByEmail} variant="secondary" disabled={busy}>
              Activate by email
            </Button>
          </div>
        </div>

        <p className="rounded-md border border-cyan-900 bg-cyan-950/25 p-3 text-cyan-100">{status}</p>
        <p className="text-xs text-slate-500">
          Configure your Stripe payment link's post-purchase redirect to this URL and include <code>?session_id={'{CHECKOUT_SESSION_ID}'}</code> for instant activation.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to pricing</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
