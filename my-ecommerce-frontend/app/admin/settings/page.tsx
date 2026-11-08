'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { Store, Truck, CreditCard, Bell, Save, Check, Loader2, Plus, X, Shield } from 'lucide-react';

type SettingsTab = 'account' | 'store' | 'delivery' | 'payment' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: any; emoji: string }[] = [
  { id: 'account', label: 'Admin Security', icon: Shield, emoji: '🔐' },
  { id: 'store', label: 'Storefront', icon: Store, emoji: '🏪' },
  { id: 'delivery', label: 'Logistics & Regions', icon: Truck, emoji: '🚚' },
  { id: 'payment', label: 'Payment Channels', icon: CreditCard, emoji: '💳' },
  { id: 'notifications', label: 'Alert Preferences', icon: Bell, emoji: '🔔' },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Account state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Store settings state
  const [settings, setSettings] = useState<any>({
    storeName: '',
    currency: 'GHS',
    currencySymbol: '₵',
    contactEmail: '',
    contactPhone: '',
    deliveryFee: 0,
    deliveryRegions: [],
    estimatedDeliveryTime: '',
    paymentMethods: [],
    notifications: { newOrder: true, statusUpdate: true },
  });

  const [newRegion, setNewRegion] = useState('');

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setAdminName(data.name);
          setAdminEmail(data.email);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch store settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSettings(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: adminName, email: adminEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('token', data.token);
        flashSaved();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Both current and new password are required');
      return;
    }
    setSaving(true);
    setPasswordMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg('✅ Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMsg(data.message || 'Failed to update password');
      }
    } catch (error) {
      setPasswordMsg('Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        flashSaved();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addRegion = () => {
    if (newRegion.trim() && !settings.deliveryRegions?.includes(newRegion.trim())) {
      setSettings({ ...settings, deliveryRegions: [...(settings.deliveryRegions || []), newRegion.trim()] });
      setNewRegion('');
    }
  };

  const removeRegion = (region: string) => {
    setSettings({ ...settings, deliveryRegions: settings.deliveryRegions.filter((r: string) => r !== region) });
  };

  const togglePaymentMethod = (index: number) => {
    const updated = [...settings.paymentMethods];
    updated[index].enabled = !updated[index].enabled;
    setSettings({ ...settings, paymentMethods: updated });
  };

  const inputClass = "w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 text-zinc-900 dark:text-white text-sm transition-all";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2";

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Platform Configuration
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Storefront parameters, dispatch territories, payment switches, and credentials.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-2 shadow-sm lg:sticky lg:top-28">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all relative ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-800 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#C5A059] rounded-r-full" />
                    )}
                    <span className="text-sm">{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-1">Administrative Profile</h2>
                  <p className="text-xs text-zinc-500">Update verified contact coordinates for this administrator seat.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Legal Name</label>
                    <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Administrative Email</label>
                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button 
                  onClick={handleSaveProfile} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Credentials
                </button>

                <hr className="border-zinc-100 dark:border-zinc-800/60" />

                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white mb-1">Access Passcode</h3>
                  <p className="text-xs text-zinc-500 mb-4">Rotate your session password regularly for atelier security.</p>
                  {passwordMsg && (
                    <div className={`p-3 rounded-xl text-xs mb-4 font-medium ${passwordMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'}`}>
                      {passwordMsg}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>New Secure Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <button 
                    onClick={handleChangePassword} 
                    disabled={saving} 
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C5A059] hover:text-[#C5A059] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />} Rotate Passcode
                  </button>
                </div>
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-1">Storefront Identity</h2>
                  <p className="text-xs text-zinc-500">Configure public atelier credentials, contact numbers, and currency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Brand Name</label>
                    <input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Base Operating Currency</label>
                    <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className={inputClass + ' font-mono'}>
                      <option value="GHS">GHS (Ghanaian Cedi - ₵)</option>
                      <option value="USD">USD (US Dollar - $)</option>
                      <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                      <option value="GBP">GBP (British Pound - £)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Client Inquiries Email</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Client Inquiries Hotline</label>
                    <input value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className={inputClass + ' font-mono'} />
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {saved ? <><Check size={15} /> Saved Successfully</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-1">Fulfillment & Courier Logistics</h2>
                  <p className="text-xs text-zinc-500">Configure base shipping fees, supported courier destinations, and timelines.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Base Dispatch Fee (₵)</label>
                    <input 
                      type="number" 
                      value={settings.deliveryFee} 
                      onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })} 
                      className={inputClass + ' font-mono tabular-nums'} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Transit Window</label>
                    <input value={settings.estimatedDeliveryTime} onChange={(e) => setSettings({ ...settings, estimatedDeliveryTime: e.target.value })} placeholder="e.g. 24-48 hours (Accra), 3-5 days (Worldwide)" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Authorized Delivery Zones</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.deliveryRegions?.map((region: string) => (
                      <span key={region} className="flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 rounded-full text-xs font-semibold">
                        {region}
                        <button onClick={() => removeRegion(region)} className="hover:text-rose-500 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRegion()}
                      placeholder="Add dispatch territory (e.g. Greater Accra, Kumasi, Takoradi)..."
                      className={inputClass + ' flex-1'}
                    />
                    <button 
                      onClick={addRegion} 
                      className="px-4 py-2.5 bg-zinc-900 text-white dark:bg-zinc-800 hover:text-[#C5A059] active:scale-95 rounded-xl transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {saved ? <><Check size={15} /> Saved Successfully</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-1">Payment Gateways</h2>
                  <p className="text-xs text-zinc-500">Toggle enabled checkout gateways for clients.</p>
                </div>

                <div className="space-y-3">
                  {settings.paymentMethods?.length > 0 ? settings.paymentMethods.map((method: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method.enabled ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white text-sm">{method.name}</p>
                          <p className="text-xs text-zinc-500">{method.enabled ? 'Active at checkout' : 'Disabled'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePaymentMethod(index)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${method.enabled ? 'bg-[#C5A059]' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div 
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                          style={{ transform: method.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  )) : (
                    <p className="text-zinc-500 text-xs text-center py-8">No payment methods configured.</p>
                  )}
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {saved ? <><Check size={15} /> Saved Successfully</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6 md:p-8 space-y-8">
                <div>
                  <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white mb-1">Automated Notifications</h2>
                  <p className="text-xs text-zinc-500">Configure email and push triggers for customer lifecycle events.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'newOrder', label: 'Client Transaction Alerts', desc: 'Notify administrator immediately when new order is finalized.' },
                    { key: 'statusUpdate', label: 'Order Status Dispatch', desc: 'Send automated email/SMS to client when order is marked shipped or delivered.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/60 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/60">
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{item.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [item.key]: !settings.notifications?.[item.key],
                          }
                        })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${settings.notifications?.[item.key] ? 'bg-[#C5A059]' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div 
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                          style={{ transform: settings.notifications?.[item.key] ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={saving} 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
                >
                  {saved ? <><Check size={15} /> Saved Successfully</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
