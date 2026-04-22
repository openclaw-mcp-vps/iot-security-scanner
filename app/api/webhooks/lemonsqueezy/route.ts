import { NextResponse } from "next/server";

import { upsertPurchase } from "@/lib/database";
import { verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

interface StripeEvent {
  type: string;
  data?: {
    object?: {
      id?: string;
      customer?: string;
      customer_email?: string;
      customer_details?: {
        email?: string;
      };
      status?: string;
      payment_status?: string;
    };
  };
}

function eventToPurchase(event: StripeEvent) {
  const object = event.data?.object;
  if (!object?.id) {
    return null;
  }

  const email = object.customer_details?.email ?? object.customer_email;
  if (!email) {
    return null;
  }

  const activeEvent =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";

  const canceledEvent =
    event.type === "checkout.session.expired" || event.type === "customer.subscription.deleted";

  if (!activeEvent && !canceledEvent) {
    return null;
  }

  return {
    sessionId: object.id,
    email,
    customerId: object.customer ?? "unknown",
    status: activeEvent ? ("active" as const) : ("canceled" as const),
    purchasedAt: new Date().toISOString()
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const stripeSignature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(rawBody, stripeSignature)) {
    return NextResponse.json(
      {
        error: "Invalid webhook signature"
      },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  const purchase = eventToPurchase(event);

  if (!purchase) {
    return NextResponse.json({ received: true, ignored: true });
  }

  await upsertPurchase(purchase);

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "stripe-compatible webhook receiver",
    status: "ready"
  });
}
