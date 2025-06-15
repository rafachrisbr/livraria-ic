
const CACHE_NAME = 'livraria-ic-v2';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Cache add failed:', error);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).catch(() => {
            // Return a basic offline page if needed
            return new Response('Offline', { status: 503 });
          });
        })
    );
  }
});
