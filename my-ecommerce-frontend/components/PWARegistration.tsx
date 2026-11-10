'use client';

import { useEffect } from 'react';
import { usePWAStore, PWAPlatform } from '@/src/store/pwaStore';
import { useNotification } from '@/src/context/NotificationContext';

export default function PWARegistration() {
  const { setDeferredPrompt, setIsInstalled, setPlatform } = usePWAStore();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // If there's an updated worker waiting, skip waiting
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((err) => {
          console.error('PWA Service Worker registration error:', err);
        });
    }

    // 2. Check if currently running in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // 3. Platform Detection
    const ua = navigator.userAgent;
    let detectedPlatform: PWAPlatform = 'other';

    const isIPad =
      /Macintosh/.test(ua) &&
      Boolean(typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    const isIOS =
      (/iPad|iPhone|iPod/.test(ua) || isIPad) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    if (isIOS) {
      detectedPlatform = 'ios';
    } else if (/Android/.test(ua)) {
      detectedPlatform = 'android';
    } else if (
      /Macintosh/.test(ua) &&
      /Safari/.test(ua) &&
      !/Chrome|Chromium|Edg|Brave/.test(ua)
    ) {
      detectedPlatform = 'macos-safari';
    } else if (/Windows|Macintosh|Linux/.test(ua) && /Chrome|Edg|Brave/.test(ua)) {
      detectedPlatform = 'desktop-chromium';
    }

    setPlatform(detectedPlatform);

    // 4. Capture beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 5. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      showNotification('Slay by Humu app installed successfully', 'success');
    };

    // 6. Network status listeners
    const handleOffline = () => {
      showNotification('You are currently offline. Check your internet connection.', 'error');
    };

    const handleOnline = () => {
      showNotification('Internet connection restored.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [setDeferredPrompt, setIsInstalled, setPlatform, showNotification]);

  return null;
}
