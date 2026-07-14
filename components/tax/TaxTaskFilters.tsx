import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TAX_TASK_STATUS_LABELS } from "@/components/tax/taxTaskMeta";
import type { CustomerRow } from "@/types/customer";
import type { TaxTypeRow } from "@/types/tax";
import type { EmployeeRecord } from "@/types/employee";
import type { TaxTaskStatus } from "@prisma/client";

const monthOptions = [
  { value: "all", label: "ทุกเดือน" },
  { value: "1", label: "ม.ค." },
  { value: "2", label: "ก.พ." },
  { value: "3", label: "มี.ค." },
  { value: "4", label: "เม.ย." },
  { value: "5", label: "พ.ค." },
  { value: "6", label: "มิ.ย." },
  { value: "7", label: "ก.ค." },
  { value: "8", label: "ส.ค." },
  { value: "9", label: "ก.ย." },
  { value: "10", label: "ต.ค." },
  { value: "11", label: "พ.ย." },
  { value: "12", label: "ธ.ค." },
];

const yearOptions = [
  { value: "all", label: "ทุกปี" },
  { value: String(new Date().getFullYear() - 1), label: String(new Date().getFullYear() - 1) },
  { value: String(new Date().getFullYear()), label: String(new Date().getFullYear()) },
  { value: String(new Date().getFullYear() + 1), label: String(new Date().getFullYear() + 1) },
];

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "ทุกสถานะ" },
  ...(Object.entries(TAX_TASK_STATUS_LABELS) as Array<[TaxTaskStatus, string]>).map(([value, label]) => ({
    value,
    label,
  })),
];

export interface TaxTaskFiltersState {
  customerId: string;
  taxTypeId: string;
  assignedEmployeeId: string;
  status: string;
  month: string;
  year: string;
}

interface TaxTaskFiltersProps {
  filters: TaxTaskFiltersState;
  customers: CustomerRow[];
  taxTypes: TaxTypeRow[];
  employees: EmployeeRecord[];
  onFiltersChange: (nextFilters: TaxTaskFiltersState) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function TaxTaskFilters({
  filters,
  customers,
  taxTypes,
  employees,
  onFiltersChange,
  onSearch,
  onReset,
}: TaxTaskFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ตัวกรองงานภาษี</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">ลูกค้า</label>
            <Select
              value={filters.customerId}
              onValueChange={(value) => onFiltersChange({ ...filters, customerId: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกลูกค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ลูกค้าทั้งหมด</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ประเภทภาษี</label>
            <Select
              value={filters.taxTypeId}
              onValueChange={(value) => onFiltersChange({ ...filters, taxTypeId: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเภทภาษี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภทภาษี</SelectItem>
                {taxTypes.map((taxType) => (
                  <SelectItem key={taxType.id} value={String(taxType.id)}>
                    {taxType.code} — {taxType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">พนักงานที่รับผิดชอบ</label>
            <Select
              value={filters.assignedEmployeeId}
              onValueChange={(value) => onFiltersChange({ ...filters, assignedEmployeeId: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกพนักงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">พนักงานทั้งหมด</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">สถานะ</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">เดือน</label>
            <Select
              value={filters.month}
              onValueChange={(value) => onFiltersChange({ ...filters, month: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ปี</label>
            <Select
              value={filters.year}
              onValueChange={(value) => onFiltersChange({ ...filters, year: value ?? "all" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" onClick={onReset}>
            ล้างตัวกรอง
          </Button>
          <Button onClick={onSearch}>ค้นหา</Button>
        </div>
      </CardContent>
    </Card>
  );
}
