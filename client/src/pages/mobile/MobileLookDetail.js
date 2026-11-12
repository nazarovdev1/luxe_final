import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowUpRight, Check, Maximize2, RefreshCw, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import { findVariant, getVariants } from '../../utils/productVariants';
import { getAllImageUrls } from '../../utils/image';
import LookbookImage from '../../components/mobile/LookbookImage';
import './mobileLookbook.css';
import { productPath } from '../../utils/productUrl';

const imageOf = (product) => getAllImageUrls(product).find((url) => !url.includes('/placeholder'));
const money = (value) => Number(value || 0).toLocaleString('uz-UZ').replace(/,/g, '.');
const sizesOf = (product) => [...new Set((product.sizes || [])
  .flatMap((size) => typeof size === 'string' ? size.split(/\s+/) : [size]).map(String).filter(Boolean))];

function LookProduct({ product, selection = {}, error, onSelect, t }) {
  const sizes = sizesOf(product);
  const colors = product.colors || [];

  return (
    <article className={`mlb-product ${error ? 'mlb-product--error' : ''}`} data-product-id={product.id}>
      <div className="mlb-product__top">
        <Link to={productPath(product, { mobile: true })} tabIndex={-1} aria-hidden="true"><LookbookImage src={imageOf(product)} alt="" fallback="/placeholder.svg" /></Link>
        <div className="mlb-product__copy">
          <p className="mlb-product__category">{product.category}</p>
          <Link to={productPath(product, { mobile: true })} className="mlb-product__name"><h3>{product.name}</h3><ArrowUpRight size={14} aria-hidden="true" /></Link>
          <p className="mlb-product__price">{money(product.price)} {t('common.sum')}</p>
        </div>
      </div>
      {(colors.length > 0 || sizes.length > 0) && (
        <div className="mlb-product__options">
          {colors.length > 0 && (
            <fieldset>
              <legend>{t('mobileLookDetail.color_label')}</legend>
              <div className="mlb-product__choices">
                {colors.map((color) => (
                  <button key={color} type="button" className="mlb-product__choice" aria-label={color} title={color} aria-pressed={selection.color === color} onClick={() => onSelect(product.id, 'color', color)}>
                    {/^#[0-9a-f]{3,8}$/i.test(color) ? <span className="mlb-product__swatch" style={{ backgroundColor: color }} /> : color}
                    {selection.color === color && <Check size={12} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {sizes.length > 0 && (
            <fieldset>
              <legend>{t('mobileLookDetail.size_label')}</legend>
              <div className="mlb-product__choices">{sizes.map((size) => (
                <button key={size} type="button" className="mlb-product__choice" aria-pressed={selection.size === size} onClick={() => onSelect(product.id, 'size', size)}>{size}</button>
              ))}</div>
            </fieldset>
          )}
        </div>
      )}
      {error && <p className="mlb-product__error" role="alert"><AlertCircle size={14} />{error}</p>}
    </article>
  );
}

export default function MobileLookDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { products } = useProducts();
  const { addToCart, totalItems } = useCart();
  const [look, setLook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const dialogRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setLoadError(false);
    setLook(null);
    setSelections({});
    setErrors({});
    setDescriptionExpanded(false);
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    apiFetch(`/api/looks/${id}`, { signal: controller.signal }).then((result) => {
      if (!active) return;
      if (result.success && result.data && result.data.isActive !== false) setLook(result.data);
      else setLoadError(result.status !== 404);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      window.clearTimeout(timeout);
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [id, attempt]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!zoomed || !dialog) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomed]);

  const lookProducts = useMemo(() => {
    if (!look) return [];
    if (look.products?.length) {
      return look.products.filter(Boolean).map((item) => {
        const productId = typeof item === 'string' ? item : item._id || item.id;
        const cached = products.find((product) => product.id === productId);
        if (typeof item === 'string') return cached;
        return { ...cached, ...item, id: productId, image: imageOf(item) || imageOf(cached) };
      }).filter(Boolean);
    }
    const resolved = (look.items || []).flatMap((item) => {
      if (item.product) {
        const productId = item.product._id || item.product;
        return products.filter((product) => product.id === productId);
      }
      return products.filter((product) => product.category === item.category)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, item.count || 1);
    });
    return [...new Map(resolved.map((product) => [product.id, product])).values()];
  }, [look, products]);

  const selectedByProduct = useMemo(() => Object.fromEntries(lookProducts.map((product) => {
    const sizes = sizesOf(product);
    const colors = product.colors || [];
    return [product.id, {
      color: colors.length === 1 ? colors[0] : selections[product.id]?.color,
      size: sizes.length === 1 ? sizes[0] : selections[product.id]?.size,
    }];
  })), [lookProducts, selections]);

  const handleSelect = (productId, field, value) => {
    setSelections((previous) => ({ ...previous, [productId]: { ...previous[productId], [field]: value } }));
    setErrors((previous) => ({ ...previous, [productId]: null }));
  };

  const handleAddAll = async () => {
    if (isAdding || !lookProducts.length) return;
    const nextErrors = {};
    const chosenVariants = {};
    lookProducts.forEach((product) => {
      const selected = selectedByProduct[product.id] || {};
      if ((product.colors || []).length && !selected.color) nextErrors[product.id] = t('mobileLookDetail.error_color');
      if (sizesOf(product).length && !selected.size) nextErrors[product.id] = nextErrors[product.id] ? t('mobileLookDetail.error_both') : t('mobileLookDetail.error_size');
      const variant = findVariant(product, selected.color, selected.size);
      chosenVariants[product.id] = variant;
      if (!nextErrors[product.id] && (getVariants(product).length ? !variant : product.stock !== undefined && product.stock <= 0)) {
        nextErrors[product.id] = t('common.outOfStock');
      }
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalid = contentRef.current?.querySelector(`[data-product-id="${Object.keys(nextErrors)[0]}"]`);
      firstInvalid?.scrollIntoView({ behavior: 'instant', block: 'center' });
      return;
    }

    setIsAdding(true);
    let added = 0;
    try {
      for (const product of lookProducts) {
        const selected = selectedByProduct[product.id] || {};
        await addToCart(product, selected.color, selected.size, 1, chosenVariants[product.id]);
        added += 1;
      }
      toast.success(`${t('mobileLookDetail.toast_success')} (${added} ${t('mobileLookDetail.success_count')})`);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setIsAdding(false);
    }
  };

  const totalPrice = lookProducts.reduce((sum, product) => sum + (Number(product.price) || 0), 0);
  const heroImage = look?.heroImage || look?.image;

  return (
    <div className="mlb-page mlb-detail">
      <header className="mlb-topbar">
        <Link to="/mobile/lookbooks" className="mlb-detail__back"><ArrowLeft size={19} strokeWidth={1.4} /><span>Lookbook</span></Link>
        <Link to="/mobile/cart" className="mlb-detail__cart"><ShoppingBag size={18} strokeWidth={1.4} />{t('mobileLookDetail.cart_button')}{totalItems > 0 ? ` (${totalItems})` : ''}</Link>
      </header>

      {isLoading ? (
        <div className="mlb-content" role="status" aria-label={t('mobileLookbooks.loading')}>
          <span className="sr-only">{t('mobileLookbooks.loading')}</span>
          <div className="mlb-loading__image mlb-shimmer" />
          <div className="mlb-loading__line mlb-shimmer" />
          <div className="mlb-loading__line mlb-loading__line--short mlb-shimmer" />
        </div>
      ) : !look ? (
        <div className="mlb-content"><div className="mlb-state" role={loadError ? 'alert' : undefined}>
          <h1>{loadError ? t('mobileLookbooks.errorLoading') : t('mobileLookDetail.not_found_title')}</h1>
          <p>{loadError ? t('mobileLookbooks.connectionError') : t('mobileLookDetail.not_found_desc')}</p>
          {loadError ? <button type="button" className="mlb-button mlb-button--outline" onClick={() => setAttempt((value) => value + 1)}><RefreshCw size={16} />{t('mobileLookbooks.retry')}</button> : <Link to="/mobile/lookbooks" className="mlb-button mlb-button--outline">{t('mobileLookDetail.back_to_lookbook')}</Link>}
        </div></div>
      ) : (
        <>
          <button type="button" className="mlb-detail__hero" onClick={() => setZoomed(true)} aria-label={t('mobileLookDetail.image_zoom_label')}>
            <LookbookImage src={heroImage} alt={look.title} />
            <Maximize2 className="mlb-detail__zoom" size={20} strokeWidth={1.3} aria-hidden="true" />
          </button>
          <div className="mlb-content" ref={contentRef}>
            <div className="mlb-detail__intro">
              <h1>{look.title}</h1>
              {look.description && <>
                <p id="look-description" className={descriptionExpanded ? '' : 'mlb-detail__description--collapsed'}>{look.description}</p>
                {look.description.length > 180 && <button type="button" className="mlb-detail__read-more" aria-expanded={descriptionExpanded} aria-controls="look-description" onClick={() => setDescriptionExpanded((value) => !value)}>{t(descriptionExpanded ? 'common.less' : 'common.more')}</button>}
              </>}
            </div>
            <div className="mlb-detail__contents"><h2>{t('mobileLookDetail.contents_label')}</h2><span>{lookProducts.length} {t('mobileLookDetail.success_count')}</span></div>
            {lookProducts.length ? lookProducts.map((product) => <LookProduct key={product.id} product={product} selection={selectedByProduct[product.id]} error={errors[product.id]} onSelect={handleSelect} t={t} />) : <p className="mlb-intro__lead">{t('mobileLookDetail.no_products')}</p>}
          </div>
          <div className="mlb-purchase"><div className="mlb-purchase__inner">
            <div className="mlb-purchase__price"><span>{t('common.total')}</span><strong>{money(totalPrice)} {t('common.sum')}</strong></div>
            <button type="button" className="mlb-button" onClick={handleAddAll} disabled={isAdding || !lookProducts.length}><ShoppingBag size={17} />{isAdding ? t('mobileLookDetail.adding') : t('mobileLookDetail.add_all')}</button>
          </div></div>
          <dialog ref={dialogRef} className="mlb-lightbox" aria-label={t('mobileLookDetail.image_zoom_label')} onClose={() => setZoomed(false)}>
            <button type="button" onClick={() => setZoomed(false)} aria-label={t('common.close')}><X size={24} strokeWidth={1.3} /></button>
            {zoomed && <LookbookImage src={heroImage} alt={look.title} />}
          </dialog>
        </>
      )}
    </div>
  );
}
