// Simple offline cache with versioning
const CACHE_NAME = 'weighright-v1';
const ASSETS = [
  './',
  './index.html',
  './axlecalc.html',
  './settings.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png'
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, then network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(r => {
      // Optionally cache new GET requests
      if (req.method === 'GET' && r.status === 200 && r.type === 'basic') {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return r;
    }).catch(() => {
      // Fallback offline page for navigations
      if (req.mode === 'navigate') return caches.match('./index.html');
    }))
  );
});