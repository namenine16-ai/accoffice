import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityCard } from "@/components/dashboard/ActivityCard";

interface OfficeHubActivityListProps {
  activities: Array<{ id: number; title: string; description: string; timestamp: string }>;
}

export function OfficeHubActivityList({ activities }: OfficeHubActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>กิจกรรมล่าสุด</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-muted-foreground">
            ยังไม่มีการอัปเดตกิจกรรมล่าสุด
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              description={activity.description}
              timestamp={activity.timestamp}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
