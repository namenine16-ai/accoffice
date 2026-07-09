import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type NotificationItem = {
  id: number;
  title: string;
  description: string;
  variant: "default" | "success" | "warning" | "destructive";
};

export function OfficeHubNotifications({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>การแจ้งเตือน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{notification.title}</p>
              <Badge variant={notification.variant}>{notification.variant === "default" ? "ทั่วไป" : notification.variant === "warning" ? "เตือน" : notification.variant === "success" ? "สำเร็จ" : "สำคัญ"}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{notification.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
