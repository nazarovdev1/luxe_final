const CACHE_NAME = 'luxe-v5'
const STATIC_CACHE = 'luxe-static-v5'
const API_CACHE = 'luxe-api-v5'
const IMAGE_CACHE = 'luxe-images-v5'

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
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
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
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/')
          })
        })
    )
    return
  }

  if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 365 * 24 * 60 * 60 * 1000))
    return
  }

  event.respondWith(staleWhileRevalidate(request, CACHE_NAME))
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

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
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