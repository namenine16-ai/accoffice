import type { RoleName } from "@/types/auth";

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  admin: [
    "customers:*",
    "workflow:*",
    "tax:*",
    "documents:*",
    "finance:*",
    "reports:*",
    "employees:*",
    "settings:*",
  ],
  staff: [
    "customers:read",
    "customers:write",
    "workflow:read",
    "workflow:write",
    "tax:read",
    "tax:write",
    "documents:read",
    "documents:write",
  ],
};

export function permissionsForRoles(roles: RoleName[]): string[] {
  return Array.from(new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? [])));
}

export function hasPermission(roles: RoleName[], required: string): boolean {
  const [resource] = required.split(":");
  const granted = permissionsForRoles(roles);
  return granted.includes(required) || granted.includes(`${resource}:*`);
}
