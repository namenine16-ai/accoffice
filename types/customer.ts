export const CUSTOMER_STATUSES = ["ใช้งาน", "ไม่ใช้งาน", "รอดำเนินการ"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface CustomerRow {
  id: number;
  code: string;
  companyName: string;
  phone: string | null;
  status: string;
}

export interface CustomerDetail {
  id: number;
  code: string;
  companyName: string;
  taxId: string;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  serviceFee: number | null;
  status: string;
  createdAt: Date;
  address: string | null;
  startDate: Date | null;
  serviceType: string | null;
  note: string | null;
}
