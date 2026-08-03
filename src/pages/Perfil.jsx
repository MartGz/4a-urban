import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import { User, Phone, Cake, Briefcase, Mail, ShieldCheck, Lock, ArrowRight, CheckCircle2, MessageCircle, AlertCircle, Key, CreditCard, Edit3, X } from "lucide-react"
import { API_URL } from "../lib/api"

const Perfil = () => {
  const { token, role } = useAuthStore()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [resetStep, setResetStep] = useState(0)
  const [resetMethod, setResetMethod] = useState('EMAIL')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUser(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    if(e) e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(user)
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado' })
        setEditing(false)
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Error al guardar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const requestResetCode = async () => {
    setResetLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method: resetMethod })
      })
      if (res.ok) {
        setResetStep(2)
      } else {
        const err = await res.json()
        alert(err.error || "Error enviando el código")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: resetCode, newPassword })
      })
      if (res.ok) {
        setResetStep(3)
      } else {
        alert("Código inválido o error")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setResetLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#080808] pt-44 px-6 text-white/30 font-urban uppercase tracking-widest animate-pulse flex items-center justify-center">Sincronizando...</div>
  if (!user) return <div className="min-h-screen bg-[#080808] pt-44 px-6 text-white/30 font-urban uppercase tracking-widest flex items-center justify-center">Error al cargar datos.</div>

  const isAdmin = role === 'ADMIN'

  return (
    <main className="min-h-screen bg-[#080808] text-white pt-44 px-6 pb-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-white/[0.01] blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-white/20" />
              <p className="text-white/40 font-urban text-[10px] uppercase tracking-[0.5em] font-bold">{isAdmin ? 'Acceso Administrativo' : 'Cuenta Cliente'}</p>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-9xl font-urban leading-none font-bold uppercase tracking-tighter">
              {isAdmin ? 'Panel' : 'Mi'}<br /><span className="text-white/10 italic">Perfil</span>
            </motion.h1>
          </div>
          <div className="flex flex-wrap gap-4">
             <button 
                onClick={() => setEditing(!editing)} 
                className={`px-8 py-5 rounded-2xl font-urban text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border shadow-xl ${editing ? 'bg-rose-500 border-rose-400 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-black'}`}
             >
                <Edit3 size={16} /> {editing ? 'Cancelar Edición' : 'Editar Información'}
             </button>
             <button onClick={() => setResetStep(1)} className="px-8 py-5 bg-white text-black rounded-2xl font-urban text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-all shadow-2xl flex items-center gap-3">
                <Lock size={16} /> Cambiar Clave
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none"><User size={250} /></div>
               
               <div className="grid md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Nombre Completo</label>
                     <input type="text" value={user.name || ''} disabled={!editing} onChange={(e) => setUser({...user, name: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} placeholder="Escribe tu nombre" />
                  </div>
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Email de acceso</label>
                     <input type="email" value={user.email || ''} disabled={!editing} onChange={(e) => setUser({...user, email: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} placeholder="email@ejemplo.com" />
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Documento de Identidad</label>
                     <input type="text" value={user.documentId || ''} disabled={!editing} onChange={(e) => setUser({...user, documentId: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} placeholder="CC / TI / NIT" />
                  </div>
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Teléfono Móvil</label>
                     <input type="text" value={user.phone || ''} disabled={!editing} onChange={(e) => setUser({...user, phone: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} placeholder="+57..." />
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {isAdmin ? (
                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Cargo Corporativo</label>
                       <input type="text" value={user.jobTitle || ''} disabled={!editing} onChange={(e) => setUser({...user, jobTitle: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} placeholder="Tu cargo en la empresa" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold px-4">Fecha de Nacimiento</label>
                       <input type="date" value={user.birthday ? user.birthday.split('T')[0] : ''} disabled={!editing} onChange={(e) => setUser({...user, birthday: e.target.value})} className={`w-full bg-white/[0.03] border ${editing ? 'border-white/30 focus:border-white focus:bg-white/[0.06]' : 'border-transparent'} px-8 py-6 rounded-[24px] font-urban text-xl transition-all outline-none text-white`} />
                    </div>
                  )}
               </div>

               <AnimatePresence>
                 {editing && (
                   <motion.button 
                     initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                     onClick={handleUpdate} disabled={saving}
                     className="w-full bg-white text-black py-8 rounded-[32px] font-urban text-sm uppercase tracking-[0.4em] font-bold shadow-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 mt-4"
                   >
                     {saving ? 'Guardando Cambios...' : 'Actualizar Perfil'} <ArrowRight size={18} />
                   </motion.button>
                 )}
               </AnimatePresence>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[48px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/[0.02] group-hover:bg-emerald-500/[0.05] transition-colors" />
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl shadow-inner"><ShieldCheck size={24} /></div>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Estado</h4>
                   </div>
                   <p className="text-4xl font-urban font-bold tracking-tighter mb-2 text-emerald-400 uppercase">Activo</p>
                   <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-bold">Verificado por 4A Urban</p>
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[48px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-700"><Lock size={100} /></div>
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-6">Seguridad</h4>
                <div className="space-y-4">
                   <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Última actividad:</p>
                   <p className="text-white text-lg font-urban font-bold">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Reciente'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {resetStep > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0c0c0c] border border-white/10 w-full max-w-xl rounded-[56px] p-16 relative overflow-hidden shadow-2xl">
                <button onClick={() => setResetStep(0)} className="absolute top-12 right-12 text-white/30 hover:text-white transition-all hover:rotate-90 duration-300 flex items-center justify-center w-10 h-10 bg-white/5 rounded-full"><X size={20} /></button>
                {resetStep === 1 && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-10"><Key size={40} className="text-white/20" /></div>
                    <h2 className="text-5xl font-urban font-bold uppercase tracking-tighter mb-6">Seguridad</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] mb-12 font-bold px-12 leading-relaxed">Confirma cómo deseas recibir tu código de validación</p>
                    <div className="grid gap-5">
                       <button onClick={() => setResetMethod('EMAIL')} className={`p-8 rounded-[32px] border transition-all text-left flex items-center justify-between group ${resetMethod === 'EMAIL' ? 'bg-white text-black border-white shadow-2xl' : 'bg-white/[0.03] border-white/5 text-white/30 hover:border-white/20 hover:bg-white/[0.05]'}`}>
                          <div className="flex items-center gap-5"><Mail size={24} className={resetMethod === 'EMAIL' ? 'text-black' : 'text-white/20'} /><span className="font-urban text-xs uppercase tracking-[0.2em] font-bold">Email Corporativo</span></div>
                          {resetMethod === 'EMAIL' && <CheckCircle2 size={20} />}
                       </button>
                       <button onClick={() => setResetMethod('WHATSAPP')} className={`p-8 rounded-[32px] border transition-all text-left flex items-center justify-between group ${resetMethod === 'WHATSAPP' ? 'bg-white text-black border-white shadow-2xl' : 'bg-white/[0.03] border-white/5 text-white/30 hover:border-white/20 hover:bg-white/[0.05]'}`}>
                          <div className="flex items-center gap-5"><MessageCircle size={24} className={resetMethod === 'WHATSAPP' ? 'text-black' : 'text-white/20'} /><span className="font-urban text-xs uppercase tracking-[0.2em] font-bold">WhatsApp Personal</span></div>
                          {resetMethod === 'WHATSAPP' && <CheckCircle2 size={20} />}
                       </button>
                    </div>
                    <button onClick={requestResetCode} disabled={resetLoading} className="w-full mt-12 bg-white/10 hover:bg-white hover:text-black text-white py-8 rounded-[32px] font-urban text-sm uppercase tracking-[0.5em] font-bold transition-all shadow-xl">
                       {resetLoading ? 'Procesando...' : 'Obtener Código'}
                    </button>
                  </div>
                )}
                {resetStep === 2 && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10"><ShieldCheck size={40} className="text-emerald-400" /></div>
                    <h2 className="text-5xl font-urban font-bold uppercase tracking-tighter mb-6">Verificación</h2>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] mb-12 font-bold px-12 leading-relaxed">Ingresa el código enviado a tu {resetMethod.toLowerCase()}</p>
                    <div className="space-y-8">
                       <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 px-8 py-8 rounded-[32px] text-center text-5xl font-urban tracking-[0.5em] focus:border-white transition-all outline-none font-bold" placeholder="000000" maxLength={6} />
                       <div className="space-y-4 text-left">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-white/20 font-bold px-6">Nueva Contraseña de Acceso</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 px-8 py-6 rounded-[24px] focus:border-white outline-none font-urban text-xl" placeholder="••••••••" />
                       </div>
                    </div>
                    <button onClick={handleResetPassword} disabled={resetLoading} className="w-full mt-12 bg-white text-black py-8 rounded-[32px] font-urban text-sm uppercase tracking-[0.5em] font-bold shadow-2xl hover:bg-gray-100 transition-all">
                       {resetLoading ? 'Validando...' : 'Confirmar Cambio'}
                    </button>
                  </div>
                )}
                {resetStep === 3 && (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 bg-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-emerald-500/40"><CheckCircle2 size={56} className="text-black" /></div>
                    <h2 className="text-6xl font-urban font-bold uppercase tracking-tighter mb-6">¡Protegido!</h2>
                    <p className="text-white/30 text-sm font-urban uppercase tracking-[0.3em] font-bold leading-relaxed mb-16">Tu clave ha sido actualizada. La seguridad de tu cuenta es nuestra prioridad.</p>
                    <button onClick={() => setResetStep(0)} className="w-full bg-white/5 border border-white/10 py-6 rounded-[24px] font-urban text-[11px] uppercase tracking-[0.5em] font-bold hover:bg-white hover:text-black transition-all">Regresar al Perfil</button>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-10 py-5 rounded-[24px] flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] border border-white/10 ${message.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
             {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
             <span className="font-urban text-[11px] uppercase tracking-[0.2em] font-bold">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default Perfil
