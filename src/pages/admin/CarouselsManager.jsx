import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, Trash2, ArrowRight } from 'lucide-react';
import { API_URL } from '../../lib/api';

const emptyForm = { name: '', slug: '' };

const slugify = (text) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '') // quita acentos (e.g. "é" -> "e", "ñ" -> "n")
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const CarouselsManager = () => {
  const [carousels, setCarousels] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuthStore();

  useEffect(() => { fetchCarousels(); }, []);

  const fetchCarousels = async () => {
    const res = await fetch(`${API_URL}/api/carousels`, { headers: { Authorization: `Bearer ${token}` } });
    setCarousels(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/carousels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData(emptyForm);
        setShowForm(false);
        fetchCarousels();
      } else {
        const err = await res.json();
        setError(err.error || 'No se pudo crear el carrusel');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carousel) => {
    if (!confirm(`¿Eliminar el carrusel "${carousel.name}" y todas sus fotos (${carousel._count.images})?`)) return;
    await fetch(`${API_URL}/api/carousels/${carousel.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCarousels();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-urban text-4xl">Carruseles</h1>
          <p className="text-white/30 text-sm mt-1">{carousels.length} carrusel(es) — cada uno se puede mostrar en una sección distinta del sitio</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormData(emptyForm); setError(''); }}
          className="bg-white text-black px-6 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl"
        >
          + Nuevo Carrusel
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="font-urban text-xl mb-6 text-white/80">Nuevo Carrusel</h2>
            {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Nombre</label>
                <input type="text" placeholder="Ej: Carrusel Home"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm" required />
              </div>
              <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Identificador (slug)</label>
                <input type="text" placeholder="ej-home-hero"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm" required />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear Carrusel'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white/5 border border-white/10 px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-white/10 transition rounded-xl">
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {carousels.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                <Images size={18} />
              </div>
              <div>
                <h3 className="font-urban text-base text-white">{c.name}</h3>
                <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">{c._count.images} foto(s)</p>
              </div>
            </div>
            <p className="text-white/20 text-[10px] font-mono mb-4">slug: {c.slug}</p>

            {c.images.length > 0 ? (
              <Link to={`/admin/galeria/${c.id}`} className="grid grid-cols-4 gap-1.5 mb-5">
                {c.images.map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                    <img src={`${API_URL}/api/gallery/${img.id}/image`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - c.images.length) }).map((_, i) => (
                  <div key={`ph-${i}`} className="aspect-square rounded-lg bg-white/[0.03] border border-dashed border-white/10" />
                ))}
              </Link>
            ) : (
              <Link to={`/admin/galeria/${c.id}`}
                className="mb-5 flex items-center justify-center h-16 rounded-lg bg-white/[0.03] border border-dashed border-white/10 text-white/15 text-[10px] uppercase tracking-widest hover:border-white/20 hover:text-white/30 transition">
                Sin fotos — súbelas aquí
              </Link>
            )}

            <div className="flex gap-3">
              <Link to={`/admin/galeria/${c.id}`}
                className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-2.5 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                Editar fotos <ArrowRight size={14} />
              </Link>
              <button onClick={() => handleDelete(c)}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-rose-500/20 transition">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {carousels.length === 0 && (
        <div className="text-center py-24">
          <p className="text-white/20 font-urban text-xl">Aún no hay carruseles</p>
        </div>
      )}
    </div>
  );
};

export default CarouselsManager;
