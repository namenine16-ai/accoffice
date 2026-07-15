import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import type { SessionPayload } from "@/types/auth";

export async function getCurrentSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function requirePermission(request: NextRequest, permission: string) {
  const session = await getCurrentSession(request);

  if (!session) {
    return apiErrorResponse(`auth.${permission}`, "กรุณาเข้าสู่ระบบ", 401);
  }

  if (!hasPermission(session.roles, permission)) {
    return apiErrorResponse(`auth.${permission}`, "ไม่มีสิทธิ์เข้าถึง", 403);
  }

  return null;
}
