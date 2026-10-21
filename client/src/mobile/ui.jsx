import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, X } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageUrl } from '../utils/image';
import { formatPrice, formatSaleNote, getActiveSale, getDisplayBadge } from '../utils/productDisplay';

export const CURRENCY = { uz: "so'm", ru: 'сум', en: 'UZS' };

export const money = (value, language = 'uz') => `${formatPrice(value)} ${CURRENCY[language] || CURRENCY.uz}`;

export const productIdOf = (product) => product?.id || product?._id;

export const productPath = (product) => `/mobile/product/${productIdOf(product)}`;

// Sticky page header: back on the left, a serif title, one action on the right.
export const TopBar = ({ title, subtitle, back = true, onBack, right = null }) => {
  const navigate = useNavigate();
  const goBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) navigate(-1);
    else navigate('/mobile');
  };
  return (
    <header className="m-top">
      <span>
        {back && (
          <button type="button" className="m-icon-btn" onClick={goBack} aria-label="Orqaga">
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>
        )}
      </span>
      <div className="m-top__title">
        {title}
        {subtitle && <small>{subtitle}</small>}
      </div>
      <span>{right}</span>
    </header>
  );
};

export const Field = ({ label, error, as = 'input', className = '', ...props }) => {
  const Tag = as;
  return (
    <label className={`m-field ${error ? 'm-field--error' : ''} ${className}`}>
      <Tag {...props} placeholder=" " className="m-field__input" />
      <span className="m-field__label">{label}</span>
      <span className="m-field__line" aria-hidden="true" />
      {error && <span className="m-field__error">{error}</span>}
    </label>
  );
};

// An image that arrives from a soft blur instead of popping in.
export const SoftImage = ({ src, alt = '', className = '', eager = false, ...props }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  // A cached image can finish before React attaches onLoad, so check `complete` after every src change.
  useEffect(() => {
    const img = ref.current;
    setLoaded(Boolean(img && img.complete && img.naturalWidth > 0));
  }, [src]);
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={`${loaded ? 'is-loaded' : ''} ${className}`}
      {...props}
    />
  );
};

export const Price = ({ product, withNote = false }) => {
  const { language } = useLanguage();
  const sale = getActiveSale(product);
  return (
    <span className="m-price">
      {money(product.price, language)}
      {sale.active && <s>{formatPrice(sale.originalPrice)}</s>}
      {withNote && sale.active && <span className="m-price__note">{formatSaleNote(sale.endsAt, language)}</span>}
    </span>
  );
};

const TAG_LABELS = {
  uz: { NEW: 'Yangi', LIMITED: 'Cheklangan', ORIGINAL: 'Original' },
  ru: { NEW: 'Новинка', LIMITED: 'Лимит', ORIGINAL: 'Оригинал' },
  en: { NEW: 'New', LIMITED: 'Limited', ORIGINAL: 'Original' },
};

export const ProductCard = ({ product, eager = false }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language } = useLanguage();
  const id = productIdOf(product);
  const labels = TAG_LABELS[language] || TAG_LABELS.uz;
  const tag = product.authenticity?.isOriginal ? 'ORIGINAL' : getDisplayBadge(product);
  const fav = isFavorite?.(id);

  return (
    <Link to={productPath(product)} className="m-card">
      <span className="m-card__frame">
        <SoftImage src={getImageUrl(product)} alt={product.name} eager={eager} />
        {tag && <span className="m-card__tag">{labels[tag]}</span>}
      </span>
      <button
        type="button"
        className={`m-card__fav ${fav ? 'is-on' : ''}`}
        aria-label="Sevimli"
        aria-pressed={Boolean(fav)}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite?.(id); }}
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} fill={fav ? 'currentColor' : 'none'} />
      </button>
      <span className="m-card__meta">
        {product.brand && <span className="m-card__brand">{product.brand}</span>}
        <span className="m-card__name">{product.name}</span>
        <Price product={product} />
      </span>
    </Link>
  );
};

export const CardSkeleton = () => (
  <div aria-hidden="true">
    <div className="m-skel" style={{ aspectRatio: '3 / 4' }} />
    <div className="m-skel m-skel--line" style={{ width: '80%' }} />
    <div className="m-skel m-skel--line" style={{ width: '45%' }} />
  </div>
);

export const ProductGrid = ({ products, loading = false, skeletons = 4 }) => (
  <div className="m-grid">
    {loading && !products.length
      ? Array.from({ length: skeletons }, (_, i) => <CardSkeleton key={i} />)
      : products.map((product, i) => <ProductCard key={productIdOf(product)} product={product} eager={i < 2} />)}
  </div>
);

export const SectionHead = ({ kicker, title, action }) => (
  <div className="m-section__head">
    <div>
      {kicker && <p className="m-kicker">{kicker}</p>}
      {title && <h2 className="m-h2">{title}</h2>}
    </div>
    {action}
  </div>
);

export const Sheet = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="m-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <div className="m-sheet__scrim" onClick={onClose} aria-hidden="true" />
      <div className="m-sheet__panel">
        <div className="m-sheet__grip" aria-hidden="true" />
        <div className="m-sheet__head">
          <h3 className="m-h3">{title}</h3>
          <button type="button" className="m-icon-btn" onClick={onClose} aria-label="Yopish">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Empty = ({ icon: Icon, title, text, action }) => (
  <div className="m-empty">
    {Icon && <Icon className="h-8 w-8" strokeWidth={1.2} />}
    <h2 className="m-h2">{title}</h2>
    {text && <p className="m-body">{text}</p>}
    {action}
  </div>
);

export const LanguageSwitch = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="m-lang" role="group" aria-label="Til">
      {['uz', 'ru', 'en'].map((code) => (
        <button key={code} type="button" aria-pressed={language === code} onClick={() => setLanguage(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
