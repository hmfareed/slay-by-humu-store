// app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Wigs',
    stock: '',
    brand: 'GlamWigs',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/products', {
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

  // Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage('Please select an image');
      return;
    }

    setUploading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login first');
      setUploading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('stock', formData.stock);
    data.append('brand', formData.brand);
    data.append('images', imageFile);   // Important: key must match your backend multer

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('✅ Product added successfully!');
        setFormData({ name: '', description: '', price: '', category: 'Wigs', stock: '', brand: 'GlamWigs' });
        setImageFile(null);
        fetchProducts(); // Refresh list
      } else {
        setMessage(result.message || 'Failed to add product');
      }
    } catch (error) {
      setMessage('Error uploading product. Make sure backend is running.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;

    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      setMessage('Product deleted');
    } catch (error) {
      setMessage('Failed to delete');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">MyStore <span className="text-zinc-500 text-xl">Admin</span></h1>
          <div className="flex items-center gap-8 text-lg font-medium">
            <Link href="/products" className="hover:text-black">Shop</Link>
            <Link href="/admin/products" className="text-black font-semibold">Admin Products</Link>
            <Link href="/" className="hover:text-black">Home</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold tracking-tight mb-3">Admin Dashboard</h1>
        <p className="text-zinc-600 text-xl mb-12">Add, view and manage your wig products</p>

        {/* Add Product Form */}
        <div className="bg-white rounded-3xl p-10 border border-zinc-100 mb-16">
          <h2 className="text-3xl font-semibold mb-8">Add New Product</h2>
          
          {message && (
            <div className={`p-4 rounded-2xl mb-6 ${message.includes('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-3">Product Name</label>
              <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black" placeholder="Midnight Silk Staright Wig" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Price (₵)</label>
              <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-3">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black" placeholder="Premium silky straight wig..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black">
                <option value="Wigs">Wigs</option>
                <option value="Phones">Phones</option>
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Stock</label>
              <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} required className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Brand</label>
              <input name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-3">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full px-6 py-5 border border-zinc-200 rounded-2xl focus:outline-none" />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit" 
                disabled={uploading}
                className="btn-primary w-full py-6 text-xl font-semibold"
              >
                {uploading ? 'Uploading Product...' : 'Add Product to Store'}
              </button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <h2 className="text-3xl font-semibold mb-8">All Products ({products.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="card bg-white rounded-3xl overflow-hidden border border-zinc-100">
              <div className="h-64 bg-zinc-100 relative">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400">No Image</div>
                )}
              </div>
              <div className="p-8">
                <h3 className="font-semibold text-2xl mb-2">{product.name}</h3>
                <p className="text-zinc-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">₵{product.price}</p>
                    <p className="text-sm text-emerald-600">Stock: {product.stock}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-700 font-medium px-6 py-3 border border-red-200 rounded-2xl hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}