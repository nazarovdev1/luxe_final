import React, { useEffect, useRef } from 'react';
import { Percent, ArrowDown } from 'lucide-react';
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

const BundleHero = ({ bundle, products, discountPercent }) => {
  const { t, language } = useLanguage();
  const heroRef = useRef(null);
  const bgRef = useRef(null);

  const currency = language === 'en' ? 'UZS' : "so'm";
  const localizedTitle = localize(bundle.title, language);
  const localizedDescription = localize(bundle.description, language);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const scrollY = window.scrollY;
      bgRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroImages = products.slice(0, 3).map(p => p.image).filter(Boolean);
  const originalPrice = bundle.originalPrice || 0;
  const discountedPrice = bundle.discountedPrice || originalPrice;
  const savings = originalPrice - discountedPrice;

  return (
    <section ref={heroRef} className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Parallax Background */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {heroImages.length > 0 ? (
          <div className="absolute inset-0 flex">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className="flex-1 relative overflow-hidden"
                style={{ transform: `scale(1.1)` }}
              >
                <img
                  src={img}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: 'brightness(0.55) saturate(0.9)',
                    objectPosition: 'center top',
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1208] to-[#0a0a0b]" />
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b]/80 via-transparent to-[#0a0a0b]/40 z-10" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 pt-32">
        <div className="max-w-3xl">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#d6b47c] to-[#c4985a] text-[#0a0a0b] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#d6b47c]/30">
              <Percent className="w-3.5 h-3.5" />
              {discountPercent}% {t('bundleDetail.discountBadge')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold uppercase tracking-widest">
              {t('bundleDetail.bundleTag')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.1] mb-4 tracking-tight">
            {localizedTitle}
          </h1>

          {/* Description */}
          {localizedDescription && (
            <p className="text-[#9aa3b2] text-lg leading-relaxed mb-8 max-w-xl">
              {localizedDescription}
            </p>
          )}

          {/* Price Block */}
          <div className="flex flex-wrap items-end gap-6 mb-10">
            <div>
              <p className="text-[#9aa3b2] text-sm mb-1">{t('bundleDetail.separateLabel')}</p>
              <p className="text-2xl text-white/40 line-through font-light">
                {formatPrice(originalPrice)} {currency}
              </p>
            </div>
            <div className="relative">
              <p className="text-[#d6b47c] text-xs font-bold uppercase tracking-widest mb-1">
                {t('bundleDetail.bundlePriceLabel')}
              </p>
              <p className="text-4xl sm:text-5xl text-white font-semibold tracking-tight">
                {formatPrice(discountedPrice)}
                <span className="text-xl text-[#9aa3b2] font-light ml-2">{currency}</span>
              </p>
            </div>
            {savings > 0 && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{t('bundleDetail.savingsLabel')}</p>
                <p className="text-emerald-300 text-xl font-bold">{formatPrice(savings)} {currency}</p>
              </div>
            )}
          </div>

          {/* Products count */}
          <div className="flex items-center gap-4">
            {products.slice(0, 4).map((p, i) => (
              <div
                key={p.id || i}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d6b47c]/40 shadow-lg"
                style={{ marginLeft: i > 0 ? '-16px' : 0, zIndex: 4 - i }}
              >
                <img src={p.image} alt={localize(p.name, language)} className="w-full h-full object-cover" />
              </div>
            ))}
            <span className="text-[#9aa3b2] text-sm ml-4">
              {products.length} {t('bundleDetail.itemsCountLabel')}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/30 text-xs tracking-widest uppercase">{t('bundleDetail.viewLabel')}</span>
        <ArrowDown className="w-5 h-5 text-[#d6b47c]" />
      </div>
    </section>
  );
};

export default BundleHero;
