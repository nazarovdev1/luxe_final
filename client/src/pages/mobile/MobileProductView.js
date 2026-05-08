import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSwipeable } from 'react-swipeable';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Check,
  Gem,
  Palette,
  Sparkles,
  Loader2,
  Share2,
} from 'lucide-react';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import SEO from '../../components/SEO';
import InstallmentCalculator from '../../components/InstallmentCalculator';
import FlashSaleTimer from '../../components/FlashSaleTimer';
import BackInStockButton from '../../components/BackInStockButton';
import PriceDropAlert from '../../components/PriceDropAlert';
import CustomerPhotoReviews from '../../components/CustomerPhotoReviews';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (item) => {
  if (!item) return '';
  if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
  return item.image || '';
};

const MobileProductView = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const product = getProduct(id);
  const isProductFavorite = product ? isFavorite(product.id) : false;

  // Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, [id, isLoading]);

  // Fetch product details
  useEffect(() => {
    if (id) fetchProductDetails(id);
  }, [id]);

  useEffect(() => {
    if (product && !isLoading) {
      addToRecentlyViewed(product);
    }
  }, [product?.id, isLoading]);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [visualResults, setVisualResults] = useState([]);
  const [visualLoading, setVisualLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error fetching reviews:', err));
  }, [id]);

  const handleReviewAdded = (newReview) => setReviews((prev) => [newReview, ...prev]);
  const handleReviewDeleted = (reviewId) => setReviews((prev) => prev.filter((r) => r._id !== reviewId));

  const images = product?.images?.length > 0
    ? product.images
    : product?.image
      ? [product.image]
      : ['/placeholder.png'];

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showLightbox]);

  // Swipe tracking
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const swipeConfig = {
    onSwiping: (eventData) => { setIsSwiping(true); setSwipeDelta(eventData.deltaX); },
    onSwipedLeft: (eventData) => { setIsSwiping(false); setSwipeDelta(0); if (Math.abs(eventData.deltaX) > 50) nextImage(); },
    onSwipedRight: (eventData) => { setIsSwiping(false); setSwipeDelta(0); if (Math.abs(eventData.deltaX) > 50) prevImage(); },
    onTap: () => { setIsSwiping(false); setSwipeDelta(0); },
    onTouchEndOrOnMouseUp: () => { setIsSwiping(false); setSwipeDelta(0); },
    trackMouse: true, trackTouch: true, delta: 10, preventDefaultTouchmoveEvent: false,
  };

  const mainHandlers = useSwipeable(swipeConfig);
  const lightboxHandlers = useSwipeable(swipeConfig);

  // Related products
  const relatedProducts = (products || [])
    .filter((item) => item.id !== product?.id && item.category === product?.category)
    .slice(0, 4);

  // Visual similar search
  const fetchVisualSimilar = async () => {
    if (!id) return;
    setVisualLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/visual-search/similar/${id}?limit=6`);
      if (data.success) setVisualResults(data.data);
    } catch { setVisualResults([]); }
    finally { setVisualLoading(false); }
  };

  // Share handler
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading State ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => (
            <span key={idx} className="h-2.5 w-2.5 bg-[#c9a96e] rounded-full animate-pulse" style={{ animationDelay: `${idx * 140}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Not Found State ───────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#141416]">
          <ShoppingCart className="h-6 w-6 text-[#c9a96e]" />
        </div>
        <h2 className="text-xl font-bold text-[#f5f5f3] mb-2">Mahsulot topilmadi</h2>
        <p className="text-sm text-[#8a8a8d] mb-6">Bu mahsulot o'chirib yuborilgan yoki mavjud emas.</p>
        <Link to="/mobile" className="inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-[#0a0a0b]">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Iltimos, rang tanlang!');
      return;
    }
    const sizeOptions = Array.isArray(product.sizes)
      ? [...new Set(product.sizes.flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s])).map((s) => String(s).trim()).filter(Boolean))]
      : [];
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Iltimos, o'lcham tanlang!");
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      toast.success(`${product.name} savatga qo'shildi!`);
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-[#c9a96e] fill-[#c9a96e]' : 'text-[#2a2a2d]'}`} />
    ))
  );

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <>
      <SEO
        title={product.name}
        description={product.description || `${product.name} — Luxx.uz premium ayollar kiyimlari.`}
        image={product.image}
        url={`/product/${id}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org", "@type": "Product",
            "name": product.name,
            "image": product.images?.length > 0 ? product.images : [product.image],
            "description": product.description,
            "sku": product._id,
            "brand": { "@type": "Brand", "name": "Luxx.uz" },
            "offers": { "@type": "Offer", "priceCurrency": "UZS", "price": product.price, "availability": "https://schema.org/InStock" }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0b]">
        {/* ═══ 1. Immersive Hero Image ═══════════════════════ */}
        <div {...mainHandlers} className="fixed top-0 left-0 w-full h-[85vh] z-0 bg-[#0a0a0b]">
          <div
            className={`flex h-full w-full ${isSwiping ? '' : 'transition-transform duration-700'}`}
            style={{ transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeDelta}px))` }}
          >
            {images.map((img, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full relative">
                <img src={img} alt={product.name} className="w-full h-full object-cover object-top" onClick={() => setShowLightbox(true)} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0b]" />
              </div>
            ))}
          </div>

          {/* Image indicators */}
          {images.length > 1 && (
            <div className="absolute top-24 right-4 flex flex-col gap-2 z-20">
              {images.map((_, index) => (
                <div key={index} className={`w-1 transition-all duration-300 rounded-full ${index === currentImageIndex ? 'h-8 bg-[#c9a96e] shadow-[0_0_12px_rgba(201,169,110,0.5)]' : 'h-2 bg-white/20'}`} />
              ))}
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <div className="absolute bottom-32 left-6 z-20 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a96e]/15 backdrop-blur-xl border border-[#c9a96e]/25 text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]">
                <Gem className="w-3 h-3" />
                {product.badge}
              </span>
            </div>
          )}
        </div>

        {/* ═══ 2. Floating Header ═══════════════════════════ */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 safe-area-top">
          <button
            onClick={() => {
              if (location.state?.fromMobileList || window.history.length > 1) navigate(-1);
              else navigate('/mobile');
            }}
            className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`w-12 h-12 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-90 ${isProductFavorite ? 'bg-[#c9a96e]/15 border-[#c9a96e]/30 text-[#c9a96e]' : 'bg-black/40 text-white'}`}
            >
              <Heart className={`w-5 h-5 ${isProductFavorite ? 'fill-[#c9a96e]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ═══ 3. Scrollable Content ════════════════════════ */}
        <div className="relative z-10 mt-[75vh]">
          <div className="bg-[#0a0a0b]/95 backdrop-blur-3xl rounded-t-[2.5rem] border-t border-white/5 p-6 sm:p-8 pb-36 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">

            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

            {/* Category */}
            {product.category && (
              <p className="text-[10px] font-black text-[#c9a96e] uppercase tracking-[0.3em] mb-3">{product.category}</p>
            )}

            {/* Title */}
            <h1 className="font-brilliant text-3xl sm:text-4xl text-[#f5f5f3] leading-[1.1] mb-5">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">{renderStars(product.rating || 0)}</div>
              <span className="text-[#f5f5f3] text-sm font-bold">{(product.rating || 0).toFixed(1)}</span>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5 text-[#8a8a8d]">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{reviews.length} sharh</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-[#f5f5f3] tracking-tight">
                {formatPrice(product.price)}
                <span className="text-[10px] text-[#6b6b6e] ml-1 font-bold">{t('common.sum')}</span>
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#6b6b6e] line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#c9a96e]/10 text-[#c9a96e] text-[10px] font-black">-{discountPercent}%</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[#8a8a8d] text-sm leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Divider */}
            <div className="border-t border-white/5 mb-8" />

            {/* ── Color Selector ──────────────────────────── */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-[#f5f5f3] uppercase tracking-[0.2em]">{t('common.color')}</h3>
                  {selectedColor && <span className="text-[10px] text-[#c9a96e] font-bold uppercase tracking-widest">{selectedColor}</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => {
                    const isHex = typeof color === 'string' && color.startsWith('#');
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`relative h-12 rounded-xl transition-all duration-300 ${isHex
                          ? `w-12 ${selectedColor === color ? 'ring-2 ring-[#c9a96e] ring-offset-3 ring-offset-[#0a0a0b] scale-110' : 'border border-white/10 hover:scale-105'}`
                          : `px-5 ${selectedColor === color ? 'bg-[#c9a96e] text-[#0a0a0b]' : 'bg-white/[0.03] border border-white/5 text-[#8a8a8d]'}`
                          }`}
                        style={isHex ? { backgroundColor: color } : {}}
                      >
                        {!isHex && <span className="text-xs font-bold uppercase tracking-widest">{color}</span>}
                        {isHex && selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Size Selector ───────────────────────────── */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-[#f5f5f3] uppercase tracking-[0.2em]">{t('common.size')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(product.sizes) ? [...new Set(product.sizes.flatMap((s) => typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]).map((s) => String(s).trim()).filter(Boolean))] : []).map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 min-w-[3rem] px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedSize === size
                        ? 'bg-[#f5f5f3] text-[#0a0a0b] shadow-[0_8px_16px_rgba(255,255,255,0.1)]'
                        : 'bg-white/[0.03] border border-white/5 text-[#8a8a8d] hover:border-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Premium Features ────────────────────────── */}
            <div className="space-y-4 mb-8">
              {hasDiscount && (
                <FlashSaleTimer
                  endTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                  originalPrice={product.originalPrice}
                  salePrice={product.price}
                  totalStock={product.stock || 10}
                  soldCount={Math.floor(Math.random() * 7) + 3}
                  productName={product.name}
                />
              )}
              {product.price >= 50000 && <InstallmentCalculator price={product.price} />}
              <PriceDropAlert product={product} />
            </div>

            {/* ── Materials & Eco ─────────────────────────── */}
            {(product.materials?.length > 0 || product.ecoScore) && (
              <div className="space-y-3 mb-8">
                {product.materials?.length > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="p-2.5 rounded-xl bg-[#c9a96e]/10">
                      <Palette className="w-4 h-4 text-[#c9a96e]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#6b6b6e] uppercase tracking-widest mb-0.5">Materiallar</p>
                      <p className="text-sm text-[#f5f5f3]">{product.materials.join(', ')}</p>
                    </div>
                  </div>
                )}
                {product.ecoScore && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="p-2.5 rounded-xl bg-green-500/10">
                      <Sparkles className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-[#6b6b6e] uppercase tracking-widest mb-1">Eko-mas'uliyat</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${product.ecoScore * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold text-green-400">{product.ecoScore}/10</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Trust Badges ────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: Truck, label: '3-6 soat' },
                { icon: Shield, label: 'Kafolat' },
                { icon: RotateCcw, label: '7 kun' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <Icon className="w-4 h-4 text-[#c9a96e]" />
                  <span className="text-[10px] font-bold text-[#8a8a8d] uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {/* ═══ Customer Photo Reviews ═══════════════════ */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-[#c9a96e]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] font-bold">Hamjamiyat</span>
              </div>
              <h3 className="font-brilliant text-2xl text-[#f5f5f3] mb-6">Mijozlarimiz nigohida</h3>
              <CustomerPhotoReviews productName={product.name} />
            </div>

            {/* ═══ Related Products ═════════════════════════ */}
            {relatedProducts.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-px w-6 bg-[#c9a96e]" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] font-bold">Tavsiya</span>
                    </div>
                    <h3 className="font-brilliant text-2xl text-[#f5f5f3]">O'xshash mahsulotlar</h3>
                  </div>
                  <button
                    onClick={fetchVisualSimilar}
                    disabled={visualLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141416] border border-white/5 text-[10px] font-bold text-[#f5f5f3]"
                  >
                    {visualLoading ? <Loader2 size={12} className="animate-spin text-[#c9a96e]" /> : <Sparkles size={12} className="text-[#c9a96e]" />}
                    AI
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none' }}>
                  {relatedProducts.map((item) => (
                    <Link key={item.id} to={`/mobile/product/${item.id}`} className="flex-shrink-0 w-40 group">
                      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#141416]">
                        <img src={getProductImage(item)} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                      <div className="mt-3">
                        <p className="text-[10px] text-[#c9a96e] uppercase tracking-wider font-bold truncate">{item.category}</p>
                        <p className="text-xs font-medium text-[#f5f5f3] truncate mt-1">{item.name}</p>
                        <p className="text-sm font-bold text-[#f5f5f3] mt-1">{formatPrice(item.price)} {t('common.sum')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ AI Visual Similar ════════════════════════ */}
            {visualResults.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="text-purple-400" size={16} />
                  </div>
                  <h3 className="font-brilliant text-xl text-[#f5f5f3]">AI Tanlovlari</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {visualResults.map((item) => (
                    <Link key={item._id} to={`/mobile/product/${item._id}`} className="group">
                      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#141416] relative border border-white/5">
                        <img src={item.images?.[0]?.url} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        {item.similarity && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-purple-600/80 text-white text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">
                            {Math.round(item.similarity * 100)}%
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-[#f5f5f3] font-medium truncate mt-2">{item.name}</p>
                      <p className="text-[10px] text-purple-300 font-bold">{Number(item.price).toLocaleString()} {t('common.sum')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ Reviews ══════════════════════════════════ */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-[#c9a96e]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] font-bold">Fikrlar</span>
              </div>
              <h3 className="font-brilliant text-2xl text-[#f5f5f3] mb-6">Mijozlar fikri</h3>

              {/* Rating summary */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-[#f5f5f3]">{(product.rating || 0).toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-1">{renderStars(product.rating || 0)}</div>
                    <p className="text-xs text-[#8a8a8d]">{reviews.length} ta sharh</p>
                  </div>
                </div>
                {reviews.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-white/5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => Math.floor(r.rating || 0) === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[9px] text-[#6b6b6e] w-3 text-right">{star}</span>
                          <Star className="w-2.5 h-2.5 text-[#c9a96e] fill-[#c9a96e]" />
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9a96e] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] text-[#6b6b6e] w-5">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Review form */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
              </div>

              {/* Review list */}
              <div className="pt-6 border-t border-white/5">
                <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 4. Sticky Footer CTA ═════════════════════════ */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/98 to-transparent pt-12 safe-area-bottom">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex items-center gap-4 bg-white/[0.03] h-14 rounded-2xl px-5 border border-white/10 backdrop-blur-2xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#8a8a8d] active:text-[#f5f5f3] active:scale-90 transition-all">
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="text-base font-black text-[#f5f5f3] w-5 text-center tabular-nums">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-[#8a8a8d] active:text-[#f5f5f3] active:scale-90 transition-all">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 h-14 bg-[#c9a96e] text-[#0a0a0b] rounded-2xl font-black text-xs tracking-[0.15em] uppercase shadow-[0_12px_24px_rgba(201,169,110,0.25)] active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('common.addToCart')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ═══ Lightbox ════════════════════════════════════ */}
        {showLightbox && (
          <div
            className="fixed inset-0 z-[100] bg-black animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowLightbox(false); }}
          >
            <div {...lightboxHandlers} className="w-full h-full flex flex-col justify-center relative">
              <button onClick={() => setShowLightbox(false)} className="absolute top-4 right-4 z-[110] p-2 bg-white/10 rounded-full backdrop-blur-md">
                <X className="w-6 h-6 text-white" />
              </button>
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 z-[110] p-3 bg-white/10 rounded-full backdrop-blur-md text-white">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 z-[110] p-3 bg-white/10 rounded-full backdrop-blur-md text-white">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <img src={images[currentImageIndex]} alt="" className="max-w-full max-h-[90vh] object-contain px-2 pointer-events-auto" />
              {images.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <span className="bg-black/50 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileProductView;
