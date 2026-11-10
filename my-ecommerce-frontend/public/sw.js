/* Slay by Humu - Progressive Web App Service Worker */

const CACHE_NAME = 'slay-pwa-v1';

const PRECACHE_ASSETS = [
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
];

// Install: Cache critical offline fallback assets & activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: Purge obsolete caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Network-first for navigations with /offline.html fallback; cache-first for static icons
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass service worker for API calls, WebSockets, or auth endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    return;
  }

  // 1. Navigation requests (document page loads / reloads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match('/offline.html');
        return cachedOffline || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // 2. Static icons & favicon (cache-first with network fallback)
  if (url.pathname.startsWith('/icons/') || url.pathname === '/favicon.ico') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network-first pass-through without caching dynamic shop pages
});
