import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Clock, Shield } from 'lucide-react';

// Randomize for realism but keep stable during session
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const BundleSocialProof = () => {
  const [viewers, setViewers] = useState(rand(24, 68));
  const [buyers, setBuyers] = useState(rand(7, 23));

  // Slowly fluctuate viewer count for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = rand(-3, 4);
        return Math.max(12, Math.min(99, prev + delta));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Live viewers */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/15">
            <div className="relative shrink-0">
              <Eye className="w-5 h-5 text-red-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{viewers}</p>
              <p className="text-[#9aa3b2] text-xs mt-0.5">kishi hozir ko'rmoqda</p>
            </div>
          </div>

          {/* Recent buyers */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-white font-bold text-lg leading-none">{buyers}</p>
              <p className="text-[#9aa3b2] text-xs mt-0.5">kishi bugun sotib oldi</p>
            </div>
          </div>

          {/* Limited time */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#d6b47c]/5 border border-[#d6b47c]/15">
            <Clock className="w-5 h-5 text-[#d6b47c] shrink-0" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Chegirma cheklangan</p>
              <p className="text-[#9aa3b2] text-xs mt-0.5">vaqt uchun amal qiladi</p>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
            <Shield className="w-5 h-5 text-white/50 shrink-0" />
            <div>
              <p className="text-white font-bold text-sm leading-tight">14 kun kafolat</p>
              <p className="text-[#9aa3b2] text-xs mt-0.5">qaytarish imkoniyati</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundleSocialProof;
