import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone, Share } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const InstallPrompt = ({ isInstallable, onInstall }) => {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const location = useLocation()

  const isMobilePath = location.pathname.startsWith('/mobile')
  
  // iOS aniqlash
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  useEffect(() => {
    const isTestMode = new URLSearchParams(window.location.search).get('test') === 'true'
    
    // Ilova allaqachon o'rnatilgan bo'lsa ko'rsatma (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (isStandalone && !isTestMode) return

    // Oyna chiqishi uchun shartlar: (Installable bo'lsa OR iOS bo'lsa) va test rejimi hisobga olinsa
    if (!isInstallable && !isIOS && !isTestMode) return

    const dismissedTime = localStorage.getItem('luxe_install_dismissed')
    if (dismissedTime && !isTestMode) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) {
        setDismissed(true)
        return
      }
    }

    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [isInstallable, isIOS])

  const handleInstall = async () => {
    if (isIOS) return // iOS'da tugma ishlamaydi, faqat ko'rsatma
    const accepted = await onInstall()
    if (accepted) {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('luxe_install_dismissed', Date.now().toString())
  }

  if (!show || dismissed) return null

  return (
    <div className={`fixed ${isMobilePath ? 'bottom-24' : 'bottom-4'} left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] animate-slide-up`}>
      <div className="bg-[#111111]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-purple-900/40 border border-purple-500/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors p-1"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/10">
            <Smartphone size={28} className="text-purple-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base mb-1 tracking-tight">
              LUXE ilovasini o'rnating
            </h3>
            
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-gray-400 text-[13px] leading-relaxed">
                  iPhone'ga o'rnatish uchun: pastdagi <span className="inline-flex items-center bg-white/10 px-1.5 py-0.5 rounded text-white"><Share size={12} className="mr-1" /> "Поделиться" (Ulashish)</span> tugmasini bosing va keyin <span className="text-white font-semibold">"На экран «Домой»" (Bosh ekranga qo'shish)</span>ni tanlang.
                </p>
                <div className="h-0.5 w-full bg-purple-500/10 rounded-full" />
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-[13px] leading-relaxed mb-4">
                  Tezkor kirish va oflayn rejim uchun ilovani bosh ekranga qo'shing
                </p>

                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all active:scale-95 w-full justify-center shadow-lg shadow-white/5"
                >
                  <Download size={18} />
                  O'rnatish
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(120%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}

export default InstallPrompt