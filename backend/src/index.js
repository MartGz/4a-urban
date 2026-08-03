import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { randomInt, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import https from 'https';
import { PERMISSIONS, PERMISSION_KEYS } from './permissions.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('Falta la variable de entorno JWT_SECRET. Defínela en backend/.env antes de iniciar el servidor.');
  process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Neon (y la mayoría de Postgres administrados en la nube) exigen SSL; Postgres local no lo necesita.
const useSsl = /neon\.tech|sslmode=require/.test(process.env.DATABASE_URL || '');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

// Función para enviar WhatsApp vía UltraMsg
const sendWhatsApp = (to, message) => {
  if (!process.env.ULTRAMSG_INSTANCE_ID || !process.env.ULTRAMSG_TOKEN) {
    console.log('--- WHATSAPP MOCK (Faltan credenciales de UltraMsg) ---');
    console.log(`PARA: ${to}\nMENSAJE: ${message}`);
    return;
  }

  const data = JSON.stringify({
    "token": process.env.ULTRAMSG_TOKEN,
    "to": to,
    "body": message
  });

  const options = {
    hostname: 'api.ultramsg.com',
    port: 443,
    path: `/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    res.on('data', (d) => { process.stdout.write(d); });
  });

  req.on('error', (e) => { console.error('Error enviando WhatsApp:', e); });
  req.write(data);
  req.end();
};

const sendResetCodeEmail = async (email, name, code) => {
  const html = `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 40px; text-align: center;"><h1 style="letter-spacing: 5px;">4A URBAN</h1><p style="color: #666; margin-bottom: 30px;">CÓDIGO DE SEGURIDAD</p><p>Hola <strong>${name || 'Usuario'}</strong>,</p><p>Has solicitado un cambio de contraseña. Usa el siguiente código para verificar tu identidad:</p><div style="background: #f4f4f4; padding: 20px; font-size: 32px; letter-spacing: 10px; font-weight: bold; margin: 30px 0; border-radius: 10px;">${code}</div><p style="color: #999; font-size: 12px;">Este código expirará en 10 minutos.</p></div>`;
  try {
    await transporter.sendMail({ from: `"4A Urban" <${process.env.SMTP_USER}>`, to: email, subject: `Código de Seguridad: ${code}`, html });
    return true;
  } catch (e) { console.error('Error SMTP:', e.message); return false; }
}

const sendInviteEmail = async (email, name, link) => {
  const html = `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 40px; text-align: center;"><h1 style="letter-spacing: 5px;">4A URBAN</h1><p style="color: #666; margin-bottom: 30px;">INVITACIÓN AL EQUIPO</p><p>Hola <strong>${name || 'Usuario'}</strong>,</p><p>Te invitaron a formar parte del equipo de 4A Urban. Crea tu contraseña para activar tu cuenta:</p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:16px 32px;margin:20px 0;border-radius:10px;text-decoration:none;font-weight:bold;">Crear mi contraseña</a><p style="color: #999; font-size: 12px;">Este enlace expira en 48 horas. Si tú no esperabas este correo, ignóralo.</p></div>`;
  try {
    await transporter.sendMail({ from: `"4A Urban" <${process.env.SMTP_USER}>`, to: email, subject: 'Invitación a 4A Urban', html });
    return true;
  } catch (e) { console.error('Error SMTP:', e.message); return false; }
};

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Limita intentos de login y de solicitud/uso de códigos/enlaces de seguridad para evitar fuerza bruta.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
});

const generateResetCode = () => randomInt(100000, 1000000).toString();

let cachedCustomerRoleId = null;
const getCustomerRoleId = async () => {
  if (cachedCustomerRoleId) return cachedCustomerRoleId;
  const role = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
  if (!role) throw new Error('El rol CUSTOMER no existe. Corre el seed antes de iniciar el servidor.');
  cachedCustomerRoleId = role.id;
  return cachedCustomerRoleId;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Deja pasar si el usuario es super admin o su rol tiene el permiso pedido.
const requirePermission = (permission) => (req, res, next) => {
  if (req.user?.isSuperAdmin || req.user?.permissions?.includes(permission)) return next();
  return res.sendStatus(403);
};

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    let user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      const roleId = await getCustomerRoleId();
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({ data: { email, password: hashedPassword, roleId }, include: { role: true } });
    } else if (user.password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Credenciales inválidas' });
    } else {
      return res.status(400).json({ error: 'Debes activar tu cuenta desde el enlace enviado a tu correo antes de iniciar sesión' });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isSuperAdmin: user.role.isSuperAdmin,
      permissions: user.role.permissions,
    }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, role: user.role.name, name: user.name, isSuperAdmin: user.role.isSuperAdmin, permissions: user.role.permissions });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error interno' }); }
});

