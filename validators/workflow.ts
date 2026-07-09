import * as z from "zod";

export const workflowTaskUpdateSchema = z.object({
  assignedEmployeeId: z.number().int().positive().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export type WorkflowTaskUpdateInput = z.infer<typeof workflowTaskUpdateSchema>;
