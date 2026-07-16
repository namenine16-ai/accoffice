"use client";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationListItem } from "@/components/notifications/NotificationListItem";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationPanel() {
  const { notifications, isLoading, error, isRead, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const visibleNotifications = notifications.slice(0, 10);

  return (
    <Card className="w-80 border-0 shadow-none">
      <CardHeader>
        <CardTitle>การแจ้งเตือน</CardTitle>
        {unreadCount > 0 ? (
          <CardAction>
            <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead}>
              อ่านทั้งหมด
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="max-h-96 space-y-3 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="โหลดการแจ้งเตือนไม่สำเร็จ" description={error} />
        ) : visibleNotifications.length === 0 ? (
          <EmptyState title="ไม่มีการแจ้งเตือน" description="ไม่มีรายการที่ต้องติดตามในขณะนี้" />
        ) : (
          visibleNotifications.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              isRead={isRead(notification.id)}
              onMarkAsRead={markAsRead}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
