import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  name: localStorage.getItem('name') || null,
  setAuth: (token, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (name) localStorage.setItem('name', name);
    set({ token, role, name });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    set({ token: null, role: null, name: null });
  },
}));
