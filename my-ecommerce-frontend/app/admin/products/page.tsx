'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  texture?: string;
  lace?: string;
  longevity?: string;
  styling?: string;
  badge?: string;
}

const STORE_CATEGORIES = ['Straight', 'Curly', 'Wavy', 'Short', 'Long'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: STORE_CATEGORIES[0],
    stock: '',
    brand: 'SlayByHumu',
    texture: '',
    lace: '',
    longevity: '',
    styling: '',
    badge: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: STORE_CATEGORIES[0],
      stock: '',
      brand: 'SlayByHumu',
      texture: '',
      lace: '',
      longevity: '',
      styling: '',
      badge: '',
    });
    setImageFile(null);
    setEditingProductId(null);
    setMessage('');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !editingProductId) {
      setMessage('Please select a product image.');
      return;
    }

    setUploading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('brand', formData.brand);
    data.append('texture', formData.texture);
    data.append('lace', formData.lace);
    data.append('longevity', formData.longevity);
    data.append('styling', formData.styling);
    data.append('badge', formData.badge);
    if (imageFile) {
      data.append('images', imageFile);   
    }

    try {
      const url = editingProductId 
        ? `${API_URL}/products/${editingProductId}`
        : `${API_URL}/products`;
      
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        resetForm();
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setMessage(result.message || `Failed to ${editingProductId ? 'update' : 'add'} product`);
      }
    } catch (error) {
      setMessage(`Error ${editingProductId ? 'updating' : 'uploading'} product.`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: typeof product.category === 'object' ? (product.category as any).name : product.category,
      stock: product.stock.toString(),
      brand: 'SlayByHumu',
      texture: product.texture || '',
      lace: product.lace || '',
      longevity: product.longevity || '',
      styling: product.styling || '',
      badge: product.badge || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const pCat = typeof p.category === 'object' ? (p.category as any).name : p.category;
    const matchesCategory = categoryFilter === 'all' || pCat === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Curate your luxury virgin hair inventory, textures, lace types, and pricing.
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl active:scale-[0.98] transition-all duration-150 font-semibold text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Search catalog by name or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 w-full sm:w-auto text-zinc-700 dark:text-zinc-300"
          >
            <option value="all">All Categories ({products.length})</option>
            {STORE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                    <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">No products found matching query.</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200/60 dark:border-zinc-800/60">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={22} className="text-zinc-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-white truncate text-sm">{product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{product.category || 'Uncategorized'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white tabular-nums text-sm">
                      ₵{Number(product.price).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono tabular-nums ${
                      product.stock > 10 ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 
                      product.stock > 0 ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' : 
                      'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#C5A059] active:scale-95 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(product._id, product.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white active:scale-95 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PC Table Layout */}
      <div className="hidden md:block bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800/60">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Inventory Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading ? (
                // 5-row structured skeleton loader
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0"></div>
                          <div className="space-y-1.5">
                            <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-800/60 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No products cataloged matching current query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-800/60">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white text-sm">{product.name}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 w-64 mt-0.5">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {typeof product.category === 'object' ? (product.category as any).name : (product.category || 'Standard')}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-zinc-900 dark:text-white tabular-nums">
                      ₵{Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border font-mono tabular-nums ${
                        product.stock > 10 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                        product.stock > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-zinc-500 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-lg active:scale-95 transition-all"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg active:scale-95 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                    {editingProductId ? 'Edit Atelier Piece' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Provide detailed specifications for client discovery</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-zinc-500 hover:text-black dark:hover:text-white p-1.5 rounded-lg active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {message && (
                  <div className="p-3.5 rounded-xl mb-6 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/50">
                    {message}
                  </div>
                )}
                
                <form id="addProductForm" onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Product Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 30″ Raw Virgin Burmese Curly" 
                      required 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Price (₵)</label>
                    <input 
                      name="price" 
                      type="number" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full px-4 py-2.5 font-mono tabular-nums bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Stock Quantity</label>
                    <input 
                      name="stock" 
                      type="number" 
                      value={formData.stock} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full px-4 py-2.5 font-mono tabular-nums bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      required 
                      rows={3} 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 text-zinc-900 dark:text-white resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white font-medium"
                    >
                      {STORE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Texture</label>
                    <input 
                      name="texture" 
                      value={formData.texture} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Raw, Unprocessed" 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Lace Specification</label>
                    <input 
                      name="lace" 
                      value={formData.lace} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Ultra-Thin HD Swiss" 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Longevity</label>
                    <input 
                      name="longevity" 
                      value={formData.longevity} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 2-3+ Years" 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Styling Capabilities</label>
                    <input 
                      name="styling" 
                      value={formData.styling} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Takes Bleach & Heat" 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Image Badge <span className="text-zinc-400 font-normal lowercase">(optional)</span></label>
                    <input 
                      name="badge" 
                      value={formData.badge} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 100% Raw Hair" 
                      className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Product Image {editingProductId && '(Optional)'}</label>
                    <div className="px-4 py-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#C5A059] transition-colors rounded-2xl flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/40">
                      <ImageIcon size={28} className="text-[#C5A059] mb-2" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                        required={!editingProductId} 
                        className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059]/10 file:text-[#C5A059] hover:file:bg-[#C5A059]/20 cursor-pointer" 
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="addProductForm" 
                  disabled={uploading} 
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider bg-[#C5A059] hover:bg-[#b08d4b] text-white active:scale-[0.98] transition-all disabled:opacity-50 flex items-center shadow-sm"
                >
                  {uploading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span> {editingProductId ? 'Saving...' : 'Publishing...'}</>
                  ) : editingProductId ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
