import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Maximize2, Phone, RefreshCw, RotateCcw, Share2, ShoppingBag, Truck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CONTACT, getPolicyCopy } from '../../config/policies';
import { apiFetch } from '../../services/api';
import { thumbUrl } from '../../utils/image';
import { showCartToast } from '../../utils/toast';
import SEO from '../SEO';
import BundleEditorialImage from './BundleEditorialImage';
import MobileBundleStudio from './MobileBundleStudio';
import BundleMobileOptions from './BundleMobileOptions';
import { bundleEditorialCopy } from './bundleEditorialCopy';
import { getBundleGallery, getEditorialPrices, isBundleOptionAvailable, localizeBundleField, normalizeEditorialProduct } from './bundleEditorialData';
import './bundleEditorial.css';

const money = (value) => Math.round(value).toLocaleString('uz-UZ').replace(/,/g, '.');

function ProductSelection({ product, selected, issue, showErrors, onSelect, mobile, copy, language }) {
  const name = localizeBundleField(product.name, language);
  const available = isBundleOptionAvailable(product);
  const productPath = `${mobile ? '/mobile' : ''}/product/${product.id}`;

  return (
    <article className={`bde-product ${showErrors && issue ? 'bde-product--error' : ''}`} id={`bundle-piece-${product.id}`}>
      <Link to={productPath} className="bde-product__image" tabIndex={-1} aria-hidden="true">
        <BundleEditorialImage src={thumbUrl(product.image, 400)} alt="" unavailable={copy.noImage} />
      </Link>
      <div className="bde-product__body">
        <div className="bde-product__category"><span>{localizeBundleField(product.category, language)}</span>{!issue && <span className="bde-product__ready"><Check size={13} />{copy.chosen}</span>}</div>
        <Link to={productPath} className="bde-product__name"><h3>{name}</h3><ArrowUpRight size={15} aria-hidden="true" /></Link>
        <p className="bde-product__price">{money(product.price)} <span>{copy.currency}</span></p>
        {mobile ? <BundleMobileOptions product={product} selected={selected} onSelect={onSelect} copy={copy} language={language} invalid={showErrors && Boolean(issue)} /> : <div className="bde-product__options">
          {product.colors.length > 0 && <fieldset>
            <legend>{copy.color}<span>{selected.color ? copy.chosen : copy.choose}</span></legend>
            <div className="bde-choices">
              {product.colors.map((color) => <button key={color} type="button" className="bde-choice bde-choice--color" title={color} aria-label={`${copy.color}: ${color}`} aria-pressed={selected.color === color} disabled={!isBundleOptionAvailable(product, color)} onClick={() => onSelect(product, 'color', color)}>
                {/^#[\da-f]{3,8}$/i.test(color) ? <span className="bde-swatch" style={{ backgroundColor: color }} /> : <span>{color}</span>}
                {selected.color === color && <Check size={12} aria-hidden="true" />}
              </button>)}
            </div>
          </fieldset>}
          {product.sizes.length > 0 && <fieldset>
            <legend>{copy.size}<span>{selected.size || copy.choose}</span></legend>
            <div className="bde-choices">
              {product.sizes.map((size) => <button key={size} type="button" className="bde-choice" aria-label={`${copy.size}: ${size}`} aria-pressed={selected.size === size} disabled={!isBundleOptionAvailable(product, selected.color, size)} onClick={() => onSelect(product, 'size', size)}>{size}</button>)}
            </div>
          </fieldset>}
        </div>}
        {(!available || (showErrors && issue)) && <p className="bde-product__error" id={`bundle-error-${product.id}`} role="alert">{!available ? copy.unavailable : issue}</p>}
      </div>
    </article>
  );
}

function BundleSkeleton({ copy }) {
  return <div className="bde-skeleton" role="status" aria-label={copy.loading}>
    <span className="sr-only">{copy.loading}</span>
    <div className="bde-skeleton__gallery bde-shimmer" />
    <div className="bde-skeleton__copy"><div className="bde-shimmer" /><div className="bde-shimmer" /><div className="bde-shimmer" /></div>
  </div>;
}

export default function BundleEditorial({ mobile = false }) {
  const { id } = useParams();
  const { language = 'uz' } = useLanguage();
  const { addLookToCart } = useCart();
  const copy = bundleEditorialCopy[language] || bundleEditorialCopy.uz;
  const policy = getPolicyCopy(language);
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [choices, setChoices] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const selectionRef = useRef(null);
  const dialogRef = useRef(null);
  const addLock = useRef(false);
  const collectionPath = mobile ? '/mobile/bundles' : '/products';
  const isStudio = mobile;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setBundle(null);
    setLoadError(false);
    setChoices({});
    setShowErrors(false);
    setActivePhoto(0);
    setZoomed(false);
    window.scrollTo(0, 0);
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    apiFetch(`/api/bundles/${encodeURIComponent(id)}`, { signal: controller.signal }).then((result) => {
      if (!active) return;
      if (result.success && result.data && result.data.isActive !== false) setBundle(result.data);
      else setLoadError(result.status !== 404 && result.data?.isActive !== false);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      window.clearTimeout(timeout);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [id, attempt]);

  const products = useMemo(() => (bundle?.products || []).filter((product) => product && typeof product === 'object').map(normalizeEditorialProduct), [bundle]);
  const gallery = useMemo(() => bundle ? getBundleGallery(bundle, products) : [], [bundle, products]);
  const selected = useMemo(() => Object.fromEntries(products.map((product) => [product.id, {
    color: product.colors.length === 1 ? product.colors[0] : choices[product.id]?.color,
    size: product.sizes.length === 1 ? product.sizes[0] : choices[product.id]?.size,
  }])), [products, choices]);
  const issues = useMemo(() => Object.fromEntries(products.flatMap((product) => {
    const option = selected[product.id];
    if ((product.colors.length && !option.color) || (product.sizes.length && !option.size)) return [[product.id, copy.selectError]];
    return isBundleOptionAvailable(product, option.color, option.size) ? [] : [[product.id, copy.unavailable]];
  })), [products, selected, copy]);
  const readyCount = products.filter((product) => !issues[product.id]).length;
  const ready = products.length > 0 && readyCount === products.length;
  const unavailable = products.some((product) => !isBundleOptionAvailable(product));
  const prices = bundle ? getEditorialPrices(bundle, products) : { original: 0, discounted: 0, savings: 0 };
  const title = localizeBundleField(bundle?.title, language);
  const description = localizeBundleField(bundle?.description, language);
  const currentPhoto = gallery[activePhoto] || gallery[0];
  const companionIndex = activePhoto === 0 ? 1 : 0;
  const companion = gallery[companionIndex];

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

  const changeChoice = (product, field, value) => {
    setChoices((previous) => {
      const next = { ...previous[product.id], [field]: value };
      if (field === 'color' && !isBundleOptionAvailable(product, value, next.size)) next.size = undefined;
      return { ...previous, [product.id]: next };
    });
  };

  const scrollToSelection = () => {
    const firstId = Object.keys(issues)[0];
    const target = firstId ? document.getElementById(`bundle-piece-${firstId}`) : selectionRef.current;
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    const firstOption = target?.querySelector('button:not(:disabled)');
    firstOption?.focus({ preventScroll: true });
  };

  const addToBag = async () => {
    if (!bundle || !products.length || unavailable || addLock.current) return;
    if (!ready) {
      setShowErrors(true);
      scrollToSelection();
      return;
    }
    addLock.current = true;
    setIsAdding(true);
    try {
      const cartProducts = products.map((product) => ({ ...product, name: localizeBundleField(product.name, language) }));
      await addLookToCart({ ...bundle, title, heroImage: currentPhoto?.url || '', products: cartProducts }, selected);
      showCartToast({ title: copy.success, itemName: title, meta: `${products.length} ${copy.pieces}` });
    } catch {
      toast.error(copy.cartError);
    } finally {
      addLock.current = false;
      setIsAdding(false);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(copy.copied);
      }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error(copy.errorBody);
    }
  };

  const cyclePhoto = (direction) => setActivePhoto((index) => (index + direction + gallery.length) % gallery.length);
  const actionLabel = isAdding ? copy.adding : unavailable ? copy.soldOut : ready ? copy.add : copy.select;
  const renderAction = (className = '') => <button type="button" className={`bde-buy ${className}`} onClick={addToBag} disabled={isAdding || unavailable || !products.length} aria-busy={isAdding}>
    <span>{actionLabel}</span>{ready ? <ShoppingBag size={18} strokeWidth={1.4} /> : <ArrowDown size={18} strokeWidth={1.4} />}
  </button>;
  const summaryIntro = <><p className="bde-eyebrow">{copy.edit}</p><h1>{title}</h1><p className="bde-summary__lead">{description || copy.intro}</p></>;

  return (
    <div className={`bde ${mobile ? 'bde--mobile bde-template--studio' : 'bde--desktop'}`}>
      <header className="bde-topline bde-shell">
        <Link to={collectionPath} className="bde-back"><ArrowLeft size={17} strokeWidth={1.3} /><span>{copy.back}</span></Link>
        <Link to={mobile ? '/mobile' : '/'} className="bde-monogram" aria-label="LUXX UZ">LUXX</Link>
        <button type="button" className="bde-share" onClick={share} aria-label={copy.share}><span>{copy.share}</span><Share2 size={16} strokeWidth={1.3} /></button>
      </header>

      {loading ? <div className="bde-shell"><BundleSkeleton copy={copy} /></div> : !bundle ? (
        <div className="bde-state bde-shell" role={loadError ? 'alert' : undefined}>
          <p className="bde-eyebrow">LUXX COLLECTION</p><h1>{loadError ? copy.error : copy.notFound}</h1>
          <p>{loadError ? copy.errorBody : copy.notFoundBody}</p>
          {loadError ? <button type="button" className="bde-outline" onClick={() => setAttempt((value) => value + 1)}><RefreshCw size={16} />{copy.retry}</button> : <Link to={collectionPath} className="bde-outline">{copy.back}<ArrowRight size={16} /></Link>}
        </div>
      ) : <>
        <SEO title={`${title} | Luxx.uz`} description={description || copy.intro} image={gallery[0]?.url} canonicalPath={`/bundle/${id}`} structuredData={{
          '@context': 'https://schema.org', '@type': 'Product', name: title, description: description || copy.intro,
          image: gallery[0]?.url, offers: { '@type': 'Offer', priceCurrency: 'UZS', price: prices.discounted, availability: `https://schema.org/${unavailable || !products.length ? 'OutOfStock' : 'InStock'}` },
        }} />

        <div className="bde-layout bde-shell">
          {isStudio && <div className="bmt-studio__intro">{summaryIntro}</div>}
          <section className="bde-gallery" aria-label={copy.photo}>
            {mobile ? <MobileBundleStudio gallery={gallery} title={title} language={language} copy={copy} onSelectPhoto={setActivePhoto} onOpenPhoto={(index) => { setActivePhoto(index); setZoomed(true); }} /> : <>
            <div className={`bde-gallery__stage ${companion ? '' : 'bde-gallery__stage--single'}`}>
              <button type="button" className="bde-gallery__main" onClick={() => setZoomed(true)} aria-label={copy.zoom} disabled={!currentPhoto}>
                <BundleEditorialImage src={thumbUrl(currentPhoto?.url, 1200)} alt={localizeBundleField(currentPhoto?.label, language) || title} unavailable={copy.noImage} />
                {currentPhoto && <Maximize2 className="bde-gallery__zoom" size={20} strokeWidth={1.3} aria-hidden="true" />}
              </button>
              {companion && <button type="button" className="bde-gallery__companion" onClick={() => setActivePhoto(companionIndex)} aria-label={`${copy.photo} ${companionIndex + 1}`}>
                <BundleEditorialImage src={thumbUrl(companion.url, 700)} alt={localizeBundleField(companion.label, language) || title} unavailable={copy.noImage} />
                <span>{copy.photo} {String(companionIndex + 1).padStart(2, '0')}<ArrowUpRight size={15} aria-hidden="true" /></span>
              </button>}
            </div>
            <div className="bde-gallery__rail">
              <div className="bde-gallery__thumbs">{gallery.map((photo, index) => <button type="button" key={photo.url} aria-label={`${copy.photo} ${index + 1}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}>
                <BundleEditorialImage src={thumbUrl(photo.url, 160)} alt="" unavailable={copy.noImage} />
              </button>)}</div>
              {gallery.length > 0 && <span className="bde-gallery__count" aria-live="polite">{String(activePhoto + 1).padStart(2, '0')}<i />{String(gallery.length).padStart(2, '0')}</span>}
            </div>
            </>}
          </section>

          <aside className="bde-summary">
            {!isStudio && <div className="bde-summary__intro">{summaryIntro}</div>}
            <div className="bde-price">
              <div className="bde-price__label"><span>{copy.price}</span><span>{products.length} {copy.pieces}</span></div>
              <div className="bde-price__amount"><strong>{money(prices.discounted)}</strong><span>{copy.currency}</span></div>
              {prices.savings > 0 && <div className="bde-price__saving"><del>{money(prices.original)} {copy.currency}</del><span>{copy.saving}: {money(prices.savings)} {copy.currency}</span></div>}
            </div>
            <div className="bde-summary__action">
              {renderAction()}
              <p className="bde-selection-status" aria-live="polite">{ready ? <Check size={14} /> : <span>{readyCount} / {products.length}</span>}{ready ? copy.ready : copy.selected}</p>
            </div>
            <div className="bde-assurance"><Check size={16} strokeWidth={1.3} /><span>{policy.tryOn}</span></div>
            <div className="bde-policy">
              <details><summary><Truck size={17} strokeWidth={1.3} />{copy.delivery}<ChevronDown size={14} /></summary><p>{policy.delivery}<br />{policy.payment}</p></details>
              <details><summary><RotateCcw size={17} strokeWidth={1.3} />{copy.returns}<ChevronDown size={14} /></summary><p>{policy.tryOn}<br />{policy.returns}</p></details>
            </div>
            <div className="bde-help"><p>{copy.needHelp}</p><a href={CONTACT.phoneHref}>{copy.contact}<ArrowUpRight size={14} /></a></div>
          </aside>

          <section className="bde-selection" ref={selectionRef} aria-labelledby="bundle-selection-title">
            <header className="bde-selection__header"><h2 id="bundle-selection-title">{copy.selectionTitle}</h2><p>{copy.selectionIntro}</p></header>
            {products.length ? products.map((product) => <ProductSelection key={product.id} product={product} selected={selected[product.id]} issue={issues[product.id]} showErrors={showErrors} onSelect={changeChoice} mobile={mobile} copy={copy} language={language} />) : <p className="bde-empty">{copy.emptyProducts}</p>}
            {prices.savings > 0 && <div className="bde-receipt">
              <div><span>{copy.separate}</span><span>{money(prices.original)} {copy.currency}</span></div>
              <div className="bde-receipt__saving"><span>{copy.saving}</span><span>−{money(prices.savings)} {copy.currency}</span></div>
              <div className="bde-receipt__total"><span>{copy.price}</span><strong>{money(prices.discounted)} {copy.currency}</strong></div>
            </div>}
          </section>
        </div>

        <footer className="bde-footer bde-shell"><span className="bde-footer__brand">LUXX</span><p>{copy.finish}</p><a href={CONTACT.phoneHref}><Phone size={14} strokeWidth={1.3} />{CONTACT.phone}</a></footer>

        <div className="bde-mobile-purchase"><div><span>{copy.price}</span><strong>{money(prices.discounted)} <small>{copy.currency}</small></strong></div>{renderAction()}</div>

        <dialog ref={dialogRef} className="bde-lightbox" aria-label={copy.zoom} onClose={() => setZoomed(false)} onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); cyclePhoto(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); cyclePhoto(-1); }
        }}>
          <button type="button" className="bde-lightbox__close" onClick={() => setZoomed(false)} aria-label={copy.close}><X size={24} strokeWidth={1.3} /></button>
          {zoomed && <BundleEditorialImage src={currentPhoto?.url} alt={localizeBundleField(currentPhoto?.label, language) || title} unavailable={copy.noImage} />}
          {gallery.length > 1 && <div className="bde-lightbox__controls"><button type="button" onClick={() => cyclePhoto(-1)} aria-label={copy.previous}><ChevronLeft size={23} /></button><span>{activePhoto + 1} / {gallery.length}</span><button type="button" onClick={() => cyclePhoto(1)} aria-label={copy.next}><ChevronRight size={23} /></button></div>}
        </dialog>
      </>}
    </div>
  );
}
