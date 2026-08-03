import { create } from 'zustand';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  name: localStorage.getItem('name') || null,
  permissions: readJson('permissions', []),
  isSuperAdmin: readJson('isSuperAdmin', false),
  setAuth: ({ token, role, name, permissions = [], isSuperAdmin = false }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (name) localStorage.setItem('name', name);
    localStorage.setItem('permissions', JSON.stringify(permissions));
    localStorage.setItem('isSuperAdmin', JSON.stringify(isSuperAdmin));
    set({ token, role, name, permissions, isSuperAdmin });
  },
  hasPermission: (permission) => {
    const state = useAuthStore.getState();
    return state.isSuperAdmin || state.permissions.includes(permission);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('permissions');
    localStorage.removeItem('isSuperAdmin');
    set({ token: null, role: null, name: null, permissions: [], isSuperAdmin: false });
  },
}));
