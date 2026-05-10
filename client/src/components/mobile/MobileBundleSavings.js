import React, { useEffect, useRef, useState } from 'react';
import { TrendingDown, Tag } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getSavingsFunFact = (savings) => {
  if (savings >= 1000000) return { icon: '✈️', text: `Bu bir shahar ichidagi samolyot chiptasiga teng!` };
  if (savings >= 500000) return { icon: '🏨', text: `Bu premium mehmonxonada 1 kunlik xonani to'lash uchun yetadi!` };
  if (savings >= 200000) return { icon: '🍽️', text: `Bu oilangiz bilan restoranda kechki ovqat uchun yetadi!` };
  if (savings >= 100000) return { icon: '💆', text: `Bu premium SPA seans uchun yetarli!` };
  if (savings >= 50000) return { icon: '☕', text: `Bu taxminan ${Math.round(savings / 35000)} dona kapuchino narxiga teng!` };
  return { icon: '🎁', text: `Bu kichik bir sovg'a uchun yetadi!` };
};

const MobileBundleSavings = ({ originalPrice, discountedPrice, discountPercent, products }) => {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  const savings = originalPrice - discountedPrice;
  const funFact = getSavingsFunFact(savings);
  const progressWidth = Math.round((discountedPrice / originalPrice) * 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-10">
      <div className="px-4">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <TrendingDown className="w-3 h-3" />
            Tejamkorlik
          </div>
          <span className="text-lg font-light text-white">Qancha tejaysiz?</span>
        </div>

        {/* Compact savings card */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-5">
          {/* Product breakdown (compact) */}
          <div className="space-y-2 mb-5">
            {products.map((product, i) => (
              <div key={product.id || i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs truncate">{product.name}</p>
                </div>
                <p className="text-white text-xs font-medium shrink-0">
                  {formatPrice(product.price)} so'm
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            {/* Original total */}
            <div className="flex items-center justify-between">
              <span className="text-[#9aa3b2] text-xs">Alohida narx</span>
              <span className="text-white/50 text-xs line-through">{formatPrice(originalPrice)} so'm</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#d6b47c]" />
                <span className="text-[#d6b47c] text-xs">Chegirma ({discountPercent}%)</span>
              </div>
              <span className="text-[#d6b47c] text-xs font-medium">-{formatPrice(savings)} so'm</span>
            </div>

            {/* Progress bar */}
            <div className="pt-1">
              <div className="flex justify-between text-[8px] text-[#9aa3b2] uppercase tracking-wider mb-1.5">
                <span>To'plam narxi</span>
                <span>Alohida narx</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#d6b47c] transition-all duration-1500 ease-out"
                  style={{ width: animated ? `${progressWidth}%` : '0%' }}
                />
              </div>
            </div>

            {/* Final price */}
            <div className="flex items-end justify-between pt-3 border-t border-white/[0.06]">
              <div>
                <p className="text-[9px] text-[#9aa3b2] uppercase tracking-wider mb-0.5">To'plam narxi</p>
                <p className="text-2xl font-semibold text-white tracking-tight">
                  {formatPrice(discountedPrice)}
                  <span className="text-sm text-[#9aa3b2] font-light ml-1">so'm</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-[#9aa3b2] uppercase tracking-wider mb-0.5">Tejash</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatPrice(savings)} so'm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        {savings > 0 && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <span className="text-2xl shrink-0">{funFact.icon}</span>
            <div>
              <p className="text-[#9aa3b2] text-[9px] uppercase tracking-wider mb-0.5">Qiziq fakt</p>
              <p className="text-white/80 text-xs">{funFact.text}</p>
            </div>
          </div>
        )}

        {/* Trust badges - 3 column */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: '🛡️', label: '14 kun', sub: 'qaytarish' },
            { icon: '🚚', label: 'Bepul', sub: 'yetkazib berish' },
            { icon: '✨', label: 'Original', sub: 'brendlar' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-xl mb-0.5">{item.icon}</div>
              <p className="text-white font-semibold text-xs">{item.label}</p>
              <p className="text-[#9aa3b2] text-[9px]">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileBundleSavings;