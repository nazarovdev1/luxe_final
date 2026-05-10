import React from 'react';
import { TrendingDown } from 'lucide-react';

const MobileBundleSavings = ({ originalPrice, discountedPrice, savings, discountPercent }) => {
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="px-5 mt-12 pb-12">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 p-8 text-center relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tejamkorlik hisoblagichi</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-neutral-400">Jami tejamkorligingiz:</p>
                        <h4 className="text-4xl font-black text-white">
                            {formatPrice(savings)} <span className="text-xl font-normal opacity-50">so'm</span>
                        </h4>
                        <p className="text-emerald-400 text-sm font-bold mt-1">
                            Alohida sotib olgandan %{discountPercent} arzonroq
                        </p>
                    </div>

                    {/* Progress Bar Viz */}
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full" 
                            style={{ width: `${discountPercent}%` }}
                        />
                    </div>

                    <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-widest max-w-[200px] mx-auto">
                        Premium sifat va mukammal tanlov siz uchun maxsus narxda
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileBundleSavings;
