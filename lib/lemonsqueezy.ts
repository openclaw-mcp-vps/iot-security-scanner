import CryptoJS from "crypto-js";

import type { AccessTokenPayload } from "@/lib/types";

const ACCESS_COOKIE_NAME = "iot_access";
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function signingSecret() {
  return (
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "local-development-secret"
  );
}

function toBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }

  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
  return decodeURIComponent(escape(atob(padded)));
}

function secureCompare(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

export function createAccessToken(
  input: Omit<AccessTokenPayload, "exp">,
  ttlSeconds = ACCESS_COOKIE_MAX_AGE
) {
  const payload: AccessTokenPayload = {
    ...input,
    exp: Date.now() + ttlSeconds * 1000
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = CryptoJS.HmacSHA256(encodedPayload, signingSecret()).toString();

  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string | undefined | null): AccessTokenPayload | null {
  if (!token) {
    return null;
  }

  const segments = token.split(".");
  if (segments.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = segments;
  const expected = CryptoJS.HmacSHA256(encodedPayload, signingSecret()).toString();

  if (!secureCompare(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AccessTokenPayload;

    if (!payload.email || !payload.sessionId || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyStripeWebhookSignature(
  rawBody: string,
  stripeSignature: string | null
) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripeSignature) {
    return false;
  }

  const parts = stripeSignature.split(",").map((entry) => entry.trim());
  const timestamp = parts.find((entry) => entry.startsWith("t="))?.replace("t=", "");
  const signatures = parts
    .filter((entry) => entry.startsWith("v1="))
    .map((entry) => entry.replace("v1=", ""));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = CryptoJS.HmacSHA256(signedPayload, secret).toString();

  return signatures.some((signature) => secureCompare(signature, expectedSignature));
}

export const authCookie = {
  name: ACCESS_COOKIE_NAME,
  maxAge: ACCESS_COOKIE_MAX_AGE,
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};
