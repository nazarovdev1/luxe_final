import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Crown,
  Flame,
  Package,
  Search,
  SlidersHorizontal,
  Gem,
  Star,
  X,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import QuickViewModal from '../components/QuickViewModal';
import ProductComparison from '../components/ProductComparison';
import SEO from '../components/SEO';

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Narx mavjud emas';
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} so'm`;
};

const getImage = (product) => {
  return product?.image || product?.images?.[0] || '/placeholder.jpg';
};

const badgeScore = (badge = '') => {
  const normalized = badge.toUpperCase();
  if (normalized === 'BESTSELLER') return 3;
  if (normalized === 'NEW') return 2;
  return 1;
};

const productScore = (product) => {
  return (product.rating || 0) * 100 + badgeScore(product.badge) * 10;
};

const PremiumCatalogCard = ({ product, onQuickView, onCompare, isCompareSelected }) => {
  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all duration-500 hover:border-[#d6b47c]/40 hover:shadow-[0_24px_60px_rgba(20,16,10,0.5)]">
      <div className="relative block aspect-[3/4] overflow-hidden">
        <Link to={`/product/${product.id}`} className="block h-full">
          <img
            src={getImage(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/20 to-transparent pointer-events-none" />

        {/* Compare Button */}
        <button
          onClick={(e) => { e.preventDefault(); onCompare?.(product); }}
          className={`absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md border transition-all duration-300 ${
            isCompareSelected
              ? 'bg-[#d6b47c]/30 border-[#d6b47c]/40 text-[#d6b47c] opacity-100'
              : 'bg-black/50 border-white/15 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-[#d6b47c]/30 hover:border-[#d6b47c]/40'
          }`}
          title="Taqqoslash"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#d6b47c]/30 hover:border-[#d6b47c]/40"
          title="Tezkor ko'rish"
        >
          <Eye className="w-4 h-4" />
        </button>

        {product.earlyAccessUntil && new Date(product.earlyAccessUntil) > new Date() && (
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
            <Gem className="w-3.5 h-3.5" />
            Early Access
          </div>
        )}

        {product.isNewCollection && (
          <div className={`absolute top-3 ${product.earlyAccessUntil && new Date(product.earlyAccessUntil) > new Date() ? 'left-32' : 'left-3'} z-10 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md`}>
            <Flame className="w-3.5 h-3.5" />
            New Collection
          </div>
        )}

        {product.badge && !product.earlyAccessUntil && !product.isNewCollection && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            <Gem className="w-3.5 h-3.5 text-[#f0d0a4]" />
            {product.badge}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-neutral-300">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            {(product.rating || 0).toFixed(1)}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold text-[#f4f1eb] truncate group-hover:text-white transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-[#f4f1eb] truncate">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-sm text-neutral-500 line-through truncate">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickView?.(product)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#d6b47c]/20 bg-[#d6b47c]/5 px-3 py-2 text-sm text-[#d6b47c] hover:bg-[#d6b47c]/15 transition-colors"
              title="Tezkor ko'rish"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/45 transition-colors"
            >
              Ko'rish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const AllProducts = () => {
  const { products, isLoading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = React.useState(categoryFromUrl || 'Barchasi');
  const [searchText, setSearchText] = React.useState('');
  const [sortBy, setSortBy] = React.useState('featured');
  const [quickViewProduct, setQuickViewProduct] = React.useState(null);
  const [compareList, setCompareList] = React.useState([]);
  const [showComparison, setShowComparison] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  // Advanced Filters
  const [priceRange, setPriceRange] = React.useState([0, 5000000]);
  const [selectedSizes, setSelectedSizes] = React.useState([]);
  const [minRating, setMinRating] = React.useState(0);
  const [inStockOnly, setInStockOnly] = React.useState(false);

  // Compute dynamic price range
  const priceBounds = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 5000000 };
    const prices = products.map(p => Number(p.price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Compute available sizes
  const availableSizes = React.useMemo(() => {
    const sizeSet = new Set();
    products.forEach(p => {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach(s => {
          const str = String(s).trim();
          if (str) sizeSet.add(str);
        });
      }
    });
    return Array.from(sizeSet).sort();
  }, [products]);

  React.useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'Barchasi');
  }, [categoryFromUrl]);

  const categories = React.useMemo(() => {
    const counts = new Map();

    products.forEach((product) => {
      if (!product.category) return;
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });

    const dynamic = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return [{ name: 'Barchasi', count: products.length }, ...dynamic];
  }, [products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    if (category === 'Barchasi') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const filteredProducts = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Barchasi' || product.category === selectedCategory;
      const searchMatch =
        q.length === 0 ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q);

      // Price range filter
      const price = Number(product.price) || 0;
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      // Size filter
      const sizeMatch = selectedSizes.length === 0 || (Array.isArray(product.sizes) && selectedSizes.some(s => product.sizes.includes(s)));

      // Rating filter
      const ratingMatch = (product.rating || 0) >= minRating;

      // Stock filter
      const stockMatch = !inStockOnly || (product.stock === undefined || product.stock > 0);

      return categoryMatch && searchMatch && priceMatch && sizeMatch && ratingMatch && stockMatch;
    });
  }, [products, selectedCategory, searchText, priceRange, selectedSizes, minRating, inStockOnly]);

  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];

    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => {
          const aDate = new Date(a.createdAt || 0).getTime();
          const bDate = new Date(b.createdAt || 0).getTime();
          return bDate - aDate;
        });
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

  const spotlightProduct = sortedProducts[0];
  const gridProducts = sortedProducts.slice(1);

  const bestRated = React.useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((p) => Number(p.rating || 0))).toFixed(1);
  }, [products]);

  const seoData = React.useMemo(() => {
    if (selectedCategory === 'Barchasi') {
      return {
        title: "Barcha ayollar kiyimlari - premium katalog | Женская одежда",
        description:
          "Luxx.uz premium katalogi: luxury kiyimlar, paltolar va eksklyuziv modellar. Каталог женской одежды премиум-класса в Ташкенте.",
        keywords:
          "luxury kiyimlar, ayollar kiyimlari, paltolar, premium katalog, женская одежда ташкент, каталог одежды",
        breadcrumbs: [{ name: 'Kiyimlar', url: '/products' }]
      };
    }

    return {
      title: `${selectedCategory} - Premium katalog | Luxx.uz`,
      description: `Luxx.uz katalogida ${selectedCategory.toLowerCase()} kolleksiyasi. Premium fason va tez yetkazib berish. ${selectedCategory} в Ташкенте.`,
      keywords: `${selectedCategory}, ayollar kiyimlari, luxx.uz, premium kiyimlar, luxury kiyimlar, купить ${selectedCategory.toLowerCase()}`,
      breadcrumbs: [
        { name: 'Kiyimlar', url: '/products' },
        { name: selectedCategory, url: `/products?category=${selectedCategory}` }
      ]
    };
  }, [selectedCategory]);

  const clearFilters = () => {
    setSearchText('');
    setSortBy('featured');
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSelectedSizes([]);
    setMinRating(0);
    setInStockOnly(false);
    handleCategoryChange('Barchasi');
  };

  const activeFilterCount = [
    selectedSizes.length > 0,
    minRating > 0,
    inStockOnly,
    priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max,
  ].filter(Boolean).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080c] pt-24 pb-16">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        breadcrumbSteps={seoData.breadcrumbs}
        canonicalPath="/products"
      />

      <div className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-[#5c3b13]/25 blur-3xl" />
      <div className="pointer-events-none absolute top-64 -right-20 h-72 w-72 rounded-full bg-[#27314a]/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171724]/95 via-[#101321]/95 to-[#15141d]/95 p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(214,180,124,0.18),transparent_35%)]" />

          <div className="relative flex flex-col gap-7">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm text-neutral-200 hover:bg-black/40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Orqaga
                </Link>

                <p className="mt-5 ml-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-6 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
                  <Crown className="w-3.5 h-3.5 text-[#f0d0a4]" />
                  Curated catalog
                </p>

                <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-[#f4f1eb]">
                  Premium mahsulotlar
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-neutral-300 leading-relaxed">
                  Sahifa premium xarid tajribasi uchun qayta yig'ildi: tez qidiruv, aqlli saralash,
                  kategoriyalar bo'yicha instant filtering va eksklyuziv kartochka dizayni.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{products.length}</p>
                  <p className="text-xs text-neutral-400 mt-1">Model</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{categories.length - 1}</p>
                  <p className="text-xs text-neutral-400 mt-1">Kategoriya</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{bestRated}</p>
                  <p className="text-xs text-neutral-400 mt-1">Top baho</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_auto] gap-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Mahsulot nomi yoki kategoriya bo'yicha qidiring"
                  className="w-full h-12 rounded-2xl border border-white/15 bg-black/25 pl-11 pr-11 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#d6b47c]/60 transition-colors"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-white/15 bg-black/40 text-neutral-300 hover:text-white"
                    aria-label="Qidiruvni tozalash"
                  >
                    <X className="w-3.5 h-3.5 mx-auto" />
                  </button>
                )}
              </label>

              <div className="grid grid-cols-2 sm:flex gap-2">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'newest', label: 'Yangi' },
                  { id: 'rating', label: 'Reyting' },
                  { id: 'price-low', label: 'Arzon narx' },
                  { id: 'price-high', label: 'Qimmat narx' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`h-12 px-4 rounded-2xl text-sm border transition-colors ${
                      sortBy === option.id
                        ? 'border-[#d6b47c]/60 bg-[#d6b47c]/15 text-[#f4f1eb]'
                        : 'border-white/15 bg-black/25 text-neutral-300 hover:text-white hover:bg-black/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Kategoriyalar
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-300 hover:text-white transition-colors"
              >
                Filterlarni tozalash
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                    selectedCategory === category.name
                      ? 'border-[#d6b47c]/70 bg-[#d6b47c]/15 text-[#f4f1eb]'
                      : 'border-white/15 bg-black/20 text-neutral-300 hover:text-white hover:bg-black/35'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-neutral-400">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-300">
              <span className="text-[#f4f1eb] font-medium">{sortedProducts.length}</span> ta natija topildi
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-wide text-neutral-300">
              <Flame className="w-3.5 h-3.5 text-orange-300" />
              Premium selection
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
              showFilters || activeFilterCount > 0
                ? 'border-[#d6b47c]/40 bg-[#d6b47c]/10 text-[#f4f1eb]'
                : 'border-white/15 bg-black/20 text-neutral-300 hover:text-white hover:bg-black/35'
            }`}
          >
            <Filter className="w-4 h-4" />
            Qo'shimcha filtrlar
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d6b47c] text-[10px] font-bold text-[#0f1014]">
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5 space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2] mb-3">Narx oralig'i</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      placeholder="Dan"
                      className="w-full rounded-lg border border-[#2d3442] bg-[#0e131d] px-3 py-2 text-xs text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
                    />
                    <span className="text-xs text-[#9aa3b2]">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      placeholder="Gacha"
                      className="w-full rounded-lg border border-[#2d3442] bg-[#0e131d] px-3 py-2 text-xs text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
                    />
                  </div>
                  <input
                    type="range"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[#d6b47c]"
                  />
                </div>
              </div>

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2] mb-3">O'lcham</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-8 min-w-[36px] rounded-lg px-2 text-xs font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                            : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2] mb-3">Minimal reyting</p>
                <div className="flex gap-1.5">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                        minRating === rating
                          ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                          : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {rating === 0 ? 'Hammasi' : (
                        <>
                          <Star className="w-3 h-3 fill-current text-amber-400" />
                          {rating}+
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2] mb-3">Mavjudligi</p>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-all ${inStockOnly ? 'bg-[#d6b47c]' : 'bg-[#2d3442]'}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition-all ${inStockOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs text-[#9aa3b2] group-hover:text-[#f4f1eb] transition-colors">Faqat mavjud</span>
                </label>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <p className="text-xs text-[#9aa3b2]">{activeFilterCount} ta faol filtr</p>
                <button
                  onClick={() => {
                    setPriceRange([priceBounds.min, priceBounds.max]);
                    setSelectedSizes([]);
                    setMinRating(0);
                    setInStockOnly(false);
                  }}
                  className="text-xs text-[#d6b47c] hover:text-[#e0c08e] transition-colors"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-[#12131c]/90 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/30">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-semibold text-[#f4f1eb]">Mahsulot topilmadi</h2>
            <p className="mt-2 text-neutral-400">Filtrlarni o'zgartirib qaytadan qidirib ko'ring.</p>
            <button
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/25 px-5 py-3 text-sm text-white hover:bg-black/40 transition-colors"
            >
              Qayta ko'rsatish
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        ) : (
          <section className="space-y-6">
            {spotlightProduct && (
              <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11131e]/95 p-3 sm:p-4 lg:p-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(214,180,124,0.13),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(76,102,156,0.18),transparent_45%)]" />

                <div className="relative grid lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] gap-4">
                  <div className="relative min-h-[300px] lg:min-h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f1017]">
                    <img
                      src={getImage(spotlightProduct)}
                      alt={spotlightProduct.name}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d14]/45 via-transparent to-[#0b0d14]/45" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0d14]/55 to-transparent" />

                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] uppercase tracking-wide text-neutral-200">
                      <Crown className="w-3.5 h-3.5 text-[#f0d0a4]" />
                      Spotlight
                    </div>
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {(spotlightProduct.rating || 0).toFixed(1)}
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Spotlight mahsulot</p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#f4f1eb]">{spotlightProduct.name}</h3>
                      <p className="mt-1 text-sm text-neutral-300">{spotlightProduct.category}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-xl font-bold text-[#f4f1eb]">{formatPrice(spotlightProduct.price)}</span>
                        <Link
                          to={`/product/${spotlightProduct.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                        >
                          Mahsulotga o'tish
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Nega tanlashmoqda</p>
                      <ul className="mt-3 space-y-2.5">
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Cheklangan drop va premium fason
                        </li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Yuqori reytingli va ko'p tanlangan model
                        </li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Kategoriya ichida eng yaxshi narx-sifat balansi
                        </li>
                      </ul>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                        <p className="text-xs uppercase tracking-wide text-neutral-400">Status</p>
                        <p className="mt-1.5 text-base font-semibold text-[#f4f1eb]">Top Selection</p>
                        <p className="mt-1 text-xs text-neutral-400">Stylistlar tavsiya qilgan model</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                        <p className="text-xs uppercase tracking-wide text-neutral-400">Category</p>
                        <p className="mt-1.5 text-base font-semibold text-[#f4f1eb]">{spotlightProduct.category}</p>
                        <p className="mt-1 text-xs text-neutral-400">Fashion capsule ichida</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d6b47c]/35 bg-gradient-to-r from-[#d6b47c]/18 to-transparent p-3.5">
                      <p className="text-sm leading-relaxed text-[#f4f1eb]">
                        Xarid tezligi va vizual preview uchun spotlight blok editorial formatda optimallashtirildi.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {gridProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {gridProducts.map((product) => (
                  <PremiumCatalogCard
                    key={product.id}
                    product={product}
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
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      {/* Comparison Bar */}
      {compareList.length > 0 && !showComparison && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#11131e]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#d6b47c]" />
              <span className="text-sm text-[#f4f1eb]">{compareList.length} ta mahsulot tanlandi</span>
              <div className="flex gap-2">
                {compareList.map((p) => (
                  <div key={p._id || p.id} className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0d1423]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompareList([])}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-[#9aa3b2] hover:bg-white/10 transition-colors"
              >
                Tozalash
              </button>
              <button
                onClick={() => setShowComparison(true)}
                disabled={compareList.length < 2}
                className="px-5 py-2 rounded-xl bg-[#d6b47c] text-black text-sm font-semibold hover:bg-[#c9a46d] transition-colors disabled:opacity-30"
              >
                Taqqoslash ({compareList.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Comparison Modal */}
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
