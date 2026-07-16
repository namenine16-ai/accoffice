import * as z from "zod";

export const workflowTaskUpdateSchema = z.object({
  assignedEmployeeId: z.number().int().positive().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export type WorkflowTaskUpdateInput = z.infer<typeof workflowTaskUpdateSchema>;

export const workflowGenerateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export type WorkflowGenerateInput = z.infer<typeof workflowGenerateSchema>;
