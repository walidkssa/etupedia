// Service Worker for WebLLM model caching
const CACHE_NAME = 'webllm-models-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache WebLLM model files from Hugging Face
  if (url.hostname.includes('huggingface.co') ||
      url.hostname.includes('hf.co') ||
      url.pathname.includes('.bin') ||
      url.pathname.includes('.wasm') ||
      url.pathname.includes('mlc-chat')) {

    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            console.log('[SW] Cache hit:', url.pathname);
            return response;
          }

          console.log('[SW] Fetching:', url.pathname);
          return fetch(event.request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
