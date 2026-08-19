import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Check, Heart, Search,
  ShoppingBag, SlidersHorizontal, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductListing from '../../hooks/useProductListing';
import { showCartToast } from '../../utils/toast';
import QuickViewModal from '../../components/QuickViewModal';
import MobileProductComparison from '../../components/MobileProductComparison';
import SEO from '../../components/SEO';
import './mobileProducts.css';
import './mobileProductsFilter.css';

const SORT_OPTIONS = [
  { id: 'featured', key: 'sort_recommended' },
  { id: 'newest', key: 'sort_newest' },
  { id: 'bestseller', key: 'sort_bestseller' },
  { id: 'rating', key: 'sort_rating' },
  { id: 'price-low', key: 'sort_price_low' },
  { id: 'price-high', key: 'sort_price_high' },
];

const productId = (product) => product?._id || product?.id;
const parsePrice = (value) => typeof value === 'string'
  ? Number((value.match(/\d+/g) || []).join('')) || 0
  : Number(value || 0);
const formatPrice = (value) => parsePrice(value).toLocaleString();
const getProductImage = (product) => {
  if (product?.image) return product.image;
  if (Array.isArray(product?.images) && product.images.length) {
    const first = product.images[0];
    return typeof first === 'object' ? first.url : first;
  }
  return '/placeholder.jpg';
};

const MobileProductFilter = ({
  t,
  categories,
  initialSearch,
  initialSort,
  initialCategory,
  initialNewOnly,
  onClose,
  onApply,
}) => {
  const [draft, setDraft] = useState(() => ({
    search: initialSearch,
    sort: initialSort,
    category: initialCategory,
    newOnly: initialNewOnly,
  }));

  const clearDraft = () => setDraft({
    search: '',
    sort: 'featured',
    category: t('common.all'),
    newOnly: false,
  });

  return createPortal(
    <div className="mcpf" role="dialog" aria-modal="true" aria-label="Mahsulotlarni saralash">
      <button className="mcpf__backdrop" onClick={onClose} aria-label="Yopish" />
      <section className="mcpf__panel">
        <header className="mcpf__header">
          <div><span>LUXX TANLOVI</span><h2>Mahsulotlarni<br /><em>saralash</em></h2></div>
          <button type="button" onClick={onClose} aria-label="Yopish"><X /></button>
        </header>

        <div className="mcpf__body">
          <label className="mcpf__search">
            <Search aria-hidden="true" />
            <input value={draft.search} onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))} placeholder="Mahsulot yoki kategoriya qidiring" />
          </label>

          <section className="mcpf__section">
            <div className="mcpf__section-title"><span>01</span><h3>Qanday tartibda?</h3></div>
            <div className="mcpf__sort-list">
              {SORT_OPTIONS.map((option) => {
                const selected = draft.sort === option.id;
                return <button type="button" key={option.id} onClick={() => setDraft((current) => ({ ...current, sort: option.id }))} className={selected ? 'is-selected' : ''}><span>{t(`mobileProducts.${option.key}`)}</span><i>{selected && <Check aria-hidden="true" />}</i></button>;
              })}
            </div>
          </section>

          <section className="mcpf__section">
            <div className="mcpf__section-title"><span>02</span><h3>Kategoriyani tanlang</h3></div>
            <div className="mcpf__categories">
              {categories.map((category) => <button type="button" key={category} onClick={() => setDraft((current) => ({ ...current, category }))} className={draft.category === category ? 'is-selected' : ''}><span>{category}</span>{draft.category === category && <Check aria-hidden="true" />}</button>)}
            </div>
          </section>

          <button type="button" className={`mcpf__new ${draft.newOnly ? 'is-selected' : ''}`} onClick={() => setDraft((current) => ({ ...current, newOnly: !current.newOnly }))}><span><b>Faqat yangi kolleksiya</b><small>Eng so‘nggi qo‘shilgan liboslar</small></span><i>{draft.newOnly && <Check aria-hidden="true" />}</i></button>
        </div>

        <footer className="mcpf__footer"><button type="button" onClick={clearDraft}>Tozalash</button><button type="button" onClick={() => onApply(draft)}>Natijalarni ko‘rish <ArrowDownRight /></button></footer>
      </section>
    </div>,
    document.body,
  );
};

