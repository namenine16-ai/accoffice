import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { sessionCookieOptions } from "@/lib/auth";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(sessionCookieOptions.name)?.value;
    const user = await authService.getCurrentUser(token);

    if (!user) {
      return apiErrorResponse("auth.me", "ยังไม่ได้เข้าสู่ระบบ", 401);
    }

    return NextResponse.json({ user });
  } catch (error) {
    return apiErrorResponse("auth.me", "โหลดข้อมูลผู้ใช้ไม่สำเร็จ", 500, error);
  }
}
