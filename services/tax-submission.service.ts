import { taxSubmissionRepository, type TaxSubmissionFilters } from "@/repositories/tax-submission.repository";
import { taxTaskRepository } from "@/repositories/tax-task.repository";
import { taxTaskService } from "@/services/tax-task.service";
import { activityService } from "@/services/activity.service";
import type { Prisma } from "@prisma/client";

export class TaxSubmissionError extends Error {}

interface CreateTaxSubmissionInput {
  submittedById?: number;
  submittedAt?: Date;
  receivedDate?: Date;
  referenceNumber?: string;
  amount?: number;
  notes?: string;
}

export const taxSubmissionService = {
  getSubmissions(filters: TaxSubmissionFilters = {}) {
    return taxSubmissionRepository.findAll(filters);
  },

  getSubmissionById(id: number) {
    return taxSubmissionRepository.findById(id);
  },

  async createSubmission(taxTaskId: number, input: CreateTaxSubmissionInput = {}) {
    const task = await taxTaskRepository.findById(taxTaskId);
    if (!task) {
      throw new TaxSubmissionError("ไม่พบงานภาษีที่เกี่ยวข้อง");
    }

    const periodStart = new Date(task.year, task.month - 1, 1);
    const submittedAt = input.submittedAt ?? new Date();
    if (submittedAt < periodStart) {
      throw new TaxSubmissionError("วันที่ยื่นแบบต้องไม่ก่อนวันเริ่มต้นของรอบภาษี");
    }

    const submission = await taxSubmissionRepository.create({
      taxTask: { connect: { id: taxTaskId } },
      ...(input.submittedById !== undefined ? { submittedBy: { connect: { id: input.submittedById } } } : {}),
      submittedAt,
      ...(input.receivedDate !== undefined ? { receivedDate: input.receivedDate } : {}),
      ...(input.referenceNumber !== undefined ? { referenceNumber: input.referenceNumber } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });

    await taxTaskService.updateStatus(taxTaskId, "FILED");

    await activityService.logActivity({
      action: "tax.submission_filed",
      details: `ยื่นแบบภาษีสำหรับงาน id ${taxTaskId}`,
    });

    return submission;
  },

  async updateSubmissionStatus(id: number, status: "ACCEPTED" | "REJECTED", rejectedReason?: string) {
    const submission = await taxSubmissionRepository.findById(id);
    if (!submission) {
      throw new TaxSubmissionError("ไม่พบข้อมูลการยื่นแบบ");
    }

    const updated = await taxSubmissionRepository.update(id, {
      status,
      ...(status === "REJECTED" ? { rejectedReason } : {}),
    });

    await activityService.logActivity({
      action: "tax.submission_status_changed",
      details: `เปลี่ยนสถานะการยื่นแบบ id ${id} เป็น ${status}`,
    });

    if (status === "ACCEPTED") {
      await taxTaskService.updateStatus(submission.taxTaskId, "COMPLETED");
    }

    return updated;
  },

  async updateSubmission(id: number, data: Prisma.TaxSubmissionUpdateInput) {
    const submission = await taxSubmissionRepository.update(id, data);

    await activityService.logActivity({
      action: "tax.submission_updated",
      details: `แก้ไขข้อมูลการยื่นแบบ id ${id}`,
    });

    return submission;
  },
};
