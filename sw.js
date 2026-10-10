const CACHE_NAME = 'shohojchat-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => console.log('Cache add failed:', url, err))
        )
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // Bypass cache for Firebase, CDNs, Instagram, YouTube
  if (url.includes('firebase') ||
    url.includes('gstatic') ||
    url.includes('googleapis') ||
    url.includes('instagram') ||
    url.includes('youtube') ||
    url.includes('tiktok') ||
    url.includes('cdn.jsdelivr') ||
    url.includes('cloudflare') ||
    event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Don't cache non-OK responses
        if (!response || response.status !== 200) return response;
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});