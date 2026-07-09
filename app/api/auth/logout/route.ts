import { NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  authService.logout();

  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieOptions.name, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
