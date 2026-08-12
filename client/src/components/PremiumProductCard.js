import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BarChart3, Gem, Heart, Eye, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const PremiumProductCard = ({
  product,
  onQuickView,
  onCompare,
  isCompareSelected,
  priority = false
}) => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const getImageUrl = (p) => {
    if (!p) return '/placeholder.jpg';
    if (p.image) return p.image;
    if (Array.isArray(p.images) && p.images.length > 0) {
      const first = p.images[0];
      return typeof first === 'object' ? (first.url || '/placeholder.jpg') : first;
    }
    return '/placeholder.jpg';
  };

  const imageUrl = getImageUrl(product);
  const isNew = product.badge?.toUpperCase() === 'NEW';
  const isBestseller = product.badge?.toUpperCase() === 'BESTSELLER';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article
      className="group relative z-0 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#121215] border border-white/[0.08] group-hover:border-[#d6b47c]/40 transition-all duration-500 shadow-[0_12px_32px_rgba(0,0,0,0.5)] group-hover:shadow-[0_22px_45px_rgba(214,180,124,0.18)]">
        {/* Card Main Clickable Image Link */}
        <Link
          to={`/product/${product.id}`}
          className="block relative aspect-[3/4] overflow-hidden bg-[#161619]"
        >
          <img
            src={imageUrl}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover object-top transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isHovered ? 'scale-108' : 'scale-100'
            } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {!imgLoaded && (
            <div className="absolute inset-0 bg-[#18181c] animate-pulse" />
          )}

          {/* Luxury Ambient Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/85 via-transparent to-[#09090b]/15 opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

          {/* Badges: BESTSELLER or NEW */}
          {(isNew || isBestseller) && (
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                isBestseller
                  ? 'bg-gradient-to-r from-[#d6b47c] via-[#f4efe6] to-[#c59b5f] text-black shadow-[0_0_18px_rgba(214,180,124,0.4)]'
                  : 'bg-black/50 backdrop-blur-md text-[#f5f1ea] border border-white/20'
              }`}>
                {isBestseller ? <Gem className="w-3 h-3 text-black" /> : <Sparkles className="w-3 h-3 text-[#d6b47c]" />}
                {product.badge}
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-[#932e3e] to-[#691c28] text-white text-[10px] font-extrabold tracking-wider border border-white/20 shadow-md">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Floating Action Buttons */}
          <div
            className={`absolute right-3.5 flex flex-col gap-2 z-20 transition-all duration-400 ${
              hasDiscount ? 'top-12' : 'top-3.5'
            } ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'}`}
            onClick={(e) => e.preventDefault()}
          >
            {/* Compare Button */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare?.(product); }}
              className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
                isCompareSelected
                  ? 'bg-[#d6b47c] text-black border-[#d6b47c] shadow-[0_0_15px_rgba(214,180,124,0.5)]'
                  : 'bg-black/50 text-white border-white/20 hover:bg-[#d6b47c] hover:text-black hover:border-[#d6b47c]'
              }`}
              title={t('premiumProductCard.compare') || "Taqqoslash"}
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            {/* Favorite Button */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
              className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
                isLiked
                  ? 'bg-rose-500/25 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-black/50 text-white border-white/20 hover:bg-rose-500 hover:text-white hover:border-rose-500'
              }`}
              title={t('premiumProductCard.favorite') || "Tanlanganlar"}
            >
              <Heart className={`w-4 h-4 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : ''}`} />
            </button>
          </div>

          {/* Quick View Button on Image Hover */}
          {onQuickView && (
            <div className={`absolute inset-x-4 bottom-4 z-20 transition-all duration-400 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#09090b]/85 hover:bg-[#d6b47c] text-[#f5f1ea] hover:text-black border border-[#d6b47c]/30 hover:border-[#d6b47c] backdrop-blur-xl font-medium text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all duration-300 group/btn"
              >
                <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                <span>{t('product.quickView', "Tezkor ko'rish")}</span>
              </button>
            </div>
          )}
        </Link>

        {/* Product Details Section */}
        <div className="p-4 bg-[linear-gradient(180deg,rgba(18,18,21,0.95),rgba(12,12,14,0.98))] border-t border-white/[0.05]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] truncate font-medium">
              {product.category || "Premium"}
            </span>
            <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
              <Star className="w-3 h-3 fill-[#d6b47c] text-[#d6b47c]" />
              <span className="text-[11px] text-[#e8e2d8] font-semibold">{(product.rating || 4.9).toFixed(1)}</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="text-[15px] font-medium text-[#f5f1ea] truncate group-hover:text-[#d6b47c] transition-colors duration-300 leading-snug">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-base sm:text-lg font-bold text-[#ffffff] tracking-tight">
              {formatPrice(product.price)} {t('common.sum') || "so'm"}
            </span>
            {hasDiscount && (
              <span className="text-[12px] text-[#8a8278] line-through decoration-rose-500/40">
                {formatPrice(product.originalPrice)} {t('common.sum') || "so'm"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PremiumProductCard;
