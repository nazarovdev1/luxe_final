import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, X, Gem, TrendingUp } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import MobileProductCard from './MobileProductCard';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileSearch = () => {
    const { products, categories } = useProducts();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const quickChips = useMemo(() => {
        const base = (categories || []).slice(0, 5);
        if (!base.length) return t('mobileSearch.fallbackChips', { returnObjects: true }) || [];
        return base;
    }, [categories, t]);

    const trendingProducts = useMemo(() => {
        const best = products.filter((product) => product.badge === 'BESTSELLER');
        if (best.length >= 4) return best.slice(0, 4);
        return products.slice(0, 4);
    }, [products]);

    useEffect(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            setSearchResults([]);
            return;
        }

        const results = products.filter((product) =>
            product.name.toLowerCase().includes(query) ||
            (product.category || '').toLowerCase().includes(query)
        );
        setSearchResults(results);
    }, [searchTerm, products]);

    const fallbackChips = Array.isArray(quickChips) && quickChips.length > 0 && typeof quickChips[0] === 'string'
      ? quickChips
      : t('mobileSearch.fallbackChips', { returnObjects: true }) || [];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black pb-24">
            <div className="pointer-events-none fixed inset-0 z-0">
                {/* Background blobs removed for neutral look */}
            </div>

            <div className="relative z-10 px-4 pt-4">
                <div className="rounded-[24px] bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('mobileSearch.placeholder')}
                                className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 text-[16px] text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                                autoFocus
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/10 text-gray-400"
                                    aria-label={t('mobileSearch.clearAria')}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                        {fallbackChips.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => setSearchTerm(chip)}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/5 border border-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 transition-colors"
                            >
                                <TrendingUp className="h-3 w-3" />
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-4 pt-5">
                {searchTerm ? (
                    <>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-white">{searchResults.length}</span> {t('mobileSearch.resultsCountSuffix')}
                            </p>
                            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">{searchTerm}</span>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {searchResults.map((product, index) => (
                                    <MobileProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-[#0f0f0f]/50 border border-white/5 p-10 text-center">
                                <Search className="mx-auto h-12 w-12 text-gray-600" />
                                <h3 className="mt-4 text-lg font-semibold text-white">{t('mobileSearch.noResults')}</h3>
                                <p className="mt-1 text-sm text-gray-400">{t('mobileSearch.noResultsHint')}</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
                                >
                                    {t('mobileSearch.clear')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-3 py-1.5 text-xs text-gray-300">
                            <Gem className="h-3.5 w-3.5 text-white" />
                            {t('mobileSearch.recommended')}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {trendingProducts.map((product, index) => (
                                <MobileProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MobileSearch;
