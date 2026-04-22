import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessSession } from "@/lib/paywall";
import { listVulnerabilities } from "@/lib/database";

const querySchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
});

export async function GET(request: Request) {
  const session = await getAccessSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ severity: searchParams.get("severity") ?? undefined });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid severity filter" }, { status: 400 });
  }

  const vulnerabilities = await listVulnerabilities(parsed.data.severity);
  return NextResponse.json({ vulnerabilities });
}
