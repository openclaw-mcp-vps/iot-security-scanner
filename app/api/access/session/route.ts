import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { accessCookieName, signAccessToken } from "@/lib/auth";
import { hasActivePurchase } from "@/lib/database";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const payload = bodySchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const hasAccess = await hasActivePurchase(payload.data.email);

  if (!hasAccess) {
    return NextResponse.json(
      {
        error:
          "No active subscription found for that email. Complete checkout first, then retry with the same email.",
      },
      { status: 402 },
    );
  }

  const token = signAccessToken({ email: payload.data.email, tier: "pro" });
  const cookieStore = await cookies();
  cookieStore.set(accessCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
