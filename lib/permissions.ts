import type { RoleName } from "@/types/auth";

export const ROLE_LABELS: Record<RoleName, string> = {
  admin: "Partner",
  manager: "Manager",
  staff: "Staff",
  intern: "Intern",
};

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  admin: [
    "dashboard:*",
    "customers:*",
    "workflow:*",
    "tax:*",
    "documents:*",
    "finance:*",
    "reports:*",
    "employees:*",
    "settings:*",
    "users:*",
  ],
  manager: [
    "dashboard:view",
    "customers:view",
    "customers:create",
    "customers:edit",
    "customers:delete",
    "workflow:view",
    "workflow:create",
    "workflow:edit",
    "workflow:delete",
    "documents:view",
    "documents:upload",
    "documents:edit",
    "documents:delete",
    "tax:view",
    "tax:create",
    "tax:edit",
    "tax:delete",
    "reports:view",
    "employees:view",
  ],
  staff: [
    "dashboard:view",
    "customers:view",
    "customers:edit",
    "workflow:view",
    "workflow:edit",
    "documents:view",
    "documents:upload",
    "documents:edit",
    "tax:view",
    "tax:edit",
  ],
  intern: [
    "dashboard:view",
    "customers:view",
    "workflow:view",
    "documents:view",
    "tax:view",
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
