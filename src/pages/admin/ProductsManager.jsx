import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { API_URL } from '../../lib/api';

const emptyForm = { nombre: '', precio: '', talla: '' };

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setPreview(null);
    setEditingId(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setImageFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const body = new FormData();
      body.append('nombre', formData.nombre);
      body.append('precio', formData.precio);
      body.append('talla', formData.talla);
      if (imageFile) body.append('image', imageFile);
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'No se pudo guardar el producto');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setFormData({ nombre: p.nombre, precio: p.precio, talla: p.talla });
    setImageFile(null);
    setPreview(`${API_URL}/api/products/${p.id}/image`);
    setEditingId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-urban text-4xl">Productos</h1>
          <p className="text-white/30 text-sm mt-1">{products.length} productos en catálogo</p>
        </div>
        <button
          onClick={() => { const next = !showForm; setShowForm(next); resetForm(); }}
          className="bg-white text-black px-6 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8"
          >
            <h2 className="font-urban text-xl mb-6 text-white/80">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-start">
              <label className="w-40 h-40 shrink-0 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={28} className="text-white/20 mb-2" />
                    <span className="text-white/30 text-[10px] uppercase tracking-widest text-center px-2">Elegir foto</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'nombre', label: 'Nombre del producto', type: 'text', placeholder: 'Ej: Camiseta 4A Classic' },
                  { key: 'precio', label: 'Precio (COP)', type: 'number', placeholder: 'Ej: 80000' },
                  { key: 'talla', label: 'Tallas disponibles', type: 'text', placeholder: 'Ej: S/M/L/XL' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm"
                      required
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={loading}
                    className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50">
                    {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Producto')}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    className="bg-white/5 border border-white/10 px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-white/10 transition rounded-xl">
                    Cancelar
                  </button>
                </div>
                <p className="md:col-span-2 text-white/20 text-[10px] uppercase tracking-widest">Máximo 5MB por imagen. Si no eliges una foto nueva al editar, se conserva la actual.</p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden group hover:border-white/20 transition-all"
          >
            {/* Imagen */}
            <div className="aspect-video bg-black/40 flex items-center justify-center relative overflow-hidden">
              <img
                src={`${API_URL}/api/products/${p.id}/image`}
                alt={p.nombre}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; e.target.className = 'w-16 h-16 object-contain opacity-10'; }}
              />
              {/* Acciones hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                <button onClick={() => handleEdit(p)}
                  className="bg-white text-black px-4 py-2 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-gray-100 transition">
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-4 py-2 font-urban text-xs uppercase tracking-widest rounded-lg hover:bg-red-400 transition">
                  Eliminar
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="font-urban text-base text-white">{p.nombre}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-white/40 text-sm">${p.precio.toLocaleString()}</span>
                <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-xs text-white/40 font-urban">{p.talla}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-24">
          <p className="text-white/20 font-urban text-xl mb-4">No hay productos aún</p>
          <button onClick={() => setShowForm(true)} className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest rounded-xl hover:bg-gray-100 transition">
            Crear primer producto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
