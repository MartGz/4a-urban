import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { PERMISSION_KEYS } from './permissions.js';

dotenv.config();
const useSsl = /neon\.tech|sslmode=require/.test(process.env.DATABASE_URL || '');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Creando roles de sistema...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Acceso total a la plataforma',
      isSystem: true,
      isSuperAdmin: true,
      permissions: PERMISSION_KEYS,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Cliente de la tienda',
      isSystem: true,
      isSuperAdmin: false,
      permissions: [],
    },
  });

  console.log('Reasignando usuarios existentes a su rol...');

  const { count: adminCount } = await prisma.user.updateMany({
    where: { role: 'ADMIN', roleId: null },
    data: { roleId: superAdminRole.id },
  });

  const { count: customerCount } = await prisma.user.updateMany({
    where: { role: { not: 'ADMIN' }, roleId: null },
    data: { roleId: customerRole.id },
  });

  console.log(`Listo: ${adminCount} usuario(s) -> SUPER_ADMIN, ${customerCount} usuario(s) -> CUSTOMER.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
