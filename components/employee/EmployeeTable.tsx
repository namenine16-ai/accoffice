"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DotsThreeOutlineVertical } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { EmployeeRecord } from "@/types/employee";

interface EmployeeTableProps {
  employees: EmployeeRecord[];
  onDeleteEmployee: (id: number) => Promise<void>;
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
};

const PAGE_SIZE = 10;

export default function EmployeeTable({ employees, onDeleteEmployee }: EmployeeTableProps) {
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeRecord | null>(null);

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(employees.map((employee) => employee.department).filter((value): value is string => Boolean(value)))
      ).sort(),
    [employees]
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.status))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(
    () =>
      employees
        .filter((employee) => departmentFilter === "all" || employee.department === departmentFilter)
        .filter((employee) => statusFilter === "all" || employee.status === statusFilter)
        .filter((employee) =>
          [employee.firstName, employee.lastName, employee.email, employee.position, employee.department]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        ),
    [employees, query, departmentFilter, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>รายชื่อพนักงาน</CardTitle>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <Input
            placeholder="ค้นหา..."
            className="max-w-xs"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={departmentFilter}
            onValueChange={(value) => {
              setDepartmentFilter(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="แผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกแผนก</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/employees/new">
            <Button>เพิ่มพนักงาน</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">ชื่อ-นามสกุล</TableHead>
              <TableHead className="p-3">Email</TableHead>
              <TableHead className="p-3">ตำแหน่ง</TableHead>
              <TableHead className="p-3">แผนก</TableHead>
              <TableHead className="p-3">สถานะ</TableHead>
              <TableHead className="p-3">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="p-3">
                  <Link href={`/employees/${employee.id}`} className="text-blue-600 hover:underline">
                    {employee.firstName} {employee.lastName}
                  </Link>
                </TableCell>
                <TableCell className="p-3">{employee.email}</TableCell>
                <TableCell className="p-3">{employee.position ?? "-"}</TableCell>
                <TableCell className="p-3">{employee.department ?? "-"}</TableCell>
                <TableCell className="p-3">
                  <Badge variant={statusVariantMap[employee.status] ?? "outline"}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="icon-sm">
                        <DotsThreeOutlineVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link href={`/employees/edit/${employee.id}`}>แก้ไข</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/employees/${employee.id}`}>ดูรายละเอียด</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog
                        open={deletingEmployee?.id === employee.id}
                        onOpenChange={(isOpen) => !isOpen && setDeletingEmployee(null)}
                      >
                        <AlertDialogTrigger>
                          <DropdownMenuItem onClick={() => setDeletingEmployee(employee)}>
                            ลบ
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าจะลบพนักงาน {employee.firstName} {employee.lastName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                await onDeleteEmployee(employee.id);
                                setDeletingEmployee(null);
                              }}
                            >
                              ลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            แสดง {visibleEmployees.length} จาก {filteredEmployees.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              ก่อนหน้า
            </Button>
            <span className="text-xs text-muted-foreground">
              หน้า {currentPage} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              ถัดไป
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
