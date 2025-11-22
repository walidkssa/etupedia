// Service Worker for Etupedia PWA
const CACHE_VERSION = 'v1';
const WEBLLM_CACHE = `webllm-models-${CACHE_VERSION}`;
const STATIC_CACHE = `etupedia-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `etupedia-runtime-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/icon_dark.png',
  '/og-image.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => {
            return name.startsWith('webllm-') ||
                   name.startsWith('etupedia-') &&
                   !name.includes(CACHE_VERSION);
          })
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Cache strategy for WebLLM model files from Hugging Face
  if (url.hostname.includes('huggingface.co') ||
      url.hostname.includes('hf.co') ||
      url.pathname.includes('.bin') ||
      url.pathname.includes('.wasm') ||
      url.pathname.includes('mlc-chat')) {

    event.respondWith(
      caches.open(WEBLLM_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            console.log('[SW] WebLLM cache hit:', url.pathname);
            return response;
          }

          console.log('[SW] Fetching WebLLM asset:', url.pathname);
          return fetch(event.request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('[SW] WebLLM fetch failed:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Cache strategy for static assets (images, fonts, etc.)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Optionally cache successful API responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // Network-first strategy for everything else (HTML, JS, CSS)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // Return offline page if available
          return caches.match('/');
        });
      })
  );
});
