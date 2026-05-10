import React from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';

const MobileBundleStickyBar = ({ discountedPrice, originalPrice, savings, isAdding, onAdd }) => {
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-5 pb-8">
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                {/* Price Info */}
                <div className="pl-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">{formatPrice(discountedPrice)}</span>
                        <span className="text-xs font-medium text-neutral-400">so'm</span>
                    </div>
                    {savings > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            -{formatPrice(savings)} tejam
                        </p>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAdd}
                    disabled={isAdding}
                    className="relative group overflow-hidden flex items-center gap-3 px-8 py-4 rounded-[1.8rem] bg-[#d6b47c] text-[#060a14] font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                    {isAdding ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" />
                            <span>Savatga</span>
                        </>
                    )}
                    
                    {/* Glossy Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
            </div>
        </div>
    );
};

export default MobileBundleStickyBar;
