import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Plus, Minus, Heart, Ruler, Check, Loader2, ArrowUpRight, Truck, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoritesContext';
import toast from 'react-hot-toast';
import { showCartToast } from '../utils/toast';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const COLOR_NAMES = {
  '#000000': 'Qora',
  '#000': 'Qora',
  '#ffffff': 'Oq',
  '#fff': 'Oq',
  '#4a0e17': 'Bordo',
  '#800020': 'Bordo',
  '#800000': 'To‘q qizil',
  '#d6b47c': 'Oltin',
  '#d8b988': 'Atelier Gold',
  '#c9a96e': 'Klassik oltin',
  '#dcdcdc': 'Kumushrang',
  '#808080': 'Kulrang',
  '#a0a0a0': 'Och kulrang',
  '#1c1c1e': 'Grafit',
  '#0a192f': 'To‘q ko‘k',
  '#1e3a8a': 'Ko‘k',
  '#2d4a22': 'Zumrad yashil',
  '#8b4513': 'Jigarrang',
  '#f5f5dc': 'Krem bej',
  '#e8d8c8': 'Bej',
  black: 'Qora',
  white: 'Oq',
  burgundy: 'Bordo',
  gold: 'Oltin',
  silver: 'Kumush',
  grey: 'Kulrang',
  gray: 'Kulrang',
  navy: 'To‘q ko‘k',
  blue: 'Ko‘k',
  green: 'Yashil',
  brown: 'Jigarrang',
  beige: 'Bej',
};

const formatColorLabel = (color) => {
  if (!color) return '';
  const lower = String(color).toLowerCase().trim();
  if (COLOR_NAMES[lower]) return COLOR_NAMES[lower];
  if (lower.startsWith('#')) return 'Kolleksiya rangi';
  return color;
};

