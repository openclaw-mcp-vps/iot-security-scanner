import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyAccessToken } from "@/lib/lemonsqueezy";
import { runNetworkScan } from "@/lib/scanner";

export const runtime = "nodejs";

const scanRequestSchema = z.object({
  target: z.string().trim().optional()
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get("iot_access")?.value;
  if (!verifyAccessToken(token)) {
    return NextResponse.json(
      {
        error: "Paid access is required to run scans"
      },
      { status: 401 }
    );
  }

  try {
    const json = await request.json().catch(() => ({}));
    const payload = scanRequestSchema.parse(json);

    const scan = await runNetworkScan(payload.target);

    return NextResponse.json({ scan });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete network scan";

    return NextResponse.json(
      {
        error: message
      },
      { status: 500 }
    );
  }
}
