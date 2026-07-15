"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ROLE_LABELS } from "@/lib/permissions";
import type { EmployeeWithAccount } from "@/types/employee";
import type { RoleName } from "@/types/auth";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS) as [RoleName, string][];

interface EmployeeAccountPanelProps {
  employee: EmployeeWithAccount;
}

export function EmployeeAccountPanel({ employee }: EmployeeAccountPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState(employee.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleName>("staff");

  const currentRole = employee.user?.roles[0]?.name as RoleName | undefined;
  const [editRole, setEditRole] = useState<RoleName>(currentRole ?? "staff");
  const [resetPassword, setResetPassword] = useState("");

  async function patchAccount(body: Record<string, unknown>, successMessage: string) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/employees/${employee.id}/account`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "ดำเนินการไม่สำเร็จ");
      }

      toast({ title: successMessage, variant: "success" });
      router.refresh();
    } catch (err) {
      toast({ title: "ดำเนินการไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAccount() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/employees/${employee.id}/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "สร้างบัญชีผู้ใช้ไม่สำเร็จ");
      }

      toast({ title: "สร้างบัญชีผู้ใช้สำเร็จ", variant: "success" });
      setPassword("");
      router.refresh();
    } catch (err) {
      toast({ title: "สร้างบัญชีผู้ใช้ไม่สำเร็จ", description: (err as Error).message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!employee.user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">พนักงานคนนี้ยังไม่มีบัญชีผู้ใช้สำหรับเข้าสู่ระบบ</p>
        <div className="space-y-2">
          <Label htmlFor="account-email">อีเมลสำหรับเข้าสู่ระบบ</Label>
          <Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-password">รหัสผ่านเริ่มต้น</Label>
          <Input
            id="account-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-role">สิทธิ์การใช้งาน</Label>
          <Select value={role} onValueChange={(value) => setRole((value as RoleName) ?? "staff")}>
            <SelectTrigger id="account-role" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateAccount} disabled={isSubmitting || !email || password.length < 8}>
          สร้างบัญชีผู้ใช้
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">อีเมล:</span>
        <span className="text-sm">{employee.user.email}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">สถานะบัญชี:</span>
        <Badge variant={employee.user.isActive ? "default" : "secondary"}>
          {employee.user.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="account-active"
          checked={employee.user.isActive}
          disabled={isSubmitting}
          onCheckedChange={(checked) =>
            patchAccount(
              { isActive: checked === true },
              checked ? "เปิดใช้งานบัญชีสำเร็จ" : "ปิดใช้งานบัญชีสำเร็จ"
            )
          }
        />
        <Label htmlFor="account-active">เปิดใช้งานบัญชี</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-edit-role">เปลี่ยนสิทธิ์การใช้งาน</Label>
        <div className="flex gap-2">
          <Select value={editRole} onValueChange={(value) => setEditRole((value as RoleName) ?? "staff")}>
            <SelectTrigger id="account-edit-role" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={isSubmitting || editRole === currentRole}
            onClick={() => patchAccount({ role: editRole }, "เปลี่ยนสิทธิ์สำเร็จ")}
          >
            บันทึกสิทธิ์
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-reset-password">ตั้งรหัสผ่านใหม่</Label>
        <div className="flex gap-2">
          <Input
            id="account-reset-password"
            type="password"
            value={resetPassword}
            onChange={(event) => setResetPassword(event.target.value)}
            placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
          />
          <Button
            variant="outline"
            disabled={isSubmitting || resetPassword.length < 8}
            onClick={() => {
              patchAccount({ password: resetPassword }, "รีเซ็ตรหัสผ่านสำเร็จ");
              setResetPassword("");
            }}
          >
            รีเซ็ต
          </Button>
        </div>
      </div>
    </div>
  );
}
