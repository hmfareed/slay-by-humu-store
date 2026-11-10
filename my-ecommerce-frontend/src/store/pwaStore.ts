import { create } from 'zustand';

export type PWAPlatform = 'android' | 'ios' | 'macos-safari' | 'desktop-chromium' | 'other';

interface PWAStore {
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: any | null;
  platform: PWAPlatform;
  isModalOpen: boolean;
  isBannerDismissed: boolean;
  setDeferredPrompt: (prompt: any) => void;
  setIsInstalled: (installed: boolean) => void;
  setPlatform: (platform: PWAPlatform) => void;
  openModal: () => void;
  closeModal: () => void;
  dismissBanner: () => void;
  promptInstall: () => Promise<void>;
}

const DISMISS_KEY = 'slay_pwa_banner_dismissed';
const DISMISS_DAYS = 14;

function checkIsBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const item = localStorage.getItem(DISMISS_KEY);
    if (!item) return false;
    const dismissedAt = parseInt(item, 10);
    const now = Date.now();
    const diffDays = (now - dismissedAt) / (1000 * 60 * 60 * 24);
    return diffDays < DISMISS_DAYS;
  } catch {
    return false;
  }
}

export const usePWAStore = create<PWAStore>((set, get) => ({
  isInstallable: false,
  isInstalled: false,
  deferredPrompt: null,
  platform: 'other',
  isModalOpen: false,
  isBannerDismissed: typeof window !== 'undefined' ? checkIsBannerDismissed() : false,

  setDeferredPrompt: (prompt) => {
    set({ deferredPrompt: prompt, isInstallable: Boolean(prompt) });
  },

  setIsInstalled: (installed) => {
    set({ isInstalled: installed, isInstallable: !installed });
  },

  setPlatform: (platform) => {
    set({ platform });
  },

  openModal: () => {
    set({ isModalOpen: true });
  },

  closeModal: () => {
    set({ isModalOpen: false });
  },

  dismissBanner: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      } catch (e) {
        console.error('Failed to store PWA banner dismiss state', e);
      }
    }
    set({ isBannerDismissed: true });
  },

  promptInstall: async () => {
    const { deferredPrompt, isInstalled } = get();
    if (isInstalled) return;

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          set({ isInstalled: true, deferredPrompt: null, isInstallable: false });
        }
      } catch (err) {
        console.error('Error triggering PWA install prompt', err);
      }
    } else {
      // For iOS Safari, macOS Safari, or browsers without deferred prompt, open guided instructions
      set({ isModalOpen: true });
    }
  },
}));