app.post('/api/auth/accept-invite', authLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña son requeridos' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  try {
    const user = await prisma.user.findFirst({ where: { inviteToken: token } });
    if (!user || !user.inviteTokenExpires || user.inviteTokenExpires < new Date()) {
      return res.status(400).json({ error: 'El enlace de invitación es inválido o expiró' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, inviteToken: null, inviteTokenExpires: null },
    });
    res.json({ message: 'Contraseña creada correctamente' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error activando la cuenta' }); }
});

app.post('/api/auth/request-reset', authLimiter, authenticateToken, async (req, res) => {
  const { method } = req.body;
  const code = generateResetCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  try {
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { resetCode: code, resetCodeExpires: expires } });
    if (method === 'EMAIL') {
      await sendResetCodeEmail(user.email, user.name, code);
    } else {
      const msg = `Hola ${user.name || 'Usuario'}, tu código de seguridad para 4A Urban es: ${code}`;
      sendWhatsApp(user.phone, msg);
    }
    res.json({ message: 'Código generado y enviado' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error en la solicitud' }); }
});

app.post('/api/auth/reset-password', authLimiter, authenticateToken, async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) return res.status(400).json({ error: 'Código y nueva contraseña son requeridos' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.resetCode || user.resetCode !== code || user.resetCodeExpires < new Date()) { return res.status(400).json({ error: 'Código inválido' }); }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword, resetCode: null, resetCodeExpires: null } });
  res.json({ message: 'Contraseña actualizada' });
});

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, birthday: true, documentId: true, jobTitle: true, createdAt: true, updatedAt: true, role: { select: { name: true } } },
    });
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }); }
});

app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, birthday, documentId, jobTitle, email } = req.body;
    const data = { name, phone, birthday: birthday ? new Date(birthday) : null, documentId, jobTitle, email };
    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(updated);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }); }
});

app.get('/api/users', authenticateToken, requirePermission('customers.view'), async (req, res) => {
  const users = await prisma.user.findMany({ where: { role: { name: 'CUSTOMER' } }, include: { orders: true } });
  const formatted = users.map(u => ({ ...u, totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0), orderCount: u.orders.length }));
  res.json(formatted);
});

// ── Roles ────────────────────────────────────────────────────────────────────
app.get('/api/permissions', authenticateToken, requirePermission('roles.manage'), (req, res) => {
  res.json(PERMISSIONS);
});

app.get('/api/roles', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const roles = await prisma.role.findMany({ include: { _count: { select: { users: true } } }, orderBy: { createdAt: 'asc' } });
  res.json(roles);
});

const isValidRolePayload = ({ name, permissions }) =>
  typeof name === 'string' && name.trim().length > 0 &&
  Array.isArray(permissions) && permissions.every((p) => PERMISSION_KEYS.includes(p));

app.post('/api/roles', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  if (!isValidRolePayload(req.body)) return res.status(400).json({ error: 'Datos de rol inválidos' });
  const { name, description, permissions, isSuperAdmin } = req.body;
  try {
    const role = await prisma.role.create({ data: { name: name.trim(), description, permissions, isSuperAdmin: !!isSuperAdmin } });
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    console.error(err); res.status(500).json({ error: 'Error' });
  }
});

app.put('/api/roles/:id', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const role = await prisma.role.findUnique({ where: { id: Number(req.params.id) } });
  if (!role) return res.sendStatus(404);
  if (role.isSystem) return res.status(400).json({ error: 'No se puede editar un rol de sistema' });
  if (!isValidRolePayload(req.body)) return res.status(400).json({ error: 'Datos de rol inválidos' });
  const { name, description, permissions, isSuperAdmin } = req.body;
  try {
    const updated = await prisma.role.update({ where: { id: role.id }, data: { name: name.trim(), description, permissions, isSuperAdmin: !!isSuperAdmin } });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    console.error(err); res.status(500).json({ error: 'Error' });
  }
});

