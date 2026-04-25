import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import {
  ArrowLeft,
  ArrowUpRight,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  Gem,
  Check,
  Crown,
  Palette,
  Ruler,
  Clock3,
} from 'lucide-react';
import ImageCarousel from '../components/ImageCarousel';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import SEO from '../components/SEO';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const THEME = {
  bgBase: '#05070d',
  textMain: '#f4f1eb',
  textMuted: '#9aa3b2',
};

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

const DotLoader = ({ size = 'md', color = 'bg-[#d6b47c]' }) => {
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5';

  return (
    <span className="inline-flex items-center gap-1.5">
      {[0, 1, 2].map((idx) => (
        <span
          key={idx}
          className={`${dot} ${color} rounded-full animate-pulse`}
          style={{ animationDelay: `${idx * 140}ms` }}
        />
      ))}
    </span>
  );
};

export default function ProductView() {
  const { id } = useParams();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const product = getProduct(id);

  React.useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

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
        <div className="max-w-md text-center rounded-[2rem] bg-gradient-to-b from-[#131c2e] to-[#0b1220] px-8 py-10 shadow-[0_24px_56px_rgba(2,5,15,0.55)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0f1627] shadow-[inset_0_0_26px_rgba(214,180,124,0.08)]">
            <ShoppingCart className="h-9 w-9 text-[#d6b47c]" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: THEME.textMain }}>Mahsulot topilmadi</h1>
          <p className="mt-2 text-sm" style={{ color: THEME.textMuted }}>Bu mahsulot o'chirib yuborilgan yoki mavjud emas.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#f4f1eb] px-5 py-2.5 text-sm font-semibold text-[#0f1014] transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Katalogga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);

  const sizeOptions = Array.isArray(product.sizes)
    ? [
      ...new Set(
        product.sizes
          .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
          .map((s) => String(s).trim())
          .filter(Boolean)
      ),
    ]
    : [];

  const relatedProducts = (products || [])
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);

  const subtotal = (Number(product.price) || 0) * quantity;

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
      toast.success(`${product.name} savatga qo'shildi! (${quantity} dona)`, { duration: 6000 });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.", { duration: 6000 });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.floor(rating) ? 'fill-current text-[#f2c66c]' : 'text-[#3f4658]'}`}
      />
    ));
  };

  const features = [
    { icon: Truck, title: 'Tez yetkazish', subtitle: '3-6 soat ichida', tone: 'from-[#13202a] to-[#0f1721]' },
    { icon: Shield, title: 'Kafolat', subtitle: '30 kun', tone: 'from-[#1a1c2b] to-[#121726]' },
    { icon: RotateCcw, title: 'Qaytarish', subtitle: '7 kun', tone: 'from-[#21181a] to-[#171418]' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-16" style={{ backgroundColor: THEME.bgBase }}>
      <SEO
        title={product.name}
        description={product.description || `${product.name} - Luxx.uz internet do'konidan xarid qiling.`}
        keywords={`${product.name}, ${product.category || 'ayollar kiyimlari'}, luxury kiyimlar, premium kiyimlar, luxx.uz`}
        image={product.image}
        canonicalPath={`/product/${id}`}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images : [product.image],
            description: product.description || `${product.name} - Luxx.uz premium ayollar kiyimlari`,
            sku: product._id,
            category: product.category,
            brand: {
              '@type': 'Brand',
              name: 'Luxx.uz',
            },
            offers: {
              '@type': 'Offer',
              url: `https://luxx.uz/product/${id}`,
              priceCurrency: 'UZS',
              price: product.price,
              priceValidUntil: '2026-12-31',
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: {
                '@type': 'Organization',
                name: 'Luxx.uz',
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  value: '0',
                  currency: 'UZS',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'UZ',
                  addressRegion: 'Toshkent',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 0,
                    maxValue: 1,
                    unitCode: 'HUR',
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 3,
                    maxValue: 6,
                    unitCode: 'HUR',
                  },
                },
              },
            },
            ...(product.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                bestRating: '5',
                worstRating: '1',
                ratingCount: reviews.length || 1,
              },
            }),
          })}
        </script>
      </Helmet>

      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-[55rem] -translate-x-1/2 rounded-full bg-[#d6b47c]/14 blur-3xl" />
      <div className="pointer-events-none absolute top-52 -left-24 h-72 w-72 rounded-full bg-[#2d4369]/22 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 -right-24 h-80 w-80 rounded-full bg-[#623d67]/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f1726] px-4 py-2 text-sm font-medium text-neutral-300 shadow-[0_12px_26px_rgba(3,7,18,0.45)] transition-all hover:bg-[#152038] hover:text-[#f4f1eb]"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1d1811] to-[#121a2a] px-3 py-1.5 shadow-[inset_0_0_20px_rgba(214,180,124,0.12),0_10px_25px_rgba(2,5,14,0.45)]">
            <Gem className="h-3.5 w-3.5 text-[#d6b47c]" />
            <span className="text-xs uppercase tracking-[0.18em] text-[#e7d9be]">Premium Selection</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.07fr_0.93fr]">
          <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#111a2b]/92 to-[#0a1220]/90 p-4 sm:p-5 shadow-[0_26px_58px_rgba(2,6,20,0.56)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#d6b47c]/10 to-transparent" />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0a1220] px-3 py-1 shadow-[inset_0_0_16px_rgba(142,166,214,0.15)]">
                <Crown className="h-3.5 w-3.5 text-[#d6b47c]" />
                <span className="text-xs uppercase tracking-[0.16em] text-neutral-300">Editorial Preview</span>
              </div>
              {product.badge && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${product.badge === 'NEW' ? 'bg-[#221c38] text-[#c9baf8]' : 'bg-[#231c14] text-[#e7d9be]'
                    }`}
                >
                  {product.badge}
                </span>
              )}
            </div>

            <div className="rounded-[1.6rem] bg-[#0b101b] p-2 sm:p-3 shadow-[inset_0_0_22px_rgba(255,255,255,0.03)]">
              {images.length > 0 ? (
                <ImageCarousel images={images} productName={product.name} />
              ) : (
                <div className="flex h-[520px] items-center justify-center rounded-2xl bg-[#0c1220] text-neutral-400">
                  Rasm mavjud emas
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#10182a]/92 p-3 shadow-[0_12px_30px_rgba(1,4,12,0.42)]">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">Category</p>
                <p className="mt-1 text-sm font-medium text-[#f4f1eb]">{product.category || "Noma'lum"}</p>
              </div>
              <div className="rounded-2xl bg-[#16131a]/92 p-3 shadow-[0_12px_30px_rgba(1,4,12,0.42)]">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">Selection</p>
                <p className="mt-1 text-sm font-medium text-[#f4f1eb]">Curated capsule model</p>
              </div>
              <div className="rounded-2xl bg-[#0f1720]/92 p-3 shadow-[0_12px_30px_rgba(1,4,12,0.42)]">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">Rating</p>
                <p className="mt-1 text-sm font-medium text-[#f4f1eb]">{(product.rating || 0).toFixed(1)} / 5.0</p>
              </div>
            </div>
          </article>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#10182a]/94 to-[#0a1220]/92 p-5 sm:p-6 shadow-[0_22px_54px_rgba(3,8,22,0.5)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#d6b47c]/10 to-transparent" />

              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1a1510] to-[#12182a] px-3 py-1 shadow-[inset_0_0_18px_rgba(214,180,124,0.12)]">
                <Gem className="h-3.5 w-3.5 text-[#d6b47c]" />
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#e7d9be]">Spotlight mahsulot</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-semibold leading-tight text-[#f4f1eb]">{product.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">{renderStars(product.rating || 0)}</div>
                <span className="text-sm text-neutral-400">
                  {(product.rating || 0).toFixed(1)} baho | {reviews.length} sharh
                </span>
              </div>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-3xl sm:text-4xl font-semibold text-[#f4f1eb]">{formatPrice(product.price)} so'm</p>
                {product.originalPrice && (
                  <p className="pb-1 text-base text-neutral-500 line-through">{formatPrice(product.originalPrice)} so'm</p>
                )}
              </div>

              {product.description && (
                <p className="mt-4 rounded-2xl bg-[#0d1526]/92 p-4 text-sm leading-relaxed text-neutral-300 shadow-[inset_0_0_24px_rgba(142,166,214,0.08)]">
                  {product.description}
                </p>
              )}
            </article>

            <article className="rounded-[2rem] bg-[#0d1423]/94 p-5 sm:p-6 shadow-[0_18px_44px_rgba(2,6,18,0.48)] ring-1 ring-inset ring-transparent">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-300">
                    <Palette className="h-4 w-4 text-[#d6b47c]" />
                    Rang tanlang
                    <span className="text-[#d6b47c]">*</span>
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {product.colors.map((color, index) => {
                      const isHex = typeof color === 'string' && color.startsWith('#');

                      if (isHex) {
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${selectedColor === color
                              ? 'scale-110 shadow-[0_0_0_2px_rgba(214,180,124,0.5),0_0_18px_rgba(214,180,124,0.45)]'
                              : 'opacity-85 shadow-[0_10px_22px_rgba(4,8,20,0.55)] hover:opacity-100'
                              }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            {selectedColor === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${selectedColor === color
                            ? 'bg-[#1b2f52] text-[#e8f0ff] shadow-[0_0_16px_rgba(126,169,244,0.38)]'
                            : 'bg-[#0f182b] text-neutral-300 hover:bg-[#16233d]'
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
                <div className="mt-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-300">
                    <Ruler className="h-4 w-4 text-[#d6b47c]" />
                    O'lcham tanlang
                    <span className="text-[#d6b47c]">*</span>
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {sizeOptions.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`h-11 min-w-[48px] rounded-xl px-3 text-sm font-semibold transition-colors ${selectedSize === size
                          ? 'bg-[#1b2f52] text-[#e8f0ff] shadow-[0_0_16px_rgba(126,169,244,0.38)]'
                          : 'bg-[#0f182b] text-neutral-300 hover:bg-[#16233d]'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-300">
                  <Clock3 className="h-4 w-4 text-[#d6b47c]" />
                  Soni
                </h3>

                <div className="inline-flex items-center rounded-2xl bg-[#0f182b] p-1 shadow-[inset_0_0_12px_rgba(142,166,214,0.12)]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-xl p-2.5 text-neutral-200 transition-colors hover:bg-[#1b2b47]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-lg font-semibold text-[#f4f1eb]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-xl p-2.5 text-neutral-200 transition-colors hover:bg-[#1b2b47]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#19140f] to-[#131a2a] px-4 py-3 shadow-[inset_0_0_22px_rgba(214,180,124,0.08)]">
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">Jami summa</p>
                <p className="mt-1 text-2xl font-semibold text-[#f4f1eb]">{formatPrice(subtotal)} so'm</p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f4f1eb] px-5 py-4 text-base font-semibold text-[#0f1014] transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingToCart ? (
                  <DotLoader size="sm" color="bg-[#0f1014]" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {isAddingToCart ? "Qo'shilmoqda..." : "Savatga qo'shish"}
              </button>

              <p className="mt-3 text-center text-xs text-neutral-400">
                Buyurtma bosqichida rang, o'lcham va soni qayta tekshiriladi.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {features.map((feature, index) => (
                  <div key={index} className={`rounded-2xl bg-gradient-to-b ${feature.tone} p-3 text-center shadow-[0_12px_30px_rgba(1,4,12,0.42)]`}>
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1120] shadow-[inset_0_0_14px_rgba(214,180,124,0.15)]">
                      <feature.icon className="h-4 w-4 text-[#d6b47c]" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#f4f1eb]">{feature.title}</p>
                    <p className="mt-1 text-[11px] text-neutral-400">{feature.subtitle}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#f4f1eb]">
                Shu uslubga <span className="font-brilliant text-[#d6b47c]">mos</span> mahsulotlar
              </h2>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f182b] px-3 py-2 text-xs uppercase tracking-[0.14em] text-neutral-200 transition-colors hover:bg-[#16233d]"
              >
                Barchasi
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-[#11192b]/94 to-[#0b1220]/94 shadow-[0_18px_42px_rgba(2,6,18,0.48)]"
                >
                  <Link to={`/product/${item.id}`} className="relative block aspect-[4/5] overflow-hidden">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-transparent to-transparent" />
                  </Link>

                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">{item.category}</p>
                    <Link to={`/product/${item.id}`}>
                      <h3 className="mt-1 max-h-14 overflow-hidden text-lg font-semibold leading-7 text-[#f4f1eb] transition-colors group-hover:text-[#f5ddb4]">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="mt-3 text-xl font-semibold text-[#f4f1eb]">{formatPrice(item.price)} so'm</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-[2rem] bg-gradient-to-br from-[#10182a]/94 via-[#131829]/92 to-[#0d1424]/94 p-6 sm:p-7 lg:p-8 shadow-[0_22px_50px_rgba(2,6,20,0.52)]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1a1510] to-[#111827] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#e7d9be] shadow-[inset_0_0_18px_rgba(214,180,124,0.12)]">
                <Gem className="h-3.5 w-3.5" />
                Real feedback
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#f4f1eb]">Mijozlar fikrlari</h2>
            </div>
            <p className="max-w-md text-sm text-neutral-400">
              Real tajriba va sharhlar mahsulot tanlashda sizga aniqroq qaror qilishga yordam beradi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 rounded-3xl bg-[#0d1526]/92 p-4 sm:p-5 shadow-[0_14px_32px_rgba(2,6,18,0.44)]">
              <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
            </div>
            <div className="lg:col-span-2 rounded-3xl bg-[#0b1220]/92 p-4 sm:p-5 shadow-[0_14px_32px_rgba(2,6,18,0.44)]">
              <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
