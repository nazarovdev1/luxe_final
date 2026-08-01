import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2, Sparkles, Share2, Check } from 'lucide-react';

/**
 * PremiumGallery — Immersive luxury product image gallery
 * Features: hover zoom lens, interactive hotspots, thumbnail strip, full-screen lightbox, micro-interactions
 */
export default function PremiumGallery({ images = [], productName = '', badge = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [copied, setCopied] = useState(false);
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
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] rounded-3xl bg-[#141416] border border-white/5 flex flex-col items-center justify-center text-[#6b6b6e] space-y-2">
        <Sparkles className="h-8 w-8 text-[#c9a96e]/40 animate-pulse" />
        <p className="text-sm font-medium">Rasm mavjud emas</p>
      </div>
    );
  }

  // ── Lightbox Portal ─────────────────────────────────────
  const Lightbox = () => {
    if (!isLightboxOpen) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300"
        onClick={() => setIsLightboxOpen(false)}
      >
        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#c9a96e] animate-ping" />
            <h3 className="max-w-[400px] truncate text-sm font-medium tracking-wide text-white/90 font-serif">
              {productName}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 border border-white/10"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main lightbox image view */}
        <div
          className="relative flex flex-1 items-center justify-center p-4 sm:p-12"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]}
            alt={`${productName} — ${currentIndex + 1}`}
            className="h-auto max-h-[82vh] w-auto max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none"
            style={{ animation: 'fluid-zoom 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 flex h-13 w-13 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                aria-label="Oldingi rasm"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex h-13 w-13 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                aria-label="Keyingi rasm"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom thumbnail bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6">
          <div className="flex flex-col items-center gap-3">
            <span className="rounded-full bg-white/10 border border-white/10 px-4 py-1 text-xs font-bold tracking-widest text-[#c9a96e] backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <div className="scrollbar-hide flex max-w-[80vw] gap-3 overflow-x-auto p-1">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goTo(index); }}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                      index === currentIndex
                        ? 'ring-2 ring-[#c9a96e] ring-offset-2 ring-offset-black scale-110 shadow-lg'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
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
    <div className="space-y-5">
      {/* ── Main Gallery Card ───────────────────────────── */}
      <div
        className="group relative cursor-zoom-in overflow-hidden rounded-3xl bg-[#141416] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] transition-all duration-500 hover:border-[#c9a96e]/30"
        onClick={() => setIsLightboxOpen(true)}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={mainImageRef}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {/* Main Image */}
          <img
            src={images[currentIndex]}
            alt={`${productName} — ${currentIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out select-none"
            style={isZooming ? {
              transform: 'scale(2.2)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            } : {}}
          />

          {/* Luxury Inner Frame Vignette */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl z-10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500 z-10" />

          {/* Top Floating Glass Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
            {badge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a96e]/90 text-black px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-md shadow-lg pointer-events-auto border border-[#c9a96e]">
                <Sparkles className="h-3 w-3" />
                {badge}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 text-[#c9a96e] border border-[#c9a96e]/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-md pointer-events-auto shadow-md">
                <Sparkles className="h-3 w-3" />
                LUXX EXCLUSIVE
              </span>
            )}

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                title="Ulashish"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 transition-all hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                title="To'liq ekranda ko'rish"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Glass Indicators */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
            {/* Zoom hint */}
            <div className={`flex items-center gap-2 rounded-full bg-black/60 border border-white/10 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md transition-opacity duration-300 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
              <ZoomIn className="h-3.5 w-3.5 text-[#c9a96e]" />
              <span className="text-[11px] font-medium tracking-wide">Kattalashtirish uchun suring</span>
            </div>

            {/* Image counter pill */}
            <div className="rounded-full bg-black/60 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-white tracking-widest backdrop-blur-md">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Hover Arrow Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                aria-label="Oldingi rasm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#c9a96e] hover:text-black hover:scale-110 active:scale-95"
                aria-label="Keyingi rasm"
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
          className="scrollbar-hide flex gap-3 overflow-x-auto py-1 px-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-[#c9a96e] ring-offset-3 ring-offset-[#0a0a0b] scale-105 shadow-[0_0_15px_rgba(201,169,110,0.3)]'
                  : 'opacity-50 hover:opacity-90 hover:scale-[1.03] border border-white/10'
              }`}
            >
              <img
                src={image}
                alt={`${productName} — thumbnail ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                loading="lazy"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-[#c9a96e]/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      <Lightbox />
    </div>
  );
}
