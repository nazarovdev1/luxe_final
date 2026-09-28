import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Check, ChevronDown, ArrowUpDown, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import QuickViewModal from '../components/QuickViewModal';
import ProductComparison from '../components/ProductComparison';
import SEO from '../components/SEO';
import PremiumProductCard from '../components/PremiumProductCard';
import FilterDrawer from '../components/FilterDrawer';
import './allProductsEditorial.css';

gsap.registerPlugin(ScrollTrigger);

const PAGE_COPY = {
  uz: { eyebrow: 'LUXX · WARDROBE INDEX 2026', overline: 'Kolleksiya / 01—03', title: 'Private\nwardrobe.', lead: 'Har bir model alohida tanlangan. Ortiqcha shovqinsiz, aniq xarakter va sizga xizmat qiladigan qulaylik.', explore: 'Katalogga o‘tish', pieces: 'model', edits: 'yo‘nalish', archive: 'Toshkent · Atelier tanlovi', catalogue: 'Kolleksiya', found: 'ta model topildi', newOnly: 'Faqat yangi' },
  ru: { eyebrow: 'LUXX · WARDROBE INDEX 2026', overline: 'Коллекция / 01—03', title: 'Private\nwardrobe.', lead: 'Каждая модель выбрана отдельно: точный характер, спокойная выразительность и комфорт, который служит вам.', explore: 'Перейти в каталог', pieces: 'моделей', edits: 'направлений', archive: 'Ташкент · Выбор ателье', catalogue: 'Коллекция', found: 'моделей найдено', newOnly: 'Только новое' },
  en: { eyebrow: 'LUXX · WARDROBE INDEX 2026', overline: 'Collection / 01—03', title: 'Private\nwardrobe.', lead: 'Every piece is selected individually: exact character, quiet presence and comfort designed to serve you.', explore: 'Enter the catalogue', pieces: 'pieces', edits: 'edits', archive: 'Tashkent · Atelier selection', catalogue: 'Collection', found: 'pieces found', newOnly: 'New only' },
};

const getProductImage = (product, fallback) => {
  if (!product) return fallback;
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === 'object' ? (first.url || fallback) : first;
  }
  return fallback;
};

