import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { API_URL } from "../lib/api"
import { Check, ArrowRight, Package, Rocket, Handshake, Briefcase, Heart } from "lucide-react"
import GalleryCarousel from "../components/GalleryCarousel"

const WHATSAPP = "573337071742"
const INSTAGRAM = "https://www.instagram.com/4a_urban"
const TIKTOK = "https://www.tiktok.com/@4a_urban"

const Home = () => {
  const [products, setProducts] = useState([])
  const [current, setCurrent] = useState(0)
  const [added, setAdded] = useState(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setProducts(data) : setProducts([]))
      .catch(() => setProducts([]))
  }, [])

  const next = useCallback(() => {
    if (products.length < 2) return
    setCurrent((c) => (c + 1) % products.length)
  }, [products.length])

  useEffect(() => {
    if (products.length < 2) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [products.length, next])

  const handleAdd = (p) => {
    addItem(p)
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1500)
  }

  const featured = products[current] || null

  return (
    <main className="bg-[#1c1c1e] text-white min-h-screen">

      {/* ══════════ HERO / CARRUSEL ══════════ */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#232326] to-[#18181b]" />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
        />
        {/* Blobs flotantes animados */}
        <motion.div
          animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/[0.04] blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] rounded-full bg-amber-500/[0.05] blur-[110px] pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center pt-20">
          {/* Texto Hero */}
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-white/30 font-urban text-xs uppercase tracking-[0.5em] mb-6">
              Colección 2026
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="font-urban text-7xl lg:text-8xl leading-none mb-10">
              STREET<br /><span className="text-white/15">CULTURE</span><br />REDEFINED
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4">
              <Link to="/catalogo"
                className="bg-white text-black px-8 py-4 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition">
                Ver Catálogo
              </Link>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                className="border border-white/20 text-white px-8 py-4 font-urban text-sm uppercase tracking-widest hover:bg-white/5 transition">
                WhatsApp
              </a>
            </motion.div>
          </div>

          {/* Carrusel de producto */}
          <div>
            {featured ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={featured.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-[3/4] max-h-[65vh] bg-[#18181b]/60 border border-white/5 overflow-hidden group flex items-center justify-center"
                  >
                    <img
                      src={`${API_URL}/api/products/${featured.id}/image`}
                      alt={featured.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-32 h-32 object-contain opacity-10 mx-auto my-auto'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#18181b]/80 to-transparent p-6">
                      <p className="font-urban text-xl text-white">{featured.nombre}</p>
                      <p className="text-white/40 font-urban text-sm">${featured.precio?.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleAdd(featured)}
                      className={`absolute top-4 right-4 px-4 py-2 font-urban text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 ${added === featured.id ? "bg-green-500 text-white" : "bg-white text-black hover:bg-gray-100"}`}>
                      {added === featured.id ? <><Check size={14} /> Añadido</> : "+ Añadir"}
                    </button>
                  </motion.div>
                </AnimatePresence>

                {/* Dots */}
                {products.length > 1 && (
                  <div className="flex gap-2 justify-center mt-4">
                    {products.map((_, i) => (
                      <button key={i} onClick={() => setCurrent(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${i === current ? "bg-white w-8" : "bg-white/20 w-2"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] max-h-[65vh] bg-[#18181b]/30 border border-white/5 flex flex-col items-center justify-center gap-4">
                <img src="/logo.png" alt="4A Urban" className="w-24 h-24 object-contain opacity-20" />
                <p className="text-white/20 font-urban text-sm uppercase tracking-widest">Cargando productos...</p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="font-urban text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ══════════ FRANJA DE TEXTO ANIMADA ══════════ */}
      <div className="border-y border-white/5 bg-[#18181b] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee font-urban text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-3">
              Streetwear Colombiano <span className="w-1 h-1 rounded-full bg-white/20" /> Diseño Propio <span className="w-1 h-1 rounded-full bg-white/20" /> Cartagena <span className="w-1 h-1 rounded-full bg-white/20" /> 4A Urban
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ CARRUSEL DE FOTOS ══════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-white/30 font-urban text-xs uppercase tracking-[0.4em] mb-2">La Marca en Movimiento</p>
            <h2 className="font-urban text-5xl">Nuestro Estilo</h2>
          </div>
          <GalleryCarousel slug="home" />
        </div>
      </section>

      {/* ══════════ MINI CATÁLOGO ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-white/30 font-urban text-xs uppercase tracking-[0.4em] mb-2">Lo más nuevo</p>
              <h2 className="font-urban text-5xl">Productos</h2>
            </div>
            <Link to="/catalogo"
              className="font-urban text-xs uppercase tracking-widest text-white/40 hover:text-white transition border-b border-white/10 pb-1 inline-flex items-center gap-1.5">
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-[#18181b]/50 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={`${API_URL}/api/products/${p.id}/image`}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-14 h-14 object-contain opacity-10'; }}
                    />
                    <button onClick={() => handleAdd(p)}
                      className={`absolute bottom-0 w-full py-3 font-urban text-xs uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center ${added === p.id ? "bg-green-500 text-white" : "bg-white text-black"}`}>
                      {added === p.id ? <Check size={14} /> : "Añadir"}
                    </button>
                  </div>
                  <div className="mt-3 px-1">
                    <p className="font-urban text-sm text-white truncate">{p.nombre}</p>
                    <p className="font-urban text-xs text-white/30">${p.precio?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-white/3 border border-white/5 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ TRABAJA CON NOSOTROS ══════════ */}
      <section className="py-24 px-6 bg-[#232326] border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-white/30 font-urban text-xs uppercase tracking-[0.4em] mb-4">Oportunidades</p>
            <h2 className="font-urban text-6xl mb-6">Trabaja<br />con nosotros</h2>
            <p className="text-white/40 text-lg mb-8 leading-relaxed">
              Somos una marca en crecimiento. Buscamos proveedores, distribuidores y representantes que compartan nuestra visión del streetwear colombiano.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20ser%20proveedor%20de%204A%20Urban`}
                target="_blank" rel="noopener noreferrer"
                className="bg-white text-black px-8 py-4 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition text-center">
                Ser Proveedor
              </a>
              <a href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20ser%20vendedor%20de%204A%20Urban`}
                target="_blank" rel="noopener noreferrer"
                className="border border-white/20 text-white px-8 py-4 font-urban text-sm uppercase tracking-widest hover:bg-white/5 transition text-center">
                Ser Vendedor
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, title: "Proveedores", desc: "Suministra materiales para nuestras colecciones." },
              { icon: Rocket, title: "Distribuidores", desc: "Lleva 4A Urban a tu ciudad." },
              { icon: Handshake, title: "Aliados", desc: "Colaboraciones con artistas y marcas afines." },
              { icon: Briefcase, title: "Vendedores", desc: "Únete con comisiones competitivas." },
            ].map((item) => (
              <motion.div key={item.title}
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className="bg-[#18181b]/40 border border-white/5 p-6 hover:border-white/15 transition">
                <item.icon className="mb-3 text-white/70" size={28} />
                <h3 className="font-urban text-lg mb-2">{item.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#18181b] border-t border-white/5 pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <img src="/logo.png" alt="4A Urban" className="h-16 w-auto object-contain mb-6" />
              <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                Marca colombiana de streetwear urbano. Ropa que habla por sí sola, hecha para quienes marcan tendencia en las calles de Cartagena.
              </p>
              {/* Redes sociales reales */}
              <div className="flex gap-3 mt-6">
                {/* Instagram */}
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition rounded-xl group">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href={TIKTOK} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition rounded-xl">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-green-400/50 hover:text-green-400 hover:border-green-400/30 transition rounded-xl">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-urban text-xs uppercase tracking-[0.3em] text-white/30 mb-6">Tienda</h4>
              <ul className="space-y-3">
                {["Catálogo", "Nuevos ingresos", "Más vendidos"].map((l) => (
                  <li key={l}><Link to="/catalogo" className="text-white/40 hover:text-white transition text-sm">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-urban text-xs uppercase tracking-[0.3em] text-white/30 mb-6">Marca</h4>
              <ul className="space-y-3">
                {[["Nosotros", "/nosotros"], ["Trabaja con nosotros", "/"], ["WhatsApp", `https://wa.me/${WHATSAPP}`]].map(([l, href]) => (
                  <li key={l}>
                    {href.startsWith("http") ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition text-sm">{l}</a>
                    ) : (
                      <Link to={href} className="text-white/40 hover:text-white transition text-sm">{l}</Link>
                    )}
                  </li>
                ))}
                <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition text-sm">Instagram</a></li>
                <li><a href={TIKTOK} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition text-sm">TikTok</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/15 text-xs font-urban">© 2026 4A Urban. Todos los derechos reservados.</p>
            <p className="text-white/15 text-xs font-urban flex items-center gap-1.5">Hecho con <Heart size={12} className="fill-current" /> en Cartagena, Colombia</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home