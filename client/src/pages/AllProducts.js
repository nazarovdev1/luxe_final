import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  X,
  Grid3X3,
  LayoutGrid,
  Sparkles,
  ChevronDown,
  Sliders,
  ArrowUpDown,
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import QuickViewModal from '../components/QuickViewModal';
import ProductComparison from '../components/ProductComparison';
import SEO from '../components/SEO';
import ProductHero from '../components/ProductHero';
import PremiumProductCard from '../components/PremiumProductCard';
import FilterDrawer from '../components/FilterDrawer';

const AllProducts = () => {
  const { products, isLoading } = useProducts();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get('category');
  const filterFromUrl = searchParams.get('filter');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || t('products.all'));
  const [isNewOnly, setIsNewOnly] = useState(filterFromUrl === 'new');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const gridRef = useRef(null);
  const loadMoreRef = useRef(null);

  const allLabel = t('products.all');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || allLabel);
  }, [categoryFromUrl, allLabel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading]);

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      if (!product.category) return;
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });
    const dynamic = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return [{ name: allLabel, count: products.length }, ...dynamic];
  }, [products, allLabel]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setVisibleCount(12);
    if (category === allLabel) {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  }, [setSearchParams, allLabel]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = selectedCategory === allLabel || product.category === selectedCategory;
      const isNewMatch = !isNewOnly || product.isNewCollection === true;
      const searchMatch =
        q.length === 0 ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q);
      return categoryMatch && isNewMatch && searchMatch;
    });
  }, [products, selectedCategory, searchText, allLabel]);

  const badgeScore = (badge = '') => {
    const normalized = badge.toUpperCase();
    if (normalized === 'BESTSELLER') return 3;
    if (normalized === 'NEW') return 2;
    return 1;
  };

  const productScore = (product) => {
    return (product.rating || 0) * 100 + badgeScore(product.badge) * 10;
  };

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'price-low':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'featured':
      default:
        return list.sort((a, b) => productScore(b) - productScore(a));
    }
  }, [filteredProducts, sortBy]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  const seoData = useMemo(() => {
    if (selectedCategory === allLabel) {
      return {
        title: "Premium ayollar kiyimlari | Luxx.uz",
        description: "Luxx.uz premium katalogi: luxury kiyimlar, paltolar va eksklyuziv modellar.",
        keywords: "luxury kiyimlar, ayollar kiyimlari, paltolar, premium katalog",
        breadcrumbs: [{ name: t('products.clothing'), url: '/products' }]
      };
    }
    return {
      title: `${selectedCategory} | Luxx.uz`,
      description: `Luxx.uz katalogida ${selectedCategory.toLowerCase()} kolleksiyasi.`,
      keywords: `${selectedCategory}, ayollar kiyimlari, luxx.uz`,
      breadcrumbs: [
        { name: t('products.clothing'), url: '/products' },
        { name: selectedCategory, url: `/products?category=${selectedCategory}` }
      ]
    };
  }, [selectedCategory, allLabel, t]);

  const sortOptions = [
    { label: t('products.sortFeatured'), value: 'featured' },
    { label: t('products.sortNewest'), value: 'newest' },
    { label: t('products.sortRating'), value: 'rating' },
    { label: t('products.sortPriceLow'), value: 'price-low' },
    { label: t('products.sortPriceHigh'), value: 'price-high' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        breadcrumbSteps={seoData.breadcrumbs}
        canonicalPath="/products"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: selectedCategory === allLabel ? 'Barcha mahsulotlar' : `${selectedCategory} mahsulotlari`,
          url: 'https://luxx.uz/products',
          numberOfItems: sortedProducts.length,
          itemListElement: displayedProducts.slice(0, 20).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://luxx.uz/product/${product.id}`,
            name: product.name,
          })),
        }}
      />

      <ProductHero
        title={selectedCategory === allLabel ? t('products.premiumCatalog') : selectedCategory}
        subtitle={t('products.catalogSubtitle')}
        count={sortedProducts.length}
        categoriesCount={categories.length - 1}
      />

      <div className="sticky top-16 z-30 backdrop-blur-2xl bg-[#09090b]/85 border-b border-[#d6b47c]/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#f7f1e8] hover:bg-[#d6b47c]/10 hover:border-[#d6b47c]/40 hover:text-[#d6b47c] transition-all duration-300 shadow-md group"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#d6b47c] group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline font-medium tracking-wide">{t('products.filters')}</span>
                {selectedCategory !== allLabel && (
                  <span className="w-2 h-2 rounded-full bg-[#d6b47c] shadow-[0_0_10px_rgba(214,180,124,0.8)] animate-pulse" />
                )}
              </button>

              {searchText && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d6b47c]/15 border border-[#d6b47c]/35 text-[11px] text-[#e8c87a] animate-fade-in shadow-sm">
                  <span>"{searchText}"</span>
                  <button onClick={() => setSearchText('')} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-[#d6b47c] to-[#c59b5f] text-black shadow-md shadow-[#d6b47c]/25'
                      : 'text-[#8a8278] hover:text-[#f7f1e8]'
                  }`}
                  title="Grid ko'rinishi"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'masonry'
                      ? 'bg-gradient-to-r from-[#d6b47c] to-[#c59b5f] text-black shadow-md shadow-[#d6b47c]/25'
                      : 'text-[#8a8278] hover:text-[#f7f1e8]'
                  }`}
                  title="Masonry ko'rinishi"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-[100]" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#a2998f] hover:text-[#f7f1e8] hover:border-[#d6b47c]/40 transition-all duration-300"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#d6b47c]" />
                  <span className="hidden md:inline font-medium">
                    {sortOptions.find(o => o.value === sortBy)?.label || t('products.sortFeatured')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-[#d6b47c]' : ''}`} />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-2xl bg-[#121215]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in-scale" style={{ zIndex: 9999 }}>
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                          sortBy === opt.value
                            ? 'text-[#e8c87a] bg-[#d6b47c]/10 font-bold'
                            : 'text-[#a2998f] hover:text-[#f7f1e8] hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.value && <Sparkles className="w-3 h-3 text-[#d6b47c]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`relative whitespace-nowrap px-5 py-2.5 rounded-full text-[12px] font-medium tracking-wider uppercase transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? 'bg-gradient-to-r from-[#d6b47c]/20 via-[#f4efe6]/10 to-[#c59b5f]/20 text-[#f7f1e8] border border-[#d6b47c]/50 shadow-[0_0_20px_rgba(214,180,124,0.25)] font-semibold'
                    : 'bg-white/[0.03] text-[#938b81] border border-white/[0.08] hover:border-white/[0.2] hover:text-[#f7f1e8]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === cat.name ? 'bg-[#d6b47c] text-black font-bold' : 'bg-white/10 text-[#a2998f]'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 pb-24" ref={gridRef}>
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-32 animate-fade-in-up">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-8">
              <Search className="w-10 h-10 text-[#6b6b6e]" />
            </div>
            <h3 className="text-2xl font-medium text-[#f5f5f3] mb-3">{t('products.noProductsFound')}</h3>
            <p className="text-[#6b6b6e] mb-8 max-w-md mx-auto">
              {t('products.noProductsHint')}
            </p>
            <button
              onClick={() => { setSearchText(''); handleCategoryChange(allLabel); }}
              className="px-8 py-3 rounded-xl bg-[#c9a96e] text-[#0a0a0b] font-bold hover:bg-[#d4b87a] transition-all shadow-lg shadow-[#c9a96e]/20"
            >
              {t('products.clearFilters')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#6b6b6e]">
                <span className="text-[#f5f5f3] font-medium">{sortedProducts.length}</span> {t('products.productsCount')}
              </p>
            </div>

            <div className={viewMode === 'masonry' ? 'premium-masonry' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5'}>
              {displayedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="stagger-reveal"
                  style={{ animationDelay: `${Math.min(index * 0.08, 0.8)}s` }}
                >
                  <PremiumProductCard
                    product={product}
                    priority={index < 4}
                    onQuickView={setQuickViewProduct}
                    onCompare={(p) => {
                      setCompareList((prev) => {
                        const exists = prev.find((x) => (x._id || x.id) === (p._id || p.id));
                        if (exists) return prev.filter((x) => (x._id || x.id) !== (p._id || p.id));
                        if (prev.length >= 3) return prev;
                        return [...prev, p];
                      });
                    }}
                    isCompareSelected={compareList.some((x) => (x._id || x.id) === (product._id || product.id))}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center mt-16">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.06] text-[#6b6b6e]">
                  <div className="w-4 h-4 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                  <span className="text-sm">{t('products.loading')}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        searchText={searchText}
        onSearchChange={setSearchText}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      {compareList.length > 0 && !showComparison && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#141416] border border-white/10 px-8 py-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-up w-[92%] max-w-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {compareList.map((p) => (
                  <div key={p._id || p.id} className="w-12 h-12 rounded-full border-2 border-[#141416] overflow-hidden bg-[#0a0a0b]">
                    <img 
                      src={p.image || (Array.isArray(p.images) ? (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0]) : '') || '/placeholder.jpg'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#f5f5f3] font-medium">{compareList.length} {t('products.comparing')}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompareList([])}
                className="text-sm text-[#6b6b6e] hover:text-[#f5f5f3] transition-colors"
              >
                {t('products.clear')}
              </button>
              <button
                onClick={() => setShowComparison(true)}
                disabled={compareList.length < 2}
                className="px-6 py-2.5 rounded-xl bg-[#c9a96e] text-[#0a0a0b] text-sm font-bold hover:bg-[#d4b87a] transition-all disabled:opacity-30 shadow-lg shadow-[#c9a96e]/20"
              >
                {t('products.compare')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showComparison && (
        <ProductComparison
          products={compareList}
          onClose={() => {
            setShowComparison(false);
            setCompareList([]);
          }}
        />
      )}
    </div>
  );
};

export default AllProducts;
