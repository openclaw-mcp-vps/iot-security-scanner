import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/data-store";
import type { AccessClaims, PurchaseRecord } from "@/lib/types";

const ACCESS_COOKIE = "iot_scanner_access";
const PURCHASES_FILE = "purchases.json";

function getAccessSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-secret-change-me";
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getAccessSecret()).update(payload).digest("base64url");
}

export function createAccessToken(claims: AccessClaims): string {
  const payload = encodeBase64Url(JSON.stringify(claims));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAccessToken(token: string): AccessClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  if (expected.length !== signature.length) {
    return null;
  }

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const claims = JSON.parse(decodeBase64Url(payload)) as AccessClaims;
    if (new Date(claims.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

export function attachAccessCookie(response: NextResponse, claims: AccessClaims): void {
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: createAccessToken(claims),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(claims.expiresAt)
  });
}

export function clearAccessCookie(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
}

export async function hasPaidAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return false;
  }

  return Boolean(verifyAccessToken(token));
}

export async function requirePaidAccess(): Promise<void> {
  const unlocked = await hasPaidAccess();
  if (!unlocked) {
    redirect("/?paywall=locked");
  }
}

export async function recordPurchase(purchase: PurchaseRecord): Promise<void> {
  const purchases = await readJsonFile<PurchaseRecord[]>(PURCHASES_FILE, []);

  const existingIndex = purchases.findIndex((item) => item.sessionId === purchase.sessionId);
  if (existingIndex >= 0) {
    purchases[existingIndex] = purchase;
  } else {
    purchases.push(purchase);
  }

  await writeJsonFile(PURCHASES_FILE, purchases);
}

export async function findPurchase(sessionId: string): Promise<PurchaseRecord | undefined> {
  const purchases = await readJsonFile<PurchaseRecord[]>(PURCHASES_FILE, []);
  return purchases.find((purchase) => purchase.sessionId === sessionId && purchase.status === "paid");
}
