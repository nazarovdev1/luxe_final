import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'

const OfflineIndicator = ({ isOnline, updateAvailable, onUpdate }) => {
  const [showOffline, setShowOffline] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setWasOffline(true)
    } else if (wasOffline) {
      const timer = setTimeout(() => {
        setShowOffline(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  return (
    <>
      {showOffline && (
        <div className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-white text-sm">
            {isOnline ? (
              <>
                <Wifi size={14} />
                <span>Internet aloqa tiklandi</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Ofline rejim - ba'zi ma'lumotlar eski bo'lishi mumkin</span>
              </>
            )}
          </div>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed bottom-20 right-4 z-[90] animate-bounce-subtle">
          <button
            onClick={onUpdate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all text-sm font-medium"
          >
            <RefreshCw size={14} />
            Yangilash mavjud
          </button>

          <style>{`
            @keyframes bounce-subtle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            .animate-bounce-subtle {
              animation: bounce-subtle 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default OfflineIndicator