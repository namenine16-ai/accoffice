import { NextResponse } from "next/server";
import { authService, InvalidCredentialsError } from "@/services/auth.service";
import { loginSchema } from "@/validators/auth";
import { sessionCookieOptions } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse("auth.login", "ข้อมูลไม่ถูกต้อง", 400);
    }

    const { email, password } = parsed.data;
    const { token, user } = await authService.login(email, password);

    const response = NextResponse.json({ user });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return apiErrorResponse("auth.login", error.message, 401);
    }

    return apiErrorResponse("auth.login", "เข้าสู่ระบบไม่สำเร็จ", 500, error);
  }
}
