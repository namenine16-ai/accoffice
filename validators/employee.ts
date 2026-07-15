import * as z from "zod";

export const employeeCreateSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  status: z.string().optional().default("active"),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

export const employeeAccountCreateSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  role: z.enum(["admin", "manager", "staff", "intern"]),
});

export const employeeAccountUpdateSchema = z.object({
  role: z.enum(["admin", "manager", "staff", "intern"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeAccountCreateInput = z.infer<typeof employeeAccountCreateSchema>;
export type EmployeeAccountUpdateInput = z.infer<typeof employeeAccountUpdateSchema>;
