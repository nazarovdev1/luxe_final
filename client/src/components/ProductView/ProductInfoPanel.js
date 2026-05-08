import React, { useState } from 'react';
import {
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Ruler,
  Sparkles,
  Palette,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import InstallmentCalculator from '../InstallmentCalculator';
import FlashSaleTimer from '../FlashSaleTimer';
import BackInStockButton from '../BackInStockButton';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * ProductInfoPanel — Right-side sticky panel with all product info
 * Props: product, reviews count, selectedColor/Size, quantity, handlers
 */
export default function ProductInfoPanel({
  product,
  reviewCount = 0,
  onAddToCart,
  onToggleWishlist,
  isFavorite = false,
  isAddingToCart = false,
  onReviewClick,
  onOpenSizeGuide,
}) {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const sizeOptions = Array.isArray(product.sizes)
    ? [...new Set(
        product.sizes
          .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
          .map((s) => String(s).trim())
          .filter(Boolean)
      )]
    : [];

  const subtotal = (Number(product.price) || 0) * quantity;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  // ── Handlers ────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      const { default: toast } = await import('react-hot-toast');
      toast.error('Iltimos, rang tanlang!', { duration: 6000 });
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      const { default: toast } = await import('react-hot-toast');
      toast.error("Iltimos, o'lcham tanlang!", { duration: 6000 });
      return;
    }
    onAddToCart?.(selectedColor, selectedSize, quantity);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 transition-colors ${
          i < Math.floor(rating) ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-[#2a2a2d]'
        }`}
      />
    ));
  };

  return (
    <div className="lg:sticky lg:top-28 lg:self-start space-y-7">
      {/* ── Category Label ──────────────────────────────── */}
      {product.category && (
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e] font-semibold">
          {product.category}
        </p>
      )}

      {/* ── Product Title ───────────────────────────────── */}
      <h1 className="text-3xl lg:text-[40px] font-brilliant text-[#f5f5f3] leading-[1.1]">
        {product.name}
      </h1>

      {/* ── Rating & Review Count ───────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {renderStars(product.rating || 0)}
          <span className="ml-1.5 text-sm font-medium text-[#f5f5f3]">
            {(product.rating || 0).toFixed(1)}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={onReviewClick}
          className="text-sm text-[#8a8a8d] hover:text-[#c9a96e] transition-colors underline-offset-4 hover:underline"
        >
          {reviewCount} sharh
        </button>
      </div>

      {/* ── Price Block ─────────────────────────────────── */}
      <div className="flex items-baseline gap-4">
        <span className="text-[28px] font-bold text-[#f5f5f3] tracking-tight">
          {formatPrice(product.price)} {t('common.sum')}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-[#6b6b6e] line-through decoration-[#c9a96e]/30">
              {formatPrice(product.originalPrice)} {t('common.sum')}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#c9a96e]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#c9a96e]">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* ── Flash Sale & Installment ─────────────────────── */}
      <div className="space-y-2">
        {hasDiscount && (
          <FlashSaleTimer
            endTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
            originalPrice={product.originalPrice}
            salePrice={product.price}
            totalStock={product.stock || 10}
            soldCount={Math.floor(Math.random() * 7) + 3}
            productName={product.name}
          />
        )}
        {product.price >= 50000 && (
          <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <InstallmentCalculator price={product.price} />
          </div>
        )}
      </div>

      {/* ── Description ─────────────────────────────────── */}
      {product.description && (
        <p className="text-[#8a8a8d] leading-relaxed text-[15px]">
          {product.description}
        </p>
      )}

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="border-t border-white/5" />

      {/* ── Color Selector ──────────────────────────────── */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f5f3]">
              Rangni tanlang
            </span>
            {selectedColor && (
              <span className="text-[11px] text-[#c9a96e] font-medium uppercase tracking-wider">
                {selectedColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color, index) => {
              const isHex = typeof color === 'string' && color.startsWith('#');
              return isHex ? (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`h-11 w-11 rounded-full transition-all duration-300 ${
                    selectedColor === color
                      ? 'ring-2 ring-[#c9a96e] ring-offset-3 ring-offset-[#0a0a0b] scale-110'
                      : 'ring-1 ring-white/10 hover:ring-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {selectedColor === color && (
                    <Check className="h-4 w-4 mx-auto text-white drop-shadow-md" />
                  )}
                </button>
              ) : (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
                    selectedColor === color
                      ? 'bg-[#c9a96e] text-[#0a0a0b] shadow-[0_4px_12px_rgba(201,169,110,0.3)]'
                      : 'bg-[#141416] text-[#8a8a8d] hover:text-[#f5f5f3] hover:bg-[#1c1c1f] border border-white/5'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Size Selector ───────────────────────────────── */}
      {sizeOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f5f3]">
              O'lchamni tanlang
            </span>
            <button
              onClick={onOpenSizeGuide}
              className="text-[11px] text-[#c9a96e] hover:text-[#d4b87a] transition-colors flex items-center gap-1.5 uppercase tracking-wider font-bold"
            >
              <Ruler className="h-3 w-3" />
              O'lcham jadvali
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size, index) => (
              <button
                key={index}
                onClick={() => setSelectedSize(size)}
                className={`h-12 min-w-[56px] px-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 ${
                  selectedSize === size
                    ? 'bg-[#f5f5f3] text-[#0a0a0b] shadow-[0_4px_12px_rgba(245,245,243,0.15)]'
                    : 'bg-[#141416] text-[#8a8a8d] hover:text-[#f5f5f3] hover:bg-[#1c1c1f] border border-white/5'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quantity + Subtotal ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-xl bg-[#141416] border border-white/5 p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] transition-colors rounded-lg hover:bg-white/5"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-[#f5f5f3]">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-[#8a8a8d] hover:text-[#f5f5f3] transition-colors rounded-lg hover:bg-white/5"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#6b6b6e] mb-0.5">Jami</p>
          <p className="text-lg font-bold text-[#f5f5f3]">{formatPrice(subtotal)} {t('common.sum')}</p>
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-[#c9a96e] px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#0a0a0b] hover:bg-[#d4b87a] hover:shadow-[0_12px_32px_rgba(201,169,110,0.25)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
          {isAddingToCart ? "Qo'shilmoqda..." : "Savatga qo'shish"}
        </button>
        <button
          onClick={onToggleWishlist}
          className={`w-14 h-14 flex items-center justify-center rounded-xl border transition-all duration-300 ${
            isFavorite
              ? 'bg-[#c9a96e]/10 border-[#c9a96e]/30 text-[#c9a96e]'
              : 'bg-[#141416] border-white/5 text-[#8a8a8d] hover:text-[#f5f5f3] hover:border-white/10'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#c9a96e]' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#141416] border border-white/5 text-[#8a8a8d] hover:text-[#f5f5f3] hover:border-white/10 transition-all duration-300"
        >
          {copied ? <Check className="h-5 w-5 text-green-400" /> : <Share2 className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Trust Badges ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: '3-6 soatda yetkazish' },
          { icon: Shield, label: 'Original sifat' },
          { icon: RotateCcw, label: '7 kun qaytarish' },
        ].map(({ icon: Icon, label }, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center"
          >
            <Icon className="h-4.5 w-4.5 text-[#c9a96e]" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8a8a8d] leading-tight">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Conditional Sections ────────────────────────── */}
      <div className="space-y-4">
        {/* Back in stock */}
        {product.stock !== undefined && product.stock <= 0 && (
          <BackInStockButton
            productId={product.id}
            productName={product.name}
            hasStock={product.stock > 0}
          />
        )}

        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="p-2 rounded-lg bg-[#c9a96e]/10 flex-shrink-0">
              <Palette className="h-4 w-4 text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#f5f5f3] uppercase tracking-wider mb-1">Materiallar</p>
              <p className="text-sm text-[#8a8a8d]">{product.materials.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Eco score */}
        {product.ecoScore && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="p-2 rounded-lg bg-green-500/10 flex-shrink-0">
              <Sparkles className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#f5f5f3] uppercase tracking-wider mb-1.5">Eko-mas'uliyat</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                    style={{ width: `${product.ecoScore * 10}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-green-400">{product.ecoScore}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* VIP Early Access */}
        {product.earlyAccessTier && product.earlyAccessTier !== 'none' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/15">
            <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
              <Star className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">VIP Early Access</p>
              <p className="text-sm text-purple-200/60">{product.earlyAccessTier} darajasidagi a'zolar uchun eksklyuziv</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
