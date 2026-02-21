const CACHE_NAME = 'eikonify-v2';
const STATIC_ASSETS = [
    '/manifest.json',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/images/eikonify-icon-light.png',
    '/images/eikonify-icon-dark.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - cache static assets only, NEVER cache HTML (Inertia pages contain auth state)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API calls and external requests
    if (url.pathname.startsWith('/api/') || url.origin !== location.origin) {
        return;
    }

    // NEVER cache HTML pages - they contain Inertia props with auth state
    // Let them always go to the network
    if (request.headers.get('accept')?.includes('text/html')) {
        return;
    }

    // For static assets only - cache first
    if (
        url.pathname.startsWith('/build/') ||
        url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|avif|svg|woff2?)$/)
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;

                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
