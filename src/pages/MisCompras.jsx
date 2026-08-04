import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { API_URL } from "../lib/api"
import { Clock, CheckCircle2, XCircle, ChevronDown, Package, ShoppingBag, HelpCircle, ArrowRight, Truck } from "lucide-react"

const WHATSAPP_NUMBER = "573337071742"

const statusMap = {
  PENDING: { label: "Pendiente", color: "text-amber-400 bg-amber-400/5 border-amber-400/20", icon: Clock },
  SHIPPED: { label: "Enviado", color: "text-blue-400 bg-blue-400/5 border-blue-400/20", icon: Truck },
  COMPLETED: { label: "Entregado", color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado", color: "text-rose-400 bg-rose-400/5 border-rose-400/20", icon: XCircle },
}

const MisCompras = () => {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchOrders()
  }, [token])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSupport = (orderId) => {
    const msg = encodeURIComponent(`Hola 4A Urban, tengo una duda sobre mi pedido #${orderId}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank")
  }

  return (
    <main className="min-h-screen bg-[#1c1c1e] text-white pt-44 px-6 pb-32 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white/[0.01] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-6">
             <span className="w-12 h-px bg-white/20" />
             <p className="text-white/30 font-urban text-[10px] uppercase tracking-[0.5em]">Historial Personal</p>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-9xl font-urban leading-none font-bold uppercase tracking-tighter">
            MIS<br /><span className="text-white/10 italic">COMPRAS</span>
          </motion.h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/[0.02] border border-white/5 animate-pulse rounded-[32px]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/[0.02] border border-white/5 p-24 text-center rounded-[48px] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10">
                <ShoppingBag size={40} className="text-white/10" />
              </div>
              <h2 className="font-urban text-5xl font-bold uppercase tracking-tighter mb-6">Aún no hay historia</h2>
              <p className="text-white/20 mb-12 max-w-xs mx-auto text-sm leading-relaxed font-urban uppercase tracking-widest">
                Tus piezas exclusivas aparecerán aquí una vez realices tu primer pedido.
              </p>
              <Link to="/catalogo"
                className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 font-urban text-xs uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition-all rounded-2xl shadow-2xl"
              >
                Ir a la tienda <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const status = statusMap[order.status] || statusMap.PENDING
              const Icon = status.icon
              const isExpanded = expanded === order.id
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white/[0.02] border border-white/5 rounded-[32px] transition-all duration-700 overflow-hidden ${isExpanded ? 'bg-white/[0.05] border-white/10' : 'hover:border-white/10'}`}
                >
                  {/* Header */}
                  <div 
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="flex flex-col md:flex-row md:items-center justify-between p-8 cursor-pointer gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-transform duration-500 ${status.color} ${isExpanded ? 'scale-110 shadow-lg' : ''}`}>
                        <Icon size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                           <p className="text-white font-urban text-2xl font-bold uppercase tracking-tight">Orden #{order.id}</p>
                           <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${status.color}`}>
                              {status.label}
                           </span>
                        </div>
                        <p className="text-white/20 text-[10px] font-urban uppercase tracking-[0.3em] mt-2 font-bold">
                          {new Date(order.createdAt).toLocaleDateString("es-CO", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                      <div className="text-right">
                        <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] mb-2 font-bold">Inversión</p>
                        <p className="font-urban text-4xl text-white font-bold tracking-tighter">${order.total.toLocaleString()}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'rotate-180 bg-white text-black' : 'hover:bg-white/10'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-[#18181b]/20"
                      >
                        <div className="p-10 space-y-10">
                          {/* Info Especial */}
                          {order.trackingNumber && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[24px] flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                     <Truck size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mb-1">Rastreo Logístico</p>
                                     <p className="font-urban text-lg font-bold text-white uppercase tracking-widest">{order.trackingNumber}</p>
                                  </div>
                               </div>
                               <button className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                                  Rastrear
                               </button>
                            </div>
                          )}

                          {/* Lista de productos */}
                          <div className="space-y-6">
                            <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold flex items-center gap-3">
                               <Package size={14} /> Contenido del Pedido
                            </p>
                            <div className="grid gap-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-6 bg-white/[0.02] p-5 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors group">
                                  <div className="w-16 h-20 bg-[#18181b] border border-white/5 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                    <img
                                      src={`${API_URL}/api/products/${item.product.id}/image`}
                                      alt={item.product.nombre}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-8 h-8 object-contain opacity-10'; }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-urban text-lg font-bold uppercase tracking-tight">{item.product.nombre}</p>
                                    <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Cantidad: {item.quantity} • Talla: {item.product.talla}</p>
                                  </div>
                                  <p className="text-white font-urban text-2xl font-bold tracking-tighter">${(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                              onClick={() => handleSupport(order.id)}
                              className="flex-1 bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:border-white/20 text-white py-5 rounded-2xl font-urban text-[10px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3"
                            >
                              <HelpCircle size={14} /> Soporte WhatsApp
                            </button>
                            <Link 
                              to="/catalogo"
                              className="flex-1 bg-white text-black py-5 rounded-2xl font-urban text-[10px] uppercase tracking-[0.3em] font-bold text-center hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                              <ShoppingBag size={14} /> Comprar de nuevo
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Decoración final */}
      <div className="max-w-5xl mx-auto mt-32 pt-16 border-t border-white/5 text-center flex flex-col items-center gap-6">
        <img src="/logo.png" alt="4A" className="w-12 h-12 object-contain opacity-5" />
        <p className="text-white/10 font-urban text-[9px] uppercase tracking-[0.6em] font-bold">STREETWEAR CULTURE • SINCE 2021 • CARTAGENA</p>
      </div>
    </main>
  )
}

export default MisCompras
