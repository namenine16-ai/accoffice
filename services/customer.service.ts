import { customerRepository } from "@/repositories/customer.repository";
import { workflowRepository } from "@/repositories/workflow.repository";
import { documentRepository } from "@/repositories/document.repository";
import { taxTaskRepository } from "@/repositories/tax-task.repository";
import { activityService } from "@/services/activity.service";
import type { Prisma } from "@prisma/client";

export class CustomerServiceError extends Error {}

export const customerService = {
  getAllCustomers() {
    return customerRepository.findAll();
  },

  getCustomerById(id: number) {
    return customerRepository.findById(id);
  },

  async createCustomer(data: Prisma.CustomerCreateInput) {
    const customer = await customerRepository.create(data);

    await activityService.logActivity({
      action: "customer.created",
      details: `สร้างลูกค้าใหม่: ${customer.companyName} (${customer.code})`,
    });

    return customer;
  },

  async updateCustomer(id: number, data: Prisma.CustomerUpdateInput) {
    const customer = await customerRepository.update(id, data);

    await activityService.logActivity({
      action: "customer.updated",
      details: `แก้ไขข้อมูลลูกค้า: ${customer.companyName} (${customer.code})`,
    });

    return customer;
  },

  async deleteCustomer(id: number) {
    const [tasks, documents, taxTasks] = await Promise.all([
      workflowRepository.findTasks({ customerId: id }),
      documentRepository.findAll({ customerId: id }),
      taxTaskRepository.findAll({ customerId: id }),
    ]);

    if (tasks.length > 0 || documents.length > 0 || taxTasks.length > 0) {
      throw new CustomerServiceError(
        "ไม่สามารถลบลูกค้านี้ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องอยู่ (งาน เอกสาร หรืองานภาษี)"
      );
    }

    const customer = await customerRepository.findById(id);
    await customerRepository.delete(id);

    await activityService.logActivity({
      action: "customer.deleted",
      details: customer ? `ลบลูกค้า: ${customer.companyName} (${customer.code})` : `ลบลูกค้า id ${id}`,
    });
  },
};
