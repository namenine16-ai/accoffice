"use client";

import { useContext } from "react";
import { hasRole as checkHasRole } from "@/lib/auth";
import { hasPermission as checkHasPermission } from "@/lib/permissions";
import { PermissionContext } from "@/components/auth/PermissionProvider";
import type { RoleName } from "@/types/auth";

export function usePermissions() {
  const { session, permissions } = useContext(PermissionContext);

  return {
    permissions,
    hasPermission: (required: string) => checkHasPermission(session?.roles ?? [], required),
    hasRole: (role: RoleName) => checkHasRole(session, role),
  };
}
