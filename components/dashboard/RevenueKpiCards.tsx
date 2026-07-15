import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface RevenueKpiCardsProps {
  activeCustomers: number;
  newCustomers: number;
  estimatedMonthlyContractValue: number;
  estimatedAnnualContractValue: number;
  averageMonthlyContractValue: number;
}

export function RevenueKpiCards({
  activeCustomers,
  newCustomers,
  estimatedMonthlyContractValue,
  estimatedAnnualContractValue,
  averageMonthlyContractValue,
}: RevenueKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DashboardCard title="ลูกค้าที่ใช้งานอยู่" value={activeCustomers} subtitle="ลูกค้าที่มีสถานะใช้งาน" />
      <DashboardCard title="ลูกค้าใหม่" value={newCustomers} subtitle="ลูกค้าใหม่ในเดือนนี้" variant="success" />
      <DashboardCard
        title="Estimated Monthly Contract Value"
        value={Math.round(estimatedMonthlyContractValue)}
        subtitle="มูลค่าสัญญาโดยประมาณต่อเดือน (บาท) — ไม่ใช่รายได้จริง"
      />
      <DashboardCard
        title="Estimated Annual Contract Value"
        value={Math.round(estimatedAnnualContractValue)}
        subtitle="มูลค่าสัญญาโดยประมาณต่อปี (บาท) — ไม่ใช่รายได้จริง"
      />
      <DashboardCard
        title="Average Monthly Contract Value"
        value={Math.round(averageMonthlyContractValue)}
        subtitle="ค่าเฉลี่ยมูลค่าสัญญารายเดือนต่อลูกค้า (บาท)"
      />
      {/*
        TODO(Office Finance sprint, v0.9.0): replace with real recognized revenue
        once Invoice/Payment models exist. Do not derive this from Customer.serviceFee —
        that field is a contracted service fee, not confirmed/recognized revenue.
      */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Actual Revenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-semibold text-muted-foreground">Coming Soon</div>
          <p className="text-sm text-muted-foreground">รอโมดูลการเงิน (Office Finance)</p>
        </CardContent>
      </Card>
    </div>
  );
}
