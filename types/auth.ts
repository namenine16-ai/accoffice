export type RoleName = "admin" | "staff";

export interface SessionPayload {
  sub: string;
  email: string;
  roles: RoleName[];
}

export interface AuthUser {
  id: number;
  email: string;
  roles: RoleName[];
}
