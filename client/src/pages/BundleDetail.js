import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { showCartToast } from '../utils/toast';
import BundleHero from '../components/BundleDetail/BundleHero';
import BundleProductCard from '../components/BundleDetail/BundleProductCard';
import BundleSavingsBreakdown from '../components/BundleDetail/BundleSavingsBreakdown';
import BundleSocialProof from '../components/BundleDetail/BundleSocialProof';
import BundleStickyBar from '../components/BundleDetail/BundleStickyBar';
import SEO from '../components/SEO';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Pick a localized field from a server payload. The API may return either a
// plain string or a `{ uz, ru, en }` map; fall back to other locales, then to
// the string itself, so we never render the raw key/path.
const localize = (value, lang) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value[lang]) return value[lang];
    if (value.uz) return value.uz;
    if (value.ru) return value.ru;
    if (value.en) return value.en;
  }
  return '';
};

const toVariantList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.trim().split(/[\s,]+/).filter(Boolean);
  return [];
};

// Normalize a single product from the bundle API response
const normalizeProduct = (p) => {
  let image = '';
  if (p.image && typeof p.image === 'string') {
    image = p.image;
  } else if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    image = typeof first === 'object' ? (first.url || '') : first;
  }
  return {
    ...p,
    id: p.id || p._id,
    image,
    price: Number(p.price) || 0,
    colors: toVariantList(p.colors),
    sizes: toVariantList(p.sizes),
  };
};

