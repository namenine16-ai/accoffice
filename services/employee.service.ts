import { employeeRepository } from "@/repositories/employee.repository";
import { activityService } from "@/services/activity.service";
import type { EmployeeCreateInput, EmployeeRecord, EmployeeUpdateInput } from "@/types/employee";

export const employeeService = {
  getAllEmployees(): Promise<EmployeeRecord[]> {
    return employeeRepository.findAll();
  },

  getEmployeeById(id: number): Promise<EmployeeRecord | null> {
    return employeeRepository.findById(id);
  },

  async createEmployee(data: EmployeeCreateInput): Promise<EmployeeRecord> {
    const employee = await employeeRepository.create(data);

    await activityService.logActivity({
      action: "employee.created",
      details: `เพิ่มพนักงานใหม่: ${employee.firstName} ${employee.lastName}`,
    });

    return employee;
  },

  async updateEmployee(id: number, data: EmployeeUpdateInput): Promise<EmployeeRecord> {
    const employee = await employeeRepository.update(id, data);

    await activityService.logActivity({
      action: "employee.updated",
      details: `แก้ไขข้อมูลพนักงาน: ${employee.firstName} ${employee.lastName}`,
    });

    return employee;
  },

  async deleteEmployee(id: number): Promise<void> {
    const employee = await employeeRepository.findById(id);
    await employeeRepository.delete(id);

    await activityService.logActivity({
      action: "employee.deleted",
      details: employee ? `ลบพนักงาน: ${employee.firstName} ${employee.lastName}` : `ลบพนักงาน id ${id}`,
    });
  },
};
