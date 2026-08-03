import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../lib/api';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', precio: '', talla: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ nombre: '', precio: '', talla: '', imageUrl: '' });
        setEditingId(null);
        setShowForm(false);
        fetchProducts();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setFormData({ nombre: p.nombre, precio: p.precio, talla: p.talla, imageUrl: p.imageUrl || '' });
    setEditingId(p.id);
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
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ nombre: '', precio: '', talla: '', imageUrl: '' }); }}
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'nombre', label: 'Nombre del producto', type: 'text', placeholder: 'Ej: Camiseta 4A Classic' },
                { key: 'precio', label: 'Precio (COP)', type: 'number', placeholder: 'Ej: 80000' },
                { key: 'talla', label: 'Tallas disponibles', type: 'text', placeholder: 'Ej: S/M/L/XL' },
                { key: 'imageUrl', label: 'URL imagen (Opcional)', type: 'text', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-urban">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 text-sm"
                    required={field.key !== 'imageUrl'}
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading}
                  className="bg-white text-black px-8 py-3 font-urban text-sm uppercase tracking-widest hover:bg-gray-100 transition rounded-xl disabled:opacity-50">
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Producto')}
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
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <img src="/logo.png" alt="4A" className="w-16 h-16 object-contain opacity-10" />
              )}
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
