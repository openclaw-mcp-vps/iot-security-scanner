import crypto from "node:crypto";

interface StripeEvent {
  id: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      customer_details?: {
        email?: string | null;
      };
      customer_email?: string | null;
      status?: string;
      payment_status?: string;
      expires_at?: number | null;
      metadata?: Record<string, string>;
    };
  };
}

function parseStripeSignature(header: string | null): { timestamp: string; signature: string } | null {
  if (!header) return null;
  const parts = header.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {});

  if (!parts.t || !parts.v1) return null;
  return { timestamp: parts.t, signature: parts.v1 };
}

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return false;

  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) return false;

  const payload = `${parsed.timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.signature));
  } catch {
    return false;
  }
}

export function parseStripeEvent(rawBody: string): StripeEvent | null {
  try {
    return JSON.parse(rawBody) as StripeEvent;
  } catch {
    return null;
  }
}

export function extractCheckoutPurchase(event: StripeEvent): {
  email: string;
  sessionId: string;
  status: "active" | "refunded";
  expiresAt: string | null;
} | null {
  const object = event.data?.object;
  if (!object?.id) return null;

  const email = object.customer_details?.email || object.customer_email;
  if (!email) return null;

  if (event.type === "checkout.session.completed") {
    return {
      email,
      sessionId: object.id,
      status: object.payment_status === "paid" ? "active" : "refunded",
      expiresAt: object.expires_at ? new Date(object.expires_at * 1000).toISOString() : null,
    };
  }

  if (event.type === "checkout.session.expired") {
    return {
      email,
      sessionId: object.id,
      status: "refunded",
      expiresAt: new Date().toISOString(),
    };
  }

  return null;
}
