import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "../store/authStore"
import { API_URL } from "../lib/api"
import { X, Send, ShieldCheck, CheckCircle2, XCircle } from "lucide-react"

const WHATSAPP_NUMBER = "573337071742"

// ── Bot responses ──────────────────────────────────────────────────────────────
const FAQS = {
  saludo: "¡Hola! Soy el asistente de **4A Urban**. Puedo ayudarte con precios, tallas, envíos, pagos, cambios y más.\n\n¿En qué te puedo ayudar hoy?",
  despedida: "¡Gracias por escribirnos! Si necesitas algo más, aquí estaré. También puedes escribirnos por WhatsApp cuando quieras 👇",
  precio: "Nuestros productos van desde **$80.000 hasta $90.000 COP**. Puedes ver el catálogo completo con precios exactos en la sección **Catálogo**.",
  talla: "Manejamos tallas **S, M, L y XL** en todos nuestros productos. Si tienes dudas sobre cuál te queda mejor, escríbenos por WhatsApp y te ayudamos a elegir.",
  envio: "Los envíos se coordinan por **WhatsApp** y hacemos entregas a **todo Colombia**. El tiempo de entrega depende de tu ciudad, normalmente entre 1 y 4 días hábiles.",
  pago: "Aceptamos **efectivo, transferencia y Nequi**. Todo se coordina y confirma por WhatsApp una vez armas tu pedido.",
  pedido: "Agrega los productos que quieras al carrito y al finalizar se abrirá **WhatsApp automáticamente** con el resumen de tu pedido para confirmarlo con nosotros.",
  seguimiento: "Para el estado de un pedido ya realizado, escríbenos por **WhatsApp** con tu nombre o número de pedido y te contamos en qué va.",
  cambios: "Manejamos cambios por talla o defectos de fábrica dentro de los primeros días después de recibido el pedido. Escríbenos por **WhatsApp** contándonos el caso y lo resolvemos.",
  materiales: "Trabajamos con telas de **buena calidad** pensadas para uso diario streetwear. Si quieres el detalle del material de una prenda específica, revisa su ficha en el **Catálogo** o pregúntanos por WhatsApp.",
  catalogo: "Puedes ver todos nuestros productos disponibles en la sección **Catálogo**, con fotos, precios y tallas.",
  proveedor: "¿Te interesa ser proveedor o aliado? Contáctanos por **WhatsApp** o visita la sección **Trabaja con nosotros** en la página de inicio.",
  contacto: "Puedes escribirnos directamente por **WhatsApp**, es nuestro canal principal de atención y ahí resolvemos cualquier duda o pedido.",
  horario: "Respondemos por WhatsApp en horario habitual de tienda. Si escribes fuera de horario, te respondemos apenas estemos disponibles.",
  descuento: "Los descuentos y promociones los anunciamos por nuestras redes y WhatsApp. ¡Escríbenos y te contamos si hay alguna activa!",
  default: "No entendí bien tu pregunta 🤔 Puedo ayudarte con: **precios**, **tallas**, **envíos**, **pagos**, **cambios/devoluciones**, **seguimiento de pedidos** o **ser proveedor**.\n\nTambién puedes escribirnos directo por WhatsApp.",
}

// Reglas ordenadas: la primera que haga match gana. Se evalúan sobre texto
// normalizado (minúsculas, sin tildes) para cubrir variaciones de escritura.
const RULES = [
  [/\b(gracias|chao|adios|nos vemos|hasta luego|bye)\b/, "despedida"],
  [/\b(hola|holi|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal)\b/, "saludo"],
  [/\b(precio|precios|cuesta|cuestan|vale|valen|valor|cuanto cuesta|cuanto vale|tarifa)\b/, "precio"],
  [/\b(talla|tallas|medida|medidas|tamano|tamanos|guia de tallas)\b/, "talla"],
  [/\b(envio|envios|domicilio|domicilios|entrega|entregan|manda|mandan|cuanto tarda|tiempo de entrega|a donde envian|hacen envios)\b/, "envio"],
  [/\b(pago|pagar|nequi|transferencia|transfer|efectivo|tarjeta|metodos de pago|como pago)\b/, "pago"],
  [/\b(seguimiento|rastrear|donde esta mi pedido|estado de mi pedido|estado del pedido)\b/, "seguimiento"],
  [/\b(cambio|cambios|devolucion|devoluciones|garantia|defecto|no me quedo|no me sirvio|talla equivocada)\b/, "cambios"],
  [/\b(material|materiales|tela|telas|calidad|algodon|composicion)\b/, "materiales"],
  [/\b(catalogo|productos|que venden|que tienen|coleccion|colecciones|que hay disponible)\b/, "catalogo"],
  [/\b(proveedor|proveedores|vendedor|distribuidor|distribuidores|aliado|aliados|mayorista|mayoristas)\b/, "proveedor"],
  [/\b(pedido|pedidos|compra|comprar|pedir|order|como compro|como hago un pedido)\b/, "pedido"],
  [/\b(contacto|telefono|numero|hablar con alguien|atencion al cliente|whatsapp)\b/, "contacto"],
  [/\b(horario|horarios|hora de atencion|a que hora|abren|cierran)\b/, "horario"],
  [/\b(descuento|descuentos|promocion|promociones|oferta|ofertas|cupon|rebaja)\b/, "descuento"],
]

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

const getPublicResponse = (msg) => {
  const m = normalize(msg)
  for (const [pattern, key] of RULES) {
    if (pattern.test(m)) return FAQS[key]
  }
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
  if (!nombre || isNaN(precio)) return null
  return { nombre, precio, talla }
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
  const { token, isSuperAdmin, permissions } = useAuthStore()
  const isAdmin = isSuperAdmin || permissions.includes("products.manage")

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
            addMsg("bot", `Producto creado correctamente:\n\n**${p.nombre}** — $${p.precio.toLocaleString()}\nTallas: ${p.talla}\n\nYa aparece en el catálogo público. Sube su foto desde **Panel → Productos**.`, CheckCircle2)
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
        addMsg("bot", "Como administrador puedes crear productos escribiendo:\n\n**crear producto [nombre], [precio], [tallas]**\n\nEjemplo:\n_crear producto Camiseta Classic, 80000, S/M/L_\n\nLa foto se sube después desde **Panel → Productos**.")
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
            className="w-[340px] h-[520px] bg-[#232326] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#18181b]/60">
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
