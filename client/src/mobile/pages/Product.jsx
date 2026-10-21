import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { Check, ChevronLeft, Heart, Plus, RotateCcw, Ruler, Share2, ShoppingBag, Star, Truck, X } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import SEO from '../../components/SEO';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import BackInStockButton from '../../components/BackInStockButton';
import SizeGuideModal from '../../components/SizeGuideModal';
import { showCartToast } from '../../utils/toast';
import { findVariant, getProductOptions } from '../../utils/productVariants';
import { trackEvent, productAnalyticsPayload } from '../../utils/analytics';
import { getPolicyCopy } from '../../config/policies';
import { API_BASE_URL } from '../../services/api';
import { Empty, Price, ProductGrid, money } from '../ui';
import './product.css';

const WORDS = {
  uz: {
    original: 'Original',
    color: 'Rang',
    size: "O'lcham",
    sizeGuide: "O'lcham jadvali",
    add: "Savatga qo'shish",
    adding: "Qo'shilmoqda",
    added: 'Savatda ✓',
    soldOut: 'Tugagan',
    few: (n) => `Faqat ${n} ta qoldi`,
    pickColor: 'Rangni tanlang',
    pickSize: "O'lchamni tanlang",
    details: 'Tavsif',
    facts: 'Tarkib va parvarish',
    delivery: 'Yetkazish va qaytarish',
    factLabels: { original: 'Original', fabric: 'Tarkibi', origin: 'Ishlab chiqarilgan', care: 'Parvarish', fit: "O'lcham bo'yicha" },
    model: (h, s) => [h && `Model bo'yi ${h} sm`, s && `kiygan o'lchami ${s}`].filter(Boolean).join(', '),
    reviews: 'Sharhlar',
    noReviews: "Hali sharh yo'q. Birinchi bo'lib fikr qoldiring.",
    related: "Shu bo'limdan",
    notFound: 'Mahsulot topilmadi',
    notFoundText: "U sotuvdan olingan bo'lishi mumkin.",
    toCatalogue: 'Katalogga',
    copied: 'Havola nusxalandi',
    error: "Savatga qo'shib bo'lmadi. Qayta urinib ko'ring.",
  },
  ru: {
    original: 'Оригинал',
    color: 'Цвет',
    size: 'Размер',
    sizeGuide: 'Таблица размеров',
    add: 'В корзину',
    adding: 'Добавляем',
    added: 'В корзине ✓',
    soldOut: 'Нет в наличии',
    few: (n) => `Осталось ${n} шт.`,
    pickColor: 'Выберите цвет',
    pickSize: 'Выберите размер',
    details: 'Описание',
    facts: 'Состав и уход',
    delivery: 'Доставка и возврат',
    factLabels: { original: 'Оригинал', fabric: 'Состав', origin: 'Страна', care: 'Уход', fit: 'Посадка' },
    model: (h, s) => [h && `Рост модели ${h} см`, s && `на ней размер ${s}`].filter(Boolean).join(', '),
    reviews: 'Отзывы',
    noReviews: 'Отзывов пока нет. Оставьте первый.',
    related: 'Из этого раздела',
    notFound: 'Товар не найден',
    notFoundText: 'Возможно, он снят с продажи.',
    toCatalogue: 'В каталог',
    copied: 'Ссылка скопирована',
    error: 'Не удалось добавить. Попробуйте ещё раз.',
  },
  en: {
    original: 'Original',
    color: 'Colour',
    size: 'Size',
    sizeGuide: 'Size guide',
    add: 'Add to bag',
    adding: 'Adding',
    added: 'In your bag ✓',
    soldOut: 'Sold out',
    few: (n) => `Only ${n} left`,
    pickColor: 'Choose a colour',
    pickSize: 'Choose a size',
    details: 'Description',
    facts: 'Fabric and care',
    delivery: 'Delivery and returns',
    factLabels: { original: 'Original', fabric: 'Fabric', origin: 'Made in', care: 'Care', fit: 'Fit' },
    model: (h, s) => [h && `Model is ${h} cm`, s && `wears size ${s}`].filter(Boolean).join(', '),
    reviews: 'Reviews',
    noReviews: 'No reviews yet. Be the first.',
    related: 'From this department',
    notFound: 'Product not found',
    notFoundText: 'It may have been taken off sale.',
    toCatalogue: 'To the catalogue',
    copied: 'Link copied',
    error: 'Could not add it. Please try again.',
  },
};

