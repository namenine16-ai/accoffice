import { taxTypeRepository } from "@/repositories/tax-type.repository";
import { activityService } from "@/services/activity.service";
import { Prisma } from "@prisma/client";

export class TaxTypeError extends Error {}

export const taxTypeService = {
  getAllTaxTypes() {
    return taxTypeRepository.findAll();
  },

  getTaxTypeById(id: number) {
    return taxTypeRepository.findById(id);
  },

  getTaxTypeByCode(code: string) {
    return taxTypeRepository.findByCode(code);
  },

  async createTaxType(data: Prisma.TaxTypeCreateInput) {
    const existing = await taxTypeRepository.findByCode(data.code);
    if (existing) {
      throw new TaxTypeError("รหัสประเภทภาษีนี้มีอยู่แล้ว");
    }

    const taxType = await taxTypeRepository.create(data);

    await activityService.logActivity({
      action: "tax.type_created",
      details: `สร้างประเภทภาษี: ${taxType.name} (${taxType.code})`,
    });

    return taxType;
  },

  async updateTaxType(id: number, data: Prisma.TaxTypeUpdateInput) {
    const taxType = await taxTypeRepository.update(id, data);

    await activityService.logActivity({
      action: "tax.type_updated",
      details: `แก้ไขประเภทภาษี: ${taxType.name} (${taxType.code})`,
    });

    return taxType;
  },

  async deleteTaxType(id: number) {
    const taxType = await taxTypeRepository.findById(id);

    try {
      await taxTypeRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new TaxTypeError("ไม่สามารถลบประเภทภาษีนี้ได้ เนื่องจากมีงานภาษีที่อ้างอิงอยู่ กรุณาปิดการใช้งาน (isActive) แทนการลบ");
      }
      throw error;
    }

    await activityService.logActivity({
      action: "tax.type_deleted",
      details: taxType ? `ลบประเภทภาษี: ${taxType.name} (${taxType.code})` : `ลบประเภทภาษี id ${id}`,
    });
  },
};
