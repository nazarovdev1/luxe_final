import React, { useEffect, useRef, useState } from 'react';
import { TrendingDown, Coffee, Tag } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Fun comparisons for savings
const getSavingsFunFact = (savings) => {
  if (savings >= 1000000) return { icon: '✈️', text: `Bu bir shahar ichidagi samolyot chiptasiga teng!` };
  if (savings >= 500000) return { icon: '🏨', text: `Bu premium mehmonxonada 1 kunlik xonani to'lash uchun yetadi!` };
  if (savings >= 200000) return { icon: '🍽️', text: `Bu oilangiz bilan restoranda kechki ovqat uchun yetadi!` };
  if (savings >= 100000) return { icon: '💆', text: `Bu premium SPA seans uchun yetarli!` };
  if (savings >= 50000) return { icon: '☕', text: `Bu taxminan ${Math.round(savings / 35000)} dona kapuchino narxiga teng!` };
  return { icon: '🎁', text: `Bu kichik bir sovg'a uchun yetadi!` };
};

const BundleSavingsBreakdown = ({ originalPrice, discountedPrice, discountPercent, products }) => {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  const savings = originalPrice - discountedPrice;
  const funFact = getSavingsFunFact(savings);

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

  const progressWidth = Math.round((discountedPrice / originalPrice) * 100);

  return (
    <section ref={sectionRef} className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingDown className="w-3.5 h-3.5" />
            Tejamkorlik
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            Qancha <span className="text-[#d6b47c]">tejaysiz</span>?
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-8 lg:p-12">
          {/* Product breakdown */}
          <div className="space-y-4 mb-10">
            {products.map((product, i) => (
              <div key={product.id || i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">{product.name}</p>
                </div>
                <p className="text-white text-sm font-medium shrink-0">
                  {formatPrice(product.price)} so'm
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-8 space-y-5">
            {/* Original total */}
            <div className="flex items-center justify-between">
              <span className="text-[#9aa3b2] text-sm">Alohida narx (jami)</span>
              <span className="text-white/50 line-through text-sm">{formatPrice(originalPrice)} so'm</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#d6b47c]" />
                <span className="text-[#d6b47c] text-sm">To'plam chegirmasi ({discountPercent}%)</span>
              </div>
              <span className="text-[#d6b47c] text-sm font-medium">-{formatPrice(savings)} so'm</span>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="flex justify-between text-[10px] text-[#9aa3b2] uppercase tracking-wider mb-2">
                <span>To'plam narxi</span>
                <span>Alohida narx</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#d6b47c] transition-all duration-1500 ease-out"
                  style={{ width: animated ? `${progressWidth}%` : '0%' }}
                />
              </div>
              <div
                className="absolute -top-0.5 transition-all duration-1500"
                style={{ left: `${animated ? progressWidth : 0}%` }}
              >
              </div>
            </div>

            {/* Final price */}
            <div className="flex items-end justify-between pt-4 border-t border-white/[0.06]">
              <div>
                <p className="text-[#9aa3b2] text-xs uppercase tracking-wider mb-1">To'plam narxi</p>
                <p className="text-4xl font-semibold text-white tracking-tight">
                  {formatPrice(discountedPrice)}
                  <span className="text-base text-[#9aa3b2] font-light ml-2">so'm</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9aa3b2] uppercase tracking-wider mb-1">Tejash</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatPrice(savings)} so'm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        {savings > 0 && (
          <div className="mt-6 flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <span className="text-3xl shrink-0">{funFact.icon}</span>
            <div>
              <p className="text-[#9aa3b2] text-xs uppercase tracking-wider mb-0.5">Qiziq fakt</p>
              <p className="text-white/80 text-sm">{funFact.text}</p>
            </div>
          </div>
        )}

        {/* Guarantees */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { icon: '🛡️', label: '14 kun', sub: 'qaytarish kafolati' },
            { icon: '🚚', label: 'Bepul', sub: 'yetkazib berish' },
            { icon: '✨', label: 'Original', sub: 'brendlar' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-[#9aa3b2] text-xs">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BundleSavingsBreakdown;
