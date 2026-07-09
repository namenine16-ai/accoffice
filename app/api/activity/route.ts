import { NextResponse } from "next/server";
import { activityService } from "@/services/activity.service";
import { apiErrorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const activities = await activityService.getRecentActivities(5);
    return NextResponse.json(activities);
  } catch (error) {
    return apiErrorResponse("activity.getRecent", "โหลดกิจกรรมล่าสุดไม่สำเร็จ", 500, error);
  }
}
