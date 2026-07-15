import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface CustomerSummaryRow {
  id: number;
  companyName: string;
  status: string;
  serviceFee: number;
  createdAt: string;
  responsibleEmployee: string;
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ใช้งาน: "default",
  "ไม่ใช้งาน": "destructive",
  รอดำเนินการ: "secondary",
};

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariantMap[status] ?? "outline"}>{status}</Badge>;
}

export function LatestCustomersTable({ customers }: { customers: CustomerSummaryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ลูกค้าล่าสุด</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {customers.length === 0 ? (
          <EmptyState title="ไม่มีลูกค้า" description="ยังไม่มีลูกค้าในระบบ" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่เพิ่ม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.companyName}</TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell>{new Date(customer.createdAt).toLocaleDateString("th-TH")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function HighestContractValueTable({ customers }: { customers: CustomerSummaryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ลูกค้าที่มีมูลค่าสัญญาสูงสุด</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {customers.length === 0 ? (
          <EmptyState title="ไม่มีข้อมูล" description="ยังไม่มีข้อมูลค่าบริการของลูกค้า" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>มูลค่าสัญญา (บาท/เดือน)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.companyName}</TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">{customer.serviceFee.toLocaleString("th-TH")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomersWithoutEmployeeTable({ customers }: { customers: CustomerSummaryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ลูกค้าที่ยังไม่มอบหมายพนักงาน</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {customers.length === 0 ? (
          <EmptyState title="ไม่มีลูกค้าที่ยังไม่มอบหมาย" description="ลูกค้าทุกรายมีพนักงานรับผิดชอบแล้ว" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.companyName}</TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
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
