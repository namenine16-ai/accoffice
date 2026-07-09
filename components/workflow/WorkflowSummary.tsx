import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowSummaryProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export function WorkflowSummary({
  totalTasks,
  completedTasks,
  inProgressTasks,
  pendingTasks,
  overdueTasks,
}: WorkflowSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>งานทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold">{totalTasks}</p>
          <p className="text-sm text-muted-foreground mt-2">รายการงานทั้งหมดในระบบ</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>เสร็จสิ้น</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-emerald-600">{completedTasks}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>กำลังทำ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-sky-600">{inProgressTasks}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รอดำเนินการ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-amber-600">{pendingTasks}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>งานคงค้าง</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-destructive">{overdueTasks}</p>
        </CardContent>
      </Card>
    </div>
  );
}
