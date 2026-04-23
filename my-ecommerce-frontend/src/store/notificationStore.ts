import { create } from 'zustand';

interface NotificationStore {
  unreadCount: number;
  incrementUnread: () => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
