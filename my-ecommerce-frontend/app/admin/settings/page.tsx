'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { User, Store, Truck, CreditCard, Bell, Save, Check, Loader2, Plus, X, Shield } from 'lucide-react';

type SettingsTab = 'account' | 'store' | 'delivery' | 'payment' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: any; emoji: string }[] = [
  { id: 'account', label: 'Account', icon: Shield, emoji: '🔐' },
  { id: 'store', label: 'Store', icon: Store, emoji: '🏪' },
  { id: 'delivery', label: 'Delivery', icon: Truck, emoji: '🚚' },
  { id: 'payment', label: 'Payment', icon: CreditCard, emoji: '💳' },
  { id: 'notifications', label: 'Notifications', icon: Bell, emoji: '🔔' },
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
      setPasswordMsg('Both fields are required');
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
        setPasswordMsg('✅ Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMsg(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordMsg('Error changing password');
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
    if (newRegion.trim() && !settings.deliveryRegions.includes(newRegion.trim())) {
      setSettings({ ...settings, deliveryRegions: [...settings.deliveryRegions, newRegion.trim()] });
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

  const inputClass = "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 text-zinc-900 dark:text-white text-sm transition-all";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Control platform configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-2 shadow-sm lg:sticky lg:top-28">
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    <span className="text-base">{tab.emoji}</span>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl shadow-sm overflow-hidden">

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Account Settings</h2>
                  <p className="text-sm text-zinc-500">Update your admin profile information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 text-sm">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
                </button>

                <hr className="border-zinc-100 dark:border-zinc-800/50" />

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Change Password</h3>
                  <p className="text-sm text-zinc-500 mb-4">Update your admin account password.</p>
                  {passwordMsg && (
                    <div className={`p-3 rounded-xl text-sm mb-4 font-medium ${passwordMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {passwordMsg}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <button onClick={handleChangePassword} disabled={saving} className="mt-4 flex items-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all disabled:opacity-50 text-sm">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Store Settings</h2>
                  <p className="text-sm text-zinc-500">Configure your store information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Store Name</label>
                    <input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className={inputClass}>
                      <option value="GHS">GHS (₵)</option>
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (₦)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Phone</label>
                    <input value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 text-sm">
                  {saved ? <><Check size={16} /> Saved!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Delivery Settings</h2>
                  <p className="text-sm text-zinc-500">Configure delivery fees, regions, and time estimates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Delivery Fee (₵)</label>
                    <input type="number" value={settings.deliveryFee} onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Delivery Time</label>
                    <input value={settings.estimatedDeliveryTime} onChange={(e) => setSettings({ ...settings, estimatedDeliveryTime: e.target.value })} placeholder="e.g. 3-5 business days" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Delivery Regions</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.deliveryRegions?.map((region: string) => (
                      <span key={region} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-500/20">
                        {region}
                        <button onClick={() => removeRegion(region)} className="hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRegion()}
                      placeholder="Add a region..."
                      className={inputClass + ' flex-1'}
                    />
                    <button onClick={addRegion} className="px-4 py-3 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors border border-violet-200 dark:border-violet-500/20">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 text-sm">
                  {saved ? <><Check size={16} /> Saved!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Payment Settings</h2>
                  <p className="text-sm text-zinc-500">Enable or disable payment methods.</p>
                </div>

                <div className="space-y-4">
                  {settings.paymentMethods?.length > 0 ? settings.paymentMethods.map((method: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${method.enabled ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                          <CreditCard size={20} className={method.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{method.name}</p>
                          <p className="text-xs text-zinc-500">{method.enabled ? 'Active' : 'Disabled'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePaymentMethod(index)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${method.enabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${method.enabled ? 'translate-x-5.5 left-0' : 'left-0.5'}`}
                          style={{ transform: method.enabled ? 'translateX(22px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                  )) : (
                    <p className="text-zinc-500 text-sm text-center py-8">No payment methods configured. Save settings to create defaults.</p>
                  )}
                </div>

                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 text-sm">
                  {saved ? <><Check size={16} /> Saved!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Notification Preferences</h2>
                  <p className="text-sm text-zinc-500">Toggle email/SMS notifications for store events.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'newOrder', label: 'New Orders', desc: 'Get notified when a new order is placed.' },
                    { key: 'statusUpdate', label: 'Order Status Updates', desc: 'Notify customers when order status changes.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [item.key]: !settings.notifications?.[item.key],
                          }
                        })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${settings.notifications?.[item.key] ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                      >
                        <div className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform"
                          style={{ transform: settings.notifications?.[item.key] ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 text-sm">
                  {saved ? <><Check size={16} /> Saved!</> : saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
