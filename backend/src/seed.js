import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
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
  console.log('Iniciando el script de seed...');

  // Roles de sistema
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: { permissions: PERMISSION_KEYS },
    create: {
      name: 'SUPER_ADMIN',
      description: 'Acceso total a la plataforma',
      isSystem: true,
      isSuperAdmin: true,
      permissions: PERMISSION_KEYS,
    },
  });
  await prisma.role.upsert({
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

  // Crear o actualizar el usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@4aurban.com' },
    update: { password: adminPassword, roleId: superAdminRole.id },
    create: {
      email: 'admin@4aurban.com',
      password: adminPassword,
      roleId: superAdminRole.id,
    },
  });
  console.log('Admin creado:', admin.email);

  // Crear productos de prueba si no hay ninguno
  const productsCount = await prisma.product.count();
  if (productsCount === 0) {
    const defaultProducts = [
      { nombre: "Camiseta 4A Classic", precio: 80000, talla: "M/L/XL" },
      { nombre: "Camiseta Urban Black", precio: 85000, talla: "M/L/XL" },
      { nombre: "Camiseta Street White", precio: 80000, talla: "M/L/XL" },
      { nombre: "Camiseta OG Logo", precio: 90000, talla: "M/L/XL" },
    ];

    for (const prod of defaultProducts) {
      await prisma.product.create({
        data: prod,
      });
    }
    console.log('Productos por defecto creados.');
  } else {
    console.log('Ya existen productos en la base de datos.');
  }

  // Carrusel por defecto usado en la página Nosotros
  await prisma.carousel.upsert({
    where: { slug: 'nosotros' },
    update: {},
    create: { slug: 'nosotros', name: 'Nosotros (Síguenos)' },
  });

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