app.delete('/api/roles/:id', authenticateToken, requirePermission('roles.manage'), async (req, res) => {
  const role = await prisma.role.findUnique({ where: { id: Number(req.params.id) }, include: { _count: { select: { users: true } } } });
  if (!role) return res.sendStatus(404);
  if (role.isSystem) return res.status(400).json({ error: 'No se puede eliminar un rol de sistema' });
  if (role._count.users > 0) return res.status(400).json({ error: 'No se puede eliminar un rol con usuarios asignados' });
  await prisma.role.delete({ where: { id: role.id } });
  res.status(204).send();
});

// ── Staff ────────────────────────────────────────────────────────────────────
app.get('/api/staff', authenticateToken, requirePermission('staff.manage'), async (req, res) => {
  const staff = await prisma.user.findMany({
    where: { role: { name: { not: 'CUSTOMER' } } },
    select: { id: true, email: true, name: true, password: true, createdAt: true, role: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(staff.map(({ password, ...u }) => ({ ...u, activo: !!password })));
});

app.post('/api/staff', authenticateToken, requirePermission('staff.manage'), async (req, res) => {
  const { email, name, roleId } = req.body;
  if (!email || !roleId) return res.status(400).json({ error: 'Email y rol son requeridos' });
  try {
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role || role.name === 'CUSTOMER') return res.status(400).json({ error: 'Rol inválido' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });

    const inviteToken = randomBytes(32).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const user = await prisma.user.create({ data: { email, name, roleId: role.id, inviteToken, inviteTokenExpires } });
    const link = `${FRONTEND_URL}/set-password?token=${inviteToken}`;
    const emailSent = await sendInviteEmail(email, name, link);
    res.status(201).json({ id: user.id, email: user.email, name: user.name, emailSent });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error creando el usuario' }); }
});

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(products);
});

const isValidProductPayload = ({ nombre, precio, talla }) =>
  typeof nombre === 'string' && nombre.trim().length > 0 &&
  Number.isFinite(Number(precio)) && Number(precio) > 0 &&
  typeof talla === 'string' && talla.trim().length > 0;

app.post('/api/products', authenticateToken, requirePermission('products.manage'), async (req, res) => {
  if (!isValidProductPayload(req.body)) return res.status(400).json({ error: 'Datos de producto inválidos' });
  const { nombre, precio, talla, imageUrl } = req.body;
  const newProduct = await prisma.product.create({ data: { nombre, precio: Number(precio), talla, imageUrl } });
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authenticateToken, requirePermission('products.manage'), async (req, res) => {
  if (!isValidProductPayload(req.body)) return res.status(400).json({ error: 'Datos de producto inválidos' });
  const { nombre, precio, talla, imageUrl } = req.body;
  const updated = await prisma.product.update({ where: { id: Number(req.params.id) }, data: { nombre, precio: Number(precio), talla, imageUrl } });
  res.json(updated);
});

app.delete('/api/products/:id', authenticateToken, requirePermission('products.manage'), async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido debe incluir al menos un producto' });
    }

    const productIds = items.map((item) => Number(item.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productById = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const itemsData = [];
    for (const item of items) {
      const product = productById.get(Number(item.productId));
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Producto o cantidad inválida en el pedido' });
      }
      // El precio se toma siempre del catálogo, nunca del cliente, para evitar manipulación.
      total += product.precio * quantity;
      itemsData.push({ productId: product.id, quantity, price: product.precio });
    }

    const order = await prisma.order.create({
      data: { userId: req.user.id, total, status: 'PENDING', items: { create: itemsData } },
    });
    res.status(201).json(order);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }); }
});

app.get('/api/orders/me', authenticateToken, async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

app.get('/api/orders', authenticateToken, requirePermission('orders.manage'), async (req, res) => {
  const orders = await prisma.order.findMany({ include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

app.put('/api/orders/:id', authenticateToken, requirePermission('orders.manage'), async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status, trackingNumber } });
  res.json(order);
});

app.listen(PORT, () => { console.log(`Servidor corriendo en http://localhost:${PORT}`); });
