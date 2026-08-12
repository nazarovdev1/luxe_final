import { useState, useEffect } from 'react'

// Changing this query forces browsers still controlled by an older worker to
// fetch a fresh worker script instead of receiving its cached `/sw.js` copy.
const SERVICE_WORKER_URL = '/sw.js?v=2026-08-12-3'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [swRegistration, setSwRegistration] = useState(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')

    if (isStandalone) {
      setIsInstalled(true)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    let handleControllerChange

    if ('serviceWorker' in navigator) {
      handleControllerChange = () => {
        // A newly activated worker has just cleared the old app-shell cache.
        // Reload once so the current tab also receives the matching build.
        window.location.reload()
      }

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      navigator.serviceWorker
        .register(SERVICE_WORKER_URL)
        .then((registration) => {
          setSwRegistration(registration)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          })
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (handleControllerChange) {
        navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setIsInstallable(false)

    return outcome === 'accepted'
  }

  const updateApp = () => {
    if (!swRegistration) return

    if (swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    window.location.reload()
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    updateAvailable,
    updateApp,
    swRegistration
  }
}
