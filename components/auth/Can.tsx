"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { hasPermission } = usePermissions();

  return <>{hasPermission(permission) ? children : fallback}</>;
}
