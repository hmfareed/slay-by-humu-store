'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { API_URL } from '@/src/lib/api';
import { useNotification as useToast } from '@/src/context/NotificationContext';

import { useNotificationStore } from '@/src/store/notificationStore';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { token, isLoggedIn, isLoading } = useAuth();
  const { showNotification } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const decrementUnread = useNotificationStore((s) => s.decrementUnread);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (token) fetchNotifications();

    // Listen for real-time notifications
    const handleNewNotification = (e: any) => {
      const newNotif = e.detail;
      setNotifications(prev => [newNotif, ...prev]);
    };

    window.addEventListener('new_notification', handleNewNotification);
    return () => window.removeEventListener('new_notification', handleNewNotification);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        decrementUnread();
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markAsRead(n._id, false);
    }
    setUnreadCount(0);
    showNotification('All notifications marked as read', 'success');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-bg pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-text/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="sticky top-0 z-50 bg-brand-bg border-b border-brand-text/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-brand-muted hover:text-brand-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-tight">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs font-sans font-medium text-brand-accent hover:text-brand-accent/80 transition-colors">
              Mark all as read
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-text/5 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-brand-muted" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight mb-2">You're all caught up!</h2>
            <p className="text-brand-muted text-sm font-sans mb-6">There are no new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => markAsRead(notification._id, notification.isRead)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${notification.isRead ? 'bg-brand-panel border-brand-text/5 opacity-70' : 'bg-brand-panel border-brand-accent/30 shadow-soft'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 ${notification.isRead ? 'text-brand-muted' : 'text-brand-accent'}`}>
                    {notification.isRead ? <CheckCircle2 size={20} /> : <Circle fill="currentColor" size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-sans font-semibold mb-1 ${notification.isRead ? 'text-brand-text' : 'text-brand-accent'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm font-sans text-brand-muted mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-brand-muted">
                      {new Date(notification.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
