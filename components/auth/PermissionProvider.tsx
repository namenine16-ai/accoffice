"use client";

import { createContext } from "react";
import type { SessionPayload } from "@/types/auth";

export interface PermissionContextValue {
  session: SessionPayload | null;
  permissions: string[];
}

export const PermissionContext = createContext<PermissionContextValue>({
  session: null,
  permissions: [],
});

interface PermissionProviderProps {
  session: SessionPayload | null;
  permissions: string[];
  children: React.ReactNode;
}

export function PermissionProvider({ session, permissions, children }: PermissionProviderProps) {
  return <PermissionContext.Provider value={{ session, permissions }}>{children}</PermissionContext.Provider>;
}
