import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, ChevronUp } from 'lucide-react';
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

const BundleStickyBar = ({
  bundle,
  discountedPrice,
  originalPrice,
  discountPercent,
  products,
  isAdding,
  onAddToCart,
  heroRef,
  canAddToCart = true,
}) => {
  const { t, language } = useLanguage();
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const currency = language === 'en' ? 'UZS' : "so'm";
  const localizedTitle = localize(bundle.title, language);

  useEffect(() => {
    const handleScroll = () => {
      // The dock should only join the page after the visitor has started
      // exploring the editorial hero — never on the first viewport.
      setIsScrolledDown(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroRef]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      className={`bundle-sticky-dock fixed bottom-4 left-0 right-0 z-[9000] ${isScrolledDown ? 'bundle-sticky-dock--visible' : ''}`}
      aria-hidden={!isScrolledDown}
    >
      {/* Glassmorphism bar */}
      <div className="bundle-sticky-dock-inner bg-[#0a0a0b]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_18px_55px_rgba(0,0,0,0.48)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Product thumbnails (desktop) */}
            <div className="hidden sm:flex -space-x-3 shrink-0">
              {products.slice(0, 3).map((p, i) => (
                <div
                  key={p.id || i}
                  className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#0a0a0b]"
                  style={{ zIndex: 3 - i }}
                >
                  <img src={p.image} alt={localize(p.name, language)} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Bundle name & price */}
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-xs truncate hidden sm:block">{localizedTitle}</p>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
                  {formatPrice(discountedPrice)} {currency}
                </span>
                <span className="text-white/30 text-sm line-through hidden sm:block">
                  {formatPrice(originalPrice)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                  -{discountPercent}%
                </span>
              </div>
            </div>

            {/* Scroll to top (mobile) */}
            {isScrolledDown && (
              <button
                onClick={scrollToTop}
                className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}

            {/* CTA Button */}
            <button
              onClick={onAddToCart}
              disabled={isAdding}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#d6b47c] to-[#c4985a] text-[#0a0a0b] font-bold text-sm transition-all hover:shadow-xl hover:shadow-[#d6b47c]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shrink-0"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:block">{t('bundleDetail.adding')}</span>
                </>
              ) : !canAddToCart ? (
                <span>{t('bundleDetail.stickySelectVariant')}</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('bundleDetail.stickyAddToCart')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleStickyBar;