const MobileProducts = () => {
  const { t } = useLanguage();
  const { products, isLoading, categories } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const listing = useProductListing({
    products,
    categories,
    allLabel: t('common.all'),
    categoryFromUrl: searchParams.get('category'),
    filterFromUrl: searchParams.get('filter'),
    setSearchParams: undefined,
    initialSort: 'featured',
    pageSize: 10,
  });

  const {
    selectedCategory, isNewOnly, searchText, sortBy, quickViewProduct,
    compareList, showComparison, derivedCategories, sortedProducts,
    displayedProducts, hasMore, setSearchText, setSortBy, setQuickViewProduct,
    setCompareList, setShowComparison, handleCategoryChange, handleNewOnlyChange,
    loadMore, resetFilters, toggleCompare, isCompareSelected,
  } = listing;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 32);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('mobile-products-sheet-open', showFilters);
    document.body.classList.toggle('mobile-products-sheet-open', showFilters);
    return () => {
      document.documentElement.classList.remove('mobile-products-sheet-open');
      document.body.classList.remove('mobile-products-sheet-open');
    };
  }, [showFilters]);

  const lead = displayedProducts[0];
  const gridProducts = displayedProducts.slice(1);
  const editorialNumber = useMemo(() => String(sortedProducts.length).padStart(2, '0'), [sortedProducts.length]);

  const favorite = (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(id);
  };
  const compare = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCompare(product);
  };
  const quickAdd = async (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    if ((product.colors || []).length || (product.sizes || []).length) {
      setQuickViewProduct(product);
      return;
    }
    try {
      await addToCart(product, '', '', 1);
      showCartToast({ itemName: product.name });
    } catch {
      toast.error(t('mobileProducts.error_generic'));
    }
  };

  const openFilters = () => {
    setShowFilters(true);
  };

  const closeFilters = () => {
    setShowFilters(false);
  };

  const applyFilters = (nextFilters) => {
    setSearchText(nextFilters.search);
    setSortBy(nextFilters.sort);
    handleCategoryChange(nextFilters.category);
    handleNewOnlyChange(nextFilters.newOnly);
    closeFilters();
  };

  const ProductCard = ({ product, index }) => {
    const id = productId(product);
    const isLead = index === 0;
    const isCompared = isCompareSelected(product);
    return (
      <article className={`mcp-card ${isLead ? 'mcp-card--lead' : ''}`}>
        <Link to={`/mobile/product/${id}`} className="mcp-card__link" aria-label={product.name}>
          <div className="mcp-card__image-wrap">
            <img src={getProductImage(product)} alt={product.name} loading={isLead ? 'eager' : 'lazy'} />
            <div className="mcp-card__shade" />
            <span className="mcp-card__index">{String(index + 1).padStart(2, '0')}</span>
            {product.badge && <span className="mcp-card__badge">{product.badge}</span>}
            <button type="button" onClick={(event) => favorite(event, id)} className="mcp-card__heart" aria-label={t('mobileProducts.wishlist_label')}>
              <Heart className={isFavorite(id) ? 'fill-current' : ''} />
            </button>
            {isLead && <span className="mcp-card__hero-mark">eng ko‘p<br />tanlangan</span>}
          </div>
          <div className="mcp-card__copy">
            <p>{product.category || 'LUXX to‘plami'}</p>
            <h2>{product.name}</h2>
            <div className="mcp-card__price-line">
              <strong>{formatPrice(product.price)} <small>{t('common.sum')}</small></strong>
              {product.rating > 0 && <span>★ {Number(product.rating).toFixed(1)}</span>}
            </div>
          </div>
        </Link>
        <div className="mcp-card__actions">
          <button type="button" onClick={(event) => compare(event, product)} className={isCompared ? 'is-active' : ''} aria-label={t('mobileProducts.compare_label')}>
            {isCompared ? <Check /> : <BarChart3 />}
          </button>
          <button type="button" onClick={(event) => quickAdd(event, product)} aria-label={t('mobileProducts.add_to_cart_label')}>
            {isLead ? <ArrowUpRight /> : <ShoppingBag />}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="mcp-page">
      <SEO
        title="Premium ayollar kiyimlari katalogi"
        description="Luxx.uz ayollar kiyimlari katalogi: premium kostyumlar, jaketlar, paltolar va zamonaviy to‘plamlarni Toshkent bo‘ylab yetkazib berish bilan xarid qiling."
        canonicalPath="/products"
      />
      <header className={`mcp-topbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="mcp-topbar__line"><span>LUXX / SARALANGAN LIBOSLAR</span><span>{editorialNumber} TA MAHSULOT</span></div>
        <div className="mcp-topbar__title-row"><h1>Uslubingizni <em>tanlang</em></h1><button onClick={openFilters} aria-label={t('mobileProducts.filter_title')}><SlidersHorizontal /></button></div>
        <div className="mcp-category-rail" aria-label={t('mobileProducts.category_heading')}>
          {derivedCategories.map((category) => <button key={category} onClick={() => handleCategoryChange(category)} className={selectedCategory === category ? 'is-current' : ''}>{category}</button>)}
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="mcp-loading"><i /><span>{t('mobileProducts.loading')}</span></div>
        ) : sortedProducts.length === 0 ? (
          <div className="mcp-empty">
            <span>0{editorialNumber}</span>
            <h2>{t('mobileProducts.no_results')}</h2>
            <button onClick={resetFilters}>{t('mobileProducts.clear_filters')}</button>
          </div>
        ) : (
          <>
            {lead && <section className="mcp-lead-stage"><ProductCard product={lead} index={0} /></section>}
            <section className="mcp-collection-head">
              <span>YANGI TANLOVLAR / {editorialNumber}</span>
              <h2>Har kuningiz<br /><em>o‘zgacha.</em></h2>
            </section>
            <section className="mcp-grid">
              {gridProducts.map((product, index) => (
                <ProductCard key={productId(product)} product={product} index={index + 1} />
              ))}
            </section>
            {hasMore && (
              <button type="button" onClick={loadMore} className="mcp-more">
                <span>YANA LIBOSLARNI KO‘RISH</span>
                <ArrowDownRight />
              </button>
            )}
          </>
        )}
      </main>

      {compareList.length > 0 && !showComparison && (
        <aside className="mcp-compare-dock">
          <div className="mcp-compare-dock__faces">{compareList.map((product) => <img key={productId(product)} src={getProductImage(product)} alt="" />)}</div>
          <p><span>TAQQOSLASH UCHUN</span>{compareList.length} {t('mobileProducts.comparing_count')}</p>
          <button onClick={() => setCompareList([])}>{t('mobileProducts.clear_short')}</button>
          <button onClick={() => setShowComparison(true)} disabled={compareList.length < 2}>{t('mobileProducts.compare')} <ArrowUpRight /></button>
        </aside>
      )}

      {showFilters && (
        <MobileProductFilter
          t={t}
          categories={derivedCategories}
          initialSearch={searchText}
          initialSort={sortBy}
          initialCategory={selectedCategory}
          initialNewOnly={isNewOnly}
          onClose={closeFilters}
          onApply={applyFilters}
        />
      )}
      <QuickViewModal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} productPathPrefix="/mobile" />
      {showComparison && <MobileProductComparison products={compareList} productPathPrefix="/mobile" onClose={() => { setShowComparison(false); setCompareList([]); }} />}
    </div>
  );
};

export default MobileProducts;
