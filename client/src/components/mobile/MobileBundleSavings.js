import React, { useEffect, useRef, useState } from 'react';
import { TrendingDown, Tag, ShieldCheck, Truck, Gem } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const MobileBundleSavings = ({ originalPrice, discountedPrice, discountPercent, products }) => {
  const { t } = useLanguage();
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  const savings = originalPrice - discountedPrice;
  const funFact = savings >= 1000000
    ? { icon: '✈️', text: t('bundleDetail.savingsFact1m') }
    : savings >= 500000
      ? { icon: '🏨', text: t('bundleDetail.savingsFact500k') }
      : savings >= 200000
        ? { icon: '🍽️', text: t('bundleDetail.savingsFact200k') }
        : savings >= 100000
          ? { icon: '💆', text: t('bundleDetail.savingsFact100k') }
          : savings >= 50000
            ? { icon: '☕', text: t('bundleDetail.savingsFact50k', { count: Math.round(savings / 35000) }) }
            : { icon: '🎁', text: t('bundleDetail.savingsFactSmall') };
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
            {t('bundleDetail.savingsBadge')}
          </div>
          <span className="text-lg font-light text-white">{t('bundleDetail.savingsHeading1')} {t('bundleDetail.savingsHeading2')}?</span>
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
                  {formatPrice(product.price)} {t('common.sum')}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            {/* Original total */}
            <div className="flex items-center justify-between">
              <span className="text-[#9aa3b2] text-xs">{t('bundleDetail.savingsSeparateTotal')}</span>
              <span className="text-white/50 text-xs line-through">{formatPrice(originalPrice)} {t('common.sum')}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#d6b47c]" />
                <span className="text-[#d6b47c] text-xs">{t('bundleDetail.savingsBundleDiscount', { percent: discountPercent })}</span>
              </div>
              <span className="text-[#d6b47c] text-xs font-medium">-{formatPrice(savings)} {t('common.sum')}</span>
            </div>

            {/* Progress bar */}
            <div className="pt-1">
              <div className="flex justify-between text-[8px] text-[#9aa3b2] uppercase tracking-wider mb-1.5">
                <span>{t('bundleDetail.savingsPriceLeft')}</span>
                <span>{t('bundleDetail.savingsPriceRight')}</span>
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
                <p className="text-[9px] text-[#9aa3b2] uppercase tracking-wider mb-0.5">{t('bundleDetail.savingsFinalLabel')}</p>
                <p className="text-2xl font-semibold text-white tracking-tight">
                  {formatPrice(discountedPrice)}
                  <span className="text-sm text-[#9aa3b2] font-light ml-1">{t('common.sum')}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-[#9aa3b2] uppercase tracking-wider mb-0.5">{t('bundleDetail.savingsFinalValue')}</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatPrice(savings)} {t('common.sum')}
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
              <p className="text-[#9aa3b2] text-[9px] uppercase tracking-wider mb-0.5">{t('bundleDetail.savingsFunTitle')}</p>
              <p className="text-white/80 text-xs">{funFact.text}</p>
            </div>
          </div>
        )}

        {/* Trust badges - 3 column */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: '🛡️', label: t('bundleDetail.guarantee14'), sub: t('bundleDetail.guaranteeReturn') },
            { icon: '🚚', label: t('bundleDetail.guaranteeFree'), sub: t('bundleDetail.guaranteeShipping') },
            { icon: '✨', label: t('bundleDetail.guaranteeOriginal'), sub: t('bundleDetail.guaranteeBrands') },
          ].map((item, index) => {
            const Icon = [ShieldCheck, Truck, Gem][index];
            return (
              <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Icon className="w-4 h-4 mx-auto mb-1.5 text-[#d6b47c]" strokeWidth={1.7} />
                <p className="text-white font-semibold text-xs">{item.label}</p>
                <p className="text-[#9aa3b2] text-[9px]">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MobileBundleSavings;
