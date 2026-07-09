import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficeHubCalendar } from "@/components/dashboard/OfficeHubCalendar";

export function CalendarCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ปฏิทินเดือนนี้</CardTitle>
      </CardHeader>
      <CardContent>
        <OfficeHubCalendar />
      </CardContent>
    </Card>
  );
}
