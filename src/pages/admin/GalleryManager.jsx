import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, ArrowUp, ArrowDown, ImageIcon } from 'lucide-react';
import { API_URL } from '../../lib/api';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    const res = await fetch(`${API_URL}/api/gallery`);
    setImages(await res.json());
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Selecciona una imagen');
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      const res = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setCaption('');
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchImages();
      } else {
        const err = await res.json();
        setError(err.error || 'No se pudo subir la imagen');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta foto de la galería?')) return;
    await fetch(`${API_URL}/api/gallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchImages();
  };

  const move = async (index, direction) => {
    const target = images[index + direction];
    const current = images[index];
    if (!target) return;
    await Promise.all([
      fetch(`${API_URL}/api/gallery/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ position: target.position }),
      }),
      fetch(`${API_URL}/api/gallery/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ position: current.position }),
      }),
    ]);
    fetchImages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-urban text-4xl">Galería</h1>
          <p className="text-white/30 text-sm mt-1">{images.length} foto(s) en el carrusel público</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-urban text-xl mb-6 text-white/80">Subir Foto</h2>
        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-6 items-start">
          <label className="w-40 h-40 shrink-0 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition overflow-hidden">
            {preview ? (
              <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon size={28} className="text-white/20 mb-2" />
                <span className="text-white/30 text-[10px] uppercase tracking-widest text-center px-2">Elegir imagen</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">Descripción (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Drop Colección 2026"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm"
              />
            </div>
            <button type="submit" disabled={uploading}
              className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50 flex items-center gap-2">
              <Upload size={16} /> {uploading ? 'Subiendo...' : 'Subir Foto'}
            </button>
            <p className="text-white/20 text-[10px] uppercase tracking-widest">Máximo 5MB por imagen. Comprime tus fotos antes de subirlas para no gastar espacio de más.</p>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div key={img.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden group relative">
              <div className="aspect-square bg-black/40">
                <img src={`${API_URL}/api/gallery/${img.id}/image`} alt={img.caption || 'Galería'} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                <div className="flex gap-2">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition disabled:opacity-20" title="Mover antes">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === images.length - 1}
                    className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition disabled:opacity-20" title="Mover después">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => handleDelete(img.id)}
                    className="bg-rose-500/20 text-rose-400 p-2 rounded-lg hover:bg-rose-500/30 transition" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {img.caption && (
                <p className="p-3 text-white/50 text-xs truncate">{img.caption}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {images.length === 0 && (
        <div className="text-center py-24">
          <p className="text-white/20 font-urban text-xl">Aún no hay fotos en la galería</p>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
