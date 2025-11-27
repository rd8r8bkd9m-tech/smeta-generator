/* eslint-disable no-restricted-globals */
/* Service Worker for SMETA PRO PWA */

const CACHE_NAME = 'smeta-pro-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip API requests - always go to network
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'Нет подключения к интернету' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // For navigation requests, try network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the response
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/')
          })
        })
    )
    return
  }

  // For other requests, try cache first, fall back to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Update cache in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response)
          })
        })
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// Background sync for offline data
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-estimates') {
    event.waitUntil(syncEstimates())
  }
})

async function syncEstimates() {
  // Sync pending offline estimates with the server
  // This will be called when the device comes back online
  try {
    // Future implementation: Read from IndexedDB and POST to server
    console.log('Service Worker: Background sync triggered for estimates')
  } catch (error) {
    console.error('Service Worker: Sync failed', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'SMETA PRO'
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url || '/',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data || '/')
  )
})

export {}
