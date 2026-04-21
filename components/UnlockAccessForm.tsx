"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockAccessForm() {
  const search = useSearchParams();
  const initialSession = useMemo(() => search.get("session_id") ?? "", [search]);

  const [sessionId, setSessionId] = useState(initialSession);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const claim = async () => {
    if (!sessionId.trim()) {
      setStatus("error");
      setMessage("Enter your Stripe Checkout Session ID (starts with cs_).");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/access/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.trim() })
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Could not validate this checkout session yet.");
        return;
      }

      setStatus("ok");
      setMessage("Access unlocked for this browser. You can now open the dashboard.");
      window.location.href = "/dashboard";
    } catch {
      setStatus("error");
      setMessage("Unable to reach unlock service.");
    }
  };

  return (
    <div className="mt-5 space-y-3 rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
      <p className="text-sm text-[#9aa4af]">
        After checkout, paste your Stripe Checkout Session ID here to activate your browser cookie.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          placeholder="cs_test_a1B2C3..."
          aria-label="Stripe checkout session ID"
        />
        <Button onClick={claim} disabled={status === "loading"}>
          {status === "loading" ? "Verifying..." : "Unlock Access"}
        </Button>
      </div>
      {status === "error" ? <p className="text-sm text-red-400">{message}</p> : null}
      {status === "ok" ? <p className="text-sm text-emerald-400">{message}</p> : null}
    </div>
  );
}