export default function BundleDetail() {
  const { id } = useParams();
  const { addLookToCart } = useCart();
  const { t, language } = useLanguage();
  const heroRef = useRef(null);
  const pageRef = useRef(null);

  const [bundle, setBundle] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  // { [productId]: { color: string|null, size: string|null } }

  useGSAP(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const cards = gsap.utils.toArray('.bundle-product-card');
    gsap.from('.bundle-social-proof', {
      y: 46,
      clipPath: 'inset(0 0 18% 0)',
      duration: 0.82,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.bundle-social-proof', start: 'top 86%', once: true },
    });
    gsap.from('.bundle-selection-heading', {
      y: 34,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.bundle-selection-section', start: 'top 74%', once: true },
    });
    cards.forEach((card) => {
      const visual = card.querySelector('.bundle-product-visual');
      const details = card.querySelector('.bundle-product-details');
      const cardTimeline = gsap.timeline({
        defaults: { ease: 'power4.out' },
        scrollTrigger: {
          trigger: card,
          start: 'top 82%',
          toggleActions: 'restart none none reset',
        },
      });
      cardTimeline
        .from(visual, { y: 76, scale: 0.97, duration: 0.82 })
        .from(details, { y: 48, x: 24, duration: 0.72 }, 0.13);
    });
    gsap.from('.bundle-savings-card, .bundle-final-cta > div', {
      y: 44,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.bundle-savings-section', start: 'top 75%', once: true },
    });
  }, { scope: pageRef, dependencies: [loading], revertOnUpdate: true });

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/bundles/${id}`);
        if (!data.success) throw new Error(t('bundleDetail.errorNotFound'));
        const b = data.data;
        const normalized = (b.products || []).map(normalizeProduct);
        setBundle(b);
        setProducts(normalized);
        // Initialize empty variants
        const initVariants = {};
        normalized.forEach(p => { initVariants[p.id] = { color: null, size: null }; });
        setSelectedVariants(initVariants);
      } catch (err) {
        console.error(err);
        setError(err.message || t('bundleDetail.errorGeneric'));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBundle();
  }, [id, t]);

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...variant },
    }));
  }, []);

  const selectionIssues = useMemo(() => {
    if (!products.length) return [];

    const issues = [];
    products.forEach((p) => {
      const selected = selectedVariants?.[p.id] || {};

      if (Array.isArray(p.colors) && p.colors.length > 0 && !selected.color) {
        issues.push({ productName: p.name, missing: 'color' });
      }

      // BundleProductCard always renders sizes (falls back to default list),
      // so require size selection for every product in the bundle.
      if (!selected.size) {
        issues.push({ productName: p.name, missing: 'size' });
      }
    });

    return issues;
  }, [products, selectedVariants]);

  const canAddToCart = selectionIssues.length === 0;

  const handleAddToCart = useCallback(async () => {
    if (!bundle) return;

    if (!canAddToCart) {
      const first = selectionIssues[0];
      const msg = first?.missing === 'color'
        ? t('bundleDetail.toastColorMissing', { name: first.productName })
        : t('bundleDetail.toastSizeMissing', { name: first.productName });
      toast.error(msg);
      return;
    }

    setIsAdding(true);
    try {
      const lookForCart = {
        ...bundle,
        id: bundle._id || bundle.id,
        products,
      };
      addLookToCart(lookForCart, selectedVariants);
      showCartToast({
        title: t('bundleDetail.toastAddTitle'),
        itemName: localize(bundle.title, language),
        meta: t('bundleDetail.toastItems', { count: products.length }),
      });
    } catch {
      toast.error(t('bundleDetail.toastError'));
    } finally {
      setIsAdding(false);
    }
  }, [bundle, products, selectedVariants, addLookToCart, canAddToCart, selectionIssues, t]);

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#d6b47c] animate-spin" />
          <p className="text-[#9aa3b2] text-sm">{t('bundleDetail.loading')}</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────
  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-6">📦</p>
          <h1 className="text-2xl font-semibold text-white mb-3">{t('bundleDetail.notFoundTitle')}</h1>
          <p className="text-[#9aa3b2] mb-8">{error || t('bundleDetail.notFoundBody')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d6b47c] text-[#0a0a0b] font-bold hover:bg-[#c4985a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('bundleDetail.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // ── Computed values ────────────────────────────────────
  const originalPrice = bundle.originalPrice || products.reduce((s, p) => s + p.price, 0);
  const discountedPrice = bundle.discountedPrice || originalPrice;
  const savings = originalPrice - discountedPrice;
  const discountPercent = bundle.discountType === 'percentage'
    ? bundle.discountValue
    : originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
  const bundlePriceRatio = originalPrice > 0 ? discountedPrice / originalPrice : 1;

  // Localized title/description that follow the active UI language
  const localizedTitle = localize(bundle.title, language);
  const localizedDescription = localize(bundle.description, language);

  return (
    <div ref={pageRef} className="bundle-page min-h-screen pb-32">
      {/* SEO */}
      <SEO
        title={localizedTitle ? `${localizedTitle} | Luxx.uz` : t('bundleDetail.loading')}
        description={localizedDescription}
        keywords={`to'plam, ${localizedTitle}, ${products.map(p => p.name).join(', ')}, chegirma`}
        canonicalPath={`/bundle/${id}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: localizedTitle,
          description: localizedDescription,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'UZS',
            price: discountedPrice,
            availability: 'https://schema.org/InStock',
          },
        }}
      />

      {/* Back button */}
      <div className="bundle-back fixed top-20 left-4 sm:left-8 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0b]/80 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:block">{t('bundleDetail.back')}</span>
        </Link>
      </div>

      {/* ── HERO ───────────────────────────────────────── */}
      <div ref={heroRef}>
        <BundleHero
          bundle={bundle}
          products={products}
          discountPercent={discountPercent}
        />
      </div>

      {/* ── SOCIAL PROOF ───────────────────────────────── */}
      <BundleSocialProof />

      {/* ── PRODUCTS SECTION ───────────────────────────── */}
      <section className="bundle-selection-section py-10">
        <div className="bundle-selection-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="bundle-selection-heading mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="h-px w-12 bg-[#d6b47c] mb-4" />
              <h2 className="text-3xl sm:text-4xl font-light text-white">
                {t('bundleDetail.sectionHeaderTitle1')} <span className="text-[#d6b47c]">{t('bundleDetail.sectionHeaderTitle2')}</span>
              </h2>
              <p className="text-[#9aa3b2] mt-2 text-sm">
                {products.length} {t('bundleDetail.sectionHeaderSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#9aa3b2]">
              <span className="w-2 h-2 rounded-full bg-[#d6b47c]" />
              {t('bundleDetail.variantRequired')}
            </div>
          </div>

          {/* Product cards */}
          <div className="bundle-selection-list space-y-8">
            {products.map((product, index) => (
              <BundleProductCard
                key={product.id || index}
                product={product}
                index={index}
                selectedVariant={selectedVariants[product.id] || {}}
                onVariantChange={handleVariantChange}
                bundleUnitPrice={Math.round(product.price * bundlePriceRatio)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SAVINGS BREAKDOWN ──────────────────────────── */}
      <BundleSavingsBreakdown
        originalPrice={originalPrice}
        discountedPrice={discountedPrice}
        discountPercent={discountPercent}
        products={products}
      />

      {/* ── BOTTOM CTA (for mobile / no sticky) ────────── */}
      <div className="bundle-final-cta max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-3xl overflow-hidden border border-[#d6b47c]/20 bg-gradient-to-br from-[#d6b47c]/5 to-transparent p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-light text-white mb-2">
            {t('bundleDetail.ctaTitle')}
          </h3>
          <p className="text-[#9aa3b2] mb-8 max-w-md mx-auto">
            {t('bundleDetail.ctaBody', { percent: discountPercent })}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[#9aa3b2] text-xs uppercase tracking-wider">{t('bundleDetail.bundlePriceLabel')}</p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(discountedPrice)} <span className="text-base text-[#9aa3b2] font-light">UZS</span>
              </p>
              {savings > 0 && (
                <p className="text-emerald-400 text-xs mt-0.5">
                  {t('bundleDetail.ctaSavings', { amount: formatPrice(savings) })}
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#d6b47c] to-[#c4985a] text-[#0a0a0b] font-bold text-base transition-all hover:shadow-2xl hover:shadow-[#d6b47c]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('bundleDetail.adding')}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  {t('bundleDetail.addToCart')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── STICKY BAR ─────────────────────────────────── */}
      <BundleStickyBar
        bundle={bundle}
        discountedPrice={discountedPrice}
        originalPrice={originalPrice}
        discountPercent={discountPercent}
        products={products}
        isAdding={isAdding}
        onAddToCart={handleAddToCart}
        canAddToCart={canAddToCart}
        heroRef={heroRef}
      />
    </div>
  );
}
