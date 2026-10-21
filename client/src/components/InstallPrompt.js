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
        <div className="luxx-install__photo">
          <img src="/mobile.jpg" alt="" decoding="async" />
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
          <h2 id="luxx-install-title">Kolleksiya — <em>cho‘ntagingizda</em></h2>

          <ol className="luxx-install__list">
            {BENEFITS.map((benefit, index) => (
              <li key={benefit}><span>{String(index + 1).padStart(2, '0')}</span>{benefit}</li>
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
