import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface SlaWorkloadKpiCardsProps {
  totalTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  upcomingTasks: number;
  completedTasks: number;
  productivity: number;
}

export function SlaWorkloadKpiCards({
  totalTasks,
  overdueTasks,
  dueTodayTasks,
  upcomingTasks,
  completedTasks,
  productivity,
}: SlaWorkloadKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DashboardCard title="งานทั้งหมด" value={totalTasks} subtitle="ตามตัวกรองที่เลือก" />
      <DashboardCard title="งานค้าง" value={overdueTasks} subtitle="งานที่เลยกำหนดส่ง" variant="destructive" />
      <DashboardCard title="ครบกำหนดวันนี้" value={dueTodayTasks} subtitle="งานที่ต้องส่งวันนี้" variant="warning" />
      <DashboardCard title="ใกล้ครบกำหนด" value={upcomingTasks} subtitle="งานที่ครบกำหนดใน 7 วันข้างหน้า" variant="warning" />
      <DashboardCard title="งานเสร็จสิ้น" value={completedTasks} subtitle="งานที่เสร็จสิ้นแล้ว" variant="success" />
      <DashboardCard title="Productivity (%)" value={productivity} subtitle="สัดส่วนงานเสร็จสิ้นต่องานทั้งหมด" />
    </div>
  );
}
