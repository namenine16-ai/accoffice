import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkflowStatusBadge } from "@/components/workflow/WorkflowStatusBadge";
import { WorkflowProgressBar } from "@/components/workflow/WorkflowProgressBar";

export type MiniTaskRow = {
  id: number;
  customerName: string;
  taskName: string;
  status: string;
  progress: number;
  deadline: string | null;
  employeeName: string;
};

export function OfficeHubSummaryTable({
  title,
  tasks,
}: {
  title: string;
  tasks: MiniTaskRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>งาน</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>พนักงาน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>กำหนดส่ง</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.taskName}</TableCell>
                <TableCell>{task.customerName}</TableCell>
                <TableCell>{task.employeeName || "ไม่มอบหมาย"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <WorkflowStatusBadge status={task.status} />
                    <WorkflowProgressBar progress={task.progress} status={task.status} />
                  </div>
                </TableCell>
                <TableCell>{task.deadline ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