const QuickViewModal = ({ isOpen, onClose, product, onSizeGuideOpen, productPathPrefix = '' }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const modalRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((img) => (typeof img === 'object' ? img.url : img)).filter(Boolean);
    }
    return product.image ? [product.image] : [];
  }, [product]);

  const sizeOptions = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.sizes)) {
      return [...new Set(
        product.sizes
          .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
          .map((s) => String(s).trim())
          .filter(Boolean)
      )];
    }
    return [];
  }, [product]);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
      const defaultSize = sizeOptions.length > 0 ? sizeOptions[0] : '';
      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [product?.id, product?._id, sizeOptions]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Hide fixed navbar when modal is open
  useEffect(() => {
    const navbar = document.querySelector('nav.fixed, .luxx-navbar');
    if (navbar && isOpen) {
      navbar.style.opacity = '0';
      navbar.style.pointerEvents = 'none';
      navbar.style.transition = 'opacity 0.25s ease';
    } else if (navbar) {
      navbar.style.opacity = '';
      navbar.style.pointerEvents = '';
      navbar.style.transition = '';
    }
    return () => {
      if (navbar) {
        navbar.style.opacity = '';
        navbar.style.pointerEvents = '';
        navbar.style.transition = '';
      }
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const productId = product.id || product._id;
  const isFav = isFavorite(productId);

  const handleAddToCart = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error(t('quickView.selectColor', 'Iltimos, rang tanlang!'));
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error(t('quickView.selectSize', "Iltimos, o'lcham tanlang!"));
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      showCartToast({
        itemName: product.name,
        quantity,
      });
      onClose();
    } catch (error) {
      toast.error(t('quickView.errorRetry', 'Xatolik yuz berdi. Qaytadan urinib ko‘ring.'));
    } finally {
      setIsAdding(false);
    }
  };

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const productUrl = `${productPathPrefix}/product/${productId}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Cinematic backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Haute Couture Modal Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0c0a08] border border-[#d8b988]/20 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(216,185,136,0.06)] text-[#f6f1e8] animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label={t('common.close', 'Yopish')}
          className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#181512]/80 backdrop-blur-md border border-white/10 text-neutral-400 hover:text-white hover:border-[#d8b988]/60 hover:bg-[#d8b988]/15 transition-all shadow-lg"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 1. VISUAL SHOWCASE (Left Column) */}
        <div className="relative w-full md:w-[48%] bg-[#14110e] flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative aspect-[3/4] md:aspect-auto md:h-full min-h-[340px] sm:min-h-[420px] md:min-h-[540px] overflow-hidden group">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08] via-transparent to-black/25 pointer-events-none" />

                {/* Gallery Next / Prev buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Oldingi rasm"
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Keyingi rasm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-[#14110e] text-neutral-500 font-serif">
                {t('quickView.noImage', 'Rasm mavjud emas')}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
              {product.badge ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-semibold tracking-[0.22em] uppercase bg-black/60 backdrop-blur-md border border-[#d8b988]/30 text-[#d8b988]">
                  {product.badge}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-semibold tracking-[0.22em] uppercase bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300">
                  ATELIER EDIT
                </span>
              )}

              {hasDiscount && (
                <span className="inline-flex items-center self-start px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#d8b988] text-[#0c0a08]">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Favorite Button (Mobile overlay) */}
            <button
              type="button"
              onClick={() => toggleFavorite(productId)}
              aria-label="Sevimlilarga qo‘shish"
              className={`absolute top-4 right-4 md:right-auto md:left-auto md:top-4 z-20 md:hidden flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all ${
                isFav
                  ? 'bg-[#d8b988]/20 border-[#d8b988] text-[#d8b988]'
                  : 'bg-black/40 border-white/10 text-white/80 hover:text-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-20 px-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentImageIndex(i)}
                    aria-label={`Rasm ${i + 1}`}
                    className={`relative h-12 w-10 rounded-md overflow-hidden border transition-all ${
                      i === currentImageIndex
                        ? 'border-[#d8b988] ring-1 ring-[#d8b988] scale-105 shadow-md shadow-black/50'
                        : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. DETAILS & ATELIER CONTROLS (Right Column) */}
        <div className="w-full md:w-[52%] p-6 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[92vh]">
          <div>
            {/* Top Eyebrow */}
            <div className="flex items-center justify-between mb-2 pr-10 sm:pr-12">
              <span className="text-[10px] font-semibold tracking-[0.28em] text-[#d8b988] uppercase truncate max-w-[200px]">
                LUXX / {product.category || 'HAUTE COUTURE'}
              </span>

              {/* Desktop Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(productId)}
                aria-label="Sevimlilarga qo‘shish"
                className={`hidden md:inline-flex items-center gap-1.5 text-xs transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5 ${
                  isFav ? 'text-[#d8b988]' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current text-[#d8b988]' : ''}`} />
                <span className="text-[11px] font-medium">{isFav ? 'Saqlangan' : 'Saqlash'}</span>
              </button>
            </div>

            {/* Product Title */}
            <Link to={productUrl} onClick={onClose} className="group block mb-2">
              <h2
                id="qv-title"
                className="font-serif text-2xl sm:text-3xl font-normal text-[#f6f1e8] group-hover:text-[#d8b988] transition-colors leading-tight tracking-tight"
              >
                {product.name}
              </h2>
            </Link>

            {/* Rating / Guarantee info */}
            <div className="flex items-center gap-3 mb-4">
              {product.rating > 0 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d8b988]/10 border border-[#d8b988]/20">
                  <Star className="w-3 h-3 fill-[#d8b988] text-[#d8b988]" />
                  <span className="text-xs font-semibold text-[#d8b988]">
                    {Number(product.rating).toFixed(1)}
                  </span>
                  {product.numReviews > 0 && (
                    <span className="text-[11px] text-neutral-400">
                      ({product.numReviews} sharh)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-[#d8b988]/80 tracking-[0.2em] uppercase font-mono">
                  • ASL NUSXA KAFOLATI
                </span>
              )}
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 pb-4 mb-5 border-b border-white/10">
              <span className="text-2xl sm:text-3xl font-serif text-[#f6f1e8] tracking-tight">
                {formatPrice(Number(product.price || 0) * (quantity > 1 ? quantity : 1))}{' '}
                <span className="text-base text-[#d8b988] font-sans font-normal">so‘m</span>
              </span>
              {quantity > 1 && (
                <span className="text-xs text-neutral-400 font-mono">
                  ({quantity} × {formatPrice(product.price)} so‘m)
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through">
                  {formatPrice(Number(product.originalPrice || 0) * (quantity > 1 ? quantity : 1))} so‘m
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-5 font-light">
                {product.description}
              </p>
            )}

            {/* Colors Section */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {t('common.color', 'Rang')}:{' '}
                    <span className="text-[#d8b988] capitalize font-medium">
                      {formatColorLabel(selectedColor) || 'Tanlang'}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color, index) => {
                    const isHex = typeof color === 'string' && color.startsWith('#');
                    const isSelected = selectedColor === color;
                    const label = formatColorLabel(color);

                    return isHex ? (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Rang: ${label}`}
                        title={label}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          isSelected
                            ? 'ring-2 ring-[#d8b988] ring-offset-2 ring-offset-[#0c0a08] scale-105'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        )}
                      </button>
                    ) : (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#d8b988] text-[#0c0a08] font-semibold shadow-md shadow-[#d8b988]/20'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes Section */}
            {sizeOptions.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {t('common.size', 'O‘lcham')}:{' '}
                    <span className="text-[#d8b988] font-medium">{selectedSize || 'Tanlang'}</span>
                  </span>
                  {onSizeGuideOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSizeGuideOpen?.();
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-[#d8b988] hover:underline"
                    >
                      <Ruler className="h-3 w-3" />
                      {t('sizeGuide.title', 'O‘lcham jadvali')}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size, index) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-9 min-w-[42px] px-3 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#d8b988] text-[#0c0a08] shadow-md shadow-[#d8b988]/20 scale-105'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:border-white/20 border border-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions & Guarantees */}
          <div className="pt-4 border-t border-white/10">
            {/* Unified Stepper + Add to Cart Row */}
            <div className="flex items-center gap-2.5 mb-4">
              {/* Quantity Stepper */}
              <div className="flex items-center h-12 rounded-xl bg-white/[0.04] border border-white/10 px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Kamaytirish"
                  className="h-10 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#f6f1e8] font-mono select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Ko‘paytirish"
                  className="h-10 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Primary Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 min-w-0 h-12 px-4 sm:px-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d8b988] via-[#e4cca2] to-[#d8b988] hover:brightness-105 active:scale-[0.98] text-[#0c0a08] font-bold text-xs uppercase tracking-[0.14em] shadow-[0_4px_22px_rgba(216,185,136,0.3)] transition-all disabled:opacity-50 select-none cursor-pointer"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#0c0a08] shrink-0" />
                ) : (
                  <ShoppingBag className="h-4 w-4 text-[#0c0a08] shrink-0" />
                )}
                <span className="truncate whitespace-nowrap">
                  {isAdding ? t('common.loading', 'Yuklanmoqda...') : t('common.addToCart', 'Savatga qo‘shish')}
                </span>
              </button>

              {/* Detail Page Link */}
              <Link
                to={productUrl}
                onClick={onClose}
                aria-label="Batafsil ko‘rish"
                title={t('quickView.viewFullDetails', 'Batafsil sahifa')}
                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-[#d8b988] hover:border-[#d8b988]/40 hover:bg-[#d8b988]/10 transition-all shrink-0"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Atelier Trust Strip (Single Line, Haute Couture) */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-white/5">
              <div className="flex items-center justify-center gap-1.5 text-neutral-400">
                <Truck className="w-3.5 h-3.5 text-[#d8b988] shrink-0" />
                <span className="text-[10px] tracking-wide text-neutral-300 whitespace-nowrap">3–6 soatda</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-neutral-400 border-x border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d8b988] shrink-0" />
                <span className="text-[10px] tracking-wide text-neutral-300 whitespace-nowrap">100% Asl</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-neutral-400">
                <RotateCcw className="w-3.5 h-3.5 text-[#d8b988] shrink-0" />
                <span className="text-[10px] tracking-wide text-neutral-300 whitespace-nowrap">14 kun bepul</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
