import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accessCookieName } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(accessCookieName);
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
