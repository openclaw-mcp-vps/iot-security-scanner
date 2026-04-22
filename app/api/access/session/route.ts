import { NextResponse } from "next/server";
import { z } from "zod";

import { getPurchaseBySessionId } from "@/lib/database";
import { authCookie, createAccessToken } from "@/lib/lemonsqueezy";

const claimSchema = z.object({
  sessionId: z.string().min(5)
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = claimSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "A valid sessionId is required"
      },
      { status: 400 }
    );
  }

  const purchase = await getPurchaseBySessionId(parsed.data.sessionId);

  if (!purchase || purchase.status !== "active") {
    return NextResponse.json(
      {
        error:
          "No active purchase found for this session yet. If payment just completed, retry in a few seconds."
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
