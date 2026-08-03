import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../lib/api';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.error || 'No se pudo activar la cuenta');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6 text-center">
        <p className="text-white/40 font-urban text-sm uppercase tracking-widest">Enlace inválido o incompleto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {done ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={36} className="text-black" />
            </div>
            <h1 className="font-urban text-3xl text-white mb-3 uppercase tracking-widest">¡Listo!</h1>
            <p className="text-white/40 text-sm">Tu contraseña quedó creada. Te llevamos al login...</p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h1 className="font-urban text-3xl text-white mb-2 uppercase tracking-widest">Crea tu contraseña</h1>
              <p className="text-white/30 text-xs font-urban uppercase tracking-widest">Activa tu cuenta de 4A Urban</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 mb-6 rounded-xl text-[10px] uppercase tracking-widest font-urban text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban"><Lock size={12} /> Nueva contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 rounded-xl text-sm"
                  placeholder="Mínimo 8 caracteres" required />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban"><Lock size={12} /> Confirmar contraseña</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 rounded-xl text-sm"
                  placeholder="Repite la contraseña" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-white text-black py-5 text-sm font-urban uppercase tracking-[0.3em] hover:bg-gray-100 transition-all rounded-xl disabled:opacity-50">
                {loading ? 'Creando...' : 'Crear contraseña'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <Link to="/login" className="text-white/20 hover:text-white transition font-urban text-[10px] uppercase tracking-widest">
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SetPassword;
