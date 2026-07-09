import { employeeRepository } from "@/repositories/employee.repository";
import { activityService } from "@/services/activity.service";
import { authService } from "@/services/auth.service";
import type { EmployeeCreateInput, EmployeeRecord, EmployeeUpdateInput, EmployeeWithAccount } from "@/types/employee";
import type { EmployeeAccountCreateInput, EmployeeAccountUpdateInput } from "@/validators/employee";
import type { RoleName } from "@/types/auth";

export class EmployeeAccountError extends Error {}

export const employeeService = {
  getAllEmployees(): Promise<EmployeeRecord[]> {
    return employeeRepository.findAll();
  },

  getEmployeeById(id: number): Promise<EmployeeWithAccount | null> {
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

  async createAccountForEmployee(employeeId: number, input: EmployeeAccountCreateInput): Promise<EmployeeWithAccount> {
    const employee = await employeeRepository.findById(employeeId);

    if (!employee) {
      throw new EmployeeAccountError("ไม่พบข้อมูลพนักงาน");
    }

    if (employee.userId) {
      throw new EmployeeAccountError("พนักงานคนนี้มีบัญชีผู้ใช้อยู่แล้ว");
    }

    const account = await authService.createAccount({
      email: input.email,
      password: input.password,
      roleName: input.role as RoleName,
    });

    const updated = await employeeRepository.update(employeeId, {
      user: { connect: { id: account.id } },
    });

    await activityService.logActivity({
      action: "employee.account_created",
      details: `สร้างบัญชีผู้ใช้ให้พนักงาน: ${employee.firstName} ${employee.lastName} (${input.role})`,
    });

    return employeeRepository.findById(updated.id) as Promise<EmployeeWithAccount>;
  },

  async updateEmployeeAccount(employeeId: number, input: EmployeeAccountUpdateInput): Promise<EmployeeWithAccount> {
    const employee = await employeeRepository.findById(employeeId);

    if (!employee || !employee.userId) {
      throw new EmployeeAccountError("พนักงานคนนี้ยังไม่มีบัญชีผู้ใช้");
    }

    if (input.role) {
      await authService.assignRole(employee.userId, input.role as RoleName);
      await activityService.logActivity({
        action: "employee.role_changed",
        details: `เปลี่ยนสิทธิ์ผู้ใช้: ${employee.firstName} ${employee.lastName} เป็น ${input.role}`,
      });
    }

    if (input.isActive !== undefined) {
      await authService.setAccountActive(employee.userId, input.isActive);
      await activityService.logActivity({
        action: "employee.account_status_changed",
        details: `${input.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}บัญชีผู้ใช้: ${employee.firstName} ${employee.lastName}`,
      });
    }

    if (input.password) {
      await authService.resetPassword(employee.userId, input.password);
      await activityService.logActivity({
        action: "employee.password_reset",
        details: `รีเซ็ตรหัสผ่านให้: ${employee.firstName} ${employee.lastName}`,
      });
    }

    return employeeRepository.findById(employeeId) as Promise<EmployeeWithAccount>;
  },
};