const imageList = (product) => {
  const list = Array.isArray(product?.images) && product.images.length
    ? product.images.map((img) => (typeof img === 'object' ? img.url : img))
    : [product?.image];
  return list.filter(Boolean).length ? list.filter(Boolean) : ['/placeholder.png'];
};

const ProductSkeleton = () => (
  <div className="m-page--bare" aria-hidden="true">
    <div className="m-skel" style={{ height: '68svh' }} />
    <div className="m-pad" style={{ paddingTop: 24 }}>
      <div className="m-skel m-skel--line" style={{ width: '30%' }} />
      <div className="m-skel" style={{ height: 30, width: '85%', marginTop: 16 }} />
      <div className="m-skel m-skel--line" style={{ width: '40%', marginTop: 18 }} />
    </div>
  </div>
);

export default function Product() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const policy = getPolicyCopy(language);
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, fetchProductDetails, isLoading, products } = useProducts();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const product = getProduct(id);

  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [slide, setSlide] = useState(0);
  const [viewer, setViewer] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [sizeGuide, setSizeGuide] = useState(false);
  const galleryRef = useRef(null);

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (id) fetchProductDetails(id);
    setColor('');
    setSize('');
    setSlide(0);
    // fetchProductDetails comes from context and is stable for our purpose; refetch only on id.
  }, [id]);

  useEffect(() => {
    if (product && !isLoading) {
      addToRecentlyViewed(product);
      trackEvent('view_item', productAnalyticsPayload(product));
    }
  }, [product?.id, isLoading]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, [id]);

  const images = useMemo(() => imageList(product), [product]);
  const colors = useMemo(() => (product ? getProductOptions(product, 'color') : []), [product]);
  const sizes = useMemo(() => (product ? getProductOptions(product, 'size') : []), [product]);
  const related = useMemo(
    () => (products || []).filter((item) => item && item.id !== product?.id && item.category === product?.category).slice(0, 4),
    [products, product],
  );

  if (isLoading && !product) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="m-page--bare">
        <Empty
          icon={ShoppingBag}
          title={w.notFound}
          text={w.notFoundText}
          action={<Link to="/mobile/products" className="m-btn m-btn--solid">{w.toCatalogue}</Link>}
        />
      </div>
    );
  }

  const productId = product.id || product._id;
  const fav = isFavorite(productId);
  const inStock = product.stock == null || Number(product.stock) > 0;
  const fewLeft = product.stock != null && Number(product.stock) > 0 && Number(product.stock) <= 3;
  const isOriginal = Boolean(product.authenticity?.isOriginal);
  const composition = [...new Set([product.fabricComposition, ...(product.materials || [])].filter(Boolean))];
  const fitText = [product.fit?.note, w.model(product.modelInfo?.height, product.modelInfo?.wearingSize)].filter(Boolean).join('. ');
  const facts = [
    isOriginal && [w.factLabels.original, [product.brand, product.authenticity?.note].filter(Boolean).join(' · ') || w.original],
    composition.length && [w.factLabels.fabric, composition.join(', ')],
    product.origin && [w.factLabels.origin, product.origin],
    product.careInstructions && [w.factLabels.care, product.careInstructions],
    fitText && [w.factLabels.fit, fitText],
  ].filter(Boolean);
  const rating = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;

  const onGalleryScroll = (event) => {
    const el = event.currentTarget;
    const slideWidth = el.firstElementChild ? el.firstElementChild.clientWidth + 12 : el.clientWidth;
    setSlide(Math.round(el.scrollLeft / slideWidth));
  };

  const share = async () => {
    const url = window.location.href.replace('/mobile/product/', '/product/');
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); toast.success(w.copied); }
    } catch { /* the person closed the share sheet */ }
  };

  const add = async () => {
    if (colors.length && !color) { toast.error(w.pickColor); return; }
    if (sizes.length && !size) { toast.error(w.pickSize); return; }
    setAdding(true);
    try {
      const variant = findVariant(product, color, size);
      await addToCart(product, color, size, 1, variant);
      trackEvent('add_to_cart', productAnalyticsPayload(product, { item_variant: variant?.sku || [color, size].filter(Boolean).join(' / '), quantity: 1 }));
      showCartToast({ itemName: product.name, quantity: 1 });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } catch {
      toast.error(w.error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="m-page--bare mp m-reveal">
      <SEO
        title={product.name}
        description={product.description || `${product.name} — Luxx.uz premium ayollar kiyimlari.`}
        image={images[0]}
        url={`/product/${id}`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': `https://luxx.uz/product/${id}#product`,
            name: product.name,
            image: images,
            description: product.description,
            sku: product.sku || product._id,
            brand: { '@type': 'Brand', name: product.brand || 'Luxx.uz' },
            offers: {
              '@type': 'Offer',
              url: `https://luxx.uz/product/${id}`,
              priceCurrency: 'UZS',
              price: product.price,
              availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          })}
        </script>
      </Helmet>

      <section className="mp-gallery">
        <div ref={galleryRef} className="mp-gallery__track" onScroll={onGalleryScroll}>
          {images.map((src, i) => (
            <button key={src + i} type="button" className="mp-gallery__slide" onClick={() => setViewer(true)} aria-label={`${product.name} ${i + 1}`}>
              <img src={src} alt={i === 0 ? product.name : ''} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            </button>
          ))}
        </div>
        <div className="mp-gallery__bar">
          <button type="button" className="mp-round" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/mobile/products'))} aria-label="Orqaga">
            <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <span>
            <button type="button" className="mp-round" onClick={share} aria-label="Ulashish"><Share2 className="h-[18px] w-[18px]" strokeWidth={1.6} /></button>
            <button type="button" className={`mp-round ${fav ? 'is-on' : ''}`} onClick={() => toggleFavorite(productId)} aria-label="Sevimli" aria-pressed={fav}>
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </span>
        </div>
        {images.length > 1 && (
          <div className="mp-gallery__count" aria-hidden="true">
            {images.map((src, i) => <i key={src + i} className={i === slide ? 'is-on' : ''} />)}
          </div>
        )}
      </section>

      <section className="mp-info m-pad">
        <div className="mp-info__top">
          {product.brand && <span className="m-kicker">{product.brand}</span>}
          {isOriginal && <span className="mp-original"><Check className="h-3 w-3" />{w.original}</span>}
        </div>
        <h1 className="mp-name">{product.name}</h1>
        <div className="mp-price"><Price product={product} withNote /></div>
        {reviews.length > 0 && (
          <a href="#reviews" className="mp-rating">
            <Star className="h-3.5 w-3.5" fill="currentColor" />
            {rating.toFixed(1)} · {reviews.length} {w.reviews.toLowerCase()}
          </a>
        )}

        {colors.length > 0 && (
          <div className="mp-option">
            <div className="mp-option__head"><span>{w.color}</span><em>{color.startsWith('#') ? '' : color}</em></div>
            <div className="mp-swatches">
              {colors.map((value) => {
                const hex = value.startsWith('#');
                return (
                  <button
                    key={value}
                    type="button"
                    className={`${hex ? 'mp-swatch' : 'm-chip'} ${color === value ? 'is-on' : ''}`}
                    style={hex ? { '--swatch': value } : undefined}
                    onClick={() => setColor(value)}
                    aria-pressed={color === value}
                    aria-label={value}
                  >
                    {!hex && value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mp-option">
            <div className="mp-option__head">
              <span>{w.size}</span>
              <button type="button" className="mp-guide" onClick={() => setSizeGuide(true)}><Ruler className="h-3.5 w-3.5" />{w.sizeGuide}</button>
            </div>
            <div className="mp-sizes">
              {sizes.map((value) => (
                <button key={value} type="button" className={`mp-size ${size === value ? 'is-on' : ''}`} onClick={() => setSize(value)} aria-pressed={size === value}>
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {fewLeft && <p className="mp-few">{w.few(Number(product.stock))}</p>}
        {!inStock && (
          <div className="mp-restock">
            <BackInStockButton productId={productId} productName={product.name} hasStock={inStock} size={size} color={color} />
          </div>
        )}

        <ul className="mp-promise">
          <li><Truck className="h-4 w-4" strokeWidth={1.5} />{policy.delivery}</li>
          <li><Check className="h-4 w-4" strokeWidth={1.5} />{policy.tryOn}</li>
          <li><RotateCcw className="h-4 w-4" strokeWidth={1.5} />{policy.returns}</li>
        </ul>

        <div className="mp-accs">
          {product.description && (
            <details className="m-acc" open>
              <summary>{w.details}<Plus className="h-4 w-4" /></summary>
              <div className="m-acc__body">{product.description}</div>
            </details>
          )}
          {facts.length > 0 && (
            <details className="m-acc">
              <summary>{w.facts}<Plus className="h-4 w-4" /></summary>
              <dl className="m-acc__body mp-facts">
                {facts.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </details>
          )}
          <details className="m-acc">
            <summary>{w.delivery}<Plus className="h-4 w-4" /></summary>
            <div className="m-acc__body">
              <p>{policy.delivery}.</p>
              <p>{policy.tryOn}.</p>
              <p>{policy.returns}. {policy.payment}.</p>
            </div>
          </details>
        </div>
      </section>

      <section id="reviews" className="m-section m-pad mp-reviews">
        <h2 className="m-h2">{w.reviews}{reviews.length > 0 && <small> {reviews.length}</small>}</h2>
        {reviews.length === 0 && <p className="m-body" style={{ marginTop: 10 }}>{w.noReviews}</p>}
        <div className="mp-reviews__form"><ReviewForm productId={id} onReviewAdded={(review) => setReviews((prev) => [review, ...prev])} /></div>
        {reviews.length > 0 && <ReviewList reviews={reviews} onReviewDeleted={(reviewId) => setReviews((prev) => prev.filter((r) => r._id !== reviewId))} />}
      </section>

      {related.length > 0 && (
        <section className="m-section m-pad">
          <p className="m-kicker" style={{ marginBottom: 20 }}>{w.related}</p>
          <ProductGrid products={related} />
        </section>
      )}

      <div className="mp-spacer" aria-hidden="true" />
      <div className="m-actionbar">
        <div className="m-actionbar__sum">
          <small>{product.brand || 'Luxx'}</small>
          <strong>{money(product.price, language)}</strong>
        </div>
        <button type="button" className={`m-btn m-btn--solid ${adding ? 'is-busy' : ''} ${added ? 'is-done' : ''}`} onClick={add} disabled={adding || !inStock}>
          {!inStock ? w.soldOut : adding ? w.adding : added ? w.added : w.add}
        </button>
      </div>

      {viewer && (
        <div className="mp-viewer" role="dialog" aria-modal="true">
          <button type="button" className="mp-round mp-viewer__close" onClick={() => setViewer(false)} aria-label="Yopish"><X className="h-5 w-5" /></button>
          <div className="mp-viewer__track">
            {images.map((src, i) => <img key={src + i} src={src} alt="" />)}
          </div>
        </div>
      )}

      <SizeGuideModal isOpen={sizeGuide} onClose={() => setSizeGuide(false)} product={product} productCategory={product.category} />
    </div>
  );
}
