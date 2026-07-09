"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkflowProgressBar } from "@/components/workflow/WorkflowProgressBar";
import { WorkflowStatusBadge } from "@/components/workflow/WorkflowStatusBadge";
import type { WorkflowTask } from "@/types/workflow";

const monthNames = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

function formatMonth(month: number) {
  return monthNames[month - 1] ?? String(month);
}

export default function WorkflowTaskTable({ tasks }: { tasks: WorkflowTask[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="p-3">งาน</TableHead>
          <TableHead className="p-3">ลูกค้า</TableHead>
          <TableHead className="p-3">ผู้รับผิดชอบ</TableHead>
          <TableHead className="p-3">เดือน/ปี</TableHead>
          <TableHead className="p-3">สถานะ</TableHead>
          <TableHead className="p-3">ความคืบหน้า</TableHead>
          <TableHead className="p-3">กำหนดส่ง</TableHead>
          <TableHead className="p-3">รายละเอียด</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="p-3 min-w-[12rem]">
              <div className="space-y-1">
                <p className="font-medium">{task.remarks ?? "งานประจำเดือน"}</p>
                <p className="text-xs text-muted-foreground">[{task.priority}]</p>
              </div>
            </TableCell>
            <TableCell className="p-3">
              <Link href={`/customers/${task.customer.id}`} className="text-blue-600 hover:underline">
                {task.customer.companyName}
              </Link>
            </TableCell>
            <TableCell className="p-3">
              {task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : "ไม่มอบหมาย"}
            </TableCell>
            <TableCell className="p-3">{formatMonth(task.month)} {task.year}</TableCell>
            <TableCell className="p-3">
              <WorkflowStatusBadge status={task.status} />
            </TableCell>
            <TableCell className="p-3 min-w-[12rem]">
              <WorkflowProgressBar progress={task.progress} status={task.status} />
            </TableCell>
            <TableCell className="p-3">
              {task.deadline ? new Date(task.deadline).toLocaleDateString("th-TH") : "-"}
            </TableCell>
            <TableCell className="p-3">
              <Link href={`/workflow/${task.id}`} className="text-blue-600 hover:underline">
                ดูรายละเอียด
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
