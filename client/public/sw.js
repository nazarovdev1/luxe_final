// Never cache Vite's hashed JS/CSS bundles. A new deployment removes the
// previous hashes, so serving an old entry bundle here would make lazy routes
// request CSS files that no longer exist.
const CACHE_NAME = 'luxe-v7'
const STATIC_CACHE = 'luxe-static-v7'
const API_CACHE = 'luxe-api-v7'
const IMAGE_CACHE = 'luxe-images-v7'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logoweb2.png',
  '/logoweb3.png',
  '/placeholder.svg',
  '/placeholder.jpg'
]

const API_CACHE_DURATION = 5 * 60 * 1000
const IMAGE_CACHE_DURATION = 24 * 60 * 60 * 1000

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('luxe-') && name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
        )
      })
      // clients.claim() is only legal after this worker becomes active.
      // Keeping it inside waitUntil also makes activation deterministic.
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  // === iOS PWA VIDEO FIX: Critical bypasses ===
  
  // 1. NEVER intercept Range requests — iOS uses these for video streaming (206 Partial Content).
  //    If SW handles Range requests, it strips the Range header and returns full 200 response,
  //    causing iOS video playback to silently fail (especially in PWA standalone mode).
  if (request.headers.get('Range')) {
    return
  }

  // 2. Skip all video-related requests by destination or file extension
  if (request.destination === 'video' || url.pathname.match(/\.(mp4|webm|mov|m3u8|ts)$/i)) {
    return
  }

  // 3. Skip audio requests as well (some videos have separate audio streams)
  if (request.destination === 'audio') {
    return
  }

  // 4. Skip ALL cross-origin requests — ImageKit, Google, Firebase, CDN etc.
  //    This is essential for iOS PWA where cross-origin video/media fetches through SW get corrupted.
  if (url.origin !== self.location.origin) {
    return
  }

  // Deployment-critical files must never be handled by this worker. Vite
  // filenames contain a content hash, and a previous deploy can remove them.
  if (
    url.pathname === '/sw.js' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/assets/')
  ) {
    return
  }

  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.includes('/api/products') && !url.pathname.includes('/api/products/')) {
      event.respondWith(networkFirst(request, API_CACHE, API_CACHE_DURATION))
      return
    }
    if (url.pathname.includes('/api/announcements')) {
      event.respondWith(networkFirst(request, API_CACHE, API_CACHE_DURATION))
      return
    }
    return
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, IMAGE_CACHE_DURATION))
    return
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/').then((shell) => shell || new Response('Offline', { status: 503 }))
          })
        })
    )
    return
  }

  if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 365 * 24 * 60 * 60 * 1000))
    return
  }

  // Do not provide a generic cache fallback. Returning undefined from a fetch
  // handler produces a network error and breaks lazy-loaded route CSS.
  return
})

async function cacheFirst(request, cacheName, maxAge) {
  const cached = await caches.match(request)
  if (cached) {
    const cachedTime = new Date(cached.headers.get('date') || 0)
    if (Date.now() - cachedTime.getTime() < maxAge) {
      return cached
    }
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    if (cached) return cached
    return new Response('', { status: 503, statusText: 'Offline' })
  }
}

async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ success: false, offline: true, data: [] }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const title = data.notification?.title || 'LUXE'
    const options = {
      body: data.notification?.body || 'Yangilik!',
      icon: '/logoweb2.png',
      badge: '/logoweb3.png',
      vibrate: [100, 50, 100],
      data: data.data || {}
    }
    event.waitUntil(self.registration.showNotification(title, options))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyDWunJ1nkjfcI84ulgBHI2LYXHMlwAxgBU',
  authDomain: 'luxe-store-ca6a2.firebaseapp.com',
  projectId: 'luxe-store-ca6a2',
  storageBucket: 'luxe-store-ca6a2.firebasestorage.app',
  messagingSenderId: '283777938224',
  appId: '1:283777938224:web:ef52f06cdba7f8bfd38ef5'
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'LUXE'
  const notificationOptions = {
    body: payload.notification?.body || 'Yangi xabar!',
    icon: '/logoweb2.png',
    badge: '/logoweb3.png',
    vibrate: [100, 50, 100],
    data: payload.data,
    actions: [{ action: 'open', title: "Ko'rish" }]
  }
  self.registration.showNotification(notificationTitle, notificationOptions)
})
