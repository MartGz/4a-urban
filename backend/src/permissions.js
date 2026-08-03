export const PERMISSIONS = [
  { key: 'products.manage', label: 'Gestionar productos' },
  { key: 'orders.manage', label: 'Gestionar pedidos' },
  { key: 'customers.view', label: 'Ver clientes' },
  { key: 'roles.manage', label: 'Gestionar roles' },
  { key: 'staff.manage', label: 'Gestionar usuarios de staff' },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);
