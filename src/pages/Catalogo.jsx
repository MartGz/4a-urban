import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "../store/cartStore"
import { Search, ShoppingCart, Check, X, Eye, ArrowRight, Truck } from "lucide-react"
import { API_URL } from "../lib/api"

const TALLAS = ["Todas", "S", "M", "L", "XL"]

const Catalogo = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tallaFiltro, setTallaFiltro] = useState("Todas")
  const [busqueda, setBusqueda] = useState("")
  const [added, setAdded] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [hovered, setHovered] = useState(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((d) => { setProductos(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAdd = (e, p) => {
    e.stopPropagation()
    addItem(p)
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1800)
  }

  const filtrados = productos.filter((p) => {
    const matchTalla = tallaFiltro === "Todas" || p.talla?.toLowerCase().includes(tallaFiltro.toLowerCase())
    const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    return matchTalla && matchBusqueda
  })

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* ══ HERO BANNER ══ */}
      <section className="relative pt-44 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 60px)" }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-white/30 font-urban text-xs uppercase tracking-[0.5em] mb-3">
            Explora la colección
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-urban text-8xl leading-none mb-12">
            CATÁLOGO
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="BUSCAR PRODUCTO..."
                className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-4 focus:outline-none focus:border-white/30 rounded-2xl text-xs placeholder:text-white/10 font-urban uppercase tracking-widest transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {TALLAS.map((t) => (
                <button key={t} onClick={() => setTallaFiltro(t)}
                  className={`px-5 py-2.5 font-urban text-[9px] uppercase tracking-[0.3em] rounded-xl transition-all whitespace-nowrap ${tallaFiltro === t ? "bg-white text-black font-bold" : "bg-white/5 border border-white/10 text-white/30 hover:border-white/30 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ GRID DE PRODUCTOS ══ */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-white/10 font-urban text-[9px] uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
            <span className="w-8 h-px bg-white/10" />
            {loading ? "Cargando..." : `${filtrados.length} ARTÍCULOS DISPONIBLES`}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/[0.02] border border-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <AnimatePresence>
                {filtrados.map((p, i) => (
                  <motion.article
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    onHoverStart={() => setHovered(p.id)}
                    onHoverEnd={() => setHovered(null)}
                    onClick={() => setSelectedProduct(p)}
                    className="group cursor-pointer relative"
                  >
                    <div className="relative aspect-[3/4] bg-[#0d0d0d] overflow-hidden rounded-[32px] border border-white/5 flex items-center justify-center">
                      <motion.img src={`${API_URL}/api/products/${p.id}/image`} alt={p.nombre}
                        animate={{ scale: hovered === p.id ? 1.08 : 1 }}
                        transition={{ duration: 0.6 }}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-24 h-24 object-contain opacity-10'; }}
                      />

                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                        <span className="font-urban text-white/50 text-[9px] uppercase tracking-widest">{p.talla}</span>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hovered === p.id ? 1 : 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col justify-end p-6"
                      >
                        <div className="flex gap-2">
                           <button onClick={(e) => handleAdd(e, p)}
                            className={`flex-1 py-4 font-urban text-[9px] uppercase tracking-[0.2em] transition-all rounded-2xl flex items-center justify-center gap-2 ${added === p.id ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-gray-100"}`}>
                            {added === p.id ? <Check size={14} /> : <ShoppingCart size={14} />}
                            {added === p.id ? "Añadido" : "Añadir"}
                          </button>
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-2xl text-white">
                             <Eye size={18} />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="mt-6 space-y-1">
                      <h2 className="font-urban text-xl text-white font-bold leading-tight uppercase tracking-tight">{p.nombre}</h2>
                      <div className="flex justify-between items-center">
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-urban">Streetwear Culture</p>
                        <p className="font-urban text-white/60 text-lg font-bold">${p.precio?.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ══ QUICK VIEW MODAL ══ */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl bg-[#0d0d0d] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-[48px]"
            >
              <button onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/5 text-white/50 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-white transition">
                <X size={20} />
              </button>

              {/* Imagen Izquierda */}
              <div className="w-full md:w-1/2 aspect-[3/4] bg-[#0d0d0d] border-r border-white/5 flex items-center justify-center">
                <img
                  src={`${API_URL}/api/products/${selectedProduct.id}/image`}
                  alt={selectedProduct.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-44 h-44 object-contain opacity-10'; }}
                />
              </div>

              {/* Info Derecha */}
              <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                   <span className="w-12 h-px bg-white/20" />
                   <p className="text-white/30 font-urban text-[10px] uppercase tracking-[0.5em]">Streetwear Essentials</p>
                </div>
                <h2 className="font-urban text-7xl text-white mb-4 leading-none font-bold uppercase tracking-tighter">{selectedProduct.nombre}</h2>
                <p className="font-urban text-4xl text-white/50 mb-10 font-bold">${selectedProduct.precio?.toLocaleString()} COP</p>
                
                <div className="space-y-8 mb-12">
                  <div>
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-urban mb-4 flex items-center gap-2">
                       <Check size={12} /> Tallas Disponibles
                    </p>
                    <div className="flex gap-3">
                      {selectedProduct.talla.split("/").map(t => (
                        <span key={t} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-white text-xs font-bold font-urban rounded-2xl uppercase">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-urban mb-3 flex items-center gap-2">
                       <Truck className="text-white/10" size={14} /> Logística de Envío
                    </p>
                    <p className="text-white/40 text-sm font-urban">Entrega express en 2 a 5 días hábiles a toda Colombia. Seguimiento en tiempo real vía email.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={(e) => { handleAdd(e, selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 bg-white text-black py-6 font-urban text-xs uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition rounded-[24px] flex items-center justify-center gap-3">
                    <ShoppingCart size={16} /> Añadir al Carrito
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  )
}

export default Catalogo