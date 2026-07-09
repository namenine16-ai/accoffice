import { customerRepository } from "@/repositories/customer.repository";
import { activityService } from "@/services/activity.service";
import type { Prisma } from "@prisma/client";

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
    const customer = await customerRepository.findById(id);
    await customerRepository.delete(id);

    await activityService.logActivity({
      action: "customer.deleted",
      details: customer ? `ลบลูกค้า: ${customer.companyName} (${customer.code})` : `ลบลูกค้า id ${id}`,
    });
  },
};
