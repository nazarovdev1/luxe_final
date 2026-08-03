import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  ArrowLeft,
  ShoppingCart,
  Loader2,
  Sparkles,
  Gem,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// Contexts
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import { showCartToast } from '../utils/toast';
import { trackEvent, productAnalyticsPayload } from '../utils/analytics';
import { findVariant, getProductOptions } from '../utils/productVariants';

// Sub-components
import PremiumGallery from '../components/ProductView/PremiumGallery';
import ProductInfoPanel from '../components/ProductView/ProductInfoPanel';
import FloatingCTA from '../components/ProductView/FloatingCTA';
import RelatedProducts from '../components/ProductView/RelatedProducts';
import ReviewsSection from '../components/ProductView/ReviewsSection';
import CraftsmanshipSpotlight from '../components/ProductView/CraftsmanshipSpotlight';
import CompleteTheLook from '../components/ProductView/CompleteTheLook';
import QuickOrderModal from '../components/ProductView/QuickOrderModal';
import SizeGuideModal from '../components/SizeGuideModal';

// Shared components
import SEO from '../components/SEO';
import CustomerPhotoReviews from '../components/CustomerPhotoReviews';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

// ── Loading Animation ──────────────────────────────────────
const DotLoader = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <div className="absolute h-full w-full rounded-full border-2 border-[#c9a96e]/20 border-t-[#c9a96e] animate-spin" />
      <Sparkles className="h-6 w-6 text-[#c9a96e] animate-pulse" />
    </div>
    <span className="text-xs uppercase tracking-[0.25em] font-black text-[#c9a96e]">
      LUXX COLLECTIONS
    </span>
  </div>
);

