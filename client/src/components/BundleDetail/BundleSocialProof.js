import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Clock3, ShieldCheck } from 'lucide-react';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const MetricItem = ({ icon: Icon, value, label, tone = 'gold', live = false }) => {
  const tones = {
    rose: {
      icon: 'text-rose-300',
      ring: 'border-rose-300/20 bg-rose-300/[0.08]',
      glow: 'from-rose-300/20',
      dot: 'bg-rose-300',
    },
    emerald: {
      icon: 'text-emerald-300',
      ring: 'border-emerald-300/20 bg-emerald-300/[0.08]',
      glow: 'from-emerald-300/20',
      dot: 'bg-emerald-300',
    },
    gold: {
      icon: 'text-[#d6b47c]',
      ring: 'border-[#d6b47c]/25 bg-[#d6b47c]/10',
      glow: 'from-[#d6b47c]/18',
      dot: 'bg-[#d6b47c]',
    },
    silver: {
      icon: 'text-slate-200/80',
      ring: 'border-white/12 bg-white/[0.06]',
      glow: 'from-white/10',
      dot: 'bg-slate-300',
    },
  };
  const currentTone = tones[tone] || tones.gold;

  return (
    <div className="group relative min-h-[88px] overflow-hidden px-5 py-5 transition-colors duration-300 hover:bg-white/[0.025] sm:px-6">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${currentTone.glow} via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="flex h-full items-center gap-4">
        
          <Icon className={`h-5 w-5 ${currentTone.icon}`} strokeWidth={1.9} />
          {live && (
            <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${currentTone.dot} shadow-[0_0_14px_currentColor]`}>
              <span className={`absolute inset-0 rounded-full ${currentTone.dot} animate-ping opacity-60`} />
            </span>
          )}


        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d8798]">
            {label}
          </p>
          <p className="mt-1.5 truncate text-[15px] font-semibold leading-tight text-[#f5f5f3] sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const BundleSocialProof = () => {
  const [viewers, setViewers] = useState(rand(24, 68));
  const [buyers, setBuyers] = useState(rand(7, 23));

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const delta = rand(-3, 4);
        return Math.max(12, Math.min(99, prev + delta));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      icon: Eye,
      value: `${viewers} kishi`,
      label: "Hozir ko'rmoqda",
      tone: 'rose',
      live: true,
    },
    {
      icon: ShoppingBag,
      value: `${buyers} ta xarid`,
      label: 'Bugungi faollik',
      tone: 'emerald',
    },
    {
      icon: Clock3,
      value: 'Chegirma cheklangan',
      label: 'Vaqtinchalik taklif',
      tone: 'gold',
    },
    {
      icon: ShieldCheck,
      value: '14 kun kafolat',
      label: 'Qaytarish imkoniyati',
      tone: 'silver',
    },
  ];

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#101116]/80 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b47c]/45 to-transparent" />
          <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#d6b47c]/[0.045] blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-0 h-36 w-36 rounded-full bg-emerald-300/[0.035] blur-3xl" />

          <div className="grid grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricItem key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundleSocialProof;
