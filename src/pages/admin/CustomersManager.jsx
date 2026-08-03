import { useState, useEffect, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../../store/authStore"
import { Users, Mail, Phone, Cake, ShoppingBag, CreditCard, ChevronDown, Calendar, Package, ArrowRight } from "lucide-react"
import { API_URL } from "../../lib/api"

const CustomersManager = () => {
  const { token } = useAuthStore()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setCustomers(data)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="p-8 text-white/30 font-urban uppercase tracking-widest animate-pulse">Cargando clientes...</div>

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="font-urban text-5xl uppercase tracking-tighter font-bold">Base de Datos</h1>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] mt-2">Gestión de fidelidad y clientes</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl text-white/40">
              <Users size={20} />
            </div>
            <span className="font-urban text-2xl uppercase tracking-tighter font-bold">{customers.length} Clientes Activos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban">
                <th className="px-10 py-6 font-normal">Identidad</th>
                <th className="px-10 py-6 font-normal">Contacto</th>
                <th className="px-10 py-6 font-normal">Cumpleaños</th>
                <th className="px-10 py-6 font-normal">Inversión</th>
                <th className="px-10 py-6 font-normal text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {customers.map((user) => (
                <Fragment key={user.id}>
                  <tr className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer ${expandedId === user.id ? 'bg-white/[0.03]' : ''}`}
                    onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 font-bold text-xl group-hover:bg-white group-hover:text-black transition-all">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-white font-urban text-lg font-bold uppercase tracking-tight">{user.name || 'Sin nombre'}</p>
                          <p className="text-white/20 text-[9px] uppercase tracking-widest mt-1 flex items-center gap-2">
                             <Calendar size={10} /> Miembro desde {new Date(user.createdAt).getFullYear()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                          <Mail size={12} className="opacity-40" /> <span className="text-[11px] font-urban">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-white/40">
                            <Phone size={12} className="opacity-40" /> <span className="text-[11px] font-urban">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {user.birthday ? (
                        <div className="flex items-center gap-3 text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-4 py-2 rounded-2xl w-fit">
                          <Cake size={14} />
                          <span className="font-urban text-[11px] uppercase tracking-widest font-bold">
                            {new Date(user.birthday).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/5 text-[10px] uppercase tracking-widest italic">No definido</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CreditCard size={14} className="opacity-40" />
                          <span className="font-urban text-xl tracking-tighter">${user.totalSpent.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">{user.orderCount} Pedidos Totales</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 ml-auto ${expandedId === user.id ? 'rotate-180 bg-white text-black' : ''}`}>
                        <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence>
                    {expandedId === user.id && (
                      <tr>
                        <td colSpan="5" className="px-10 py-0 bg-black/40">
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                             <div className="py-10 border-x border-white/5">
                                <div className="flex items-center gap-4 mb-8 px-10">
                                   <Package size={16} className="text-white/20" />
                                   <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Historial de pedidos del cliente</h4>
                                   <span className="flex-1 h-px bg-white/5" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-10">
                                   {user.orders && user.orders.length > 0 ? user.orders.map(order => (
                                     <div key={order.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[24px] hover:border-white/10 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                           <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">#{order.id}</span>
                                           <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${
                                              order.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                                              order.status === 'PENDING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                                              'text-blue-400 border-blue-400/20 bg-blue-400/5'
                                           }`}>
                                              {order.status}
                                           </span>
                                        </div>
                                        <p className="text-2xl font-urban font-bold tracking-tighter mb-4 text-white/80">${order.total.toLocaleString()}</p>
                                        <div className="flex justify-between items-center text-[9px] text-white/20 uppercase tracking-widest">
                                           <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                           <div className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <ArrowRight size={12} />
                                           </div>
                                        </div>
                                     </div>
                                   )) : (
                                     <p className="text-white/10 text-xs italic font-urban col-span-full">Este cliente aún no ha completado compras.</p>
                                   )}
                                </div>
                             </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-10 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700"><Users size={80} /></div>
          <h4 className="font-urban text-amber-500 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Estrategia VIP</h4>
          <p className="text-white/40 text-sm leading-relaxed font-urban uppercase tracking-widest">
            Prioriza el contacto con clientes que superen los $500.000 en inversión total para ofrecer drops exclusivos.
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-10 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700"><Cake size={80} /></div>
          <h4 className="font-urban text-emerald-500 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Marketing Estacional</h4>
          <p className="text-white/40 text-sm leading-relaxed font-urban uppercase tracking-widest">
            Filtra por cumpleaños este mes para enviar códigos de descuento personalizados vía WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomersManager
