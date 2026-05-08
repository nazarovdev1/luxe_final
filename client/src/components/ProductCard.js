import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, Gem } from 'lucide-react';
import { Badge } from './ui';
import { useLanguage } from '../contexts/LanguageContext';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const ProductCard = ({ product, onQuickView, onCompare, isCompareSelected }) => {
  const { t } = useLanguage();
  const getImage = (product) => {
    return product?.image || product?.images?.[0] || '/placeholder.jpg';
  };

  return (
    <article className="group relative z-0">
      <Link to={`/product/${product.id}`} className="block relative z-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#141416] z-0">
          <img
            src={getImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {product.badge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="accent" icon={Gem}>{product.badge}</Badge>
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); onCompare?.(product); }}
            className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-md border transition-all duration-200 ${
              isCompareSelected
                ? 'bg-[#c9a96e]/30 border-[#c9a96e]/40 text-[#c9a96e]'
                : 'bg-[#0a0a0b]/60 border-white/15 text-white opacity-0 group-hover:opacity-100'
            }`}
            title="Taqqoslash"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
            className="absolute bottom-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a0a0b]/60 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#c9a96e]/30 hover:border-[#c9a96e]/40"
            title="Tezkor ko'rish"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </Link>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] uppercase tracking-wider text-[#6b6b6e] truncate">
            {product.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#c9a96e]">
            <Star className="w-3 h-3 fill-current" />
            {(product.rating || 0).toFixed(1)}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-[#f5f5f3] truncate group-hover:text-[#c9a96e] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#f5f5f3]">{formatPrice(product.price)} {t('common.sum')}</p>
          {product.originalPrice && (
            <p className="text-xs line-through text-[#6b6b6e]">{formatPrice(product.originalPrice)} {t('common.sum')}</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
