import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Eye,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductListing from '../../hooks/useProductListing';
import QuickViewModal from '../../components/QuickViewModal';
import MobileProductComparison from '../../components/MobileProductComparison';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Tavsiya' },
  { id: 'newest', label: 'Yangilari' },
  { id: 'bestseller', label: 'Ommabop' },
  { id: 'rating', label: 'Reyting' },
  { id: 'price-low', label: "Arzonrog'i" },
  { id: 'price-high', label: "Qimmatrog'i" },
];

const parsePrice = (value) => {
  if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
  return Number(value || 0);
};

const formatPrice = (value) => `${parsePrice(value).toLocaleString()}`;

const getProductImage = (product) => {
  if (!product) return '/placeholder.jpg';
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === 'object' ? first.url : first;
  }
  return '/placeholder.jpg';
};

const MobileProducts = () => {
  const { t } = useLanguage();
  const { products, isLoading, categories } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    selectedCategory,
    isNewOnly,
    searchText,
    sortBy,
    quickViewProduct,
    compareList,
    showComparison,
    derivedCategories,
    sortedProducts,
    displayedProducts,
    hasMore,
    setSearchText,
    setSortBy,
    setQuickViewProduct,
    setCompareList,
    setShowComparison,
    handleCategoryChange,
    handleNewOnlyChange,
    loadMore,
    resetFilters,
    toggleCompare,
    isCompareSelected,
  } = useProductListing({
    products,
    categories,
    allLabel: 'Barchasi',
    categoryFromUrl: searchParams.get('category'),
    filterFromUrl: searchParams.get('filter'),
    setSearchParams,
    initialSort: 'featured',
    pageSize: 10,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString());
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!isLoading && products.length > 0) {
      const savedScroll = sessionStorage.getItem('mobileProductsScroll');
      if (savedScroll) {
        setTimeout(() => window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' }), 0);
      }
    }
  }, [isLoading, products.length]);

  useEffect(() => {
    const overflow = showFilters ? 'hidden' : '';
    document.body.style.overflow = overflow;
    document.documentElement.style.overflow = overflow;
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showFilters]);

  useEffect(() => {
    if (!loadMoreRef.current || isLoading || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.2 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const handleFavoriteToggle = (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(productId);
  };

  const handleQuickAdd = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    if ((product.colors || []).length > 0 || (product.sizes || []).length > 0) {
      setQuickViewProduct(product);
      return;
    }

    try {
      await addToCart(product, '', '', 1);
      toast.success(`${product.name} savatga qo'shildi!`);
    } catch {
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const handleCompareClick = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCompare(product);
  };

  const ProductBadge = ({ badge }) => {
    if (!badge) return null;
    const isNew = (badge || '').toUpperCase() === 'NEW';
    return (
      <span className={`absolute left-3 top-3 z-10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isNew ? 'bg-white text-black' : 'bg-black/60 text-white backdrop-blur-sm'}`}>
        {badge}
      </span>
    );
  };

  const ProductTile = ({ product, lead = false }) => {
    const selectedForCompare = isCompareSelected(product);
    return (
      <Link
        to={`/mobile/product/${product.id}`}
        state={{ fromMobileList: true }}
        onClick={() => sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString())}
        className={`group block ${lead ? 'mb-6' : 'mb-6'}`}
      >
        <div className={`relative overflow-hidden bg-[#0a0a0a] ${lead ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-active:scale-105"
            loading={lead ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
          <ProductBadge badge={product.badge} />

          <button
            onClick={(event) => handleFavoriteToggle(event, product.id)}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-md active:scale-95"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`} />
          </button>

          <div className={`absolute right-3 z-10 flex gap-2 ${lead ? 'bottom-[88px] flex-col' : 'bottom-3'}`}>
            <button
              onClick={(event) => handleCompareClick(event, product)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md active:scale-95 ${selectedForCompare ? 'border-[#d6b47c]/50 bg-[#d6b47c] text-black' : 'border-white/10 bg-black/45 text-white'}`}
              aria-label="Compare"
            >
              {selectedForCompare ? <Check className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            </button>
          </div>

          {lead && (
            <div className="absolute bottom-0 left-0 w-full p-5">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">{product.category}</p>
              <h2 className="mb-2 text-2xl font-light leading-tight text-white">{product.name}</h2>
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-white">{formatPrice(product.price)} {t('common.sum')}</p>
                <button className="flex h-10 w-10 items-center justify-center bg-white text-black active:scale-95">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!lead && (
          <div className="px-1 pt-3">
            <p className="truncate pr-2 text-[10px] font-medium uppercase tracking-widest text-gray-500">{product.category}</p>
            <h3 className="mb-1.5 mt-1 min-h-[3em] text-sm font-normal leading-normal text-white line-clamp-3">{product.name}</h3>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">{formatPrice(product.price)} {t('common.sum')}</p>
              <button
                onClick={(event) => handleQuickAdd(event, product)}
                className="bg-white/10 p-2 active:bg-white/20"
                aria-label="Add to cart"
              >
                <ShoppingBag className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </Link>
    );
  };

  const FilterSheet = () => {
    if (!showFilters) return null;

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
        <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0a0a0a] p-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-light tracking-wide text-white">Filter</h2>
            <button onClick={() => setShowFilters(false)} className="p-2 text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Mahsulot yoki kategoriya..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-[16px] text-white placeholder:text-gray-500 outline-none focus:border-[#d6b47c]/50"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">Saralash</h3>
              <div className="grid grid-cols-2 gap-3">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`border px-4 py-3 text-left text-sm ${sortBy === option.id ? 'border-white bg-white/5 text-white' : 'border-white/10 text-white/60'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">Kategoriya</h3>
              <div className="flex flex-wrap gap-2">
                {derivedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`border px-4 py-2 text-xs uppercase tracking-wide ${selectedCategory === category ? 'border-white bg-white text-black' : 'border-white/10 text-white/60'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleNewOnlyChange(!isNewOnly)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${isNewOnly ? 'border-[#d6b47c]/40 bg-[#d6b47c]/10 text-[#d6b47c]' : 'border-white/10 bg-white/[0.03] text-white/70'}`}
            >
              <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Faqat yangi kolleksiya</span>
              {isNewOnly && <Check className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-8 flex gap-4 border-t border-white/10 pt-6">
            <button onClick={resetFilters} className="flex-1 py-4 text-xs font-medium uppercase tracking-widest text-white/60">
              Tozalash
            </button>
            <button onClick={() => setShowFilters(false)} className="flex-1 bg-white py-4 text-xs font-bold uppercase tracking-widest text-black">
              Natijalarni ko'rish
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const lead = displayedProducts[0] || null;
  const feedProducts = displayedProducts.slice(1);

  return (
    <div className="min-h-screen bg-black pb-28 text-white">
      <header className={`sticky top-0 z-40 border-b bg-black/85 backdrop-blur-md transition-colors ${isScrolled ? 'border-white/10' : 'border-transparent'}`}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-light uppercase tracking-widest">Shop <span className="font-serif text-lg italic lowercase text-white/70">collection</span></h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/40">{sortedProducts.length} items</p>
          </div>
          <button onClick={() => setShowFilters(true)} className="flex h-10 w-10 items-center justify-center border border-white/10">
            <SlidersHorizontal className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto px-5 pb-4 scrollbar-hide">
          {derivedCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`whitespace-nowrap border-b pb-1 text-xs uppercase tracking-widest ${selectedCategory === category ? 'border-white text-white' : 'border-transparent text-white/40'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-2">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent" />
            <p className="mt-4 text-xs uppercase tracking-widest text-white/40">Loading Collection...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <p className="mb-4 text-2xl font-serif italic text-white/20">No results found</p>
            <button onClick={resetFilters} className="border-b border-white pb-0.5 text-xs uppercase tracking-widest">Clear Filters</button>
          </div>
        ) : (
          <>
            {lead && <ProductTile product={lead} lead />}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4">
              {feedProducts.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d6b47c]/30 border-t-[#d6b47c]" />
              </div>
            )}
          </>
        )}
      </main>

      {compareList.length > 0 && !showComparison && (
        <div className="fixed bottom-24 left-3 right-3 z-50 rounded-3xl border border-white/10 bg-[#0f0f0f]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {compareList.map((product) => (
                  <img key={product.id} src={getProductImage(product)} alt="" className="h-10 w-10 rounded-full border-2 border-[#0f0f0f] object-cover" />
                ))}
              </div>
              <p className="text-xs font-semibold text-white">{compareList.length} ta taqqoslanmoqda</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCompareList([])} className="px-2 text-xs text-white/50">Clear</button>
              <button
                onClick={() => setShowComparison(true)}
                disabled={compareList.length < 2}
                className="rounded-2xl bg-[#d6b47c] px-4 py-2 text-xs font-bold uppercase text-black disabled:opacity-40"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      <FilterSheet />
      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        productPathPrefix="/mobile"
      />
      {showComparison && (
        <MobileProductComparison
          products={compareList}
          productPathPrefix="/mobile"
          onClose={() => {
            setShowComparison(false);
            setCompareList([]);
          }}
        />
      )}
    </div>
  );
};

export default MobileProducts;
