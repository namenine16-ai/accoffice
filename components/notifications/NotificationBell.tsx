"use client";

import { BellIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/utils/cn";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className={cn("relative", className)} />}>
        <BellIcon />
        {unreadCount > 0 ? (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
        <span className="sr-only">การแจ้งเตือน</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  );
}
