'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

const STORE_CATEGORIES = ['Straight', 'Curly', 'Wavy', 'Short', 'Long'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: 'SlayByHumu',
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
      setMessage('Please select an image');
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

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Products</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your store catalog and inventory.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all font-medium"
        >
          <Plus size={20} className="mr-2" /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm py-2 px-4 rounded-xl focus:outline-none w-full sm:w-auto">
            <option value="all">All Categories</option>
            {STORE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="py-20 text-center text-zinc-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">No products found.</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-zinc-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-zinc-900 dark:text-white truncate">{product.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{product.category || 'Uncategorized'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-bold text-zinc-900 dark:text-white">₵{product.price}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      product.stock > 10 ? 'text-emerald-500 bg-emerald-500/10' : 
                      product.stock > 0 ? 'text-amber-500 bg-amber-500/10' : 
                      'text-rose-500 bg-rose-500/10'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl font-medium text-sm transition-colors hover:bg-violet-500/20"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(product._id, product.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl font-medium text-sm transition-colors hover:bg-rose-500/20"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PC Table Layout */}
      <div className="hidden md:block bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Inventory</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 w-48">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {product.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">₵{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        product.stock > 10 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                        product.stock > 0 ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                        'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingProductId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-black dark:hover:text-white bg-white dark:bg-black p-1.5 rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {message && (
                  <div className="p-4 rounded-2xl mb-6 bg-rose-100 text-rose-700 text-sm font-medium border border-rose-200">
                    {message}
                  </div>
                )}
                
                <form id="addProductForm" onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Product Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Price (₵)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white">
                      {STORE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Stock Quantity</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} required className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Product Image {editingProductId && '(Optional)'}</label>
                    <div className="px-4 py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                      <ImageIcon size={32} className="text-zinc-400 mb-3" />
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} required={!editingProductId} className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" form="addProductForm" disabled={uploading} className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center">
                  {uploading ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span> {editingProductId ? 'Saving...' : 'Publishing...'}</>
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
