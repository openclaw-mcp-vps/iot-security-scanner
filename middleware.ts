import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/lemonsqueezy";

const protectedPaths = ["/dashboard", "/scan", "/devices"];

function requiresAccess(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function middleware(request: NextRequest) {
  if (!requiresAccess(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("iot_access")?.value;
  const verified = verifyAccessToken(token);

  if (!verified) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("paywall", "1");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/scan/:path*", "/devices/:path*"]
};
