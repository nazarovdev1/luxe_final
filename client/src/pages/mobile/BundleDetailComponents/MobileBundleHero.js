import React from 'react';
import { Gem } from 'lucide-react';

const MobileBundleHero = ({ bundle, products, discountPercent, originalPrice, discountedPrice }) => {
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const mainImage = bundle.heroImage || (products && products[0]?.image) || '/placeholder.jpg';

    return (
        <div className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img 
                    src={mainImage} 
                    alt={bundle.title}
                    className="w-full h-full object-cover object-center"
                />
                {/* Advanced Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#060a14]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Bottom */}
            <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12">
                <div className="space-y-4">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                        <Gem className="w-3 h-3 text-amber-300" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-300">
                            %{discountPercent} CHEGIRMA
                        </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                        <h1 className="text-5xl font-bold tracking-tight text-white leading-none font-sans uppercase">
                            {bundle.title}
                        </h1>
                        <p className="text-sm text-neutral-300 max-w-xs leading-relaxed opacity-90">
                            {bundle.description || "Premium tanlov, cheklangan vaqt ichida maxsus chegirma bilan."}
                        </p>
                    </div>

                    {/* Price Tag */}
                    <div className="flex items-baseline gap-3 pt-2">
                        <span className="text-4xl font-black text-white tracking-tight">
                            {formatPrice(discountedPrice)} <span className="text-lg font-normal opacity-60">so'm</span>
                        </span>
                        {originalPrice > discountedPrice && (
                            <span className="text-lg text-neutral-500 line-through decoration-amber-500/40">
                                {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator Dot */}
            <div className="absolute bottom-8 right-6 flex flex-col items-center gap-2">
                <div className="w-[2px] h-12 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-full h-1/2 bg-amber-500/60 animate-bounce" />
                </div>
            </div>
        </div>
    );
};

export default MobileBundleHero;
