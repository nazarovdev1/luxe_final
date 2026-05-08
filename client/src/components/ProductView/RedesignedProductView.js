import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Gem,
  Ruler,
  ArrowRight,
} from 'lucide-react';
import ImageCarousel from '../ImageCarousel';
import ReviewList from '../ReviewList';
import { useLanguage } from '../../contexts/LanguageContext';
import ReviewForm from '../ReviewForm';
import SEO from '../SEO';
import SizeGuideModal from '../SizeGuideModal';
import InstallmentCalculator from '../InstallmentCalculator';
import FlashSaleTimer from '../FlashSaleTimer';
import { Button, Badge, Card } from './ui';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const THEME = {
  bgBase: '#0a0a0b',
  textMain: '#f5f5f3',
  textMuted: '#8a8a8d',
  accent: '#c9a96e',
};

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const DotLoader = ({ size = 'sm' }) => {
  const dot = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <span className="inline-flex items-center gap-1.5">
      {[0, 1, 2].map((idx) => (
        <span
          key={idx}
          className={`${dot} bg-[#c9a96e] rounded-full animate-pulse`}
          style={{ animationDelay: `${idx * 140}ms` }}
        />
      ))}
    </span>
  );
};

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current text-[#c9a96e]' : 'text-[#3a3a3d]'}`}
    />
  ));
};

