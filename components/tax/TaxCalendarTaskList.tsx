import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TAX_TASK_PRIORITY_BADGE_VARIANT,
  TAX_TASK_PRIORITY_LABELS,
  TAX_TASK_STATUS_BADGE_VARIANT,
  TAX_TASK_STATUS_LABELS,
  type BadgeVariant,
} from "@/components/tax/taxTaskMeta";
import type { TaxTaskRow } from "@/types/tax";

type Category = "overdue" | "dueToday" | "upcoming" | "completed";

const CATEGORY_LABELS: Record<Category, string> = {
  overdue: "เกินกำหนด",
  dueToday: "ครบกำหนดวันนี้",
  upcoming: "ใกล้ครบกำหนด",
  completed: "เสร็จสิ้น",
};

const CATEGORY_BADGE_VARIANT: Record<Category, BadgeVariant> = {
  overdue: "destructive",
  dueToday: "warning",
  upcoming: "default",
  completed: "success",
};

interface TaxCalendarTaskListProps {
  overdue: TaxTaskRow[];
  dueToday: TaxTaskRow[];
  upcoming: TaxTaskRow[];
  completed: TaxTaskRow[];
}

export function TaxCalendarTaskList({ overdue, dueToday, upcoming, completed }: TaxCalendarTaskListProps) {
  const rows: Array<{ category: Category; task: TaxTaskRow }> = [
    ...overdue.map((task) => ({ category: "overdue" as const, task })),
    ...dueToday.map((task) => ({ category: "dueToday" as const, task })),
    ...upcoming.map((task) => ({ category: "upcoming" as const, task })),
    ...completed.map((task) => ({ category: "completed" as const, task })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการงานภาษี</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">หมวดหมู่</TableHead>
              <TableHead className="p-3">ลูกค้า</TableHead>
              <TableHead className="p-3">ประเภทภาษี</TableHead>
              <TableHead className="p-3">วันครบกำหนด</TableHead>
              <TableHead className="p-3">สถานะ</TableHead>
              <TableHead className="p-3">พนักงาน</TableHead>
              <TableHead className="p-3">ความสำคัญ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ category, task }) => (
              <TableRow key={`${category}-${task.id}`}>
                <TableCell className="p-3">
                  <Badge variant={CATEGORY_BADGE_VARIANT[category]}>{CATEGORY_LABELS[category]}</Badge>
                </TableCell>
                <TableCell className="p-3 font-medium">{task.customer.companyName}</TableCell>
                <TableCell className="p-3">
                  {task.taxType.code} — {task.taxType.name}
                </TableCell>
                <TableCell className="p-3">{new Date(task.dueDate).toLocaleDateString("th-TH")}</TableCell>
                <TableCell className="p-3">
                  <Badge variant={TAX_TASK_STATUS_BADGE_VARIANT[task.status]}>
                    {TAX_TASK_STATUS_LABELS[task.status]}
                  </Badge>
                </TableCell>
                <TableCell className="p-3">
                  {task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "-"}
                </TableCell>
                <TableCell className="p-3">
                  <Badge variant={TAX_TASK_PRIORITY_BADGE_VARIANT[task.priority]}>
                    {TAX_TASK_PRIORITY_LABELS[task.priority]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
