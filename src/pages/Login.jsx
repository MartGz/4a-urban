import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../lib/api';

const WHATSAPP_NUMBER = "573337071742";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setAuth(data.token, data.role, data.name);
        navigate(data.role === 'ADMIN' ? '/admin' : '/catalogo');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex overflow-hidden">
      
      {/* ══ PANEL IZQUIERDO (VISUAL) ══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000')] bg-cover bg-center" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        
        {/* Floating Text */}
        <div className="relative z-10 flex flex-col justify-between p-20 w-full h-full">
          <Link to="/" className="hover:opacity-80 transition inline-block w-fit">
            <img src="/logo.png" alt="4A" className="h-12 w-auto object-contain" />
          </Link>
          
          <div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white/30 font-urban text-xs uppercase tracking-[0.6em] mb-6"
            >
              Exclusive Drop 2026
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-urban text-9xl text-white leading-none mb-8"
            >
              STREET<br/><span className="text-white/10">SOUL</span>
            </motion.h2>
            <div className="h-px w-20 bg-white/20 mb-8" />
            <p className="text-white/40 text-lg max-w-sm font-urban tracking-widest uppercase">
              La calle no perdona, el estilo tampoco.
            </p>
          </div>
        </div>
      </div>

      {/* ══ PANEL DERECHO (FORMULARIO) ══ */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.01] blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="mb-12">
            <h1 className="font-urban text-4xl text-white mb-2 uppercase tracking-widest">Bienvenido</h1>
            <p className="text-white/30 text-xs font-urban uppercase tracking-widest">Ingresa a tu cuenta de 4A Urban</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 mb-8 rounded-xl text-[10px] uppercase tracking-widest font-urban text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] rounded-xl transition-all placeholder:text-white/10 text-sm"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-white/30 text-[10px] uppercase tracking-[0.2em] font-urban">Password</label>
                <button
                  type="button"
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, olvidé mi contraseña de 4A Urban y necesito ayuda para recuperarla.')}`, '_blank')}
                  className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 text-white px-6 py-4 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] rounded-xl transition-all placeholder:text-white/10 text-sm"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-5 text-sm font-urban uppercase tracking-[0.3em] hover:bg-gray-100 transition-all rounded-xl disabled:opacity-50 shadow-xl"
            >
              {loading ? 'Validando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center"><span className="bg-[#080808] px-4 text-white/20 text-[10px] uppercase tracking-widest">o continúa con</span></div>
          </div>

          <button
            type="button"
            onClick={() => alert("Próximamente: Autenticación con Google")}
            className="w-full flex items-center justify-center gap-4 bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-white py-4 rounded-xl transition-all font-urban text-[10px] uppercase tracking-widest"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.48 10.92v3.28h4.74c-.2 1.06-.9 1.95-1.93 2.53l2.9 2.26c2.09-1.92 3.28-4.74 3.28-8.09 0-.78-.07-1.53-.2-2.25H12.48zM12 23c2.97 0 5.46-.98 7.28-2.66l-2.9-2.26c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H3.6l-2.97 2.29C2.43 20.53 6.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V9.12H1.43C.53 10.66 0 12.33 0 14.09c0 1.76.53 3.43 1.43 4.97l3.03-2.34c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 6.7 1 2.43 3.47 1.43 5.41L4.46 7.7c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Cloud
          </button>

          <div className="mt-12 text-center">
            <Link to="/" className="text-white/20 hover:text-white transition font-urban text-[10px] uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-1">
              ← Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
