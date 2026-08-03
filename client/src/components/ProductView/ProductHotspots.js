import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';

/**
 * ProductHotspots — Interactive floating pins over the main product photo
 * Gives a 5-second WOW factor by letting users explore garment details directly on the photo.
 */
export default function ProductHotspots({ activeIndex = 0 }) {
  const [activePin, setActivePin] = useState(null);

  // Default hotspots tailored to luxury garments
  const hotspots = [
    {
      id: 'pin-1',
      x: 48, // % from left
      y: 28, // % from top
      title: 'Keng Yoqali Bichim',
      desc: 'Italyancha klassik siluet va elegant keng yoqa uslubi',
      badge: 'Italian Cut',
    },
    {
      id: 'pin-2',
      x: 62,
      y: 52,
      title: 'Oltin Rangli Tugmalar',
      desc: 'Qo\'lda ishlov berilgan va mustahkamlangan premium metall tugmalar',
      badge: 'Hand-Crafted',
    },
    {
      id: 'pin-3',
      x: 35,
      y: 65,
      title: 'Eksklyuziv Bordo Mato',
      desc: 'Silliq, qat-qat bo\'lmaydigan va mayin kashmir aralashmali mato',
      badge: 'Luxury Fabric',
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {hotspots.map((pin) => {
        const isOpen = activePin === pin.id;
        return (
          <div
            key={pin.id}
            className="absolute pointer-events-auto transition-transform duration-300"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {/* Pulsing Hotspot Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePin(isOpen ? null : pin.id);
              }}
              onMouseEnter={() => setActivePin(pin.id)}
              className="relative group flex items-center justify-center focus:outline-none"
              aria-label={pin.title}
            >
              {/* Outer pulsing halo */}
              <span className="absolute h-8 w-8 rounded-full bg-[#c9a96e]/40 animate-ping" />
              {/* Middle glass ring */}
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black/70 border border-[#c9a96e] text-[#c9a96e] shadow-[0_0_15px_rgba(201,169,110,0.6)] backdrop-blur-md transition-all group-hover:scale-125 group-hover:bg-[#c9a96e] group-hover:text-black">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Floating Glass Tooltip Box */}
            {isOpen && (
              <div
                className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-64 p-4 rounded-2xl bg-black/85 border border-[#c9a96e]/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a96e] bg-[#c9a96e]/10 px-2.5 py-0.5 rounded-full border border-[#c9a96e]/20">
                    {pin.badge}
                  </span>
                  <button
                    onClick={() => setActivePin(null)}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{pin.title}</h4>
                <p className="text-[11px] text-[#8a8a8d] leading-relaxed">{pin.desc}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
