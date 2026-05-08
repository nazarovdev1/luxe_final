import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Loader2, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * FloatingCTA — Sticky bottom bar that appears when the main CTA scrolls out of viewport
 * Uses IntersectionObserver for visibility detection
 */
export default function FloatingCTA({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart = false,
  isFavorite = false,
  onToggleWishlist,
  ctaRef, // ref to the main Add to Cart button to observe
}) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!ctaRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // CTA is visible — hide floating bar with delay
          setIsVisible(false);
          setTimeout(() => setShouldRender(false), 400);
        } else {
          // CTA is out of view — show floating bar
          setShouldRender(true);
          requestAnimationFrame(() => setIsVisible(true));
        }
      },
      { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
    );

    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [ctaRef]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-400 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transitionDuration: '400ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="backdrop-blur-xl bg-[#0a0a0b]/92 border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Product info */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-medium text-[#f5f5f3] truncate">{product.name}</p>
              <p className="text-sm font-bold text-[#c9a96e]">{formatPrice(product.price)} {t('common.sum')}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center rounded-lg bg-[#1c1c1f] border border-white/5 p-0.5">
              <button
                onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-[#f5f5f3]">{quantity}</span>
              <button
                onClick={() => onQuantityChange?.(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Total */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-[#6b6b6e]">Jami</p>
              <p className="text-sm font-bold text-[#f5f5f3]">
                {formatPrice((Number(product.price) || 0) * quantity)} {t('common.sum')}
              </p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#c9a96e] px-6 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#0a0a0b] hover:bg-[#d4b87a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {isAddingToCart ? "..." : "Savatga"}
            </button>

            {/* Wishlist */}
            <button
              onClick={onToggleWishlist}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-[#c9a96e]/10 border-[#c9a96e]/30 text-[#c9a96e]'
                  : 'bg-[#1c1c1f] border-white/5 text-[#8a8a8d] hover:text-[#f5f5f3]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#c9a96e]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
