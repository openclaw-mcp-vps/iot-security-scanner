import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accessCookieName, verifyAccessToken } from "@/lib/auth";

export async function getAccessSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(accessCookieName)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requirePaidAccess() {
  const session = await getAccessSession();
  if (!session) {
    redirect("/?paywall=required");
  }
  return session;
}
