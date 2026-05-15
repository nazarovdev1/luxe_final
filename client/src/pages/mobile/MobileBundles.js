import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, Gem, Percent } from 'lucide-react';
import useProductService from '../../server/server';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileBundles = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { getAllBundles } = useProductService();
    
    const [bundles, setBundles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBundles = async () => {
            setIsLoading(true);
            try {
                const result = await getAllBundles();
                if (result && result.success && result.data) {
                    // Only show active bundles
                    const activeBundles = result.data.filter(b => b.isActive);
                    setBundles(activeBundles);
                }
            } catch (error) {
                console.error("To'plamlarni yuklashda xatolik:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBundles();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }, []);

    const formatPrice = (price) => {
        if (!price) return '0';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="min-h-screen bg-[#060a14] text-white pb-24 relative overflow-hidden">
            <SEO title="Premium To'plamlar | LUXX" />
            
            {/* Background effects */}
            <div className="pointer-events-none fixed top-0 left-1/4 w-[300px] h-[300px] bg-[#d6b47c]/5 blur-[120px] rounded-full z-0" />
            <div className="pointer-events-none fixed bottom-0 right-1/4 w-[300px] h-[300px] bg-[#d6b47c]/5 blur-[120px] rounded-full z-0" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#060a14]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[#f4f1eb]">Premium To'plamlar</h1>
                    <p className="text-[10px] uppercase tracking-widest text-[#d6b47c]">Kolleksiyalar</p>
                </div>
            </div>

            <div className="px-4 mt-6 relative z-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-serif text-[#f4f1eb] leading-tight">
                        Maxsus <span className="text-[#d6b47c] italic">Chegirmalar</span><br />
                        Siz Uchun
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2">
                        Eng yaxshi kiyimlarni to'plam shaklida xarid qiling va pulingizni tejang.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 text-[#d6b47c] animate-spin" />
                        <p className="text-sm text-neutral-500">To'plamlar yuklanmoqda...</p>
                    </div>
                ) : bundles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-md">
                        <div className="w-16 h-16 rounded-full bg-[#d6b47c]/10 flex items-center justify-center mb-4 border border-[#d6b47c]/20">
                            <Sparkles className="w-8 h-8 text-[#d6b47c]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#f4f1eb]">Hozircha to'plamlar yo'q</h3>
                        <p className="text-sm text-neutral-400 mt-2 px-6">Tez orada yangi premium to'plamlar qo'shiladi.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bundles.map((bundle) => {
                            const discountPercent = bundle.discountType === 'percentage' 
                                ? bundle.discountValue 
                                : Math.round(((bundle.originalPrice - bundle.discountedPrice) / bundle.originalPrice) * 100);

                            return (
                                <Link 
                                    key={bundle._id || bundle.id}
                                    to={`/mobile/bundle/${bundle._id || bundle.id}`}
                                    className="block group active:scale-[0.98] transition-transform duration-300"
                                >
                                    <div className="relative rounded-3xl overflow-hidden border border-[#d6b47c]/20 bg-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden flex">
                                            {bundle.products && bundle.products.length > 0 ? (
                                                bundle.products.map((p, idx) => (
                                                    <div key={idx} className="flex-1 h-full relative overflow-hidden border-r border-white/10 last:border-r-0">
                                                        <img 
                                                            src={p.image || p.images?.[0] || '/placeholder.jpg'} 
                                                            alt={p.name || bundle.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <img 
                                                    src={bundle.heroImage || '/mobile.jpg'} 
                                                    alt={bundle.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            )}
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#060a14]/60 to-transparent" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#060a14]/80 to-transparent" />
                                            
                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d6b47c]/90 backdrop-blur-md shadow-lg">
                                                    <Gem className="w-3.5 h-3.5 text-black" />
                                                    <span className="text-[10px] uppercase tracking-bold text-black font-bold">Premium</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-md shadow-lg border border-red-400/30">
                                                    <Percent className="w-3.5 h-3.5 text-white" />
                                                    <span className="text-[11px] font-bold text-white">-{discountPercent}%</span>
                                                </div>
                                            </div>

                                            {/* Content Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                                <h3 className="text-2xl font-bold text-white mb-2">{bundle.title}</h3>
                                                <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed mb-4">
                                                    {bundle.description || 'Bir nechta mahsulotlar yig\'indisidan tashkil topgan maxsus to\'plam.'}
                                                </p>
                                                
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xs text-neutral-400 line-through mb-0.5">
                                                            {formatPrice(bundle.originalPrice)} so'm
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xl font-bold text-[#d6b47c]">
                                                                {formatPrice(bundle.discountedPrice)} so'm
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                                                        Ko'rish
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Products Preview */}
                                        {bundle.products && bundle.products.length > 0 && (
                                            <div className="bg-[#0c111d] p-4 border-t border-white/5">
                                                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3 font-semibold">
                                                    To'plam ichida ({bundle.products.length} ta)
                                                </p>
                                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                                    {bundle.products.map(p => (
                                                        <div key={p._id || p.id} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 relative group-hover:border-[#d6b47c]/50 transition-colors">
                                                            <img 
                                                                src={p.image || p.images?.[0] || '/placeholder.jpg'} 
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                    <div className="w-4 flex-shrink-0" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileBundles;
