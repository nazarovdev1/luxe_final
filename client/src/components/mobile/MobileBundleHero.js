import React, { useState } from 'react';
import { Percent } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const MobileBundleHero = ({ bundle, products, discountPercent, onImageClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const heroImages = products.slice(0, 3).map(p => p.image).filter(Boolean);
  const discountedPrice = bundle.discountedPrice || bundle.originalPrice || 0;
  const originalPrice = bundle.originalPrice || 0;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const swipeConfig = {
    onSwiping: (eventData) => { setIsSwiping(true); setSwipeDelta(eventData.deltaX); },
    onSwipedLeft: (eventData) => { setIsSwiping(false); setSwipeDelta(0); if (Math.abs(eventData.deltaX) > 50) nextImage(); },
    onSwipedRight: (eventData) => { setIsSwiping(false); setSwipeDelta(0); if (Math.abs(eventData.deltaX) > 50) prevImage(); },
    onTap: () => { setIsSwiping(false); setSwipeDelta(0); },
    onTouchEndOrOnMouseUp: () => { setIsSwiping(false); setSwipeDelta(0); },
    trackMouse: true, trackTouch: true, delta: 10, preventDefaultTouchmoveEvent: false,
  };

  const handlers = useSwipeable(swipeConfig);

  return (
    <section className="relative w-full h-[75vh] overflow-hidden bg-[#0a0a0b]">
      {/* Swipeable image gallery */}
      <div {...handlers} className="absolute inset-0">
        <div
          className={`flex h-full w-full ${isSwiping ? '' : 'transition-transform duration-500'}`}
          style={{ transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeDelta}px))` }}
        >
          {heroImages.length > 0 ? (
            heroImages.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-full h-full relative" onClick={onImageClick}>
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.4)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0b]" />
              </div>
            ))
          ) : (
            <div className="flex-shrink-0 w-full h-full bg-gradient-to-br from-[#1a1208] to-[#0a0a0b]" />
          )}
        </div>
      </div>

      {/* Vertical dot indicators */}
      {heroImages.length > 1 && (
        <div className="absolute top-28 right-3 flex flex-col gap-2 z-20">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className={`w-1 transition-all duration-300 rounded-full ${
                index === currentImageIndex
                  ? 'h-8 bg-[#d6b47c] shadow-[0_0_12px_rgba(214,180,124,0.5)]'
                  : 'h-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content overlay — only essential info */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8">
        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#d6b47c] to-[#c4985a] text-[#0a0a0b] text-[10px] font-black uppercase tracking-widest shadow-lg">
              <Percent className="w-3 h-3" />
              {discountPercent}% Chegirma
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white leading-tight mb-3">
          {bundle.title}
        </h1>

        {/* Price — clean and bold */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-white tracking-tight">
            {formatPrice(discountedPrice)}
            <span className="text-base text-[#9aa3b2] font-normal ml-1">so'm</span>
          </span>
          {originalPrice > discountedPrice && (
            <span className="text-base text-white/40 line-through">
              {formatPrice(originalPrice)} so'm
            </span>
          )}
        </div>
      </div>

      {/* Products count badge — top left */}
      <div className="absolute top-4 left-4 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium">
          {products.length} ta mahsulot
        </span>
      </div>
    </section>
  );
};

export default MobileBundleHero;