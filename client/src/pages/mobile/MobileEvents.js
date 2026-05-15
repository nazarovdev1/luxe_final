import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Crown, Gift, Leaf, MessageSquare, Play, Radio, Swords, Compass } from 'lucide-react';
import { eventNavItems, resolveNavLabel } from '../../config/navigation';
import { useLanguage } from '../../contexts/LanguageContext';

const ICONS = {
  Camera,
  Crown,
  Gift,
  Leaf,
  MessageSquare,
  Play,
  Radio,
  Swords,
};

const MobileEvents = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#060a14] px-4 pb-28 pt-5 text-white">
      <section className="rounded-[28px] border border-white/10 bg-[#0f1420]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b47c]/25 bg-[#d6b47c]/10 px-3 py-1.5 text-[#d6b47c]">
          <Compass className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em]">Explore</span>
        </div>
        <h1 className="mt-4 text-3xl font-light leading-tight text-[#f6f1e8]">
          Platform tajribalari
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#8e98a8]">
          Desktopdagi barcha events yo'nalishlari mobile uchun tezkor, touch-first hubga jamlandi.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {eventNavItems.map((item) => {
          const Icon = ICONS[item.icon] || Sparkles;
          return (
            <Link
              key={item.id}
              to={item.mobilePath}
              className="min-h-[150px] rounded-[26px] border p-4 transition-transform active:scale-[0.98]"
              style={{
                borderColor: `${item.color}26`,
                background: `linear-gradient(145deg, ${item.color}18, rgba(255,255,255,0.035))`,
              }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                style={{ color: item.color, borderColor: `${item.color}25`, background: `${item.color}14` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-sm font-bold text-[#f6f1e8]">{resolveNavLabel(item, t)}</h2>
              <p className="mt-1 text-xs leading-5 text-[#8e98a8]">{item.subtitle}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default MobileEvents;
