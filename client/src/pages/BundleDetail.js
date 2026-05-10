import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import BundleHero from '../components/BundleDetail/BundleHero';
import BundleProductCard from '../components/BundleDetail/BundleProductCard';
import BundleSavingsBreakdown from '../components/BundleDetail/BundleSavingsBreakdown';
import BundleSocialProof from '../components/BundleDetail/BundleSocialProof';
import BundleStickyBar from '../components/BundleDetail/BundleStickyBar';
import SEO from '../components/SEO';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
  };
};

export default function BundleDetail() {
  const { id } = useParams();
  const { addLookToCart } = useCart();
  const heroRef = useRef(null);

  const [bundle, setBundle] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  // { [productId]: { color: string|null, size: string|null } }

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/bundles/${id}`);
        if (!data.success) throw new Error('Bundle topilmadi');
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
        setError(err.message || 'Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBundle();
  }, [id]);

  const handleVariantChange = useCallback((productId, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...variant },
    }));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!bundle) return;
    setIsAdding(true);
    try {
      const lookForCart = {
        ...bundle,
        id: bundle._id || bundle.id,
        products,
      };
      addLookToCart(lookForCart, selectedVariants);
      toast.success(`"${bundle.title}" to'plami savatga qo'shildi! 🛍️`, { duration: 4000 });
    } catch {
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsAdding(false);
    }
  }, [bundle, products, selectedVariants, addLookToCart]);

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#d6b47c] animate-spin" />
          <p className="text-[#9aa3b2] text-sm">To'plam yuklanmoqda...</p>
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
          <h1 className="text-2xl font-semibold text-white mb-3">To'plam topilmadi</h1>
          <p className="text-[#9aa3b2] mb-8">{error || "Bu to'plam mavjud emas yoki o'chirilgan."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d6b47c] text-[#0a0a0b] font-bold hover:bg-[#c4985a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Bosh sahifaga
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
  const bundleUnitPrice = products.length > 0 ? discountedPrice / products.length : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0b] pb-32">
      {/* SEO */}
      <SEO
        title={`${bundle.title} — Maxsus To'plam | Luxx.uz`}
        description={bundle.description || `${bundle.title} to'plami. ${discountPercent}% chegirma bilan ${formatPrice(discountedPrice)} so'm.`}
        keywords={`to'plam, ${bundle.title}, ${products.map(p => p.name).join(', ')}, chegirma`}
        canonicalPath={`/bundle/${id}`}
      />

      {/* Back button */}
      <div className="fixed top-20 left-4 sm:left-8 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0b]/80 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:block">Orqaga</span>
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
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="h-px w-12 bg-[#d6b47c] mb-4" />
              <h2 className="text-3xl sm:text-4xl font-light text-white">
                To'plamdagi <span className="text-[#d6b47c]">kiyimlar</span>
              </h2>
              <p className="text-[#9aa3b2] mt-2 text-sm">
                {products.length} ta mahsulot • Har birini yaqindan ko'ring va rang/o'lcham tanlang
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#9aa3b2]">
              <span className="w-2 h-2 rounded-full bg-[#d6b47c]" />
              Rang yoki o'lcham tanlash ixtiyoriy
            </div>
          </div>

          {/* Product cards */}
          <div className="space-y-8">
            {products.map((product, index) => (
              <BundleProductCard
                key={product.id || index}
                product={product}
                index={index}
                selectedVariant={selectedVariants[product.id] || {}}
                onVariantChange={handleVariantChange}
                bundleUnitPrice={bundleUnitPrice}
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-3xl overflow-hidden border border-[#d6b47c]/20 bg-gradient-to-br from-[#d6b47c]/5 to-transparent p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-light text-white mb-2">
            Hamma narsa yoqdimi?
          </h3>
          <p className="text-[#9aa3b2] mb-8 max-w-md mx-auto">
            Bu to'plamni savatga qo'shing va {discountPercent}% tejang!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[#9aa3b2] text-xs uppercase tracking-wider">To'plam narxi</p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(discountedPrice)} <span className="text-base text-[#9aa3b2] font-light">so'm</span>
              </p>
              {savings > 0 && (
                <p className="text-emerald-400 text-xs mt-0.5">
                  {formatPrice(savings)} so'm tejaysiz
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
                  Qo'shilmoqda...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  To'plamni savatga qo'shish
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
        heroRef={heroRef}
      />
    </div>
  );
}
