"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SlaDashboardFilterValues {
  month: number | null;
  year: number | null;
  employeeId: number | null;
  customerId: number | null;
}

interface EmployeeOption {
  id: number;
  name: string;
}

interface CustomerOption {
  id: number;
  companyName: string;
}

interface SlaDashboardFiltersProps {
  employees: EmployeeOption[];
  customers: CustomerOption[];
  onApply: (filters: SlaDashboardFilterValues) => void;
}

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => currentYear - index);

export function SlaDashboardFilters({ employees, customers, onApply }: SlaDashboardFiltersProps) {
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [employeeId, setEmployeeId] = useState("all");
  const [customerId, setCustomerId] = useState("all");

  function handleSearch() {
    onApply({
      month: month === "all" ? null : Number(month),
      year: year === "all" ? null : Number(year),
      employeeId: employeeId === "all" ? null : Number(employeeId),
      customerId: customerId === "all" ? null : Number(customerId),
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="sla-filter-month">เดือน</Label>
        <Select value={month} onValueChange={(value) => setMonth(value ?? "all")}>
          <SelectTrigger id="sla-filter-month" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกเดือน</SelectItem>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla-filter-year">ปี</Label>
        <Select value={year} onValueChange={(value) => setYear(value ?? "all")}>
          <SelectTrigger id="sla-filter-year" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกปี</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla-filter-employee">พนักงาน</Label>
        <Select value={employeeId} onValueChange={(value) => setEmployeeId(value ?? "all")}>
          <SelectTrigger id="sla-filter-employee" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกคน</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={String(employee.id)}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sla-filter-customer">ลูกค้า</Label>
        <Select value={customerId} onValueChange={(value) => setCustomerId(value ?? "all")}>
          <SelectTrigger id="sla-filter-customer" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกราย</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={String(customer.id)}>
                {customer.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={handleSearch}>
        ค้นหา
      </Button>
    </div>
  );
}
