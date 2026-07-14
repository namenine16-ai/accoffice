import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/*
 * TODO(Client CRM sprint, v0.8.0): populate with real outstanding-payment data
 * once Service Agreement / Billing Cycle / Outstanding Payment Tracking exist.
 * No Invoice/Payment/receivable model exists in prisma/schema.prisma yet, so
 * there is nothing to query — this stays a placeholder until that data exists.
 */
export function OutstandingCustomersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ลูกค้าที่มียอดค้างชำระ</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="ยังไม่มีข้อมูลยอดค้างชำระ"
          description="ฟีเจอร์ติดตามยอดค้างชำระลูกค้าจะเปิดใช้งานในโมดูล Client CRM (เร็วๆ นี้)"
        />
      </CardContent>
    </Card>
  );
}
