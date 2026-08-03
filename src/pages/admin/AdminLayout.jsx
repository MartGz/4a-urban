import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../lib/api';
import { LayoutDashboard, ShoppingBag, Users, User, LogOut, ArrowUpRight, ArrowLeft, ShieldCheck, UserCog } from 'lucide-react';

const AdminLayout = () => {
  const { token, isSuperAdmin, permissions, logout, name } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ products: 0 });
  const [loggingOut, setLoggingOut] = useState(false);
  const isStaff = isSuperAdmin || permissions.length > 0;

  useEffect(() => {
    if (!token || !isStaff) return;
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => setStats({ products: data.length }))
      .catch(() => {});
  }, [token, isStaff]);

  if (!token) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate('/login');
    }, 1200);
  };

  const hasPerm = (perm) => isSuperAdmin || permissions.includes(perm);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/admin/productos', label: 'Productos', icon: ShoppingBag, show: hasPerm('products.manage') },
    { to: '/admin/clientes', label: 'Clientes', icon: Users, show: hasPerm('customers.view') },
    { to: '/admin/roles', label: 'Roles', icon: ShieldCheck, show: hasPerm('roles.manage') },
    { to: '/admin/personal', label: 'Personal', icon: UserCog, show: hasPerm('staff.manage') },
    { to: '/admin/perfil', label: 'Mi Perfil', icon: User, show: true },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#080808] flex text-white font-urban">
      {/* Logout Overlay */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Saliendo del Panel...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-white/5 flex flex-col fixed h-full z-20">
        {/* Profile Head */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-xl shadow-white/5">
            {name ? name[0].toUpperCase() : 'A'}
          </div>
          <h2 className="text-xl tracking-tighter uppercase font-bold">{name || 'Admin'}</h2>
          <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Administrator Access</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 mt-4">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                  active ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-black' : 'text-white/20 group-hover:text-white transition-colors'} />
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 mt-auto space-y-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] uppercase tracking-widest text-white/20">Catálogo Activo</span>
              <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full animate-pulse" />
            </div>
            <p className="text-2xl font-bold">{stats.products} <span className="text-[10px] text-white/20 font-normal uppercase tracking-widest">SKUs</span></p>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 transition-all group">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen relative">
        {/* Dynamic Header bar */}
        <header className="h-20 border-b border-white/5 flex items-center px-12 justify-between sticky top-0 bg-[#080808]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 text-white/30 text-[10px] uppercase tracking-[0.3em]">
            <Link to="/admin" className="hover:text-white transition">4A URBAN</Link>
            <span>/</span>
            <span className="text-white font-bold">{navItems.find(n => n.to === location.pathname)?.label || 'System'}</span>
          </div>
          
          <Link to="/" className="flex items-center gap-2 font-urban text-[10px] text-white/20 hover:text-white transition uppercase tracking-[0.2em] group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Ver Tienda <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
          </Link>
        </header>

        {/* Content Wrapper */}
        <div className="p-12 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
