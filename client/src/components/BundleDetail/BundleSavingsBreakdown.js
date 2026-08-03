import React, { useEffect, useRef, useState } from 'react';
import { TrendingDown, Coffee, Tag, ShieldCheck, Truck, Gem } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const localize = (value, lang) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value[lang]) return value[lang];
    if (value.uz) return value.uz;
    if (value.ru) return value.ru;
    if (value.en) return value.en;
  }
  return '';
};

// Fun comparisons for savings
const getSavingsFunFact = (savings, t) => {
  if (savings >= 1000000) return { icon: '✈️', text: t('bundleDetail.savingsFact1m') };
  if (savings >= 500000) return { icon: '🏨', text: t('bundleDetail.savingsFact500k') };
  if (savings >= 200000) return { icon: '🍽️', text: t('bundleDetail.savingsFact200k') };
  if (savings >= 100000) return { icon: '💆', text: t('bundleDetail.savingsFact100k') };
  if (savings >= 50000) return { icon: '☕', text: t('bundleDetail.savingsFact50k', { count: Math.round(savings / 35000) }) };
  return { icon: '🎁', text: t('bundleDetail.savingsFactSmall') };
};

const BundleSavingsBreakdown = ({ originalPrice, discountedPrice, discountPercent, products }) => {
  const { t, language } = useLanguage();
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef(null);

  const savings = originalPrice - discountedPrice;
  const funFact = getSavingsFunFact(savings, t);
  const currency = language === 'en' ? 'UZS' : "so'm";
  const localizedProducts = products.map((p) => ({ ...p, name: localize(p.name, language) }));

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
    <section ref={sectionRef} className="bundle-savings-section py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingDown className="w-3.5 h-3.5" />
            {t('bundleDetail.savingsBadge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            {t('bundleDetail.savingsHeading1')} <span className="text-[#d6b47c]">{t('bundleDetail.savingsHeading2')}</span>?
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="bundle-savings-card overflow-hidden p-8 lg:p-12">
          {/* Product breakdown */}
          <div className="space-y-4 mb-10">
            {localizedProducts.map((product, i) => (
              <div key={product.id || i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">{product.name}</p>
                </div>
                <p className="text-white text-sm font-medium shrink-0">
                  {formatPrice(product.price)} {currency}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-8 space-y-5">
            {/* Original total */}
            <div className="flex items-center justify-between">
              <span className="text-[#9aa3b2] text-sm">{t('bundleDetail.savingsSeparateTotal')}</span>
              <span className="text-white/50 line-through text-sm">{formatPrice(originalPrice)} {currency}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#d6b47c]" />
                <span className="text-[#d6b47c] text-sm">{t('bundleDetail.savingsBundleDiscount', { percent: discountPercent })}</span>
              </div>
              <span className="text-[#d6b47c] text-sm font-medium">-{formatPrice(savings)} {currency}</span>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="flex justify-between text-[10px] text-[#9aa3b2] uppercase tracking-wider mb-2">
                <span>{t('bundleDetail.savingsPriceLeft')}</span>
                <span>{t('bundleDetail.savingsPriceRight')}</span>
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
                <p className="text-[#9aa3b2] text-xs uppercase tracking-wider mb-1">{t('bundleDetail.savingsFinalLabel')}</p>
                <p className="text-4xl font-semibold text-white tracking-tight">
                  {formatPrice(discountedPrice)}
                  <span className="text-base text-[#9aa3b2] font-light ml-2">{currency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9aa3b2] uppercase tracking-wider mb-1">{t('bundleDetail.savingsFinalValue')}</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatPrice(savings)} {currency}
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
              <p className="text-[#9aa3b2] text-xs uppercase tracking-wider mb-0.5">{t('bundleDetail.savingsFunTitle')}</p>
              <p className="text-white/80 text-sm">{funFact.text}</p>
            </div>
          </div>
        )}

        {/* Guarantees */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { icon: '🛡️', label: t('bundleDetail.guarantee14'), sub: t('bundleDetail.guaranteeReturn') },
            { icon: '🚚', label: t('bundleDetail.guaranteeFree'), sub: t('bundleDetail.guaranteeShipping') },
            { icon: '✨', label: t('bundleDetail.guaranteeOriginal'), sub: t('bundleDetail.guaranteeBrands') },
          ].map((item, index) => {
            const Icon = [ShieldCheck, Truck, Gem][index];
            return (
              <div key={item.label} className="text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <Icon className="w-5 h-5 mx-auto mb-2 text-[#d6b47c]" strokeWidth={1.7} />
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-[#9aa3b2] text-xs">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BundleSavingsBreakdown;
