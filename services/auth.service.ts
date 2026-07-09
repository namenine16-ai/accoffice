import bcrypt from "bcryptjs";
import { authRepository } from "@/repositories/auth.repository";
import { hasRole, signSessionToken, verifySessionToken } from "@/lib/auth";
import type { AuthUser, RoleName, SessionPayload } from "@/types/auth";

export class InvalidCredentialsError extends Error {}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const user = await authRepository.findByEmail(email);

    if (!user || !user.isActive || user.deletedAt) {
      throw new InvalidCredentialsError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    const roles = user.roles.map((role) => role.name) as RoleName[];
    const token = await signSessionToken({ sub: String(user.id), email: user.email, roles });

    return { token, user: { id: user.id, email: user.email, roles } };
  },

  logout() {
    return { success: true };
  },

  async getCurrentUser(token: string | undefined): Promise<AuthUser | null> {
    if (!token) {
      return null;
    }

    const session = await verifySessionToken(token);

    if (!session) {
      return null;
    }

    return {
      id: Number(session.sub),
      email: session.email,
      roles: session.roles,
    };
  },

  hasRole(session: SessionPayload | null, role: RoleName) {
    return hasRole(session, role);
  },

  async createAccount({
    email,
    password,
    roleName,
  }: {
    email: string;
    password: string;
    roleName: RoleName;
  }) {
    const passwordHash = await bcrypt.hash(password, 10);

    return authRepository.create({
      email,
      password: passwordHash,
      roles: { connect: [{ name: roleName }] },
    });
  },

  assignRole(userId: number, roleName: RoleName) {
    return authRepository.update(userId, {
      roles: { set: [{ name: roleName }] },
    });
  },

  setAccountActive(userId: number, isActive: boolean) {
    return authRepository.update(userId, { isActive });
  },

  async resetPassword(userId: number, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return authRepository.update(userId, { password: passwordHash });
  },
};
