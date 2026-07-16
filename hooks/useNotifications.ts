"use client";

import { useContext } from "react";
import { NotificationContext } from "@/components/notifications/NotificationProvider";

export function useNotifications() {
  return useContext(NotificationContext);
}
