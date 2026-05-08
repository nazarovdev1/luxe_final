import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BarChart3, Gem, Heart } from 'lucide-react';
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
  const imageUrl = product?.image || product?.images?.[0] || '/placeholder.jpg';
  const isNew = product.badge?.toUpperCase() === 'NEW';
  const isBestseller = product.badge?.toUpperCase() === 'BESTSELLER';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article
      className="group relative z-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Entire image is clickable — navigates to product */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#141416] luxury-card-glow transition-all duration-500 ease-out group-hover:-translate-y-2 z-0"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#141416] animate-pulse" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {(isNew || isBestseller) && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isBestseller
                ? 'premium-badge-shimmer text-[#0a0a0b]'
                : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
            }`}>
              {isBestseller && <Gem className="w-3 h-3" />}
              {product.badge}
            </span>
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black tracking-wider">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Action buttons — stop click from bubbling to Link */}
        <div
          className={`absolute right-4 flex flex-col gap-2 z-20 transition-all duration-300 ${
            hasDiscount ? 'top-14' : 'top-4'
          } ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}`}
          onClick={(e) => e.preventDefault()}
        >
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare?.(product); }}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
              isCompareSelected
                ? 'bg-[#c9a96e] text-[#0a0a0b] border-[#c9a96e]'
                : 'bg-black/40 text-white border-white/10 hover:bg-[#c9a96e] hover:text-[#0a0a0b] hover:border-[#c9a96e]'
            }`}
            title="Taqqoslash"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
              isLiked
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-black/40 text-white border-white/10 hover:bg-white/20 hover:border-white/20'
            }`}
            title="Sevimlilarga qo'shish"
          >
            <Heart className={`w-4 h-4 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : ''}`} />
          </button>
        </div>
      </Link>

      <div className="mt-4 px-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b6e] truncate font-medium">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#c9a96e] text-[#c9a96e]" />
            <span className="text-[11px] text-[#8a8a8d] font-medium">{(product.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-[#f5f5f3] truncate group-hover:text-[#c9a96e] transition-colors duration-300 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#f5f5f3] tracking-tight">{formatPrice(product.price)} {t('common.sum')}</span>
          {hasDiscount && (
            <span className="text-[11px] text-[#6b6b6e] line-through decoration-red-500/30">{formatPrice(product.originalPrice)} {t('common.sum')}</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default PremiumProductCard;
