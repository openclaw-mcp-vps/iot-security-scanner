import { Suspense } from "react";
import Link from "next/link";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";

export default function PurchaseSuccessPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-8">
      <h1 className="text-2xl font-bold">Purchase Received</h1>
      <p className="text-sm text-[#9aa4af]">
        Your checkout completed. Paste your Checkout Session ID below to claim browser access and open the scanner dashboard.
      </p>
      <Suspense fallback={<p className="text-sm text-[#9aa4af]">Loading checkout details...</p>}>
        <UnlockAccessForm />
      </Suspense>
      <Link href="/" className="inline-flex text-sm text-blue-400 hover:text-blue-300">
        Return to homepage
      </Link>
    </div>
  );
}
