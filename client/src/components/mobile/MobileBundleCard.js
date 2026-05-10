import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const MobileBundleCard = ({ product, index, selectedVariant, onVariantChange, bundleUnitPrice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize images
  const images = (() => {
    if (product.image) return [product.image];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => typeof img === 'object' ? img.url : img);
    }
    return ['/placeholder.jpg'];
  })();

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : SIZES;
  const selectedColor = selectedVariant?.color || null;
  const selectedSize = selectedVariant?.size || null;
  const originalPrice = product.price || 0;
  const savings = originalPrice - (bundleUnitPrice || originalPrice);

  return (
    <article className="rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent">
      {/* Main row: image + info */}
      <div className="flex gap-4 p-4">
        {/* Image thumbnail */}
        <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 bg-[#0e0e10]">
          <img
            src={images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Index badge + category */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-[#d6b47c] text-[#0a0a0b] text-[10px] font-black flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#d6b47c]/60 font-bold truncate">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-white/40 line-through">{formatPrice(originalPrice)} so'm</span>
            {savings > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                To'plamda arzon
              </span>
            )}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] text-[#d6b47c] font-medium"
          >
            {isExpanded ? 'Yopish' : 'Rang/o\'lcham tanlash'}
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded: Variant selectors */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-4">
          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <p className="text-[10px] text-[#9aa3b2] uppercase tracking-widest mb-2 font-medium">
                Rang
                {selectedColor && (
                  <span className="ml-2 text-white font-normal normal-case text-[10px]">{selectedColor}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onVariantChange(product.id, { color, size: selectedSize })}
                    className={`w-9 h-9 rounded-full border-2 transition-all active:scale-90 ${
                      selectedColor === color
                        ? 'border-[#d6b47c] scale-110 shadow-lg shadow-[#d6b47c]/30'
                        : 'border-white/20 hover:border-white/50'
                    }`}
                    style={{ backgroundColor: color.startsWith('#') ? color : '#888' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div>
            <p className="text-[10px] text-[#9aa3b2] uppercase tracking-widest mb-2 font-medium">
              O'lcham
              {selectedSize && (
                <span className="ml-2 text-white font-normal normal-case text-[10px]">{selectedSize}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onVariantChange(product.id, { color: selectedColor, size })}
                  className={`min-w-[40px] h-9 px-3 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${
                    selectedSize === size
                      ? 'bg-[#d6b47c] border-[#d6b47c] text-[#0a0a0b] shadow-lg shadow-[#d6b47c]/20'
                      : 'border-white/10 text-[#9aa3b2] hover:border-[#d6b47c]/40 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Status + detail link */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              {(selectedColor || selectedSize) ? (
                <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                  <Check className="w-3 h-3" />
                  Tanlandi
                </span>
              ) : (
                <span className="text-[#9aa3b2] text-[10px]">Ixtiyoriy tanlov</span>
              )}
            </div>
            <Link
              to={`/product/${product.id}`}
              className="flex items-center gap-0.5 text-[10px] text-[#d6b47c] font-medium"
            >
              Batafsil
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Inline variant status when collapsed */}
      {!isExpanded && (selectedColor || selectedSize) && (
        <div className="px-4 pb-3 flex items-center gap-1.5 text-emerald-400 text-[10px] font-medium border-t border-white/[0.04] pt-2">
          <Check className="w-3 h-3" />
          {[selectedColor, selectedSize].filter(Boolean).join(' • ')} tanlandi
        </div>
      )}
    </article>
  );
};

export default MobileBundleCard;