'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun, Bell, BellOff, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from 'next-themes';
import { API_URL } from '@/src/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';

const API = API_URL;

export default function SettingsPage() {
  const { token, isLoggedIn } = useAuth();
  const { showNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState(true);
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      showNotification('Please fill in all password fields', 'error');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${API}/users/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('Password changed successfully', 'success');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setChangingPw(false);
      } else {
        showNotification(data.message || 'Failed to change password', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg  border-b border-brand-text/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 flex items-center gap-3">
          <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-serif font-bold tracking-tight">{t('settings.title')}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Dark Mode Toggle */}
        <div
          className="bg-brand-panel rounded-2xl border border-brand-text/5 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-accent" /> : <Sun className="w-5 h-5 text-brand-accent" />}
            </div>
            <div>
              <p className="font-sans font-medium text-sm">{t('settings.darkMode')}</p>
              <p className="text-brand-muted text-xs font-sans">{t('settings.darkModeDesc')}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Notifications Toggle */}
        <div
          className="bg-brand-panel rounded-2xl border border-brand-text/5 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              {notifications ? <Bell className="w-5 h-5 text-brand-accent" /> : <BellOff className="w-5 h-5 text-brand-muted" />}
            </div>
            <div>
              <p className="font-sans font-medium text-sm">{t('settings.notifications')}</p>
              <p className="text-brand-muted text-xs font-sans">{t('settings.notificationsDesc')}</p>
            </div>
          </div>
          <button 
            onClick={() => { setNotifications(!notifications); showNotification(notifications ? 'Notifications off' : 'Notifications on', 'info'); }}
            className={`relative flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${notifications ? 'bg-brand-panel border border-brand-text/10' : 'bg-black/10'}`}
          >
            <span className={`absolute w-5 h-5 bg-brand-text rounded-full shadow transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Language Selection */}
        <div className="bg-brand-panel rounded-2xl border border-brand-text/5 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <p className="font-sans font-medium text-sm">{t('settings.language')}</p>
              <p className="text-brand-muted text-xs font-sans">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                showNotification('Language updated', 'success');
              }}
              className="pl-4 pr-8 py-2 bg-brand-bg border border-brand-text/10 focus:outline-none focus:border-brand-accent transition-colors text-sm font-medium rounded-xl appearance-none"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="sw">Swahili</option>
              <option value="pt">Portuguese</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-brand-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div
          className="bg-brand-panel rounded-2xl border border-brand-text/5 overflow-hidden">
          <button onClick={() => { if (isLoggedIn) setChangingPw(!changingPw); else showNotification('Please login first', 'error'); }}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-brand-text/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="text-left">
                <p className="font-sans font-medium text-sm">{t('settings.changePassword')}</p>
                <p className="text-brand-muted text-xs font-sans">{t('settings.changePasswordDesc')}</p>
              </div>
            </div>
          </button>

          {changingPw && (
            <div className="px-6 pb-6 space-y-3 border-t border-brand-text/5 pt-4">
              <div className="relative">
                <input type={showCurrentPw ? 'text' : 'password'} placeholder="Current Password"
                  value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent pr-10" />
                <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} placeholder="New Password (min 6 chars)"
                  value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent pr-10" />
                <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input type="password" placeholder="Confirm New Password"
                value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="w-full bg-brand-bg border border-brand-text/10 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-accent" />
              <button onClick={handleChangePassword} disabled={pwLoading}
                className="btn-gold w-full py-3 text-sm disabled:opacity-50">
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
