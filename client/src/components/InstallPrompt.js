import React, { useEffect, useRef, useState } from 'react'
import { Share, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import './InstallPrompt.css'

const DISMISS_KEY = 'luxe_install_dismissed'
const EXIT_DURATION = 220

const BENEFITS = [
  'Yangi kelganlar birinchi bo‘lib',
  'Buyurtmalaringiz bir joyda',
  'To‘liq ekranda, brauzersiz',
]

// Gold motes that drift up through the photo: [left %, size px, rise seconds, delay seconds, sway px]
const DUST = [
  [12, 3, 7.5, 0.4, 10],
  [27, 2, 6.2, 2.6, -14],
  [41, 3, 8.4, 1.2, 8],
  [58, 2, 6.8, 3.8, -9],
  [71, 3, 7.9, 0.9, 12],
  [86, 2, 6.5, 2.1, -11],
  [94, 2, 8.8, 4.6, 7],
]

const InstallPrompt = ({ isInstallable, onInstall }) => {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef(null)
  const location = useLocation()

  const isMobilePath = location.pathname.startsWith('/mobile')
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true'
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true

    if (isStandalone && !isTestMode) return undefined
    if (!isInstallable && !isIOS && !isTestMode) return undefined

    const dismissedTime = localStorage.getItem(DISMISS_KEY)
    if (dismissedTime && !isTestMode) {
      const hoursSinceDismissed = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        setDismissed(true)
        return undefined
      }
    }

    // Keep the desktop maison's opening choreography unobstructed; mobile retains
    // the shorter install invitation because its experience is intentionally app-led.
    const revealDelay = isMobilePath ? 3000 : 12000
    const timer = window.setTimeout(() => setShow(true), revealDelay)
    return () => window.clearTimeout(timer)
  }, [isInstallable, isIOS, isMobilePath])

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  const closePrompt = (rememberDismissal = false) => {
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setShow(false)
      setIsClosing(false)
      if (rememberDismissal) {
        setDismissed(true)
        localStorage.setItem(DISMISS_KEY, Date.now().toString())
      }
    }, EXIT_DURATION)
  }

  // Desktop pointers nudge the photo a few pixels the opposite way, like a window onto a room.
  const handlePhotoPointer = (event) => {
    if (event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--px', ((event.clientX - box.left) / box.width - 0.5).toFixed(3))
    event.currentTarget.style.setProperty('--py', ((event.clientY - box.top) / box.height - 0.5).toFixed(3))
  }

  const resetPhotoPointer = (event) => {
    event.currentTarget.style.setProperty('--px', '0')
    event.currentTarget.style.setProperty('--py', '0')
  }

  const handleInstall = async () => {
    if (isIOS) return
    const accepted = await onInstall()
    if (accepted) closePrompt()
  }

  if (!show || dismissed) return null

  return (
    <div className={`luxx-install ${isMobilePath ? 'luxx-install--mobile' : ''} ${isClosing ? 'is-closing' : ''}`}>
      {isMobilePath && (
        <button
          type="button"
          className="luxx-install__scrim"
          onClick={() => closePrompt(true)}
          tabIndex={-1}
          aria-label="O‘rnatish oynasini yopish"
        />
      )}

      <aside className="luxx-install__sheet" role="dialog" aria-modal="false" aria-labelledby="luxx-install-title">
        <div
          className="luxx-install__photo"
          onPointerMove={handlePhotoPointer}
          onPointerLeave={resetPhotoPointer}
        >
          <div className="luxx-install__stage">
            <img src="/mobile.jpg" alt="" decoding="async" />
          </div>
          <span className="luxx-install__veil" aria-hidden="true" />
          <span className="luxx-install__sheen" aria-hidden="true" />
          <span className="luxx-install__frame" aria-hidden="true" />
          <span className="luxx-install__dust" aria-hidden="true">
            {DUST.map(([left, size, rise, delay, sway]) => (
              <i
                key={left}
                style={{ '--x': `${left}%`, '--s': `${size}px`, '--rise': `${rise}s`, '--delay': `${delay}s`, '--sway': `${sway}px` }}
              />
            ))}
          </span>
          <button
            type="button"
            className="luxx-install__close"
            onClick={() => closePrompt(true)}
            aria-label="O‘rnatish oynasini yopish"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="luxx-install__body">
          <p className="luxx-install__eyebrow">LUXX ilovasi</p>
          <h2 id="luxx-install-title"><span>Kolleksiya — </span><em>cho‘ntagingizda</em></h2>

          <ol className="luxx-install__list">
            {BENEFITS.map((benefit, index) => (
              <li key={benefit} style={{ '--i': index }}><span>{String(index + 1).padStart(2, '0')}</span>{benefit}</li>
            ))}
          </ol>

          {isIOS ? (
            <div className="luxx-install__ios">
              <p className="luxx-install__ios-title">Safari’da o‘rnatish</p>
              <ol>
                <li>
                  <span>1</span>
                  <p>Pastdagi <strong>Ulashish</strong> tugmasini bosing</p>
                  <Share size={18} strokeWidth={1.5} aria-hidden="true" />
                </li>
                <li>
                  <span>2</span>
                  <p><strong>Bosh ekranga qo‘shish</strong> bandini tanlang</p>
                </li>
              </ol>
            </div>
          ) : (
            <button type="button" className="luxx-install__action" onClick={handleInstall}>
              Bosh ekranga qo‘shish
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

export default InstallPrompt
