import jwt from "jsonwebtoken";

const COOKIE_NAME = "iot_scanner_access";

interface AccessPayload {
  email: string;
  tier: "pro";
}

function getSecret() {
  return process.env.ACCESS_TOKEN_SECRET || "development-access-secret-change-me";
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: "30d",
    issuer: "iot-security-scanner",
    audience: "paid-users",
  });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), {
      issuer: "iot-security-scanner",
      audience: "paid-users",
    });
    if (typeof decoded !== "object" || !decoded.email) return null;
    return {
      email: decoded.email,
      tier: "pro",
    };
  } catch {
    return null;
  }
}

export const accessCookieName = COOKIE_NAME;
