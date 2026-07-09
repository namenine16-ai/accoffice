import * as z from "zod";

export const customerCreateSchema = z.object({
  code: z.string().min(1, "รหัสลูกค้าจำเป็นต้องระบุ"),
  companyName: z.string().min(1, "ชื่อบริษัทจำเป็นต้องระบุ"),
  taxId: z.string().min(1, "เลขผู้เสียภาษีจำเป็นต้องระบุ"),
  businessType: z.string().optional().nullable(),
  companyRegisterNo: z.string().optional().nullable(),
  vatRegistered: z.coerce.boolean().optional().default(false),
  vatNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().nullable(),
  lineId: z.string().optional().nullable(),
  accountant: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
  accountingPeriod: z.string().optional().nullable(),
  serviceFee: z.coerce.number().min(0, "ค่าบริการต้องไม่ติดลบ").optional().default(0),
  startDate: z.string().optional().nullable(),
  status: z.string().optional().default("ใช้งาน"),
  note: z.string().optional().nullable(),
  googleDriveFolder: z.string().optional().nullable(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
