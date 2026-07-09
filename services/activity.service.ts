import { activityRepository } from "@/repositories/activity.repository";

interface LogActivityInput {
  action: string;
  details?: string;
}

export const activityService = {
  getRecentActivities(limit = 5) {
    return activityRepository.findRecent(limit);
  },

  async logActivity({ action, details }: LogActivityInput) {
    try {
      await activityRepository.create({ action, details });
    } catch (error) {
      console.error(JSON.stringify({ level: "error", scope: "activity.log", action, error: String(error) }));
    }
  },
};
