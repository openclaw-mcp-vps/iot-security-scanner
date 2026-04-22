import { NextResponse } from "next/server";
import { z } from "zod";

import { getLatestActivePurchaseByEmail } from "@/lib/database";
import { authCookie, createAccessToken } from "@/lib/lemonsqueezy";

const claimSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = claimSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "A valid email is required"
      },
      { status: 400 }
    );
  }

  const purchase = await getLatestActivePurchaseByEmail(parsed.data.email);

  if (!purchase) {
    return NextResponse.json(
      {
        error: "No active purchase found for that email"
      },
      { status: 404 }
    );
  }

  const token = createAccessToken({
    email: purchase.email,
    sessionId: purchase.sessionId
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookie.name, token, authCookie);

  return response;
}
