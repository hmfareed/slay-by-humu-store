'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/src/lib/api';

const API = API_URL;

interface Address {
  _id: string;
  name: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  gpsAddress: string;
  isDefault: boolean;
}

const emptyForm = { name: '', phone: '', region: '', city: '', street: '', gpsAddress: '', isDefault: false };

export default function AddressPage() {
  const { token, isLoggedIn, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) { router.push('/login'); return; }
    if (token) fetchAddresses();
  }, [token, authLoading]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAddresses(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.region || !form.city || !form.street) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `${API}/addresses/${editingId}` : `${API}/addresses`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showNotification(editingId ? 'Address updated' : 'Address added', 'success');
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchAddresses();
      } else {
        const data = await res.json();
        showNotification(data.message || 'Failed to save address', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification('Address deleted', 'info');
        fetchAddresses();
      }
    } catch {
      showNotification('Failed to delete', 'error');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`${API}/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification('Default address updated', 'success');
        fetchAddresses();
      }
    } catch { /* silent */ }
  };

  const startEdit = (addr: Address) => {
    setForm({ name: addr.name, phone: addr.phone, region: addr.region, city: addr.city, street: addr.street, gpsAddress: addr.gpsAddress, isDefault: addr.isDefault });
    setEditingId(addr._id);
    setShowForm(true);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center pb-20"><div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-text/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">Delivery Addresses</h1>
          </div>
          {!showForm && (
            <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-brand-accent text-xs font-sans font-semibold uppercase tracking-widest">
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-brand-panel rounded-2xl border border-brand-text/5 p-6 mb-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-serif font-bold text-lg">{editingId ? 'Edit Address' : 'New Address'}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-brand-muted hover:text-brand-text"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                  <input placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Region (e.g. Greater Accra) *" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                  <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                </div>
                <input placeholder="Street / Area *" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                <input placeholder="GPS Address (optional)" value={form.gpsAddress} onChange={(e) => setForm({ ...form, gpsAddress: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-colors" />
                <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="accent-brand-accent" />
                  Set as default address
                </label>
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold w-full py-3 text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && <div className="space-y-3">{[1, 2].map(i => <div key={i} className="bg-brand-panel rounded-2xl p-5 border border-brand-text/5 animate-pulse"><div className="h-4 bg-brand-text/5 rounded w-1/3 mb-2" /><div className="h-3 bg-brand-text/5 rounded w-2/3" /></div>)}</div>}

        {/* Empty state */}
        {!loading && addresses.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-brand-panel border border-brand-text/5 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-brand-muted" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-serif tracking-tight mb-3">No saved addresses</h2>
            <p className="text-brand-muted font-sans font-light text-sm mb-8">Add a delivery address to speed up checkout.</p>
            <button onClick={() => setShowForm(true)} className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm"><Plus className="w-4 h-4" /> Add Address</button>
          </motion.div>
        )}

        {/* Address List */}
        {!loading && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <motion.div key={addr._id} layout className="bg-brand-panel rounded-2xl border border-brand-text/5 p-5 relative">
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[9px] font-sans font-bold uppercase tracking-widest text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3" fill="currentColor" /> Default
                  </span>
                )}
                <h3 className="font-sans font-semibold text-sm mb-1">{addr.name}</h3>
                <p className="text-brand-muted text-xs font-sans mb-0.5">{addr.phone}</p>
                <p className="text-brand-muted text-xs font-sans">{addr.street}, {addr.city}, {addr.region}</p>
                {addr.gpsAddress && <p className="text-brand-muted text-[10px] font-sans mt-1">GPS: {addr.gpsAddress}</p>}

                <div className="flex gap-3 mt-4 pt-3 border-t border-brand-text/5">
                  <button onClick={() => startEdit(addr)} className="flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-muted hover:text-brand-accent transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr._id)} className="flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-muted hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-accent ml-auto">
                      <Check className="w-3 h-3" /> Set Default
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
