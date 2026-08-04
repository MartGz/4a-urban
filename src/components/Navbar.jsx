import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { ShoppingBag, User, LogOut, Menu, X, Smartphone, ShoppingCart, Info, Home, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const WHATSAPP_NUMBER = "573337071742"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const navigate = useNavigate()
  const count = useCartStore((s) => s.getCount())
  const { token, isSuperAdmin, permissions, logout, name } = useAuthStore()
  const isStaff = isSuperAdmin || permissions.length > 0

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      logout()
      setLoggingOut(false)
      navigate('/login')
    }, 1500)
  }

  return (
    <>
      {/* Logout Loading Overlay */}
      <AnimatePresence>
        {loggingOut && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#18181b] flex flex-col items-center justify-center gap-6"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full"
            />
            <p className="font-urban text-[10px] uppercase tracking-[0.5em] text-white/50 animate-pulse">Cerrando sesión segura...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Bar */}
      <div className="fixed top-0 left-0 w-full z-[60] bg-white text-black py-1.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee font-urban text-[10px] uppercase tracking-[0.3em] font-bold">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-10 inline-flex items-center gap-2">
              Envíos a todo Colombia <Smartphone size={10} /> • Streetwear Premium • Cartagena • 4A Urban
            </span>
          ))}
        </div>
      </div>

      <nav className="fixed top-8 left-0 w-full z-50 bg-[#18181b]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition">
            <img src="/logo.png" alt="4A Urban" className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex gap-10 font-urban text-xs uppercase tracking-[0.2em]">
            <Link to="/" className="text-white/60 hover:text-white transition flex items-center gap-2 group">
              <Home size={14} className="opacity-40 group-hover:opacity-100" /> Inicio
            </Link>
            <Link to="/catalogo" className="text-white/60 hover:text-white transition flex items-center gap-2 group">
              <ShoppingBag size={14} className="opacity-40 group-hover:opacity-100" /> Catálogo
            </Link>
            <Link to="/nosotros" className="text-white/60 hover:text-white transition flex items-center gap-2 group">
              <Info size={14} className="opacity-40 group-hover:opacity-100" /> Nosotros
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/carrito" className="relative p-2 text-white/60 hover:text-white transition">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </Link>

            {token ? (
              <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-4">
                <div className="text-right">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest leading-none mb-1">{isStaff ? 'Staff' : 'Cliente'}</p>
                  <p className="text-[11px] text-white font-urban uppercase tracking-widest">{name || 'Usuario'}</p>
                </div>
                {!isStaff && (
                  <Link to="/mis-compras" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition group" title="Mis Pedidos">
                    <Package size={18} className="text-white/40 group-hover:text-white transition" />
                  </Link>
                )}
                <Link to="/perfil" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition group" title="Mi Perfil">
                  <User size={18} className="text-white/40 group-hover:text-white transition" />
                </Link>
                {isStaff && (
                  <Link to="/admin" className="font-urban text-[9px] uppercase tracking-[0.2em] bg-white text-black px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">Panel</Link>
                )}
                <button onClick={handleLogout} className="p-2 text-white/20 hover:text-rose-500 transition">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 font-urban text-[10px] uppercase tracking-widest border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition">
                <User size={14} /> Ingresar
              </Link>
            )}

            <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#18181b] overflow-hidden font-urban text-lg uppercase tracking-widest border-b border-white/10"
            >
              <div className="p-8 flex flex-col gap-6">
                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-4"><Home size={20} /> Inicio</Link>
                <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="flex items-center gap-4"><ShoppingBag size={20} /> Catálogo</Link>
                <Link to="/nosotros" onClick={() => setMenuOpen(false)} className="flex items-center gap-4"><Info size={20} /> Nosotros</Link>
                <Link to="/carrito" onClick={() => setMenuOpen(false)} className="flex items-center gap-4"><ShoppingCart size={20} /> Carrito ({count})</Link>
                {token && (
                  <>
                    <Link to="/mis-compras" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 text-white/50"><Package size={20} /> Mis Pedidos</Link>
                    <Link to="/perfil" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 text-white/50"><User size={20} /> Mi Perfil</Link>
                  </>
                )}
                {token ? (
                  <button onClick={handleLogout} className="text-left text-rose-500 flex items-center gap-4"><LogOut size={20} /> Salir</button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-4 border-t border-white/10 pt-6"><User size={20} /> Ingresar</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

export default Navbar