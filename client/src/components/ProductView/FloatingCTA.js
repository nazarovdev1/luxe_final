import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Loader2, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (item) => {
  if (!item) return '';
  if (Array.isArray(item.images) && item.images.length > 0) {
    const img = item.images[0];
    return typeof img === 'object' ? img.url : img;
  }
  return item.image || '';
};

/**
 * FloatingCTA — Luxury Sticky bottom bar that appears when main CTA scrolls out of viewport
 */
export default function FloatingCTA({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart = false,
  isFavorite = false,
  onToggleWishlist,
  ctaRef,
}) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!ctaRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(false);
          setTimeout(() => setShouldRender(false), 300);
        } else {
          setShouldRender(true);
          requestAnimationFrame(() => setIsVisible(true));
        }
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [ctaRef]);

  if (!shouldRender || !product) return null;

  const thumbnail = getProductImage(product);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="backdrop-blur-2xl bg-[#0a0a0b]/85 border-t border-[#c9a96e]/20 shadow-[0_-12px_40px_rgba(0,0,0,0.7)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3 sm:py-3.5">

            {/* Left: Product Thumbnail & Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {thumbnail && (
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#141416] hidden xs:block">
                  <img src={thumbnail} alt={product.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#c9a96e]">
                    {formatPrice(product.price)} {t('common.sum')}
                  </p>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] text-[#6b6b6e] line-through hidden sm:inline">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Quantity selector */}
            <div className="flex items-center rounded-xl bg-[#1c1c1f] border border-white/10 p-0.5">
              <button
                onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-[#8a8a8d] hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Kamaytirish"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold text-white">{quantity}</span>
              <button
                onClick={() => onQuantityChange?.(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#8a8a8d] hover:text-white transition-colors rounded-lg hover:bg-white/10"
                aria-label="Oshirish"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right: Add to Cart & Wishlist */}
            <div className="flex items-center gap-2">
              <button
                onClick={onAddToCart}
                disabled={isAddingToCart}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] px-6 py-2.5 sm:py-3 text-xs font-black uppercase tracking-[0.15em] text-black shadow-[0_6px_20px_rgba(201,169,110,0.3)] hover:shadow-[0_8px_25px_rgba(201,169,110,0.45)] active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <ShoppingCart className="h-4 w-4 text-black" />
                )}
                <span className="hidden sm:inline">{isAddingToCart ? "Qo'shilmoqda..." : "Savatga Qo'shish"}</span>
                <span className="sm:hidden">{isAddingToCart ? "..." : "Savatga"}</span>
              </button>

              <button
                onClick={onToggleWishlist}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-[#c9a96e]/20 border-[#c9a96e]/40 text-[#c9a96e]'
                    : 'bg-[#1c1c1f] border-white/10 text-[#8a8a8d] hover:text-white'
                }`}
                title="Saralanganlarga"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#c9a96e]' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
