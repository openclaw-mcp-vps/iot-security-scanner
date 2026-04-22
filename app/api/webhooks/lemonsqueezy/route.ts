import { NextResponse } from "next/server";
import { extractCheckoutPurchase, parseStripeEvent, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";
import { upsertPurchase } from "@/lib/database";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = parseStripeEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const purchase = extractCheckoutPurchase(event);
  if (purchase) {
    await upsertPurchase({
      email: purchase.email,
      stripe_session_id: purchase.sessionId,
      status: purchase.status,
      purchased_at: new Date().toISOString(),
      expires_at: purchase.expiresAt,
    });
  }

  return NextResponse.json({ received: true });
}
