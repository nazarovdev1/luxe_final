import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Gem, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const MobileLookbooks = () => {
    const navigate = useNavigate();
    const [looks, setLooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchLooks();
    }, []);

    const fetchLooks = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/looks');
            const result = await response.json();
            if (result.success) {
                setLooks(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch looks:', err);
            toast.error('Looklarni yuklashda xatolik');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set(['all']);
        looks.forEach(look => {
            (look.items || []).forEach(item => cats.add(item.category));
        });
        return Array.from(cats);
    }, [looks]);

    const filteredLooks = useMemo(() => {
        if (activeFilter === 'all') return looks;
        return looks.filter(look =>
            (look.items || []).some(item => item.category === activeFilter)
        );
    }, [looks, activeFilter]);

    const getLookProductCount = (look) => {
        if (look.products && look.products.length > 0) {
            return look.products.length;
        }
        return (look.items || []).reduce((sum, item) => sum + (item.count || 1), 0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-2 border-[#d6b47c]/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-2 border-[#d6b47c]/60 rounded-full animate-pulse"></div>
                        <Gem className="absolute inset-0 m-auto w-6 h-6 text-[#d6b47c] animate-pulse" />
                    </div>
                    <p className="text-[#d6b47c] text-xs tracking-widest uppercase animate-pulse">Looklarni yuklash...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08090d] pb-20">
            {/* Hero Section */}
            <div className="relative pt-20 pb-6 px-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Gem className="w-5 h-5 text-[#d6b47c]" />
                        <h1 className="text-2xl font-brilliant text-[#f4f1eb]">Lookbook</h1>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="p-2 rounded-xl border border-[#d6b47c]/30 bg-[#d6b47c]/10 text-[#d6b47c]"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#0f1623]/80 backdrop-blur-sm border border-white/10">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeFilter === cat
                                            ? 'bg-[#d6b47c] text-[#0a0a0a] shadow-lg shadow-[#d6b47c]/25'
                                            : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    {cat === 'all' ? 'Barchasi' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-sm text-neutral-400">
                    {filteredLooks.length} ta look topildi
                </p>
            </div>

            {/* Lookbook Grid */}
            {filteredLooks.length === 0 ? (
                <div className="text-center py-20 px-4">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-neutral-600" />
                    </div>
                    <p className="text-neutral-400 text-sm">Bu kategoriya bo'yicha looklar topilmadi</p>
                </div>
            ) : (
                <div className="px-4 space-y-4">
                    {filteredLooks.map((look, index) => {
                        const productCount = getLookProductCount(look);
                        const lookId = look._id || look.id;

                        return (
                            <div
                                key={lookId}
                                className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f1623]/50 backdrop-blur-sm"
                            >
                                {/* Image */}
                                <button
                                    type="button"
                                    className="relative w-full pt-[125%] cursor-pointer text-left"
                                    onClick={() => navigate(`/mobile/lookbooks/${lookId}`)}
                                >
                                    <img
                                        src={look.heroImage}
                                        alt={look.title}
                                        onError={(e) => { e.target.src = '/mobile.jpg' }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/20 to-transparent" />

                                    {/* Product Count Badge */}
                                    <div className="absolute top-3 left-3">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                            <ShoppingBag className="w-3 h-3 text-[#d6b47c]" />
                                            <span className="text-xs font-medium text-white">{productCount}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-[#d6b47c]/20 backdrop-blur-sm border border-[#d6b47c]/30">
                                            <span className="text-[9px] uppercase tracking-wider text-[#d6b47c] font-medium">
                                                Look {look.id || index + 1}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-brilliant text-[#f4f1eb] mb-1 line-clamp-1">
                                            {look.title}
                                        </h3>

                                        <p className="text-xs text-neutral-400 line-clamp-2">
                                            {look.description}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Back to Home */}
            <div className="px-4 py-6">
                <button
                    onClick={() => navigate('/mobile')}
                    className="w-full py-3.5 rounded-2xl border border-white/10 bg-white/5 text-[#f4f1eb] font-medium text-sm flex items-center justify-center gap-2"
                >
                    Bosh sahifaga qaytish
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MobileLookbooks;
