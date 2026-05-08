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
} from 'lucide-react';

// Contexts
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

// Sub-components
import PremiumGallery from '../components/ProductView/PremiumGallery';
import ProductInfoPanel from '../components/ProductView/ProductInfoPanel';
import FloatingCTA from '../components/ProductView/FloatingCTA';
import RelatedProducts from '../components/ProductView/RelatedProducts';
import ReviewsSection from '../components/ProductView/ReviewsSection';
import SizeGuideModal from '../components/SizeGuideModal';

// Shared components
import SEO from '../components/SEO';
import CustomerPhotoReviews from '../components/CustomerPhotoReviews';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

// ── Loading Animation ──────────────────────────────────────
const DotLoader = () => (
  <span className="inline-flex items-center gap-1.5">
    {[0, 1, 2].map((idx) => (
      <span
        key={idx}
        className="h-2.5 w-2.5 bg-[#c9a96e] rounded-full animate-pulse"
        style={{ animationDelay: `${idx * 140}ms` }}
      />
    ))}
  </span>
);

// ════════════════════════════════════════════════════════════
// ProductView — Premium Luxury Product Detail Page
// ════════════════════════════════════════════════════════════
export default function ProductView() {
  const { id } = useParams();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const product = getProduct(id);
  const isProductFavorite = product ? isFavorite(product.id) : false;

  // ── State ─────────────────────────────────────────────
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [visualResults, setVisualResults] = useState([]);
  const [visualLoading, setVisualLoading] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Refs for scroll targets and CTA observation
  const reviewsRef = useRef(null);
  const mainCtaRef = useRef(null);
  const [quantity, setQuantity] = useState(1);

  // ── Data Fetching ─────────────────────────────────────
  useEffect(() => {
    if (id) fetchProductDetails(id);
  }, [id]);

  useEffect(() => {
    if (product && !isLoading) {
      addToRecentlyViewed(product);
    }
  }, [product?.id, isLoading]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error fetching reviews:', err));
  }, [id]);

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
      await addToCart(product, selectedColor, selectedSize, qty);
      toast.success(`${product.name} savatga qo'shildi! (${qty} dona)`, { duration: 6000 });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.", { duration: 6000 });
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, addToCart]);

  // ── Wishlist Toggle ───────────────────────────────────
  const handleToggleWishlist = useCallback(() => {
    if (product?.id) {
      toggleFavorite(product.id);
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
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#141416]">
            <ShoppingCart className="h-6 w-6 text-[#c9a96e]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#f5f5f3]">Mahsulot topilmadi</h1>
          <p className="mt-2 text-sm text-[#8a8a8d]">
            Bu mahsulot o'chirib yuborilgan yoki mavjud emas.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-[#0a0a0b] hover:bg-[#d4b87a] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Katalogga qaytish
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived Data ──────────────────────────────────────
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean);

  const relatedProducts = (products || [])
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20 pb-16 animate-fade-in">
      {/* ── SEO ────────────────────────────────────────── */}
      <SEO
        title={product.name}
        description={product.description || `${product.name} — Luxx.uz internet do'konidan xarid qiling.`}
        keywords={`${product.name}, ${product.category || 'ayolar kiyimlari'}, luxury kiyimlar, premium kiyimlar, luxx.uz`}
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
            image: product.images && product.images.length > 0 ? product.images : [product.image],
            description: product.description || `${product.name} — Luxx.uz premium ayollar kiyimlari`,
            sku: product._id,
            category: product.category,
            brand: { '@type': 'Brand', name: 'Luxx.uz' },
            offers: {
              '@type': 'Offer',
              url: `https://luxx.uz/product/${id}`,
              priceCurrency: 'UZS',
              price: product.price,
              availability: 'https://schema.org/InStock',
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb Navigation ─────────────────────── */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#6b6b6e] animate-fade-in-up">
          <Link
            to="/products"
            className="hover:text-[#c9a96e] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Katalog
          </Link>
          {product.category && (
            <>
              <span className="text-[#3a3a3d]">/</span>
              <Link
                to={`/products?category=${product.category}`}
                className="hover:text-[#c9a96e] transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <span className="text-[#3a3a3d]">/</span>
          <span className="text-[#8a8a8d] truncate max-w-[200px]">{product.name}</span>

          {/* Badge */}
          {product.badge && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#c9a96e]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a96e] border border-[#c9a96e]/20">
              <Gem className="h-3 w-3" />
              {product.badge}
            </span>
          )}
        </nav>

        {/* ── Main Product Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: Premium Gallery */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <PremiumGallery images={images} productName={product.name} />
          </div>

          {/* Right: Product Info Panel (sticky) */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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
              />
            </div>
          </div>
        </div>

        {/* ── Customer Photo Reviews ────────────────────── */}
        <section className="mt-24 border-t border-white/5 pt-16 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#c9a96e]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">
              Hamjamiyat
            </span>
          </div>
          <div className="flex flex-col items-center mb-12 text-center lg:text-left lg:items-start">
            <h2 className="text-2xl lg:text-3xl font-brilliant text-[#f5f5f3] mb-4">
              Mijozlarimiz nigohida
            </h2>
            <p className="text-[#8a8a8d] max-w-lg text-[15px]">
              Sizning uslubingiz bizni ilhomlantiradi. O'z suratingizni ulashing va hamjamiyatimizning bir qismiga aylaning.
            </p>
          </div>
          <CustomerPhotoReviews productName={product.name} />
        </section>

        {/* ── Related Products + AI Visual Similar ──────── */}
        <div className="mt-24">
          <RelatedProducts
            relatedProducts={relatedProducts}
            visualResults={visualResults}
            visualLoading={visualLoading}
            onFetchVisualSimilar={fetchVisualSimilar}
          />
        </div>

        {/* ── Reviews Section ───────────────────────────── */}
        <div className="mt-24">
          <ReviewsSection
            product={product}
            reviews={reviews}
            onReviewAdded={handleReviewAdded}
            onReviewDeleted={handleReviewDeleted}
            sectionRef={reviewsRef}
          />
        </div>
      </div>

      {/* ── Floating CTA Bar (desktop) ──────────────────── */}
      <FloatingCTA
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={() => handleAddToCart('', '', quantity)}
        isAddingToCart={isAddingToCart}
        isFavorite={isProductFavorite}
        onToggleWishlist={handleToggleWishlist}
        ctaRef={mainCtaRef}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productCategory={product?.category}
      />
    </div>
  );
}
