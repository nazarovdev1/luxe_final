import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ZoomIn, Check } from 'lucide-react';
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const BundleProductCard = ({ product, index, selectedVariant, onVariantChange, bundleUnitPrice }) => {
  const { t, language } = useLanguage();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const currency = language === 'en' ? 'UZS' : "so'm";
  const localizedName = localize(product.name, language);
  const localizedDescription = localize(product.description, language);
  const localizedCategory = localize(product.category, language);

  // Normalize images to array of strings
  const images = (() => {
    if (product.image) return [product.image];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => typeof img === 'object' ? img.url : img);
    }
    return ['/placeholder.jpg'];
  })();

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = (Array.isArray(product.sizes) && product.sizes.length > 0) ? product.sizes : SIZES;
  const selectedColor = selectedVariant?.color || null;
  const selectedSize = selectedVariant?.size || null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const originalPrice = product.price || 0;
  const savings = originalPrice - (bundleUnitPrice || originalPrice);

  return (
    <article
      className="bundle-product-card group relative grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden transition-all duration-500"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Left: Image Gallery */}
      <div className="bundle-product-visual relative aspect-[3/4] lg:aspect-auto overflow-hidden bg-[#0e0e10]">
        {/* Main Image with Zoom */}
        <div
          className="relative h-full overflow-hidden cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={images[activeImageIdx] || '/placeholder.jpg'}
            alt={localizedName}
            className="w-full h-full object-cover transition-transform duration-700"
            style={isZoomed ? {
              transform: 'scale(1.85)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            } : {}}
          />

          {/* Zoom hint */}
          <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-opacity ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
            <ZoomIn className="w-3.5 h-3.5" />
            {t('bundleDetail.productCardZoom')}
          </div>

          {/* Index badge */}
          <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#d6b47c] text-[#0a0a0b] text-sm font-black flex items-center justify-center shadow-lg">
            {index + 1}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`w-12 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImageIdx === i
                  ? 'border-[#d6b47c] scale-105'
                  : 'border-white/10 opacity-60 hover:opacity-90'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="bundle-product-details flex flex-col p-8 lg:p-10 justify-between">
        <div>
          {/* Category */}
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#d6b47c]/60 font-bold mb-3">
            {localizedCategory}
          </p>

          {/* Name */}
          <h3 className="text-2xl lg:text-3xl font-light text-white leading-tight mb-4">
            {localizedName}
          </h3>

          {/* Description */}
          {localizedDescription && (
            <p className="text-[#9aa3b2] text-sm leading-relaxed mb-6 line-clamp-3">
              {localizedDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-end gap-4 mb-8">
            <div>
              <p className="text-[10px] text-[#9aa3b2] uppercase tracking-wider mb-1">{t('bundleDetail.productCardSeparatePrice')}</p>
              <p className="text-xl text-white/40 line-through">{formatPrice(originalPrice)} {currency}</p>
            </div>
            <div className="bundle-product-price">
              <p>TO'PLAMDAGI NARX</p>
              <strong>{formatPrice(bundleUnitPrice || originalPrice)} <span>{currency}</span></strong>
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">{t('bundleDetail.productCardCheaper')}</span>
              </div>
            )}
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-[#9aa3b2] uppercase tracking-widest mb-3 font-medium">
                {t('bundleDetail.productCardColor')}
                {selectedColor && (
                  <span className="ml-2 text-white font-normal normal-case">{selectedColor}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onVariantChange(product.id, { color, size: selectedSize })}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color
                      ? 'border-[#d6b47c] scale-110 shadow-lg shadow-[#d6b47c]/30'
                      : 'border-white/20 hover:border-white/50'}`}
                    style={{ backgroundColor: color.startsWith('#') ? color : '#888' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="mb-8">
            <p className="text-xs text-[#9aa3b2] uppercase tracking-widest mb-3 font-medium">
              {t('bundleDetail.productCardSize')}
              {selectedSize && (
                <span className="ml-2 text-white font-normal normal-case">{selectedSize}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onVariantChange(product.id, { color: selectedColor, size })}
                  className={`min-w-[44px] h-10 px-3 rounded-xl text-xs font-bold border transition-all ${selectedSize === size
                    ? 'bg-[#d6b47c] border-[#d6b47c] text-[#0a0a0b] shadow-lg shadow-[#d6b47c]/20'
                    : 'border-white/10 text-[#9aa3b2] hover:border-[#d6b47c]/40 hover:text-white'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            {(selectedColor || selectedSize) ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                {t('bundleDetail.productCardSelected')}
              </div>
            ) : (
              <p className="text-[#9aa3b2] text-xs">{t('bundleDetail.productCardPickColorSize')}</p>
            )}
          </div>
          <Link
            to={`/product/${product.id}`}
            className="flex items-center gap-1 text-xs text-[#d6b47c] hover:gap-2 transition-all"
          >
            {t('bundleDetail.productCardDetails')}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BundleProductCard;
