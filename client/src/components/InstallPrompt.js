import React, { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, Share2, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import './InstallPrompt.css'

const DISMISS_KEY = 'luxe_install_dismissed'
const EXIT_DURATION = 140

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

    const timer = window.setTimeout(() => setShow(true), 3000)
    return () => window.clearTimeout(timer)
  }, [isInstallable, isIOS])

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
    <aside
      className={`luxx-install ${isMobilePath ? 'luxx-install--mobile' : ''} ${isClosing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="luxx-install-title"
    >
      <div className="luxx-install__card">
        <div className="luxx-install__topline">
          <span>LUXX / PRIVATE ACCESS</span>
          <span aria-hidden="true">01</span>
        </div>

        <button
          type="button"
          className="luxx-install__close"
          onClick={() => closePrompt(true)}
          aria-label="O‘rnatish oynasini yopish"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <div className="luxx-install__body">
          <div className="luxx-install__monogram" aria-hidden="true"><span>L</span></div>

          <div className="luxx-install__copy">
            <p className="luxx-install__eyebrow">Mobil atelier</p>
            <h2 id="luxx-install-title">LUXX har doim yoningizda</h2>

            {isIOS ? (
              <div className="luxx-install__ios">
                <p>Safari’da <strong>Ulashish</strong> tugmasini, so‘ng <strong>Bosh ekranga qo‘shish</strong> bandini tanlang.</p>
                <div className="luxx-install__steps" aria-label="O‘rnatish bosqichlari">
                  <span><b>01</b><Share2 size={15} />Ulashish</span>
                  <i aria-hidden="true" />
                  <span><b>02</b><ArrowDownToLine size={15} />Bosh ekranga</span>
                </div>
              </div>
            ) : (
              <>
                <p className="luxx-install__description">
                  Kolleksiyalar, buyurtmalar va maxsus takliflarga bir tegishda kiring.
                </p>
                <button type="button" className="luxx-install__action" onClick={handleInstall}>
                  <span>Bosh ekranga o‘rnatish</span>
                  <ArrowDownToLine size={17} strokeWidth={1.6} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default InstallPrompt
