import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

const MobileBundleProductCard = ({ product, index, selectedVariant, onVariantChange }) => {
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];

    return (
        <div className="relative group rounded-[2rem] bg-gradient-to-br from-white/[0.06] to-transparent border border-white/10 p-4 transition-all active:scale-[0.98]">
            <div className="flex gap-5">
                {/* Product Image */}
                <div className="relative w-28 h-36 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-[#060a14] flex items-center justify-center text-[10px] font-bold border-2 border-[#060a14]">
                        {index + 1}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1">
                            {product.category}
                        </p>
                        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                            {product.name}
                        </h3>
                        <p className="mt-2 text-base font-bold text-white/90">
                            {formatPrice(product.price)} <span className="text-xs font-normal opacity-60">so'm</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-[#d6b47c] text-[10px] font-bold uppercase tracking-wider">
                        <span>Variantlarni tanlash</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* Selection Area (Inline for speed) */}
            {(colors.length > 0 || sizes.length > 0) && (
                <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                    {/* Colors */}
                    {colors.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Rang tanlang</p>
                            <div className="flex flex-wrap gap-2.5">
                                {colors.map((color, i) => {
                                    const isSelected = selectedVariant?.color === color;
                                    const isHex = color.startsWith('#');
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => onVariantChange(product.id, { color })}
                                            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                isSelected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#060a14] scale-110' : 'opacity-80'
                                            }`}
                                            style={{ backgroundColor: isHex ? color : '#333' }}
                                        >
                                            {!isHex && <span className="text-[8px] text-white font-bold uppercase">{color.slice(0, 2)}</span>}
                                            {isSelected && isHex && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">O'lcham tanlang</p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size, i) => {
                                    const isSelected = selectedVariant?.size === size;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => onVariantChange(product.id, { size })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                isSelected 
                                                ? 'bg-amber-500 text-[#060a14] shadow-lg shadow-amber-500/20' 
                                                : 'bg-white/5 text-white border border-white/10'
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
            )}
        </div>
    );
};

export default MobileBundleProductCard;