// ════════════════════════════════════════════════════════════
// ProductView — Ultra Luxury Cinematic Product Detail Page
// ════════════════════════════════════════════════════════════
export default function ProductView() {
  const { id } = useParams();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { t } = useLanguage();

  const product = getProduct(id);
  const isProductFavorite = product ? isFavorite(product.id) : false;

  // ── State ─────────────────────────────────────────────
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [visualResults, setVisualResults] = useState([]);
  const [visualLoading, setVisualLoading] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [quickOrderVariant, setQuickOrderVariant] = useState({ color: '', size: '' });
  const [quantity, setQuantity] = useState(1);

  // Refs for scroll targets and CTA observation
  const reviewsRef = useRef(null);
  const mainCtaRef = useRef(null);

  // ── Data Fetching ─────────────────────────────────────
  useEffect(() => {
    if (id) fetchProductDetails(id);
  }, [id]);

  useEffect(() => {
    if (product && !isLoading) {
      addToRecentlyViewed(product);
      trackEvent('view_item', productAnalyticsPayload(product));
    }
  }, [product?.id, isLoading]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error fetching reviews:', err));
  }, [id]);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-product-reveal]');
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [product?.id]);

  // ── Review Handlers ───────────────────────────────────
  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  // ── Add to Cart ───────────────────────────────────────
  const handleAddToCart = useCallback(async (selectedColor, selectedSize, qty) => {
    setIsAddingToCart(true);
    try {
      const variant = findVariant(product, selectedColor, selectedSize);
      await addToCart(product, selectedColor, selectedSize, qty, variant);
      trackEvent('add_to_cart', productAnalyticsPayload(product, {
        item_variant: variant?.sku || [selectedColor, selectedSize].filter(Boolean).join(' / '),
        quantity: qty,
      }));
      showCartToast({
        itemName: product.name,
        quantity: qty,
        duration: 6000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('productView.errorAddToCart') || "Savatga qo'shishda xatolik ro'y berdi", { duration: 6000 });
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, addToCart]);

  // ── Wishlist Toggle ───────────────────────────────────
  const handleToggleWishlist = useCallback(() => {
    if (product?.id) {
      toggleFavorite(product.id);
      trackEvent('add_to_wishlist', productAnalyticsPayload(product));
    }
  }, [product, toggleFavorite]);

  // ── Visual Similar Search ─────────────────────────────
  const fetchVisualSimilar = async () => {
    if (!id) return;
    setVisualLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/visual-search/similar/${id}?limit=6`);
      if (data.success) setVisualResults(data.data);
    } catch {
      setVisualResults([]);
    } finally {
      setVisualLoading(false);
    }
  };

  // ── Scroll to Reviews ─────────────────────────────────
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenQuickOrder = (color = '', size = '') => {
    setQuickOrderVariant({ color, size });
    setIsQuickOrderOpen(true);
  };

  // ── Loading State ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <DotLoader />
      </div>
    );
  }

  // ── Not Found State ───────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0b]">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#141416] border border-white/10 shadow-xl">
            <ShoppingCart className="h-7 w-7 text-[#c9a96e]" />
          </div>
          <h1 className="text-2xl font-serif text-white">{t('productView.notFoundTitle') || "Mahsulot topilmadi"}</h1>
          <p className="text-xs text-[#8a8a8d]">
            {t('productView.notFoundDesc') || "Siz qidirayotgan mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#c9a96e] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0b] hover:bg-[#d4b87a] transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('productView.backToCatalog') || "Katalogga qaytish"}
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived Data ──────────────────────────────────────
  const images = product.images && product.images.length > 0
    ? product.images.map(img => typeof img === 'object' ? img.url : img)
    : [product.image].filter(Boolean);

  const relatedProducts = (products || [])
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="clean-product-page min-h-screen text-[#f5f5f3] pt-24 pb-20 relative overflow-hidden selection:bg-[#c9a96e] selection:text-black">
      {/* ── Ambient Luxury Glow Backdrops ──────────────── */}
      <div className="clean-page-orb clean-page-orb-left" />
      <div className="clean-page-orb clean-page-orb-right" />

      {/* ── Ticker Tape Top Banner ──────────────────────── */}
      <div className="product-marquee w-full py-2.5 overflow-hidden whitespace-nowrap mb-7 pointer-events-none">
        <div className="inline-flex items-center gap-8 animate-[marquee_25s_linear_infinite] text-[10px] font-black uppercase tracking-[0.25em] text-[#c9a96e]">
          <span>✨ EXCLUSIVE LUXURY COLLECTION</span>
          <span>•</span>
          <span>⚡ TOSHKEN BO'YLAB 3-6 SOATDA EXPRESS YETKAZIB BERISH</span>
          <span>•</span>
          <span>💎 100% KAFOLATLANGAN ORIGINAL SIFAT</span>
          <span>•</span>
          <span>🌟 TO'PLAM CHEGIRMASI: -15% OUTFIT MATCHING</span>
          <span>•</span>
          <span>✨ EXCLUSIVE LUXURY COLLECTION</span>
        </div>
      </div>

      {/* ── SEO Metadata ──────────────────────────────── */}
      <SEO
        title={product.name}
        description={product.description || `${product.name} — Luxx.uz internet do'konidan xarid qiling.`}
        keywords={`${product.name}, ${product.category || 'ayollar kiyimlari'}, luxury kiyimlar, premium kiyimlar, luxx.uz`}
        image={product.image}
        breadcrumbSteps={[
          { name: 'Kiyimlar', url: '/products' },
          { name: product.category, url: `/products?category=${product.category}` },
          { name: product.name, url: `/product/${id}` },
        ]}
        canonicalPath={`/product/${id}`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: images,
            description: product.description || `${product.name} — Luxx.uz premium ayollar kiyimlari`,
            sku: product.sku || product._id,
            category: product.category,
            brand: { '@type': 'Brand', name: 'Luxx.uz' },
            offers: {
              '@type': 'Offer',
              url: `https://luxx.uz/product/${id}`,
              priceCurrency: 'UZS',
              price: product.price,
              availability: Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
            ...(product.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                bestRating: '5',
                ratingCount: reviews.length || 1,
              },
            }),
          })}
        </script>
      </Helmet>

      <div className="relative z-10 mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb Navigation ─────────────────────── */}
        <nav className="clean-breadcrumb mb-7 flex items-center flex-wrap gap-2 text-xs animate-fade-in-up">
          <Link
            to="/products"
            className="hover:text-[#c9a96e] transition-colors flex items-center gap-1.5 font-medium group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            {t('productView.breadcrumbCatalog') || "Katalog"}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 text-white/20" />
              <Link
                to={`/products?category=${product.category}`}
                className="hover:text-[#c9a96e] transition-colors font-medium"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-white/20" />
          <span className="text-white/90 font-bold truncate max-w-[240px]">{product.name}</span>

          {/* Badge */}
          {product.badge && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#c9a96e]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e] border border-[#c9a96e]/30 shadow-sm backdrop-blur-md">
              <Gem className="h-3 w-3" />
              {product.badge}
            </span>
          )}
        </nav>

        {/* ── Main Product Section (5-Second WOW Grid) ───── */}
        <div className="clean-product-hero grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)] gap-8 xl:gap-20 items-start">

          {/* Left Column: Gallery with Interactive Hotspots */}
          <div className="clean-gallery-shell animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <PremiumGallery images={images} productName={product.name} badge={product.badge} />
          </div>

          {/* Right Column: Sticky Product Info with 1-Click Buy */}
          <div className="clean-info-shell animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="product-editorial-kicker">
              <span>THE PRIVATE EDIT</span>
              <span className="product-editorial-line" />
              <span>01 / {String(images.length).padStart(2, '0')}</span>
            </div>
            <div ref={mainCtaRef}>
              <ProductInfoPanel
                product={product}
                reviewCount={reviews.length}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isFavorite={isProductFavorite}
                isAddingToCart={isAddingToCart}
                onReviewClick={scrollToReviews}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                onOpenQuickOrder={handleOpenQuickOrder}
              />
            </div>
          </div>
        </div>

        {/* ── 3D Craftsmanship Spotlight Section ────────── */}
        <div data-product-reveal className="product-scroll-reveal">
          <CraftsmanshipSpotlight />
        </div>

        {/* ── Outfit Matcher Lookbook (Complete The Look) ── */}
        <div data-product-reveal className="product-scroll-reveal">
          <CompleteTheLook currentProduct={product} />
        </div>

        {/* ── Customer Photo Reviews Section ────────────── */}
        <section data-product-reveal className="product-scroll-reveal mt-28 border-t border-white/10 pt-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#c9a96e]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">
              {t('productView.communityLabel') || "HAMJAMIYAT"}
            </span>
          </div>
          <div className="flex flex-col items-center mb-12 text-center lg:text-left lg:items-start space-y-2">
            <h2 className="text-2xl lg:text-3xl font-serif text-white">
              {t('productView.communityTitle') || "Mijozlarimiz suratlari"}
            </h2>
            <p className="text-[#8a8a8d] max-w-lg text-sm leading-relaxed">
              {t('productView.communityDesc') || "Luxx.uz mahsulotlari bilan o'z stilini namoyon etgan xaridorlarimiz suratlari to'plami."}
            </p>
          </div>
          <CustomerPhotoReviews productId={product._id || product.id || id} productName={product.name} product={product} />
        </section>

        {/* ── Related Products + AI Visual Similarity ───── */}
        <div data-product-reveal className="product-scroll-reveal mt-28">
          <RelatedProducts
            relatedProducts={relatedProducts}
            visualResults={visualResults}
            visualLoading={visualLoading}
            onFetchVisualSimilar={fetchVisualSimilar}
          />
        </div>

        {/* ── Customer Reviews & Form Section ───────────── */}
        <div data-product-reveal className="product-scroll-reveal mt-28">
          <ReviewsSection
            product={product}
            reviews={reviews}
            onReviewAdded={handleReviewAdded}
            onReviewDeleted={handleReviewDeleted}
            sectionRef={reviewsRef}
          />
        </div>
      </div>

      {/* ── Sticky Bottom Floating Bar ──────────────────── */}
      <FloatingCTA
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={() => {
          if (getProductOptions(product, 'size').length || getProductOptions(product, 'color').length) {
            mainCtaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            toast.error(t('productView.errorSelectVariant') || "Iltimos, rang va o'lchamni tanlang!");
            return;
          }
          handleAddToCart('', '', quantity);
        }}
        isAddingToCart={isAddingToCart}
        isFavorite={isProductFavorite}
        onToggleWishlist={handleToggleWishlist}
        ctaRef={mainCtaRef}
      />

      {/* ── Size Guide Modal ────────────────────────────── */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productCategory={product?.category}
        product={product}
      />

      {/* ── 1-Click Fast Express Order Modal ────────────── */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={product}
        selectedColor={quickOrderVariant.color}
        selectedSize={quickOrderVariant.size}
      />
    </div>
  );
}
