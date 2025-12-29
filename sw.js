/* ========================================
   NeuralPath - Service Worker
   Offline-first PWA support
   ======================================== */

const CACHE_NAME = 'neuralpath-v1.0.1';
const RUNTIME_CACHE = 'neuralpath-runtime-v1.0.1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/favicon.svg',
    
    // Icons
    '/icons/icon-72.svg',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
    
    // CSS
    '/css/variables.css',
    '/css/base.css',
    '/css/components.css',
    '/css/layout.css',
    '/css/pages.css',
    
    // Core JS
    '/js/utils/storage.js',
    '/js/utils/helpers.js',
    '/js/core/router.js',
    '/js/core/state.js',
    '/js/core/search.js',
    '/js/components/components.js',
    '/js/pages/home.js',
    '/js/pages/explore.js',
    '/js/pages/courses.js',
    '/js/pages/tools.js',
    '/js/pages/jobs.js',
    '/js/pages/resources.js',
    '/js/app.js',
    
    // Data
    '/data/tools.json',
    '/data/careers.json',
    '/data/learning-path.json',
    '/data/resources.json',
    '/data/courses/index.json',
    '/data/graphs/index.json'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching app shell...');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Precache complete!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precache failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients...');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip external requests (CDN, fonts, etc.)
    if (url.origin !== location.origin) {
        // For external resources, try network first, cache as fallback
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache external resources
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }
    
    // For local assets - cache first, network fallback
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update cache in background
                    event.waitUntil(
                        fetch(request)
                            .then((networkResponse) => {
                                if (networkResponse.ok) {
                                    caches.open(CACHE_NAME).then((cache) => {
                                        cache.put(request, networkResponse);
                                    });
                                }
                            })
                            .catch(() => {}) // Ignore network errors for background update
                    );
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                    });
            })
    );
});

// Background sync for when coming back online
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgress());
    }
});

// Sync user progress when back online
async function syncProgress() {
    console.log('[SW] Syncing progress data...');
    // Future: sync localStorage progress to a backend
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    
    const options = {
        body: data.body || 'New content available!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'NeuralPath', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'dismiss') return;
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
    if (event.data?.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data?.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((names) => {
                return Promise.all(names.map((name) => caches.delete(name)));
            })
        );
    }
    
    if (event.data?.action === 'getCacheSize') {
        event.waitUntil(
            getCacheSize().then((size) => {
                event.source.postMessage({ action: 'cacheSize', size });
            })
        );
    }
});

// Helper to get cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

console.log('[SW] Service worker loaded!');
