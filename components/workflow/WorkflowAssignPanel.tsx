"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface AssignableEmployee {
  id: number;
  firstName: string;
  lastName: string;
  position: string | null;
}

interface WorkflowAssignPanelProps {
  taskId: number;
  currentEmployeeId: number | null;
  currentStatus: string;
  employees: AssignableEmployee[];
}

const statusOptions = [
  { value: "pending", label: "รอดำเนินการ" },
  { value: "in_progress", label: "กำลังทำ" },
  { value: "completed", label: "เสร็จสิ้น" },
];

export function WorkflowAssignPanel({ taskId, currentEmployeeId, currentStatus, employees }: WorkflowAssignPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>(currentEmployeeId ? String(currentEmployeeId) : "unassigned");
  const [status, setStatus] = useState(currentStatus);

  async function patchTask(body: Record<string, unknown>, successMessage: string) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/workflow/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "บันทึกข้อมูลไม่สำเร็จ");
      }

      toast({ title: successMessage, variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: "บันทึกข้อมูลไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assign-employee">มอบหมายพนักงาน</Label>
        <div className="flex gap-2">
          <Select value={employeeId} onValueChange={(value) => setEmployeeId(value ?? "unassigned")}>
            <SelectTrigger id="assign-employee" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">ยังไม่ได้มอบหมาย</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={String(employee.id)}>
                  {employee.firstName} {employee.lastName}
                  {employee.position ? ` (${employee.position})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={isSubmitting || employeeId === String(currentEmployeeId ?? "unassigned")}
            onClick={() =>
              patchTask(
                { assignedEmployeeId: employeeId === "unassigned" ? null : Number(employeeId) },
                "มอบหมายงานสำเร็จ"
              )
            }
          >
            บันทึก
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assign-status">สถานะงาน</Label>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value ?? currentStatus)}>
            <SelectTrigger id="assign-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={isSubmitting || status === currentStatus}
            onClick={() => patchTask({ status }, "อัปเดตสถานะสำเร็จ")}
          >
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
}
