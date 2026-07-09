import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLE_PERMISSIONS } from "../lib/permissions";

const prisma = new PrismaClient();

async function ensureRoleWithPermissions(roleName: string, permissionNames: string[]) {
  const permissions = await Promise.all(
    permissionNames.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  return prisma.role.upsert({
    where: { name: roleName },
    update: {
      permissions: { set: permissions.map((permission) => ({ id: permission.id })) },
    },
    create: {
      name: roleName,
      permissions: { connect: permissions.map((permission) => ({ id: permission.id })) },
    },
  });
}

async function main() {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  const adminPassword = process.env.AUTH_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("AUTH_ADMIN_EMAIL and AUTH_ADMIN_PASSWORD must be set to seed the admin user");
  }

  const adminRole = await ensureRoleWithPermissions("admin", ROLE_PERMISSIONS.admin);
  await ensureRoleWithPermissions("staff", ROLE_PERMISSIONS.staff);

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      name: "Admin",
      roles: { connect: [{ id: adminRole.id }] },
    },
  });

  console.log(`Created admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
