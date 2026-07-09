import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PendingDocumentRow {
  id: number;
  customerName: string;
  expectedDocument: string;
  daysWaiting: number;
}

export function OfficeHubPendingDocuments({ items }: { items: PendingDocumentRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ลูกค้ารอเอกสาร</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>เอกสารที่รอ</TableHead>
              <TableHead>วันที่รอ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>{item.expectedDocument}</TableCell>
                <TableCell>{item.daysWaiting} วัน</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
