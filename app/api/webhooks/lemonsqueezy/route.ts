import { NextResponse } from "next/server";
import { recordPurchase } from "@/lib/auth";
import { verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

interface StripeCheckoutSession {
  id: string;
  amount_total?: number;
  currency?: string;
  customer_details?: {
    email?: string;
  };
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const valid = verifyStripeWebhookSignature(payload, signature, secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data?: {
      object?: StripeCheckoutSession;
    };
  };

  if (event.type === "checkout.session.completed" && event.data?.object?.id) {
    const session = event.data.object;

    await recordPurchase({
      sessionId: session.id,
      email: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: new Date().toISOString(),
      status: "paid"
    });
  }

  return NextResponse.json({ received: true });
}
