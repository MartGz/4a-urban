import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import { API_URL } from '../../lib/api';

const emptyForm = { email: '', name: '', roleId: '' };

const StaffManager = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useAuthStore();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [staffRes, rolesRes] = await Promise.all([
      fetch(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setStaff(await staffRes.json());
    const allRoles = await rolesRes.json();
    setRoles(allRoles.filter((r) => r.name !== 'CUSTOMER'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(emptyForm);
        setShowForm(false);
        setMessage(`Usuario creado. Le estamos enviando el correo de invitación a ${data.email}.`);
        fetchAll();
      } else {
        setError(data.error || 'No se pudo crear el usuario');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-urban text-4xl">Personal</h1>
          <p className="text-white/30 text-sm mt-1">{staff.length} usuario(s) de staff</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormData(emptyForm); setError(''); }}
          className="bg-white text-black px-6 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl"
        >
          + Nuevo Usuario
        </button>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 mb-8 rounded-xl text-sm flex items-center gap-3">
          <Mail size={16} /> {message}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="font-urban text-xl mb-6 text-white/80">Invitar Usuario</h2>
            {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Nombre</label>
                <input type="text" placeholder="Ej: Juana Pérez" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm" required />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Email</label>
                <input type="email" placeholder="correo@ejemplo.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm" required />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Rol</label>
                <select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm" required>
                  <option value="">Selecciona un rol</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Invitación'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white/5 border border-white/10 px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-white/10 transition rounded-xl">
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.01] border-b border-white/5 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban">
              <th className="px-8 py-5 font-normal">Nombre</th>
              <th className="px-8 py-5 font-normal">Email</th>
              <th className="px-8 py-5 font-normal">Rol</th>
              <th className="px-8 py-5 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {staff.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6 text-white font-urban">{u.name || 'Sin nombre'}</td>
                <td className="px-8 py-6 text-white/40">{u.email}</td>
                <td className="px-8 py-6">
                  <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs text-white/60 font-urban">{u.role.name}</span>
                </td>
                <td className="px-8 py-6">
                  {u.activo ? (
                    <span className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest"><CheckCircle2 size={14} /> Activo</span>
                  ) : (
                    <span className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest"><Clock size={14} /> Invitación pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/20 font-urban text-xl">No hay usuarios de staff aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManager;
