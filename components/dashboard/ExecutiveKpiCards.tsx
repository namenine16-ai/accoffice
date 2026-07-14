import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface ExecutiveKpiCardsProps {
  totalCustomers: number;
  totalTasks: number;
  upcomingTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export function ExecutiveKpiCards({
  totalCustomers,
  totalTasks,
  upcomingTasks,
  overdueTasks,
  completedTasks,
}: ExecutiveKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DashboardCard title="ลูกค้าทั้งหมด" value={totalCustomers} subtitle="บริษัทในระบบทั้งหมด" />
      <DashboardCard title="งานทั้งหมด" value={totalTasks} subtitle="งานประจำเดือนทั้งหมด" />
      <DashboardCard
        title="งานใกล้ครบกำหนด"
        value={upcomingTasks}
        subtitle="ครบกำหนดภายใน 7 วัน"
        variant="warning"
      />
      <DashboardCard title="งานค้าง" value={overdueTasks} subtitle="งานที่เลยกำหนดส่ง" variant="destructive" />
      <DashboardCard
        title="งานเสร็จสิ้น"
        value={completedTasks}
        subtitle="งานที่ดำเนินการเสร็จแล้ว"
        variant="success"
      />
      {/*
        TODO(Revenue Dashboard sprint): replace with real monthly revenue once the
        Office Finance module (v0.9.0 — invoicing/payments) ships. Deliberately not
        derived from Customer.serviceFee here: that field is a recurring service fee,
        not confirmed billed/received revenue, and no Invoice/Payment model exists yet.
      */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>รายได้รายเดือน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-semibold text-muted-foreground">เร็วๆ นี้</div>
          <p className="text-sm text-muted-foreground">รอโมดูลการเงิน (Revenue Dashboard)</p>
        </CardContent>
      </Card>
    </div>
  );
}
