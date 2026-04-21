import { NextResponse } from "next/server";
import { z } from "zod";
import { attachAccessCookie, findPurchase } from "@/lib/auth";

export const runtime = "nodejs";

const claimSchema = z.object({
  sessionId: z.string().min(5)
});

export async function POST(request: Request) {
  try {
    const payload = claimSchema.parse(await request.json());

    const purchase = await findPurchase(payload.sessionId);
    if (!purchase) {
      return NextResponse.json(
        {
          error:
            "Session not found yet. Stripe webhook may still be pending. Confirm webhook delivery or retry in a minute."
        },
        { status: 404 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

    const response = NextResponse.json({ ok: true });
    attachAccessCookie(response, {
      sessionId: purchase.sessionId,
      email: purchase.email,
      purchasedAt: purchase.createdAt,
      expiresAt: expiresAt.toISOString()
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