export default function ProductView() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const product = getProduct(id);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');

  React.useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (product && !isLoading) {
      addToRecentlyViewed(product);
    }
  }, [product?.id, isLoading]);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);

  React.useEffect(() => {
    if (id) {
      fetch(`${API_BASE}/reviews/${id}`)
        .then((res) => res.json())
        .then((data) => setReviews(data))
        .catch((err) => console.error('Error fetching reviews:', err));
    }
  }, [id]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME.bgBase }}>
        <DotLoader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: THEME.bgBase }}>
        <Card className="max-w-md text-center p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1c1c1f]">
            <ShoppingCart className="h-6 w-6 text-[#c9a96e]" />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: THEME.textMain }}>Mahsulot topilmadi</h2>
          <p className="mt-2 text-sm" style={{ color: THEME.textMuted }}>Bu mahsulot o'chirib yuborilgan yoki mavjud emas.</p>
          <Link to="/products">
            <Button className="mt-5" icon={ArrowLeft}>
              Katalogga qaytish
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);

  const sizeOptions = Array.isArray(product.sizes)
    ? [...new Set(
        product.sizes
          .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
          .map((s) => String(s).trim())
          .filter(Boolean)
      )]
    : [];

  const relatedProducts = (products || [])
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  const subtotal = (Number(product.price) || 0) * quantity;

  const features = [
    { icon: Truck, title: 'Tez yetkazish', subtitle: '3-6 soat ichida' },
    { icon: Shield, title: 'Kafolat', subtitle: '30 kun' },
    { icon: RotateCcw, title: 'Qaytarish', subtitle: '7 kun' },
  ];

  const handleAddToCart = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Iltimos, rang tanlang!', { duration: 6000 });
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Iltimos, o'lcham tanlang!", { duration: 6000 });
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      toast.success(`${product.name} savatga qo'shildi!`, { duration: 6000 });
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.", { duration: 6000 });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getProductImage = (item) => {
    if (!item) return '';
    if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
    return item.image || '';
  };

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ backgroundColor: THEME.bgBase }}>
      <SEO
        title={product.name}
        description={product.description || `${product.name} - Luxx.uz internet do'konidan xarid qiling.`}
        keywords={`${product.name}, luxury kiyimlar, premium kiyimlar, luxx.uz`}
        image={product.image}
        breadcrumbSteps={[
          { name: 'Kiyimlar', url: '/products' },
          { name: product.category, url: `/products?category=${product.category}` },
          { name: product.name, url: `/product/${id}` }
        ]}
        canonicalPath={`/product/${id}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: THEME.textMuted }}
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </button>
          {product.badge && (
            <Badge variant="accent" icon={Gem}>{product.badge}</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-[#141416]">
              {images.length > 0 ? (
                <ImageCarousel images={images} productName={product.name} />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-[#6b6b6e]">
                  Rasm mavjud emas
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#141416] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6b6b6e]">Kategoriya</p>
                <p className="mt-1 text-sm font-medium text-[#f5f5f3] truncate">{product.category || "Noma'lum"}</p>
              </div>
              <div className="rounded-lg bg-[#141416] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6b6b6e]">Reyting</p>
                <p className="mt-1 text-sm font-medium text-[#f5f5f3]">{(product.rating || 0).toFixed(1)} / 5</p>
              </div>
              <div className="rounded-lg bg-[#141416] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#6b6b6e]">Sharhlar</p>
                <p className="mt-1 text-sm font-medium text-[#f5f5f3]">{reviews.length} ta</p>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight" style={{ color: THEME.textMain }}>
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">{renderStars(product.rating || 0)}</div>
                <span className="text-sm" style={{ color: THEME.textMuted }}>
                  {(product.rating || 0).toFixed(1)} ({reviews.length} sharh)
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <p className="text-3xl font-semibold" style={{ color: THEME.textMain }}>
                {formatPrice(product.price)} {t('common.sum')}
              </p>
              {product.originalPrice && (
                <p className="pb-1 text-lg line-through" style={{ color: THEME.textMuted }}>
                  {formatPrice(product.originalPrice)} {t('common.sum')}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: THEME.textMuted }}>
                {product.description}
              </p>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: THEME.textMain }}>
                    Rang <span className="text-[#c9a96e]">*</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => {
                    const isHex = typeof color === 'string' && color.startsWith('#');
                    if (isHex) {
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`h-10 w-10 rounded-full transition-all duration-200 ${
                            selectedColor === color
                              ? 'scale-110 ring-2 ring-[#c9a96e] ring-offset-2 ring-offset-[#0a0a0b]'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {selectedColor === color && <Check className="h-4 w-4 mx-auto text-white" />}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedColor === color
                            ? 'bg-[#c9a96e] text-[#0a0a0b]'
                            : 'bg-[#1c1c1f] text-[#f5f5f3] hover:bg-[#252529]'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: THEME.textMain }}>
                    O'lcham <span className="text-[#c9a96e]">*</span>
                  </h3>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs flex items-center gap-1.5 transition-colors hover:text-[#c9a96e]"
                    style={{ color: THEME.textMuted }}
                  >
                    <Ruler className="h-3 w-3" />
                    O'lcham jadvali
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 min-w-[48px] px-3 rounded-lg text-sm font-semibold transition-colors ${
                        selectedSize === size
                          ? 'bg-[#c9a96e] text-[#0a0a0b]'
                          : 'bg-[#1c1c1f] text-[#f5f5f3] hover:bg-[#252529]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-3" style={{ color: THEME.textMain }}>
                Soni
              </h3>
              <div className="inline-flex items-center rounded-lg bg-[#1c1c1f] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 rounded-md transition-colors hover:bg-[#252529]"
                >
                  <Minus className="h-4 w-4" style={{ color: THEME.textMain }} />
                </button>
                <span className="min-w-[3rem] text-center text-base font-semibold" style={{ color: THEME.textMain }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 rounded-md transition-colors hover:bg-[#252529]"
                >
                  <Plus className="h-4 w-4" style={{ color: THEME.textMain }} />
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-[#141416] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: THEME.textMuted }}>Jami summa</span>
                <span className="text-xl font-semibold" style={{ color: THEME.textMain }}>
                  {formatPrice(subtotal)} {t('common.sum')}
                </span>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              loading={isAddingToCart}
              icon={ShoppingCart}
              className="w-full"
              size="lg"
            >
              {isAddingToCart ? "Qo'shilmoqda..." : "Savatga qo'shish"}
            </Button>

            <div className="grid grid-cols-3 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="rounded-lg bg-[#141416] p-3 text-center">
                  <feature.icon className="h-4 w-4 mx-auto mb-2" style={{ color: THEME.accent }} />
                  <p className="text-xs font-medium" style={{ color: THEME.textMain }}>{feature.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: THEME.textMuted }}>{feature.subtitle}</p>
                </div>
              ))}
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <FlashSaleTimer
                endTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                originalPrice={product.originalPrice}
                salePrice={product.price}
                totalStock={product.stock || 10}
                soldCount={Math.floor(Math.random() * 7) + 3}
                productName={product.name}
              />
            )}

            {product.price >= 50000 && (
              <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
                <InstallmentCalculator price={product.price} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <div className="flex gap-8 border-b border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#c9a96e] text-[#f5f5f3]'
                  : 'text-[#6b6b6e] hover:text-[#8a8a8d]'
              }`}
            >
              Sharhlar ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-[#c9a96e] text-[#f5f5f3]'
                  : 'text-[#6b6b6e] hover:text-[#8a8a8d]'
              }`}
            >
              Qo'shimcha ma'lumot
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
                </div>
                <div className="lg:col-span-2">
                  <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} />
                </div>
              </div>
            )}
            {activeTab === 'info' && (
              <div className="max-w-2xl">
                <Card>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.textMain }}>Mahsulot haqida</h3>
                  <div className="space-y-3 text-sm" style={{ color: THEME.textMuted }}>
                    <p><span className="font-medium" style={{ color: THEME.textMain }}>{t('product.category')}:</span> {product.category}</p>
                    <p><span className="font-medium" style={{ color: THEME.textMain }}>{t('common.price')}:</span> {formatPrice(product.price)} {t('common.sum')}</p>
                    {product.sizes && <p><span className="font-medium" style={{ color: THEME.textMain }}>{t('product.sizes')}:</span> {Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}</p>}
                    {product.colors && <p><span className="font-medium" style={{ color: THEME.textMain }}>Ranglar:</span> {Array.isArray(product.colors) ? product.colors.join(', ') : product.colors}</p>}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: THEME.textMain }}>
              O'xshash mahsulotlar
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[#c9a96e]"
              style={{ color: THEME.textMuted }}
            >
              Hammasi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="group">
                <Card padding={false} hover>
                  <div className="aspect-[3/4] overflow-hidden rounded-[14px]">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs uppercase tracking-wider truncate" style={{ color: THEME.textMuted }}>
                      {item.category}
                    </p>
                    <h3 className="mt-1 text-sm font-medium truncate group-hover:text-[#c9a96e]" style={{ color: THEME.textMain }}>
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold" style={{ color: THEME.textMain }}>
                      {formatPrice(item.price)} {t('common.sum')}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productCategory={product?.category}
      />
    </div>
  );
}
