import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Trash2, Users } from 'lucide-react';
import { API_URL } from '../../lib/api';

const emptyForm = { name: '', description: '', permissions: [], isSuperAdmin: false };

const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthStore();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [rolesRes, permsRes] = await Promise.all([
      fetch(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/api/permissions`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setRoles(await rolesRes.json());
    setPermissions(await permsRes.json());
  };

  const togglePermission = (key) => {
    setFormData((f) => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter((p) => p !== key) : [...f.permissions, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const url = editingId ? `${API_URL}/api/roles/${editingId}` : `${API_URL}/api/roles`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
        fetchAll();
      } else {
        const err = await res.json();
        setError(err.error || 'No se pudo guardar el rol');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setFormData({ name: role.name, description: role.description || '', permissions: role.permissions, isSuperAdmin: role.isSuperAdmin });
    setEditingId(role.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (role) => {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    const res = await fetch(`${API_URL}/api/roles/${role.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) fetchAll();
    else {
      const err = await res.json();
      alert(err.error || 'No se pudo eliminar el rol');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-urban text-4xl">Roles</h1>
          <p className="text-white/30 text-sm mt-1">{roles.length} roles configurados</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(emptyForm); setError(''); }}
          className="bg-white text-black px-6 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl"
        >
          + Nuevo Rol
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="font-urban text-xl mb-6 text-white/80">{editingId ? 'Editar Rol' : 'Nuevo Rol'}</h2>
            {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Nombre del rol</label>
                  <input
                    type="text"
                    placeholder="Ej: Ventas"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Descripción (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Gestiona pedidos y clientes"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isSuperAdmin: !formData.isSuperAdmin })}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                  formData.isSuperAdmin ? 'bg-white text-black border-white' : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-3 font-urban text-xs uppercase tracking-widest font-bold">
                  <ShieldCheck size={18} /> Super Administrador (acceso total)
                </span>
                <span className={`w-10 h-6 rounded-full p-1 transition-all ${formData.isSuperAdmin ? 'bg-emerald-500' : 'bg-white/10'}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${formData.isSuperAdmin ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              {!formData.isSuperAdmin && (
                <div>
                  <label className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-3 font-urban">
                    <Lock size={14} /> Permisos
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/20 transition">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="accent-white"
                        />
                        <span className="text-sm text-white/70">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50">
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Rol')}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role) => (
          <motion.div key={role.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${role.isSuperAdmin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-urban text-base text-white">{role.name}</h3>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Users size={11} /> {role._count.users} usuario(s)
                  </p>
                </div>
              </div>
            </div>
            {role.description && <p className="text-white/40 text-sm mb-4">{role.description}</p>}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {role.isSuperAdmin ? (
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">Acceso total</span>
              ) : role.permissions.length === 0 ? (
                <span className="text-white/20 text-[10px] uppercase tracking-widest italic">Sin permisos</span>
              ) : (
                role.permissions.map((p) => (
                  <span key={p} className="bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">{p}</span>
                ))
              )}
            </div>
            {!role.isSystem && (
              <div className="flex gap-3">
                <button onClick={() => handleEdit(role)}
                  className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-2 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 transition">
                  Editar
                </button>
                <button onClick={() => handleDelete(role)}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-rose-500/20 transition flex items-center gap-2">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            {role.isSystem && (
              <p className="text-white/10 text-[10px] uppercase tracking-widest italic">Rol de sistema</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RolesManager;
