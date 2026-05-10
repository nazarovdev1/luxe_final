import React from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const MobileBundleStickyCTA = ({
  bundle,
  discountedPrice,
  originalPrice,
  discountPercent,
  isAdding,
  onAddToCart,
}) => {
  const savings = originalPrice - discountedPrice;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/98 to-transparent pt-8 safe-area-bottom">
      {/* Bundle info bar */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex-1 min-w-0">
          <p className="text-[#9aa3b2] text-[10px] uppercase tracking-wider truncate">{bundle.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base tracking-tight">
              {formatPrice(discountedPrice)} so'm
            </span>
            <span className="text-white/30 text-xs line-through">{formatPrice(originalPrice)}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold">
              -{discountPercent}%
            </span>
          </div>
        </div>
        {savings > 0 && (
          <div className="text-right">
            <p className="text-[8px] text-[#9aa3b2] uppercase tracking-wider">Tejash</p>
            <p className="text-xs font-bold text-emerald-400">{formatPrice(savings)} so'm</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onAddToCart}
        disabled={isAdding}
        className="w-full h-14 bg-gradient-to-r from-[#d6b47c] to-[#c4985a] text-[#0a0a0b] rounded-2xl font-black text-sm tracking-[0.1em] uppercase shadow-[0_12px_24px_rgba(214,180,124,0.25)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isAdding ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Qo'shilmoqda...
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            To'plamni savatga qo'shish
          </>
        )}
      </button>
    </div>
  );
};

export default MobileBundleStickyCTA;