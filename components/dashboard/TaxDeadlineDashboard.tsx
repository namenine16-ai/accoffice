import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WorkflowTask } from "@/types/workflow";

const taxTypeConfig = [
  { key: "vat", label: "ภาษีมูลค่าเพิ่ม (VAT)" },
  { key: "pnd1", label: "ภ.ง.ด.1" },
  { key: "pnd3", label: "ภ.ง.ด.3" },
  { key: "pnd53", label: "ภ.ง.ด.53" },
  { key: "sso", label: "ประกันสังคม (SSO)" },
] as const;

interface TaxDeadlineRow {
  key: string;
  label: string;
  dueCount: number;
}

function buildTaxDeadlineRows(tasks: WorkflowTask[], today: Date): TaxDeadlineRow[] {
  const dueSoon = tasks.filter((task) => {
    if (!task.deadline || task.status === "completed") {
      return false;
    }

    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return taxTypeConfig.map(({ key, label }) => ({
    key,
    label,
    dueCount: dueSoon.filter((task) => !task[key]).length,
  }));
}

interface TaxDeadlineDashboardProps {
  tasks: WorkflowTask[];
  today: Date;
}

export function TaxDeadlineDashboard({ tasks, today }: TaxDeadlineDashboardProps) {
  const rows = buildTaxDeadlineRows(tasks, today);
  const hasAnyDue = rows.some((row) => row.dueCount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาษีครบกำหนดใน 7 วัน</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyDue ? (
          <p className="text-sm text-muted-foreground">ไม่มีภาษีที่ต้องยื่นในอีก 7 วันข้างหน้า</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภทภาษี</TableHead>
                <TableHead>จำนวนงานที่ต้องยื่น</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>
                    {row.dueCount > 0 ? (
                      <Badge variant="destructive">{row.dueCount} งาน</Badge>
                    ) : (
                      <Badge variant="outline">0</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
