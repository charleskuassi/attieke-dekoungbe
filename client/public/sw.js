const CACHE_NAME = 'attieke-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/images/logo.png',
    '/manifest.json'
];

// Installation - skipWaiting permet au nouveau SW de prendre le relais immédiatement
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force le nouveau SW à prendre la main immédiatement
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Stratégie : Network First avec fallback cache
self.addEventListener('fetch', (event) => {
    // API requests - network only
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si le réseau fonctionne, on met à jour le cache en background
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Si le réseau échoue, on sert le cache
                return caches.match(event.request);
            })
    );
});

// Activation - nettoie les anciens caches et prend le contrôle immédiatement
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Prend le contrôle de tous les clients immédiatement
        })
    );
});
