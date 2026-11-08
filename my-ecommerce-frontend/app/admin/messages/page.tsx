'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { Send, Users, User as UserIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('all');
  const [isSending, setIsSending] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorMessage(null);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        setErrorMessage('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 1200);
        return;
      }

      if (res.status === 403) {
        setErrorMessage('Access denied: You are not authorized as an administrator.');
        setUsers([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data.filter(u => u.role === 'user'));
      } else {
        setErrorMessage(data.message || 'Failed to load recipients');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setErrorMessage('Network error while connecting to server. Please check backend connection.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message.');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, message, targetUserId })
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login?expired=true';
        return;
      }

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Message sent successfully!');
        setTitle('');
        setMessage('');
        setTargetUserId('all');
      } else {
        alert(`Failed to send: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error while sending message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Client Broadcasts
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Deliver atelier announcements, seasonal lookbook alerts, and order updates.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-700 dark:text-rose-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compose Form */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm"
        >
          <form onSubmit={handleSendMessage} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Target Audience</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  {targetUserId === 'all' ? <Users size={16} /> : <UserIcon size={16} />}
                </div>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans appearance-none font-medium"
                >
                  <option value="all">All Registered Clients ({users.length})</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Subject / Header</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Atelier Private Sale: Rare Burmese Curls"
                required
                className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Message Copy</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose announcement for client inboxes..."
                required
                rows={6}
                className="w-full px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059]/60 transition-all text-zinc-800 dark:text-zinc-200 text-sm font-sans resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full md:w-auto px-8 py-3 bg-[#C5A059] hover:bg-[#b08d4b] text-white rounded-xl font-semibold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Transmitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Dispatch Broadcast
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121212] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-zinc-900 dark:text-white mb-4">Transmission Protocol</h3>
            <ul className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs">1</div>
                <p>Messages deliver instantly into the customer's authenticated notifications feed.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs">2</div>
                <p>Clients are alerted via the header badge icon across desktop and mobile storefronts.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center flex-shrink-0 font-serif font-bold text-xs">3</div>
                <p>Target individual clients for custom bespoke orders or select "All Registered Clients" for collection launches.</p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
