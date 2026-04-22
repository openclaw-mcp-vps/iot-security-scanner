"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/access/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Access could not be verified.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm text-slate-300" htmlFor="unlock-email">
        Enter the email used at checkout
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="unlock-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@homeoffice.com"
        />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Verifying..." : "Unlock Dashboard"}
        </Button>
      </div>
      {status === "error" ? <p className="text-sm text-red-300">{message}</p> : null}
    </form>
  );
}
