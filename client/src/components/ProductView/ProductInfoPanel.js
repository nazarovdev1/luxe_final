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
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import InstallmentCalculator from '../InstallmentCalculator';
import FlashSaleTimer from '../FlashSaleTimer';
import BackInStockButton from '../BackInStockButton';
import { getProductOptions } from '../../utils/productVariants';
import { trackEvent, productAnalyticsPayload } from '../../utils/analytics';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * ProductInfoPanel — Luxury Right-side sticky panel with interactive options, tabs & CTAs
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
  const { t, language } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'materials' | 'shipping'

  const sizeOptions = getProductOptions(product, 'size');
  const colorOptions = getProductOptions(product, 'color');

  const subtotal = (Number(product.price) || 0) * quantity;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const viewerCount = 18;

  // ── Handlers ────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (colorOptions.length > 0 && !selectedColor) {
      const { default: toast } = await import('react-hot-toast');
      toast.error('Iltimos, rang tanlang!', { duration: 5000 });
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      const { default: toast } = await import('react-hot-toast');
      toast.error("Iltimos, o'lcham tanlang!", { duration: 5000 });
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
        className={`h-4 w-4 transition-colors ${
          i < Math.floor(rating) ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-white/20'
        }`}
      />
    ));
  };

  return (
    <div className="lg:sticky lg:top-28 lg:self-start space-y-7 bg-[#141416]/50 p-6 lg:p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

      {/* ── Live Viewer & Authenticity Header ───────────── */}
      <div className="flex items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Eye className="h-3.5 w-3.5" />
          <span>Hozir <strong className="font-bold text-emerald-300">{viewerCount} kishi</strong> ko'rmoqda</span>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#c9a96e] font-bold">
          <Shield className="h-3.5 w-3.5" />
          100% Original
        </span>
      </div>

      {/* ── Category & Title ────────────────────────────── */}
      <div className="space-y-2">
        {product.category && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a96e] font-bold">
              {product.category}
            </p>
          </div>
        )}

        <h1 className="text-3xl lg:text-4xl font-serif font-normal text-white tracking-tight leading-[1.15]">
          {product.name}
        </h1>
      </div>

      {/* ── Rating & Reviews Link ───────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-0.5">{renderStars(product.rating || 5.0)}</div>
          <span className="ml-1 text-xs font-bold text-white">
            {(product.rating || 5.0).toFixed(1)}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={onReviewClick}
          className="text-xs font-medium text-[#8a8a8d] hover:text-[#c9a96e] transition-colors underline-offset-4 hover:underline flex items-center gap-1"
        >
          <span>{reviewCount} sharh</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* ── Price Section ───────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-5 border border-white/10 space-y-3">
        <div className="flex items-baseline gap-4">
          <span className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            {formatPrice(product.price)} <span className="text-lg font-medium text-[#c9a96e]">{t('common.sum')}</span>
          </span>
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#6b6b6e] line-through decoration-red-500/50">
                {formatPrice(product.originalPrice)} {t('common.sum')}
              </span>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 px-2.5 py-0.5 text-xs font-black text-red-400 border border-red-500/30 animate-pulse">
                -{discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Installment Badge pill */}
        {product.price >= 50000 && (
          <div className="pt-2 border-t border-white/5">
            <InstallmentCalculator price={product.price} />
          </div>
        )}
      </div>

      {/* ── Flash Sale Urgency Box ──────────────────────── */}
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

      {/* ── Color Selector ──────────────────────────────── */}
      {colorOptions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
              Rangni tanlang
            </span>
            {selectedColor && (
              <span className="text-xs text-[#c9a96e] font-bold uppercase tracking-wider bg-[#c9a96e]/10 px-2.5 py-0.5 rounded-full border border-[#c9a96e]/20">
                {selectedColor}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color, index) => {
              const isHex = typeof color === 'string' && color.startsWith('#');
              const isSelected = selectedColor === color;
              return isHex ? (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`h-11 w-11 rounded-full transition-all duration-300 relative ${
                    isSelected
                      ? 'ring-2 ring-[#c9a96e] ring-offset-4 ring-offset-[#0a0a0b] scale-110 shadow-[0_0_15px_rgba(201,169,110,0.5)]'
                      : 'ring-1 ring-white/20 hover:ring-white/50 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {isSelected && (
                    <Check className="h-4 w-4 mx-auto text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  )}
                </button>
              ) : (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wider transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#c9a96e] text-black shadow-[0_6px_20px_rgba(201,169,110,0.35)] scale-105'
                      : 'bg-[#1c1c1f] text-[#8a8a8d] hover:text-white hover:bg-[#252529] border border-white/10'
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
              O'lchamni tanlang
            </span>
            <button
              onClick={onOpenSizeGuide}
              className="text-xs text-[#c9a96e] hover:text-[#d4b87a] transition-colors flex items-center gap-1.5 uppercase tracking-wider font-bold group"
            >
              <Ruler className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
              O'lcham jadvali
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizeOptions.map((size, index) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedSize(size);
                    trackEvent('select_size', productAnalyticsPayload(product, { item_variant: size }));
                  }}
                  className={`h-12 min-w-[58px] px-4 rounded-2xl text-xs font-bold tracking-widest transition-all duration-300 ${
                    isSelected
                      ? 'bg-white text-black shadow-[0_6px_20px_rgba(255,255,255,0.2)] scale-105 border-white'
                      : 'bg-[#1c1c1f] text-[#8a8a8d] hover:text-white hover:bg-[#252529] border border-white/10'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quantity & Subtotal ─────────────────────────── */}
      <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8a8a8d] mr-3">Miqdor:</span>
          <div className="flex items-center rounded-xl bg-[#1c1c1f] border border-white/10 p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center text-[#8a8a8d] hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Kamaytirish"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center text-[#8a8a8d] hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Oshirish"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[#6b6b6e] mb-0.5">Jami Summa</p>
          <p className="text-xl font-bold text-white">{formatPrice(subtotal)} <span className="text-xs text-[#c9a96e]">{t('common.sum')}</span></p>
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="relative flex-1 group overflow-hidden flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#c9a96e] bg-[length:200%_auto] hover:bg-[position:right_center] px-8 py-4.5 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_12px_32px_rgba(201,169,110,0.3)] hover:shadow-[0_16px_40px_rgba(201,169,110,0.45)] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          ) : (
            <ShoppingCart className="h-5 w-5 text-black" />
          )}
          <span>{isAddingToCart ? "Qo'shilmoqda..." : "Savatga qo'shish"}</span>
        </button>

        <button
          onClick={onToggleWishlist}
          className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all duration-300 active:scale-90 ${
            isFavorite
              ? 'bg-[#c9a96e]/20 border-[#c9a96e]/50 text-[#c9a96e] shadow-[0_0_20px_rgba(201,169,110,0.3)]'
              : 'bg-[#1c1c1f] border-white/10 text-[#8a8a8d] hover:text-white hover:border-white/20'
          }`}
          title="Saralanganlarga qo'shish"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-[#c9a96e]' : ''}`} />
        </button>

        <button
          onClick={handleShare}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#1c1c1f] border border-white/10 text-[#8a8a8d] hover:text-white hover:border-white/20 transition-all duration-300 active:scale-90"
          title="Ulashish"
        >
          {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Share2 className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Interactive Tabs (Tavsif / Material / Yetkazib berish) ── */}
      <div className="border-t border-white/10 pt-6 space-y-4">
        <div className="flex border-b border-white/10 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 px-3 relative transition-colors ${
              activeTab === 'desc' ? 'text-[#c9a96e]' : 'text-[#8a8a8d] hover:text-white'
            }`}
          >
            Tavsif
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a96e] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 px-3 relative transition-colors ${
              activeTab === 'materials' ? 'text-[#c9a96e]' : 'text-[#8a8a8d] hover:text-white'
            }`}
          >
            Material va Parvarish
            {activeTab === 'materials' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a96e] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 px-3 relative transition-colors ${
              activeTab === 'shipping' ? 'text-[#c9a96e]' : 'text-[#8a8a8d] hover:text-white'
            }`}
          >
            Yetkazib berish
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a96e] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="text-xs text-[#8a8a8d] leading-relaxed min-h-[80px]">
          {activeTab === 'desc' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <p className="text-sm text-white/80">{product.description || "Yuqori sifatli matolardan tayyorlangan eksklyuziv premium model. Smart-casual va klassik kombinatsiyalar uchun juda mos keladi."}</p>
              {product.fit && (
                <p className="text-xs text-[#c9a96e] font-medium pt-1">
                  Fit: <span className="text-white font-normal">{typeof product.fit === 'string' ? product.fit : product.fit.label || product.fit.type}</span>
                </p>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              {product.materials && product.materials.length > 0 ? (
                <p><strong className="text-white">Tarkibi:</strong> {product.materials.join(', ')}</p>
              ) : (
                <p><strong className="text-white">Tarkibi:</strong> Premium Silk-Cotton Blend / Italiana Cashmere finish</p>
              )}
              <ul className="list-disc list-inside space-y-1 text-white/70 pt-1">
                <li>Faqat kimyoviy tozalash tavsiya etiladi (Dry Clean Only)</li>
                <li>Past haroratda bug' bilan dazmollang</li>
                <li>Iliq va quruq joyda ilmoqda saqlang</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-white">
                <Truck className="h-4 w-4 text-[#c9a96e]" />
                <span className="font-bold">Toshkent bo'ylab 3-6 soat ichida yetkazib beramiz</span>
              </div>
              <p className="text-white/70">O'zbekistonning barcha viloyatlariga 24-48 soat ichida bepul yetkazib berish xizmati mavjud.</p>
              <p className="text-emerald-400 font-medium">14 kun davomida kiyilmagan holda bepul qaytarish yoki almashtirish kafolati.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        {[
          { icon: Truck, label: '3-6 soat', sub: 'Toshkent Express' },
          { icon: Shield, label: '100% Original', sub: 'Kafolatlangan Sifat' },
          { icon: RotateCcw, label: '14 Kun', sub: 'Bepul Qaytarish' },
        ].map(({ icon: Icon, label, sub }, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center hover:border-white/15 hover:bg-white/[0.04] transition-all"
          >
            <Icon className="h-4 w-4 text-[#c9a96e] mb-0.5" />
            <span className="text-[11px] font-bold text-white leading-tight">{label}</span>
            <span className="text-[9px] text-[#8a8a8d]">{sub}</span>
          </div>
        ))}
      </div>

      {/* Out of Stock notification button */}
      {product.stock !== undefined && product.stock <= 0 && (
        <BackInStockButton
          productId={product.id}
          productName={product.name}
          hasStock={product.stock > 0}
        />
      )}
    </div>
  );
}
