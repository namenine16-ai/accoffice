import { SignJWT, jwtVerify } from "jose";
import type { RoleName, SessionPayload } from "@/types/auth";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_DURATION_SECONDS,
};

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, roles: payload.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !Array.isArray(payload.roles)
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles as RoleName[],
    };
  } catch {
    return null;
  }
}

export function hasRole(session: SessionPayload | null, role: RoleName): boolean {
  return session?.roles.includes(role) ?? false;
}