const AllProducts = () => {
  const { products, isLoading } = useProducts();
  const { t, language } = useLanguage();
  const copy = PAGE_COPY[language] || PAGE_COPY.uz;
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
  const [visibleCount, setVisibleCount] = useState(12);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const loadMoreRef = useRef(null);
  const pageRef = useRef(null);
  const allLabel = t('products.all');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || allLabel);
    setIsNewOnly(filterFromUrl === 'new');
  }, [categoryFromUrl, filterFromUrl, allLabel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current || isLoading) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((previous) => previous + 12);
    }, { threshold: 0.1 });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading]);

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((product) => {
      if (product.category) counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });
    const dynamic = Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return [{ name: allLabel, count: products.length }, ...dynamic];
  }, [products, allLabel]);

  const updateUrl = useCallback((category, newOnly) => {
    const params = {};
    if (category !== allLabel) params.category = category;
    if (newOnly) params.filter = 'new';
    setSearchParams(params);
  }, [allLabel, setSearchParams]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setVisibleCount(12);
    updateUrl(category, isNewOnly);
  }, [isNewOnly, updateUrl]);

  const handleNewOnlyChange = () => {
    const next = !isNewOnly;
    setIsNewOnly(next);
    setVisibleCount(12);
    updateUrl(selectedCategory, next);
  };

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = selectedCategory === allLabel || product.category === selectedCategory;
      const newMatch = !isNewOnly || product.isNewCollection === true;
      const searchMatch = !query || (product.name || '').toLowerCase().includes(query) || (product.category || '').toLowerCase().includes(query);
      return categoryMatch && newMatch && searchMatch;
    });
  }, [products, selectedCategory, searchText, allLabel, isNewOnly]);

  const sortedProducts = useMemo(() => {
    const productScore = (product) => {
      const badge = (product.badge || '').toUpperCase();
      return (product.rating || 0) * 100 + (badge === 'BESTSELLER' ? 30 : badge === 'NEW' ? 20 : 10);
    };
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'newest': return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'price-low': return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high': return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating': return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: return list.sort((a, b) => productScore(b) - productScore(a));
    }
  }, [filteredProducts, sortBy]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedProducts.length;

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      const hero = root.querySelector('.wardrobe-hero');
      if (hero) {
        gsap.to(hero.querySelectorAll('.wardrobe-runway img'), {
          yPercent: -7, scale: 1.11, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
        });
        gsap.to(hero.querySelector('.wardrobe-hero__masthead'), {
          y: -68, autoAlpha: 0.3, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'center center', end: 'bottom top', scrub: 0.8 },
        });
      }

      const intro = root.querySelector('.catalogue-intro');
      if (intro) gsap.fromTo(intro.querySelectorAll('p, h2'),
        { y: 58, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: intro, start: 'top 80%', once: true } });
      const toolbar = root.querySelector('.catalogue-toolbar');
      if (toolbar) gsap.fromTo(toolbar,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: toolbar, start: 'top 92%', once: true } });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || isLoading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      root.querySelectorAll('.catalogue-product-cell').forEach((card, index) => {
        gsap.fromTo(card, { y: 54, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.85, delay: (index % 4) * 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        });
      });
    }, root);
    return () => context.revert();
  }, [isLoading, selectedCategory, sortBy, visibleCount, sortedProducts.length]);
  const heroItems = [
    { product: products[0], image: getProductImage(products[0], '/editorial/private-edit-tailoring.png'), fallbackName: 'The Signature Line', fallbackCategory: 'Tailoring' },
    { product: products[1], image: getProductImage(products[1], '/editorial/private-edit-evening.png'), fallbackName: 'Evening Architecture', fallbackCategory: 'Private Edit' },
    { product: products[2], image: getProductImage(products[2], '/editorial/story-presence-v2.png'), fallbackName: 'Quiet Presence', fallbackCategory: 'Atelier' },
  ];
  const seoData = useMemo(() => ({
    title: selectedCategory === allLabel ? 'Premium ayollar kiyimlari | Luxx.uz' : `${selectedCategory} | Luxx.uz`,
    description: selectedCategory === allLabel ? 'Luxx.uz premium katalogi: luxury kiyimlar, paltolar va eksklyuziv modellar.' : `Luxx.uz katalogida ${selectedCategory.toLowerCase()} kolleksiyasi.`,
    keywords: selectedCategory === allLabel ? 'luxury kiyimlar, ayollar kiyimlari, paltolar, premium katalog' : `${selectedCategory}, ayollar kiyimlari, luxx.uz`,
    breadcrumbs: selectedCategory === allLabel ? [{ name: t('products.clothing'), url: '/products' }] : [{ name: t('products.clothing'), url: '/products' }, { name: selectedCategory, url: `/products?category=${selectedCategory}` }],
  }), [selectedCategory, allLabel, t]);
  const sortOptions = [
    { label: t('products.sortFeatured'), value: 'featured' },
    { label: t('products.sortNewest'), value: 'newest' },
    { label: t('products.sortRating'), value: 'rating' },
    { label: t('products.sortPriceLow'), value: 'price-low' },
    { label: t('products.sortPriceHigh'), value: 'price-high' },
  ];

  return (
    <main ref={pageRef} className="catalogue-page">
      <SEO title={seoData.title} description={seoData.description} keywords={seoData.keywords} breadcrumbSteps={seoData.breadcrumbs} canonicalPath="/products" structuredData={{ '@context': 'https://schema.org', '@type': 'ItemList', '@id': 'https://luxx.uz/products#item-list', name: selectedCategory === allLabel ? 'Barcha mahsulotlar' : `${selectedCategory} mahsulotlari`, url: 'https://luxx.uz/products', numberOfItems: sortedProducts.length, itemListElement: displayedProducts.slice(0, 20).map((product, index) => ({ '@type': 'ListItem', position: index + 1, url: `https://luxx.uz/product/${product.id}`, name: product.name })) }} />

      <section className="wardrobe-hero" aria-labelledby="catalogue-title">
        <header className="wardrobe-hero__top"><p className="catalogue-eyebrow"><span />{copy.eyebrow}</p><span>{copy.archive}</span></header>
        <div className="wardrobe-hero__masthead">
          <div><p>{copy.overline}</p><h1 id="catalogue-title">{copy.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1></div>
          <aside><span>001 / EDITOR'S NOTE</span><p>{copy.lead}</p></aside>
        </div>
        <div className="wardrobe-runway">
          {heroItems.map((item, index) => (
            <figure key={item.product?.id || item.fallbackName}>
              <img src={item.image} alt={item.product?.name || item.fallbackName} fetchPriority={index === 0 ? 'high' : 'auto'} />
              <figcaption><span>{String(index + 1).padStart(2, '0')}</span><div><small>{item.product?.category || item.fallbackCategory}</small><strong>{item.product?.name || item.fallbackName}</strong></div></figcaption>
            </figure>
          ))}
        </div>
        <footer className="wardrobe-hero__foot"><div className="catalogue-hero__stats"><span><strong>{products.length}</strong>{copy.pieces}</span><span><strong>{Math.max(categories.length - 1, 0)}</strong>{copy.edits}</span></div><button type="button" onClick={() => document.getElementById('catalogue-grid')?.scrollIntoView({ behavior: 'smooth' })}>{copy.explore}<ArrowDown aria-hidden="true" /></button></footer>
      </section>

      <section id="catalogue-grid" className="catalogue-body">
        <header className="catalogue-intro"><div><p>02 / {copy.catalogue}</p><h2>{selectedCategory === allLabel ? t('products.premiumCatalog') : selectedCategory}</h2></div><p>{copy.lead}</p></header>
        <div className="catalogue-toolbar">
          <div className="catalogue-categories" role="list" aria-label={copy.catalogue}>
            {categories.map((category) => <button type="button" key={category.name} onClick={() => handleCategoryChange(category.name)} className={selectedCategory === category.name ? 'is-active' : ''}>{category.name}<sup>{String(category.count).padStart(2, '0')}</sup></button>)}
          </div>
          <div className="catalogue-tools">
            <button type="button" className={`catalogue-new-toggle ${isNewOnly ? 'is-active' : ''}`} onClick={handleNewOnlyChange}><span aria-hidden="true" />{copy.newOnly}</button>
            <button type="button" onClick={() => setIsFilterOpen(true)}><SlidersHorizontal aria-hidden="true" />{t('products.filters')}</button>
            <div className="catalogue-sort" ref={sortRef}>
              <button type="button" onClick={() => setIsSortOpen((open) => !open)} aria-expanded={isSortOpen}><ArrowUpDown aria-hidden="true" />{sortOptions.find((option) => option.value === sortBy)?.label}<ChevronDown className={isSortOpen ? 'is-open' : ''} aria-hidden="true" /></button>
              {isSortOpen && <div className="catalogue-sort__menu">{sortOptions.map((option) => <button type="button" key={option.value} onClick={() => { setSortBy(option.value); setIsSortOpen(false); }} className={sortBy === option.value ? 'is-active' : ''}>{option.label}{sortBy === option.value && <Check aria-hidden="true" />}</button>)}</div>}
            </div>
          </div>
        </div>

        {(searchText || selectedCategory !== allLabel || isNewOnly) && <div className="catalogue-active-filters"><span>{sortedProducts.length} {copy.found}</span>{searchText && <button type="button" onClick={() => setSearchText('')}>“{searchText}” <X aria-hidden="true" /></button>}{selectedCategory !== allLabel && <button type="button" onClick={() => handleCategoryChange(allLabel)}>{selectedCategory} <X aria-hidden="true" /></button>}</div>}

        {isLoading ? <div className="catalogue-loading-grid" aria-label={t('products.loading')}>{Array.from({ length: 8 }, (_, index) => <div key={index}><span /></div>)}</div> : sortedProducts.length === 0 ? <div className="catalogue-empty"><Search aria-hidden="true" /><p>00 / ARCHIVE</p><h3>{t('products.noProductsFound')}</h3><span>{t('products.noProductsHint')}</span><button type="button" onClick={() => { setSearchText(''); setIsNewOnly(false); handleCategoryChange(allLabel); }}>{t('products.clearFilters')}</button></div> : <><div className="catalogue-product-grid">{displayedProducts.map((product, index) => <div className="catalogue-product-cell" key={product.id} style={{ '--card-index': index }}><PremiumProductCard product={product} index={index} priority={index < 4} onQuickView={setQuickViewProduct} onCompare={(item) => { setCompareList((current) => { const exists = current.find((entry) => (entry._id || entry.id) === (item._id || item.id)); if (exists) return current.filter((entry) => (entry._id || entry.id) !== (item._id || item.id)); return current.length >= 3 ? current : [...current, item]; }); }} isCompareSelected={compareList.some((item) => (item._id || item.id) === (product._id || product.id))} /></div>)}</div>{hasMore && <div ref={loadMoreRef} className="catalogue-loader"><span />{t('products.loading')}</div>}</>}
      </section>

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} categories={categories} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} searchText={searchText} onSearchChange={setSearchText} sortBy={sortBy} onSortChange={setSortBy} />
      <QuickViewModal isOpen={Boolean(quickViewProduct)} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} />
      {compareList.length > 0 && !showComparison && <aside className="catalogue-compare-bar"><div className="catalogue-compare-bar__images">{compareList.map((product) => <img key={product._id || product.id} src={getProductImage(product, '/placeholder.jpg')} alt="" />)}</div><p><strong>{String(compareList.length).padStart(2, '0')}</strong>{t('products.comparing')}</p><button type="button" onClick={() => setCompareList([])}>{t('products.clear')}</button><button type="button" disabled={compareList.length < 2} onClick={() => setShowComparison(true)}>{t('products.compare')}</button></aside>}
      {showComparison && <ProductComparison products={compareList} onClose={() => { setShowComparison(false); setCompareList([]); }} />}
    </main>
  );
};

export default AllProducts;
