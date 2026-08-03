import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShoppingCart, Check, CreditCard, AlertCircle } from "lucide-react"
import { API_URL } from "../lib/api"

const WHATSAPP_NUMBER = "573337071742"

const Carrito = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount, addItem } = useCartStore()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [sugerencias, setSugerencias] = useState([])
  const [comprando, setComprando] = useState(false)
  const [error, setError] = useState("")
  const total = getTotal()
  const count = getCount()

  const metaEnvio = 200000
  const progresoEnvio = Math.min((total / metaEnvio) * 100, 100)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(d => {
        const idsInCart = items.map(i => i.id)
        setSugerencias(d.filter(p => !idsInCart.includes(p.id)).slice(0, 3))
      })
  }, [items])

  const handleComprar = async () => {
    if (!token) { navigate("/login"); return }
    if (items.length === 0) return

    setComprando(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          total,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.precio })),
        }),
      })
      if (!res.ok) throw new Error("No se pudo registrar el pedido")
    } catch {
      setComprando(false)
      setError("No pudimos registrar tu pedido. Verifica tu conexión e inténtalo de nuevo.")
      return
    }

    const resumen = items.map((i) =>
      `• ${i.nombre} x${i.quantity} — $${(i.precio * i.quantity).toLocaleString()}`
    ).join("\n")

    const msg = encodeURIComponent(
      `¡Hola! Quiero hacer el siguiente pedido en *4A Urban*\n\n${resumen}\n\n*Total: $${total.toLocaleString()} COP*\n\n¿Me confirmas disponibilidad?`
    )
    clearCart()
    setComprando(false)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank")
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md">
          <div className="relative mb-12">
            <motion.div
              animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-40 h-40 mx-auto flex items-center justify-center bg-white/[0.02] rounded-full border border-white/5"
            >
              <ShoppingCart size={64} className="text-white/10" strokeWidth={1} />
            </motion.div>
            <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full" />
          </div>
          <p className="font-urban text-white/30 text-[10px] uppercase tracking-[0.5em] mb-4">Tu selección</p>
          <h1 className="font-urban text-6xl text-white mb-6 uppercase tracking-tighter font-bold">Carrito Vacío</h1>
          <p className="text-white/30 mb-12 leading-relaxed font-urban text-sm uppercase tracking-widest px-8">Explora nuestra colección y encuentra piezas exclusivas para tu estilo.</p>
          <Link to="/catalogo"
            className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 font-urban text-xs uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition-all rounded-2xl shadow-2xl">
            Explorar Catálogo <ArrowRight size={14} />
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white pt-44 px-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-white/30 font-urban text-[10px] uppercase tracking-[0.5em] mb-4 flex items-center gap-4">
               <span className="w-12 h-px bg-white/10" /> Tu Selección Actual
            </p>
            <h1 className="font-urban text-8xl leading-none font-bold uppercase tracking-tighter">CARRITO</h1>
          </div>
          <div className="text-right">
            <p className="text-white/30 font-urban text-[10px] uppercase tracking-widest">{count} ARTÍCULOS EN BOLSA</p>
            <button onClick={clearCart}
              className="text-white/20 hover:text-rose-500 transition font-urban text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2 ml-auto group">
              <Trash2 size={12} className="group-hover:-translate-y-0.5 transition-transform" /> Vaciar carrito
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex gap-8 bg-white/[0.02] border border-white/5 hover:border-white/10 p-6 transition-all rounded-[32px] items-center"
                >
                  <div className="w-32 h-40 bg-[#0c0c0c] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden relative rounded-2xl">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <img src="/logo.png" alt="4A" className="w-16 h-16 object-contain opacity-10" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-2">
                    <div>
                      <h3 className="font-urban text-2xl text-white font-bold uppercase tracking-tight">{item.nombre}</h3>
                      <p className="text-white/20 text-[10px] font-urban mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                         <span className="w-4 h-px bg-white/10" /> Talla: {item.talla}
                      </p>
                    </div>
                    <div className="flex items-center gap-8 mt-8">
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition">
                          <Minus size={14} />
                        </button>
                        <span className="w-12 h-10 flex items-center justify-center font-urban text-white text-base font-bold">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        className="text-white/10 hover:text-rose-500 transition font-urban text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 group">
                        <Trash2 size={12} className="group-hover:scale-110 transition-transform" /> Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-center py-1">
                    <p className="font-urban text-3xl text-white font-bold tracking-tighter">${(item.precio * item.quantity).toLocaleString()}</p>
                    {item.quantity > 1 && (
                      <p className="text-white/10 text-[10px] font-urban mt-1 uppercase tracking-widest">${item.precio.toLocaleString()} c/u</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Sugerencias */}
            {sugerencias.length > 0 && (
              <div className="mt-24">
                <div className="flex items-center gap-4 mb-10">
                   <h4 className="font-urban text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold whitespace-nowrap">Completa el estilo</h4>
                   <span className="w-full h-px bg-white/5" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {sugerencias.map((p) => (
                    <div key={p.id} className="group relative">
                      <div className="aspect-[3/4] bg-[#0c0c0c] border border-white/5 rounded-[24px] overflow-hidden mb-4 relative">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-5">
                            <img src="/logo.png" alt="4A" className="w-16 h-16 object-contain" />
                          </div>
                        )}
                        <button onClick={() => addItem(p)}
                          className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 rounded-xl font-urban text-[9px] uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center justify-center gap-2">
                          <Plus size={12} /> Añadir
                        </button>
                      </div>
                      <h5 className="font-urban text-xs text-white uppercase tracking-tight font-bold">{p.nombre}</h5>
                      <p className="font-urban text-xs text-white/30 mt-1">${p.precio?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/[0.01] border border-white/5 p-10 sticky top-44 rounded-[40px] shadow-2xl"
            >
              <h2 className="font-urban text-[10px] uppercase tracking-[0.5em] text-white/20 mb-10 font-bold">Resumen de Orden</h2>

              {/* Barra de envío */}
              <div className="mb-12">
                <div className="flex justify-between text-[9px] font-urban uppercase tracking-[0.2em] mb-4">
                  <span className={total >= metaEnvio ? "text-emerald-400 font-bold" : "text-white/30"}>
                    {total >= metaEnvio ? "✓ Envío Gratis Desbloqueado" : `Te faltan $${(metaEnvio - total).toLocaleString()}`}
                  </span>
                  <span className="text-white/10">{Math.round(progresoEnvio)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progresoEnvio}%` }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
                {total < metaEnvio && (
                  <p className="text-[8px] text-white/10 uppercase tracking-widest mt-3 flex items-center gap-2">
                    <Truck size={10} /> Meta para envío nacional gratuito
                  </p>
                )}
              </div>

              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-6">
                  <span className="font-urban text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">Inversión Total</span>
                  <span className="font-urban text-5xl text-white font-bold tracking-tighter">${total.toLocaleString()}</span>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-white/30">
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-[10px] uppercase tracking-widest font-urban">Transacción Segura</span>
                   </div>
                   <div className="flex items-center gap-3 text-white/30">
                      <Truck size={14} className="text-white/10" />
                      <span className="text-[10px] uppercase tracking-widest font-urban">Envío Coordinado</span>
                   </div>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-rose-400 text-[10px] uppercase tracking-widest font-urban mb-4">
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <button onClick={handleComprar} disabled={comprando}
                className="w-full bg-white text-black hover:bg-gray-100 py-6 rounded-3xl font-urban text-xs uppercase tracking-[0.4em] font-bold transition-all flex items-center justify-center gap-4 mb-6 shadow-2xl shadow-white/5 group disabled:opacity-50">
                {comprando ? "Procesando..." : "Realizar Pedido"} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link to="/catalogo"
                className="w-full block text-center py-5 font-urban text-[9px] uppercase tracking-widest text-white/20 hover:text-white transition-all border border-white/5 hover:border-white/10 rounded-2xl">
                Seguir Comprando
              </Link>

              {!token && (
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-white/10 text-[9px] mb-4 uppercase tracking-[0.3em] font-bold">
                    Acceso exclusivo clientes
                  </p>
                  <Link to="/login" className="text-white font-urban text-[10px] uppercase tracking-[0.4em] font-bold border-b border-white/40 pb-1 hover:border-white transition-all">
                    Identificarse
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Carrito