import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, CheckCircle2, AlertCircle, Key, ArrowLeft } from 'lucide-react';
import { API_URL } from '../lib/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('EMAIL');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, method }),
      });
      if (res.ok) setStep(2);
      else { const err = await res.json(); setError(err.error || 'Error enviando el código'); }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (res.ok) setStep(3);
      else { const err = await res.json(); setError(err.error || 'Código inválido'); }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 mb-6 rounded-xl text-[10px] uppercase tracking-widest font-urban text-center flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mx-auto mb-6"><Key size={28} className="text-white/30" /></div>
                <h1 className="font-urban text-3xl text-white mb-2 uppercase tracking-widest">Recuperar acceso</h1>
                <p className="text-white/30 text-xs font-urban uppercase tracking-widest">Te enviamos un código de verificación</p>
              </div>
              <form onSubmit={requestCode} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 rounded-xl text-sm"
                    placeholder="nombre@ejemplo.com" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setMethod('EMAIL')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${method === 'EMAIL' ? 'bg-white text-black border-white' : 'bg-white/[0.03] border-white/10 text-white/40'}`}>
                    <Mail size={18} /> <span className="text-[9px] uppercase tracking-widest font-bold">Email</span>
                  </button>
                  <button type="button" onClick={() => setMethod('WHATSAPP')}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${method === 'WHATSAPP' ? 'bg-white text-black border-white' : 'bg-white/[0.03] border-white/10 text-white/40'}`}>
                    <MessageCircle size={18} /> <span className="text-[9px] uppercase tracking-widest font-bold">WhatsApp</span>
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black py-5 text-sm font-urban uppercase tracking-[0.3em] hover:bg-gray-100 transition-all rounded-xl disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 text-center">
                <h1 className="font-urban text-3xl text-white mb-2 uppercase tracking-widest">Verificación</h1>
                <p className="text-white/30 text-xs font-urban uppercase tracking-widest">Ingresa el código enviado a tu {method === 'EMAIL' ? 'correo' : 'WhatsApp'}</p>
              </div>
              <form onSubmit={confirmReset} className="space-y-5">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6}
                  className="w-full bg-white/[0.03] border border-white/10 px-6 py-6 rounded-xl text-center text-3xl font-urban tracking-[0.5em] focus:border-white/30 outline-none"
                  placeholder="000000" required />
                <div className="space-y-2">
                  <label className="block text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban">Nueva contraseña</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 rounded-xl text-sm"
                    placeholder="Mínimo 8 caracteres" required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black py-5 text-sm font-urban uppercase tracking-[0.3em] hover:bg-gray-100 transition-all rounded-xl disabled:opacity-50">
                  {loading ? 'Validando...' : 'Confirmar Cambio'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={36} className="text-black" />
              </div>
              <h1 className="font-urban text-3xl text-white mb-3 uppercase tracking-widest">¡Listo!</h1>
              <p className="text-white/40 text-sm mb-10">Tu contraseña fue actualizada correctamente.</p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-white text-black py-5 text-sm font-urban uppercase tracking-[0.3em] hover:bg-gray-100 transition-all rounded-xl">
                Ir a Iniciar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 3 && (
          <div className="mt-10 text-center">
            <Link to="/login" className="text-white/20 hover:text-white transition font-urban text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
              <ArrowLeft size={12} /> Volver al inicio de sesión
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
