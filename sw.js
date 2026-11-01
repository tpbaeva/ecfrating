// Offline support: fetch from the network and update the cache; fall back to
// the cache when offline or when the network is too slow.
// Bump CACHE when the file list changes.

const CACHE = 'ecfrating-v2';
const NETWORK_TIMEOUT_MS = 3000;
const FILES = [
  './',
  'index.html',
  'style.css',
  'ecf.js',
  'app.js',
  'manifest.json',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const network = fetch(event.request, { cache: 'no-cache' }).then((response) => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      });
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS));
      try {
        return await Promise.race([network, timeout]);
      } catch {
        const cached = await cache.match(event.request, { ignoreSearch: true });
        return cached || network;
      }
    })
  );
});
