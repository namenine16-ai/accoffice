import { Badge } from "@/components/ui/badge";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost"> = {
  pending: "secondary",
  in_progress: "default",
  completed: "outline",
};

const statusLabelMap: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังทำ",
  completed: "เสร็จสิ้น",
};

interface WorkflowStatusBadgeProps {
  status: string;
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status] ?? "ghost"}>
      {statusLabelMap[status] ?? status}
    </Badge>
  );
}
