"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { Notification, NotificationPriority } from "@/components/notifications/NotificationProvider";

const PRIORITY_BADGE_VARIANT: Record<NotificationPriority, "destructive" | "warning" | "outline"> = {
  critical: "destructive",
  high: "warning",
  normal: "outline",
};

const PRIORITY_LABEL: Record<NotificationPriority, string> = {
  critical: "วิกฤต",
  high: "สำคัญ",
  normal: "ทั่วไป",
};

interface NotificationListItemProps {
  notification: Notification;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
}

export function NotificationListItem({ notification, isRead, onMarkAsRead }: NotificationListItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        isRead ? "border-border/50 bg-card" : "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {notification.href ? (
            <Link href={notification.href} className="text-sm font-semibold hover:underline">
              {notification.title}
            </Link>
          ) : (
            <p className="text-sm font-semibold">{notification.title}</p>
          )}
          <p className="text-xs text-muted-foreground">{notification.description}</p>
          {notification.date ? (
            <p className="text-xs text-muted-foreground">{new Date(notification.date).toLocaleDateString("th-TH")}</p>
          ) : null}
        </div>
        <Badge variant={PRIORITY_BADGE_VARIANT[notification.priority]}>{PRIORITY_LABEL[notification.priority]}</Badge>
      </div>
      {!isRead ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 h-auto p-0 text-xs font-medium text-primary hover:bg-transparent hover:underline"
          onClick={() => onMarkAsRead(notification.id)}
        >
          ทำเครื่องหมายว่าอ่านแล้ว
        </Button>
      ) : null}
    </div>
  );
}
