import { dueDateRuleRepository } from "@/repositories/due-date-rule.repository";
import { activityService } from "@/services/activity.service";
import type { Prisma } from "@prisma/client";

export class DueDateRuleError extends Error {
  notFound: boolean;

  constructor(message: string, options?: { notFound?: boolean }) {
    super(message);
    this.notFound = options?.notFound ?? false;
  }
}

function addMonths(year: number, month: number, offset: number) {
  const total = month - 1 + offset;
  return {
    year: year + Math.floor(total / 12),
    month: (total % 12) + 1,
  };
}

function nextBusinessDay(date: Date) {
  const adjusted = new Date(date);
  const day = adjusted.getDay();
  if (day === 6) {
    adjusted.setDate(adjusted.getDate() + 2);
  } else if (day === 0) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  return adjusted;
}

export const dueDateRuleService = {
  getAllRules() {
    return dueDateRuleRepository.findAll();
  },

  getRuleById(id: number) {
    return dueDateRuleRepository.findById(id);
  },

  getRuleForTaxType(taxTypeId: number) {
    return dueDateRuleRepository.findByTaxTypeId(taxTypeId);
  },

  async createRule(data: Prisma.DueDateRuleCreateInput) {
    const taxTypeId = data.taxType.connect?.id;
    if (taxTypeId !== undefined) {
      const existing = await dueDateRuleRepository.findByTaxTypeId(taxTypeId);
      if (existing) {
        throw new DueDateRuleError("ประเภทภาษีนี้มีกฎวันครบกำหนดอยู่แล้ว");
      }
    }

    const rule = await dueDateRuleRepository.create(data);

    await activityService.logActivity({
      action: "tax.due_date_rule_created",
      details: `สร้างกฎวันครบกำหนดสำหรับประเภทภาษี id ${rule.taxTypeId}`,
    });

    return rule;
  },

  async updateRule(id: number, data: Prisma.DueDateRuleUpdateInput) {
    const rule = await dueDateRuleRepository.update(id, data);

    await activityService.logActivity({
      action: "tax.due_date_rule_updated",
      details: `แก้ไขกฎวันครบกำหนด id ${id}`,
    });

    return rule;
  },

  async deleteRule(id: number) {
    await dueDateRuleRepository.delete(id);

    await activityService.logActivity({
      action: "tax.due_date_rule_deleted",
      details: `ลบกฎวันครบกำหนด id ${id}`,
    });
  },

  async computeDueDate(taxTypeId: number, month: number, year: number) {
    const rule = await dueDateRuleRepository.findByTaxTypeId(taxTypeId);
    if (!rule) {
      throw new DueDateRuleError("ไม่พบกฎวันครบกำหนดสำหรับประเภทภาษีนี้", { notFound: true });
    }

    const { year: dueYear, month: dueMonth } = addMonths(year, month, rule.monthOffset);
    let dueDate = new Date(dueYear, dueMonth - 1, rule.dayOfMonth);

    if (rule.allowWeekendAdjustment) {
      dueDate = nextBusinessDay(dueDate);
    }

    return dueDate;
  },
};
