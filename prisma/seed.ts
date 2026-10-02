import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

async function main() {
  const tenant =
    (await prisma.tenant.findFirst({ where: { name: 'Tenant Demo' } })) ??
    (await prisma.tenant.create({ data: { name: 'Tenant Demo' } }));

  const users = [
    { email: 'admin@demo.com', name: 'Admin', telephone: '88888888', role: 'ADMIN' as const },
    { email: 'user@demo.com', name: 'Usuario', telephone: '77777777', role: 'USER' as const },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash('Admin123*', 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hash, tenantId: tenant.id },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });