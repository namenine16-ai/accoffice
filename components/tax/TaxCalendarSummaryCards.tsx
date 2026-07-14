import { DashboardCard } from "@/components/dashboard/DashboardCard";

export interface TaxCalendarCounts {
  upcoming: number;
  dueToday: number;
  overdue: number;
  completed: number;
  total: number;
}

interface TaxCalendarSummaryCardsProps {
  counts: TaxCalendarCounts;
}

export function TaxCalendarSummaryCards({ counts }: TaxCalendarSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="ใกล้ครบกำหนด"
        value={counts.upcoming}
        subtitle="งานภาษีที่ใกล้ถึงวันครบกำหนด"
        variant="default"
      />
      <DashboardCard
        title="ครบกำหนดวันนี้"
        value={counts.dueToday}
        subtitle="งานภาษีที่ครบกำหนดวันนี้"
        variant="warning"
      />
      <DashboardCard
        title="เกินกำหนด"
        value={counts.overdue}
        subtitle="งานภาษีที่เกินกำหนดแล้ว"
        variant="destructive"
      />
      <DashboardCard
        title="เสร็จสิ้น"
        value={counts.completed}
        subtitle="งานภาษีที่ดำเนินการเสร็จสิ้นแล้ว"
        variant="success"
      />
    </div>
  );
}
