import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficeHubCalendar } from "@/components/dashboard/OfficeHubCalendar";
import type { WorkflowTask } from "@/types/workflow";

interface CalendarCardProps {
  tasks: WorkflowTask[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function CalendarCard({ tasks, selectedDate, onSelectDate }: CalendarCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ปฏิทินเดือนนี้</CardTitle>
      </CardHeader>
      <CardContent>
        <OfficeHubCalendar tasks={tasks} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      </CardContent>
    </Card>
  );
}
