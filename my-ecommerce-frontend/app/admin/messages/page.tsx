'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/lib/api';
import { Send, Users, User as UserIcon, Loader2 } from 'lucide-react';
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
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('all');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter out admins so we only send to customers, though the backend also handles this
        setUsers(data.filter(u => u.role === 'user'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Broadcast Messages</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Send in-app notifications directly to your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Compose Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <form onSubmit={handleSendMessage} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Audience</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  {targetUserId === 'all' ? <Users size={18} /> : <UserIcon size={18} />}
                </div>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  disabled={loadingUsers}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200 appearance-none"
                >
                  <option value="all">All Customers ({users.length})</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Message Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Big Summer Sale! 🌞"
                required
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                required
                rows={6}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 ring-violet-500/50 transition-all text-zinc-800 dark:text-zinc-200 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121212] border border-zinc-100 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">How it works</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                <p>Messages are sent instantly to the selected customers.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                <p>Customers will see a notification badge on their account bell icon.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div>
                <p>Use "All Customers" for general announcements like sales or new arrivals.</p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
