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
import type { CustomerRow } from "@/types/customer";

interface CustomerTableProps {
  customers: CustomerRow[];
  onDeleteCustomer: (id: number) => Promise<void>;
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ใช้งาน: "default",
  "ไม่ใช้งาน": "destructive",
  รอดำเนินการ: "secondary",
};

const PAGE_SIZE = 10;

export default function CustomerTable({ customers, onDeleteCustomer }: CustomerTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRow | null>(null);

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        [customer.code, customer.companyName, customer.phone, customer.status]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [customers, query]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCustomers = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>รายชื่อลูกค้า</CardTitle>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Input
            placeholder="ค้นหา..."
            className="max-w-xs"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Link href="/customers/new">
            <Button>เพิ่มลูกค้า</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-3">รหัส</TableHead>
              <TableHead className="p-3">บริษัท</TableHead>
              <TableHead className="p-3">โทรศัพท์</TableHead>
              <TableHead className="p-3">สถานะ</TableHead>
              <TableHead className="p-3">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="p-3">{customer.code}</TableCell>
                <TableCell className="p-3">
                  <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:underline">
                    {customer.companyName}
                  </Link>
                </TableCell>
                <TableCell className="p-3">{customer.phone ?? "-"}</TableCell>
                <TableCell className="p-3">
                  <Badge variant={statusVariantMap[customer.status] ?? "outline"}>
                    {customer.status}
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
                        <Link href={`/customers/edit/${customer.id}`}>แก้ไข</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/customers/${customer.id}`}>ดูรายละเอียด</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog
                        open={deletingCustomer?.id === customer.id}
                        onOpenChange={(isOpen) => !isOpen && setDeletingCustomer(null)}
                      >
                        <AlertDialogTrigger>
                          <DropdownMenuItem onClick={() => setDeletingCustomer(customer)}>
                            ลบ
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าจะลบลูกค้า {customer.companyName}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                await onDeleteCustomer(customer.id);
                                setDeletingCustomer(null);
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
            แสดง {visibleCustomers.length} จาก {filteredCustomers.length} รายการ
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
