import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Users, Shield, Globe, Rocket, Camera, MessageCircle, MapPin, ArrowRight, Smartphone } from "lucide-react"

const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WHATSAPP = "573337071742"
const INSTAGRAM = "https://www.instagram.com/4a_urban"
const TIKTOK = "https://www.tiktok.com/@4a_urban"

const values = [
  { num: "01", title: "Autenticidad", desc: "No seguimos tendencias, las creamos. Cada prenda nace de la calle, no de una sala de juntas.", icon: Shield },
  { num: "02", title: "Calidad", desc: "Materiales premium que resisten el tiempo y el movimiento. Hecho para durar, no para desechar.", icon: Rocket },
  { num: "03", title: "Cultura", desc: "Somos parte de la cultura urbana de Cartagena. Nuestra ropa cuenta una historia.", icon: Globe },
  { num: "04", title: "Comunidad", desc: "Más que clientes, somos familia. Cada persona que usa 4A es parte del movimiento.", icon: Users },
]

const stats = [
  { value: "2021", label: "Fundada" },
  { value: "+500", label: "Clientes" },
  { value: "100%", label: "Colombiano" },
  { value: "∞", label: "Visión" },
]

const Nosotros = () => {
  return (
    <main className="bg-[#080808] text-white min-h-screen font-urban">

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 80px)" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-40 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-white/20" />
              <p className="text-white/30 text-[10px] uppercase tracking-[0.5em]">Nuestra historia</p>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-9xl leading-none font-bold uppercase tracking-tighter mb-10">
              NACI<br />MOS<br /><span className="text-white/10 italic">EN LA</span><br />CALLE
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-white/40 text-xl leading-relaxed max-w-md font-light">
              4A Urban nació en las calles de Cartagena con una visión clara: ropa para los que viven la ciudad, 
              pa' estar bacano sin perder la esencia del barrio.
            </motion.p>
          </div>

          {/* Logo grande */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000" />
              <img src="/logo.png" alt="4A Urban" className="relative w-80 h-80 object-contain drop-shadow-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="border-y border-white/5 py-20 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center group">
              <p className="text-6xl font-bold mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500">{s.value}</p>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.4em]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ MISIÓN ══ */}
      <section className="py-40 px-6 relative">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-white/[0.01] blur-[150px] rounded-full translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
          {/* Visual */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative aspect-square">
            <div className="absolute inset-0 border border-white/5 rounded-[40px]" />
            <div className="absolute top-10 left-10 right-0 bottom-0 border border-white/10 rounded-[40px]" />
            <div className="absolute inset-20 bg-white/[0.02] flex items-center justify-center rounded-[32px] overflow-hidden">
               <img src="/logo.png" alt="4A Urban" className="w-44 h-44 object-contain opacity-10" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Texto en esquina */}
            <div className="absolute bottom-8 left-8 flex items-center gap-3">
              <MapPin size={14} className="text-white/30" />
              <p className="text-white/20 text-[10px] uppercase tracking-[0.4em]">Cartagena, Colombia</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-8 font-bold flex items-center gap-4">
              <span className="w-10 h-px bg-white/10" /> Lo que nos mueve
            </p>
            <h2 className="text-8xl font-bold uppercase tracking-tighter mb-10 leading-[0.9]">Nuestra<br /><span className="text-white/10">Misión</span></h2>
            <p className="text-white/40 text-xl leading-relaxed mb-10 font-light">
              Crear prendas que representen la cultura urbana de Cartagena, con la calidad y el estilo que se siente 
              desde la primera vez que te pones una de nuestras piezas.
            </p>
            <p className="text-white/30 text-lg leading-relaxed font-light italic">
              "No somos solo una marca de ropa. Somos un movimiento cultural que busca dar voz y estilo 
              a quienes viven y respiran la ciudad."
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ VALORES ══ */}
      <section className="py-32 px-6 bg-[#0c0c0c] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-4 font-bold">Lo que somos</p>
              <h2 className="text-8xl font-bold uppercase tracking-tighter leading-none">Nuestros<br /><span className="text-white/10">Valores</span></h2>
            </div>
            <p className="text-white/20 text-sm max-w-xs uppercase tracking-widest font-light leading-relaxed">
              Principios que guían cada puntada y cada diseño de 4A Urban.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 p-10 rounded-[32px] hover:bg-white/[0.04] hover:border-white/20 transition-all group">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-black transition-all">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">{v.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed font-light">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ SÍGUENOS ══ */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] mb-6 font-bold">Encuéntranos</p>
          <h2 className="text-8xl font-bold uppercase tracking-tighter mb-20">Síguenos</h2>

          <div className="flex flex-wrap gap-8 justify-center items-center">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-6 bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white text-white hover:text-black px-10 py-6 rounded-[32px] transition-all min-w-[280px]">
              <InstagramIcon size={28} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest opacity-40">Instagram</p>
                <p className="text-xl font-bold tracking-tight">@4a_urban</p>
              </div>
            </a>

            <a href={TIKTOK} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-6 bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white text-white hover:text-black px-10 py-6 rounded-[32px] transition-all min-w-[280px]">
              <Smartphone size={28} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest opacity-40">TikTok</p>
                <p className="text-xl font-bold tracking-tight">@4a_urban</p>
              </div>
            </a>

            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-6 bg-white/[0.03] border border-white/5 hover:border-emerald-500 hover:bg-emerald-500 text-white px-10 py-6 rounded-[32px] transition-all min-w-[280px]">
              <MessageCircle size={28} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-widest opacity-40">WhatsApp</p>
                <p className="text-xl font-bold tracking-tight">Contactar</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="py-40 px-6 bg-white text-black relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
           <h1 className="text-[40vw] font-bold opacity-5 uppercase tracking-tighter leading-none">URBAN</h1>
        </motion.div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-8xl font-bold uppercase tracking-tighter mb-10 leading-none">
            Únete al<br /><span className="italic opacity-30">movimiento</span>
          </motion.h2>
          <p className="text-black/40 text-xl mb-16 max-w-xl mx-auto font-light leading-relaxed">
            Descubre nuestra colección y forma parte de la cultura urbana de Cartagena. Prendas reales para gente real.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/catalogo"
              className="bg-black text-white px-12 py-6 rounded-[24px] font-bold text-xs uppercase tracking-[0.4em] hover:bg-black/90 transition shadow-2xl flex items-center justify-center gap-3">
              Ver Catálogo <ArrowRight size={16} />
            </Link>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="border-2 border-black text-black px-12 py-6 rounded-[24px] font-bold text-xs uppercase tracking-[0.4em] hover:bg-black hover:text-white transition flex items-center justify-center gap-3">
              Contactar <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Nosotros