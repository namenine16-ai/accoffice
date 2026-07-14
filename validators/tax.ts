import * as z from "zod";
import { Priority, TaxTaskStatus } from "@prisma/client";

export const taxTypeCreateSchema = z.object({
  code: z.string().trim().min(1, "กรุณาระบุรหัสประเภทภาษี").max(50, "รหัสยาวเกินไป"),
  name: z.string().trim().min(1, "กรุณาระบุชื่อประเภทภาษี"),
  description: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type TaxTypeCreateInput = z.infer<typeof taxTypeCreateSchema>;

export const taxTypeUpdateSchema = taxTypeCreateSchema.partial();
export type TaxTypeUpdateInput = z.infer<typeof taxTypeUpdateSchema>;

export const dueDateRuleCreateSchema = z.object({
  taxTypeId: z.coerce.number().int().positive("กรุณาระบุประเภทภาษี"),
  dayOfMonth: z.coerce.number().int().min(1, "วันที่ต้องอยู่ระหว่าง 1-31").max(31, "วันที่ต้องอยู่ระหว่าง 1-31"),
  monthOffset: z.coerce.number().int().min(0).optional(),
  allowWeekendAdjustment: z.boolean().optional(),
  allowHolidayAdjustment: z.boolean().optional(),
  notes: z.string().trim().min(1).optional(),
});
export type DueDateRuleCreateInput = z.infer<typeof dueDateRuleCreateSchema>;

export const dueDateRuleUpdateSchema = z.object({
  dayOfMonth: z.coerce.number().int().min(1, "วันที่ต้องอยู่ระหว่าง 1-31").max(31, "วันที่ต้องอยู่ระหว่าง 1-31").optional(),
  monthOffset: z.coerce.number().int().min(0).optional(),
  allowWeekendAdjustment: z.boolean().optional(),
  allowHolidayAdjustment: z.boolean().optional(),
  notes: z.string().trim().min(1).optional(),
});
export type DueDateRuleUpdateInput = z.infer<typeof dueDateRuleUpdateSchema>;

export const taxTaskCreateSchema = z.object({
  customerId: z.coerce.number().int().positive("กรุณาระบุลูกค้า"),
  customerTaskId: z.coerce.number().int().positive("กรุณาระบุงานที่เกี่ยวข้อง"),
  taxTypeId: z.coerce.number().int().positive("กรุณาระบุประเภทภาษี"),
  month: z.coerce.number().int().min(1, "เดือนไม่ถูกต้อง").max(12, "เดือนไม่ถูกต้อง"),
  year: z.coerce.number().int().min(2000, "ปีไม่ถูกต้อง"),
  assignedEmployeeId: z.coerce.number().int().positive().optional(),
  priority: z.enum(Priority).optional(),
  remarks: z.string().trim().min(1).optional(),
});
export type TaxTaskCreateInput = z.infer<typeof taxTaskCreateSchema>;

export const taxTaskUpdateSchema = z.object({
  assignedEmployeeId: z.coerce.number().int().positive().nullable().optional(),
  priority: z.enum(Priority).optional(),
  remarks: z.string().trim().min(1).optional(),
});
export type TaxTaskUpdateInput = z.infer<typeof taxTaskUpdateSchema>;

export const taxTaskStatusUpdateSchema = z
  .object({
    status: z.enum(TaxTaskStatus),
  })
  .strict();
export type TaxTaskStatusUpdateInput = z.infer<typeof taxTaskStatusUpdateSchema>;

export const taxSubmissionCreateSchema = z.object({
  taxTaskId: z.coerce.number().int().positive("กรุณาระบุงานภาษี"),
  submittedById: z.coerce.number().int().positive().optional(),
  submittedAt: z.coerce.date().optional(),
  receivedDate: z.coerce.date().optional(),
  referenceNumber: z.string().trim().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional(),
  notes: z.string().trim().min(1).optional(),
});
export type TaxSubmissionCreateInput = z.infer<typeof taxSubmissionCreateSchema>;

export const taxSubmissionUpdateSchema = z.object({
  referenceNumber: z.string().trim().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional(),
  receivedDate: z.coerce.date().optional(),
  notes: z.string().trim().min(1).optional(),
});
export type TaxSubmissionUpdateInput = z.infer<typeof taxSubmissionUpdateSchema>;

export const taxSubmissionStatusUpdateSchema = z
  .object({
    status: z.enum(["ACCEPTED", "REJECTED"]),
    rejectedReason: z.string().trim().min(1).optional(),
  })
  .strict();
export type TaxSubmissionStatusUpdateInput = z.infer<typeof taxSubmissionStatusUpdateSchema>;
