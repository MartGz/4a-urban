import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../../store/authStore"
import { API_URL } from "../../lib/api"
import {
  TrendingUp, 
  Package, 
  Shirt, 
  Activity, 
  RefreshCw, 
  Search, 
  Filter, 
  Mail, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  ChevronRight,
  Bell,
  MessageSquare,
  User
} from "lucide-react"

const Dashboard = () => {
  const { token } = useAuthStore()
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0, activeUsers: 42 })
  const [orders, setOrders] = useState([])
  const [saving, setSaving] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [updateData, setUpdateData] = useState({ status: '', trackingNumber: '', sendEmail: true, customMessage: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      const products = await productsRes.json()
      const allOrders = await ordersRes.json()
      setStats({ totalProducts: products.length, totalOrders: allOrders.length, totalSales: allOrders.reduce((sum, o) => sum + o.total, 0), activeUsers: 42 })
      setOrders(allOrders)
    } catch (err) { console.error(err) }
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updateData)
      })
      if (res.ok) { 
        setEditingOrder(null)
        fetchData() 
      } else {
        const errData = await res.json()
        alert(`Error: ${errData.error || 'No se pudo guardar'}`)
      }
    } catch (err) { 
      console.error(err)
      alert('Error de conexión con el servidor')
    } finally {
      setSaving(false)
    }
  }

  const statusOptions = [
    { id: 'PENDING', label: 'Pendiente', color: 'bg-amber-500', icon: Clock },
    { id: 'SHIPPED', label: 'Enviado', color: 'bg-blue-500', icon: Truck },
    { id: 'COMPLETED', label: 'Entregado', color: 'bg-emerald-500', icon: CheckCircle2 },
    { id: 'CANCELLED', label: 'Cancelado', color: 'bg-rose-500', icon: XCircle },
  ]

  const cards = [
    { title: "Ventas Reales", value: `$${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400" },
    { title: "Pedidos Totales", value: stats.totalOrders, icon: Package, color: "text-amber-400" },
    { title: "Productos", value: stats.totalProducts, icon: Shirt, color: "text-blue-400" },
    { title: "Visitas Hoy", value: stats.activeUsers, icon: Activity, color: "text-rose-400" },
  ]

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-urban text-5xl uppercase tracking-tighter font-bold">Dashboard</h1>
          <p className="text-white/20 text-xs font-urban uppercase tracking-[0.4em] mt-2">Visión general del sistema</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all font-urban text-[10px] uppercase tracking-widest group">
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Sincronizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <card.icon size={64} />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-white/5 ${card.color}`}>
                <card.icon size={20} />
              </div>
              <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-urban">Live</span>
            </div>
            <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-urban mb-1">{card.title}</h3>
            <p className={`text-4xl font-urban font-bold tracking-tighter ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gestión de Pedidos */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <Package className="text-white/20" size={24} />
            <h3 className="font-urban text-2xl uppercase tracking-tighter font-bold">Órdenes Recientes</h3>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input type="text" placeholder="Buscar pedido..." className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-urban outline-none focus:border-white/30 transition-all w-64" />
             </div>
             <button className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/30 hover:text-white transition"><Filter size={14} /></button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban">
                <th className="px-10 py-6 font-normal">Referencia</th>
                <th className="px-10 py-6 font-normal">Comprador</th>
                <th className="px-10 py-6 font-normal">Estado</th>
                <th className="px-10 py-6 font-normal">Inversión</th>
                <th className="px-10 py-6 font-normal">Emailing</th>
                <th className="px-10 py-6 font-normal text-right">Control</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <td className="px-10 py-8 font-urban text-white/40 font-bold">#{order.id}</td>
                  <td className="px-10 py-8">
                    <p className="text-white font-urban text-base">{order.user.name || 'Sin nombre'}</p>
                    <p className="text-white/20 text-[10px] uppercase tracking-widest">{order.user.email}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-urban uppercase tracking-[0.1em] border ${
                      order.status === 'PENDING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                      order.status === 'SHIPPED' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                      order.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                      'text-rose-400 border-rose-400/20 bg-rose-400/5'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'PENDING' ? 'bg-amber-400' :
                        order.status === 'SHIPPED' ? 'bg-blue-400' :
                        order.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                      {order.status === 'PENDING' ? 'Pendiente' : order.status === 'SHIPPED' ? 'Enviado' : order.status === 'COMPLETED' ? 'Entregado' : 'Cancelado'}
                    </div>
                  </td>
                  <td className="px-10 py-8 font-urban text-white/80 font-bold text-lg">${order.total.toLocaleString()}</td>
                  <td className="px-10 py-8">
                    {order.emailSent ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Mail size={14} />
                        </div>
                        <div>
                          <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-urban font-bold">Enviado</p>
                          <p className="text-[9px] text-white/10">{new Date(order.lastNotificationAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 opacity-20">
                         <Mail size={14} />
                         <span className="text-[10px] uppercase tracking-widest font-urban">Pendiente</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button onClick={() => { setEditingOrder(order); setUpdateData({ status: order.status, trackingNumber: order.trackingNumber || '', sendEmail: true, customMessage: '' }); }}
                      className="bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black px-5 py-2.5 rounded-xl font-urban text-[10px] uppercase tracking-widest transition-all inline-flex items-center gap-2 group">
                      Gestionar <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL DE GESTIÓN (REDESIGNADO) ══ */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingOrder(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-[#0e0e0e] border border-white/10 rounded-[48px] overflow-hidden p-12 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="font-urban text-5xl text-white mb-3 uppercase tracking-tighter font-bold">ORDEN #{editingOrder.id}</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center"><User size={12} className="text-white/30" /></div>
                    <p className="text-white/30 text-[10px] font-urban uppercase tracking-[0.2em]">{editingOrder.user.email}</p>
                  </div>
                </div>
                <button onClick={() => setEditingOrder(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition"><XCircle size={24} /></button>
              </div>

              <form onSubmit={handleUpdateOrder} className="space-y-10">
                {/* Selector de Estado Premium */}
                <div>
                  <label className="flex items-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban mb-5">
                    <Activity size={12} /> Estado del Proceso
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.id} type="button" onClick={() => setUpdateData({ ...updateData, status: opt.id })}
                          className={`flex items-center justify-between p-4 rounded-2xl border font-urban text-[11px] uppercase tracking-widest transition-all ${
                            updateData.status === opt.id 
                              ? `border-white text-white ${opt.color}/10 bg-white/5` 
                              : 'border-white/5 text-white/20 hover:border-white/20 hover:bg-white/[0.02]'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                             <Icon size={16} className={updateData.status === opt.id ? 'text-white' : 'text-white/10'} />
                             {opt.label}
                          </span>
                          {updateData.status === opt.id && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Número de Guía */}
                <div>
                  <label className="flex items-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban mb-4">
                    <Truck size={12} /> Número de Guía Logistics
                  </label>
                  <div className="relative">
                    <input type="text" value={updateData.trackingNumber} onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                      placeholder="Ej: SERVIENTREGA-99201"
                      className="w-full bg-white/5 border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:border-white/30 outline-none text-sm font-urban tracking-widest placeholder:text-white/5"
                    />
                    <Package size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10" />
                  </div>
                </div>

                {/* Sección Email Dinámica */}
                <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${updateData.sendEmail ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white/5 text-white/10'}`}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-white font-urban text-xs uppercase tracking-widest font-bold">Email Automatizado</p>
                        <p className="text-white/20 text-[9px] uppercase tracking-widest">Enviar alerta al comprador</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setUpdateData({ ...updateData, sendEmail: !updateData.sendEmail })}
                      className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${updateData.sendEmail ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <motion.div 
                        animate={{ x: updateData.sendEmail ? 28 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md" 
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {updateData.sendEmail && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                        <label className="flex items-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em] font-urban">
                          <MessageSquare size={12} /> Mensaje Especial
                        </label>
                        <textarea value={updateData.customMessage} onChange={(e) => setUpdateData({ ...updateData, customMessage: e.target.value })}
                          placeholder="Tu pedido ya está en camino, esperamos que te encante..."
                          className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-white/30 outline-none text-sm min-h-[120px] font-urban placeholder:text-white/5"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Acciones Finales */}
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 bg-white text-black py-6 rounded-[24px] font-urban text-xs uppercase tracking-[0.4em] font-bold hover:bg-gray-100 transition shadow-2xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Procesando...' : 'Actualizar Orden'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
