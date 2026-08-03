import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import { API_URL } from "../lib/api"
import { X, Send, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"

const WHATSAPP_NUMBER = "573337071742"

// ── Bot responses ──────────────────────────────────────────────────────────────
const FAQS = {
  hola: "¡Hola! Soy el asistente de **4A Urban**. Puedo ayudarte con preguntas sobre productos, envíos y pagos.\n\n¿En qué te puedo ayudar hoy?",
  precio: "Nuestros productos van desde **$80.000 hasta $90.000 COP**. Puedes ver el catálogo completo en la sección Catálogo.",
  talla: "Manejamos tallas **S, M, L y XL** en todos nuestros productos.",
  envio: "Los envíos se coordinan por **WhatsApp**. ¡Hacemos envíos a todo Colombia!",
  pago: "Aceptamos **efectivo, transferencia y Nequi**. Todo se coordina por WhatsApp.",
  pedido: "Agrega productos al carrito y al finalizar se abrirá WhatsApp automáticamente con tu pedido.",
  proveedor: "¿Te interesa ser proveedor? Contáctanos por WhatsApp o visita la sección **Trabaja con nosotros** en la página de inicio.",
  default: "No entendí bien tu pregunta. Puedes preguntar sobre **precios**, **tallas**, **envíos**, **pagos** o escribirnos por WhatsApp.",
}

const getPublicResponse = (msg) => {
  const m = msg.toLowerCase()
  if (m.match(/hola|buenos|hey|saludos/)) return FAQS.hola
  if (m.match(/precio|cuesta|vale|valor|cuanto/)) return FAQS.precio
  if (m.match(/talla|taille|medida|tama/)) return FAQS.talla
  if (m.match(/envio|envío|domicilio|entrega|manda/)) return FAQS.envio
  if (m.match(/pago|pagar|nequi|transfer|efectivo/)) return FAQS.pago
  if (m.match(/pedido|compra|pedir|order/)) return FAQS.pedido
  if (m.match(/proveedor|vendedor|distribuidor|aliado/)) return FAQS.proveedor
  return FAQS.default
}

// ── Admin parser: "crear producto Camiseta X, 85000, S/M/L" ────────────────────
const parseAdminCreate = (msg) => {
  const m = msg.toLowerCase()
  if (!m.startsWith("crear producto") && !m.startsWith("nuevo producto")) return null
  // Esperamos: "crear producto [nombre], [precio], [tallas]"
  const raw = msg.replace(/^(crear|nuevo)\s+producto\s*/i, "").trim()
  const parts = raw.split(",").map(s => s.trim())
  if (parts.length < 2) return null
  const nombre = parts[0]
  const precio = parseFloat(parts[1].replace(/[^0-9.]/g, ""))
  const talla = parts[2] || "M/L/XL"
  const imageUrl = parts[3] || ""
  if (!nombre || isNaN(precio)) return null
  return { nombre, precio, talla, imageUrl }
}

// ── Markdown bold ───────────────────────────────────────────────────────────────
const escapeHtml = (text) => text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

const renderMd = (text) => ({ __html: escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") })

// ── Component ───────────────────────────────────────────────────────────────────
const Chatbox = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "¡Hola! Soy el asistente de **4A Urban**. ¿En qué te puedo ayudar hoy?" },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const { token, role } = useAuthStore()
  const isAdmin = role === "ADMIN"

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, typing])

  const addMsg = (from, text, icon = null) => setMessages((prev) => [...prev, { id: Date.now() + Math.random(), from, text, icon }])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userText = input.trim()
    addMsg("user", userText)
    setInput("")
    setTyping(true)

    // Admin puede crear productos
    if (isAdmin) {
      const productData = parseAdminCreate(userText)
      if (productData) {
        try {
          const res = await fetch(`${API_URL}/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(productData),
          })
          setTyping(false)
          if (res.ok) {
            const p = await res.json()
            addMsg("bot", `Producto creado correctamente:\n\n**${p.nombre}** — $${p.precio.toLocaleString()}\nTallas: ${p.talla}\n\nYa aparece en el catálogo público.`, CheckCircle2)
          } else {
            addMsg("bot", "Hubo un error al crear el producto. Verifica los datos e inténtalo de nuevo.", XCircle)
          }
        } catch {
          setTyping(false)
          addMsg("bot", "Error de conexión con el servidor.", XCircle)
        }
        return
      }
      // Ayuda admin
      if (userText.toLowerCase().includes("ayuda") || userText.toLowerCase().includes("como")) {
        setTyping(false)
        addMsg("bot", "Como administrador puedes crear productos escribiendo:\n\n**crear producto [nombre], [precio], [tallas], [url imagen opcional]**\n\nEjemplo:\n_crear producto Camiseta Classic, 80000, S/M/L_")
        return
      }
    }

    // Respuesta pública
    setTimeout(() => {
      setTyping(false)
      addMsg("bot", getPublicResponse(userText))
    }, 900)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="w-[340px] h-[520px] bg-[#0e0e0e] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-black/60">
              <img src="/logo.png" alt="4A" className="w-9 h-9 object-contain" />
              <div className="flex-1">
                <p className="text-white font-urban text-sm leading-none">4A Urban</p>
                <p className="text-green-400 text-xs mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> En línea
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
              {isAdmin && (
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/40 font-urban flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0" /> Modo Admin — escribe <strong className="text-white/60">ayuda</strong> para ver comandos
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed flex items-start gap-2 ${
                      msg.from === "user"
                        ? "bg-white text-black rounded-br-none"
                        : "bg-white/8 text-white rounded-bl-none border border-white/5"
                    }`}
                  >
                    {msg.icon && <msg.icon size={15} className="shrink-0 mt-0.5" />}
                    <span dangerouslySetInnerHTML={renderMd(msg.text)} />
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none">
                    <span className="flex gap-1.5 items-center">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-4 mb-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-urban uppercase tracking-widest py-2.5 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hablar por WhatsApp
            </a>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 pb-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAdmin ? "crear producto / pregunta..." : "Escribe tu pregunta..."}
                className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-white/30 placeholder:text-white/20"
              />
              <button type="submit" className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition shrink-0">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform overflow-hidden border-2 border-white/20"
      >
        {open ? (
          <X size={24} className="text-black" />
        ) : (
          <img src="/logo-dark.png" alt="Chat" className="w-12 h-12 object-cover rounded-full" />
        )}
      </button>
    </div>
  )
}

export default Chatbox
