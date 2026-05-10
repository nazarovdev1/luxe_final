import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

/**
 * PremiumGallery — Immersive product image gallery
 * Features: hover zoom, thumbnail strip, full-screen lightbox, keyboard navigation
 */
export default function PremiumGallery({ images = [], productName = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const mainImageRef = useRef(null);
  const thumbnailStripRef = useRef(null);

  // ── Navigation ──────────────────────────────────────────
  const goTo = useCallback((index) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  const next = useCallback(() => {
    goTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, goTo]);

  // ── Keyboard navigation ─────────────────────────────────
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, next, prev]);

  // ── Scroll active thumbnail into view ───────────────────
  useEffect(() => {
    if (!thumbnailStripRef.current) return;
    const activeThumb = thumbnailStripRef.current.children[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  // ── Mouse zoom handler ──────────────────────────────────
  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-2xl bg-[#141416] flex items-center justify-center">
        <p className="text-[#6b6b6e] text-sm">Rasm mavjud emas</p>
      </div>
    );
  }

  // ── Lightbox Portal ─────────────────────────────────────
  const Lightbox = () => {
    if (!isLightboxOpen) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xl flex flex-col animate-in fade-in duration-300"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={() => setIsLightboxOpen(false)}
      >
        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="max-w-[60%] truncate text-sm font-medium text-white/80">
            {productName}
          </div>
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main image */}
        <div
          className="relative flex flex-1 items-center justify-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`${productName} — ${currentIndex + 1}`}
            className="h-auto max-h-[75vh] w-auto max-w-[80vw] object-contain rounded-lg"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
          <div className="flex items-center justify-center gap-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <div className="scrollbar-hide flex max-w-[60vw] gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goTo(index); }}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                      index === currentIndex
                        ? 'ring-2 ring-[#c9a96e] ring-offset-2 ring-offset-black scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Main Image ──────────────────────────────────── */}
      <div
        className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-[#141416]"
        onClick={() => setIsLightboxOpen(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={mainImageRef}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`${productName} — ${currentIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out"
            style={isZooming ? {
              transform: 'scale(1.8)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            } : {}}
          />

          {/* Zoom indicator */}
          <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
            <ZoomIn className="h-3.5 w-3.5" />
            Kattalashtirish
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Navigation arrows — visible on hover */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/60"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/60"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Thumbnail Strip ──────────────────────────────── */}
      {images.length > 1 && (
        <div
          ref={thumbnailStripRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-[#c9a96e] ring-offset-2 ring-offset-[#0a0a0b] scale-105'
                  : 'opacity-60 hover:opacity-90 hover:scale-[1.02]'
              }`}
            >
              <img
                src={image}
                alt={`${productName} — thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox />
    </div>
  );
}
