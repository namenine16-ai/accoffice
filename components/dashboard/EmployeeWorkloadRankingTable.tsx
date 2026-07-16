import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export interface EmployeeWorkloadRow {
  employeeId: number;
  employeeName: string;
  totalTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export function EmployeeWorkloadRankingTable({ rows }: { rows: EmployeeWorkloadRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>อันดับภาระงานพนักงาน</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState title="ไม่มีข้อมูลพนักงาน" description="ยังไม่มีพนักงานในระบบ" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>อันดับ</TableHead>
                <TableHead>พนักงาน</TableHead>
                <TableHead>งานทั้งหมด</TableHead>
                <TableHead>งานค้าง</TableHead>
                <TableHead>งานเสร็จสิ้น</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.employeeId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.employeeName}</TableCell>
                  <TableCell className="tabular-nums">{row.totalTasks}</TableCell>
                  <TableCell className="tabular-nums">{row.overdueTasks}</TableCell>
                  <TableCell className="tabular-nums">{row.completedTasks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
