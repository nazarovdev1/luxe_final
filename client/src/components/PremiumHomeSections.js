import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ArrowUp, Heart, MoveUpRight, Plus } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, getAllImageUrls, resolveImageUrl } from '../utils/image';
import { apiFetch } from '../services/api';
import LookDetailModal from './LookDetailModal';
import copy from '../data/atelierHomeCopy';
import './atelierHome.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const serial = (index) => String(index + 1).padStart(2, '0');
const fallbackImage = (event) => {
  if (!event.currentTarget.src.endsWith('/placeholder.jpg')) event.currentTarget.src = '/placeholder.jpg';
};

function TextLink({ to, children, className = '' }) {
  return <Link to={to} className={`atelier-link ${className}`}><span>{children}</span><ArrowUpRight size={17} strokeWidth={1.3} aria-hidden="true" /></Link>;
}

function ProductTile({ product, c, currency }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const images = getAllImageUrls(product);
  const favorite = isFavorite(product.id);
  const price = Number(product.price);
  return (
    <article className="atelier-product">
      <div className="atelier-product-photo">
        <Link to={`/product/${product.id}`} className="atelier-product-image" aria-label={`${c.view}: ${product.name}`}>
          <img src={getImageUrl(product)} alt={product.name} loading="lazy" decoding="async" onError={fallbackImage} />
          {images[1] && <img className="atelier-product-alternate" src={images[1]} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
          <span className="atelier-product-discover">{c.view}<Plus size={17} aria-hidden="true" /></span>
        </Link>
        {product.badge === 'NEW' && <span className="atelier-product-badge">{c.new}</span>}
        <button type="button" className={`atelier-favorite ${favorite ? 'is-saved' : ''}`} aria-label={favorite ? c.unfavorite : c.favorite} aria-pressed={favorite} onClick={() => isAuthenticated ? toggleFavorite(product.id) : navigate('/login')}>
          <Heart size={17} strokeWidth={1.25} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="atelier-product-info"><span>{product.category}</span><span>{Number.isFinite(price) && price > 0 ? `${new Intl.NumberFormat('ru-RU').format(price)} ${currency}` : c.price}</span></div>
      <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
    </article>
  );
}

function Collection({ c, language, currency }) {
  const { products, isLoading } = useProducts();
  const [category, setCategory] = useState('');
  const root = useRef(null);
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const selection = useMemo(() => [...products]
    .filter(p => p.id && (!category || p.category === category))
    .sort((a, b) => (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0))
    .slice(0, 4), [products, category]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const tiles = root.current.querySelectorAll('.atelier-product');
      if (tiles.length) gsap.from(tiles, { y: 38, opacity: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 88%', once: true } });
    });
    ScrollTrigger.refresh();
    return () => media.revert();
  }, { scope: root, dependencies: [selection, language, isLoading], revertOnUpdate: true });

  return (
    <section id="products" className="atelier-collection atelier-shell">
      <span id="new-collection" className="atelier-anchor" />
      <span id="bestsellers" className="atelier-anchor" />
      <span id="home-bestsellers" className="atelier-anchor" />
      <div className="atelier-section-heading" data-reveal>
        <div><p className="atelier-eyebrow">01 / {c.selected}</p><h2>{c.collection}<br /><em>{c.collectionItalic}</em></h2></div>
        <div className="atelier-heading-aside"><p>{c.collectionCopy}</p><TextLink to="/products">{c.catalogue}</TextLink></div>
      </div>
      <div id="home-categories" className="atelier-filters" aria-label={c.selected}>
        {[{ value: '', label: c.all }, ...categories.map(name => ({ value: name, label: name }))].map(item => <button type="button" key={item.value} aria-pressed={category === item.value} onClick={() => setCategory(item.value)}>{item.label}<span>{item.value ? products.filter(p => p.category === item.value).length : products.length}</span></button>)}
      </div>
      <div className="atelier-products" ref={root} aria-busy={isLoading}>
        {isLoading && !products.length ? <div className="atelier-product-loading" role="status"><span />{c.loading}</div> : selection.length ? selection.map(product => <ProductTile key={product.id} product={product} c={c} currency={currency} />) : <p className="atelier-empty" role="status">{c.empty}</p>}
      </div>
      <div className="atelier-collection-bottom"><span>THE WARDROBE, RECONSIDERED.</span><TextLink to={category ? `/products?category=${encodeURIComponent(category)}` : '/products'}>{c.catalogue}</TextLink></div>
    </section>
  );
}

function Lookbook({ c }) {
  const [looks, setLooks] = useState([]);
  const [active, setActive] = useState(0);
  const [params, setParams] = useSearchParams();
  const selectedLook = params.get('look');
  const scene = useRef(null);
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/looks').then(result => {
      if (!cancelled && result.success && Array.isArray(result.data)) setLooks(result.data.filter(look => (look._id || look.id) && resolveImageUrl(look.heroImage)).slice(0, 3));
    }).catch(() => { /* Keep the editorial selection available while the service is offline. */ });
    return () => { cancelled = true; };
  }, []);
  const scenes = looks.length ? looks : c.fallbackLooks.map((title, i) => ({ title, heroImage: ['/second_pose.jpg', '/about_photo.jpg', '/heroimgg.jpg'][i] }));
  const activeIndex = Math.min(active, scenes.length - 1);
  const current = scenes[activeIndex];
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(scene.current.querySelectorAll('.atelier-look-layer'), { scale: 1.045, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' });
    });
    return () => media.revert();
  }, { scope: scene, dependencies: [activeIndex, looks], revertOnUpdate: true });
  const openLook = () => {
    const next = new URLSearchParams(params);
    next.set('look', current._id || current.id);
    setParams(next, { preventScrollReset: true });
  };
  const closeLook = () => {
    const next = new URLSearchParams(params);
    next.delete('look');
    setParams(next, { replace: true, preventScrollReset: true });
  };
  return (
    <section id="home-lookbook" className="atelier-lookbook">
      <div className="atelier-lookbook-inner atelier-shell">
        <div className="atelier-look-copy" data-reveal>
          <p className="atelier-eyebrow">02 / {c.looksLabel}</p>
          <h2>{c.looks}<br /><em>{c.looksItalic}</em></h2>
          <p className="atelier-body-copy">{c.looksCopy}</p>
          <div className="atelier-look-select" aria-label={c.looksLabel}>
            {scenes.map((look, i) => <button type="button" key={look._id || look.id || i} aria-pressed={activeIndex === i} onClick={() => setActive(i)}><span>{serial(i)}</span><span>{look.title}</span><ArrowUpRight size={19} strokeWidth={1} aria-hidden="true" /></button>)}
          </div>
          <TextLink to="/lookbooks">{c.allLooks}</TextLink>
        </div>
        <div className="atelier-look-scene" ref={scene}>
          <img key={current.heroImage} className="atelier-look-layer" src={resolveImageUrl(current.heroImage)} alt={current.title} loading="lazy" decoding="async" onError={fallbackImage} />
          <div className="atelier-look-shade" />
          <span className="atelier-look-issue">LUXX / {serial(activeIndex)}</span>
          <div className="atelier-look-caption"><span>{c.editorial}</span><p aria-live="polite">{current.title}</p></div>
          {current._id || current.id ? <button type="button" className="atelier-round-link" aria-label={c.openLook} onClick={openLook}><ArrowUpRight size={30} strokeWidth={1} /></button> : <Link to="/lookbooks" className="atelier-round-link" aria-label={c.allLooks}><ArrowUpRight size={30} strokeWidth={1} /></Link>}
        </div>
      </div>
      {selectedLook && <LookDetailModal lookId={selectedLook} onClose={closeLook} />}
    </section>
  );
}

export default function PremiumHomeSections() {
  const { language, t } = useLanguage();
  const c = copy[language] || copy.uz;
  const root = useRef(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      root.current.querySelectorAll('[data-reveal]').forEach(element => {
        gsap.from(element, { y: 45, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
      gsap.from('.atelier-manifesto-title span', { yPercent: 110, rotate: 2, stagger: 0.12, duration: 1.25, ease: 'power4.out', scrollTrigger: { trigger: root.current.querySelector('.atelier-manifesto-title'), start: 'top 87%', once: true } });
      root.current.querySelectorAll('[data-parallax]').forEach(frame => {
        gsap.fromTo(frame.querySelector('img'), { yPercent: -5, scale: 1.13 }, { yPercent: 5, scale: 1.13, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      gsap.fromTo('.atelier-ribbon-track', { xPercent: 5 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current.querySelector('.atelier-ribbon'), start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
    });
    media.add('(min-width: 1100px) and (prefers-reduced-motion: no-preference)', () => {
      const craft = root.current.querySelector('.atelier-craft');
      gsap.timeline({ scrollTrigger: { trigger: craft, start: 'top 88px', end: '+=55%', pin: true, scrub: 0.8, invalidateOnRefresh: true } })
        .fromTo('.atelier-craft-photo img', { scale: 1.03 }, { scale: 1.2, ease: 'none' }, 0)
        .fromTo('.atelier-craft-detail', { opacity: 0.28, y: 12 }, { opacity: 1, y: 0, stagger: 0.25, ease: 'none' }, 0);
    });
    const onLoad = () => ScrollTrigger.refresh();
    const images = [...root.current.querySelectorAll('img')];
    images.forEach(img => img.addEventListener('load', onLoad, { once: true }));
    let disposed = false;
    document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; images.forEach(img => img.removeEventListener('load', onLoad)); media.revert(); };
  }, { scope: root, dependencies: [language], revertOnUpdate: true });

  return (
    <div ref={root} className="atelier-home">
      <div className="atelier-chapter-line"><span>LUXX — TASHKENT</span><span>{c.edition}</span><a href="#new-collection">{c.discover}<ArrowRight size={13} aria-hidden="true" /></a></div>
      <section id="premium-home" className="atelier-manifesto atelier-shell">
        <div className="atelier-manifesto-meta"><span className="atelier-eyebrow">L’ART DE VIVRE</span><span className="atelier-eyebrow">{c.philosophy}</span></div>
        <div className="atelier-manifesto-layout">
          <figure className="atelier-manifesto-portrait" data-parallax><img src="/about_photo.jpg" alt={c.signature} width="1536" height="2304" loading="lazy" decoding="async" /><figcaption>FIG. 01 — THE ART OF BEING YOU</figcaption></figure>
          <div className="atelier-manifesto-content"><h2 className="atelier-manifesto-title">{c.intro.map((line, i) => <div key={line}><span className={i === 1 ? 'atelier-italic' : ''}>{line}</span></div>)}</h2><div className="atelier-manifesto-description" data-reveal><span className="atelier-asterisk" aria-hidden="true">✳</span><p>{c.introCopy}</p><TextLink to="/about">{c.story}</TextLink></div></div>
          <figure className="atelier-manifesto-detail" data-parallax><img src="/images/mobile/couture-manifesto.webp" alt="" width="900" height="1600" loading="lazy" decoding="async" /><figcaption>{c.signature}</figcaption></figure>
        </div>
        <div className="atelier-manifesto-bottom"><span>LESS NOISE. MORE FEELING.</span><span>THE LUXX WAY ↗</span></div>
      </section>
      <Collection c={c} language={language} currency={t('common.sum')} />
      <Lookbook c={c} />
      <div className="atelier-ribbon" aria-hidden="true"><div className="atelier-ribbon-track">Made to feel. <em>Made for you.</em> <span>✳</span> Made to feel. <em>Made for you.</em></div></div>
      <section id="about" className="atelier-craft">
        <div className="atelier-craft-photo"><img src="/images/mobile/couture-manifesto.webp" alt={c.craftLabel} width="900" height="1600" loading="lazy" decoding="async" /><span>THE FEELING OF LUXX</span></div>
        <div className="atelier-craft-content"><p className="atelier-eyebrow">03 / {c.craftLabel}</p><h2>{c.craft}<br /><em>{c.craftItalic}</em></h2><p className="atelier-body-copy">{c.craftCopy}</p><div className="atelier-craft-details">{c.details.map(([number, title, detail]) => <div className="atelier-craft-detail" key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><Plus size={16} strokeWidth={1} aria-hidden="true" /></div>)}</div><TextLink to="/about">{c.story}</TextLink></div>
      </section>
      <section className="atelier-care atelier-shell"><div className="atelier-section-heading" data-reveal><p className="atelier-eyebrow">04 / {c.care}</p><h2>{c.careTitle} <em>{c.careItalic}</em></h2></div><div className="atelier-services">{c.services.map(([title, detail], i) => <Link to={i === 1 ? '/faq' : '/contact'} className="atelier-service" key={title} data-reveal><span className="atelier-service-number">{serial(i)}</span><MoveUpRight size={26} strokeWidth={1} aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></Link>)}</div></section>
      <section className="atelier-invitation"><div className="atelier-invitation-photo" data-parallax><img src="/second_pose.jpg" alt="" width="1728" height="1152" loading="lazy" decoding="async" /></div><div className="atelier-invitation-content" data-reveal><p className="atelier-eyebrow">{c.invitation}</p><h2>{c.closing}<br /><em>{c.closingItalic}</em></h2><Link to="/products" className="atelier-button">{c.shop}<ArrowUpRight size={20} strokeWidth={1.2} aria-hidden="true" /></Link></div><span className="atelier-invitation-note">A LITTLE LUXURY. ALL YOURS.</span></section>
      <footer id="footer" className="atelier-footer"><div className="atelier-footer-top atelier-shell"><div className="atelier-footer-brand"><Link to="/" aria-label="LUXX">LUXX<span>®</span></Link><p>{c.footerCopy}</p><span>TASHKENT, UZBEKISTAN</span></div><nav aria-label={c.navigation}><p className="atelier-eyebrow">{c.navigation}</p><Link to="/products">{c.catalogue}</Link><Link to="/lookbooks">Lookbook</Link><Link to="/about">{c.about}</Link><Link to="/blog">{c.journal}</Link></nav><nav aria-label={c.help}><p className="atelier-eyebrow">{c.help}</p><Link to="/contact">{c.contact}</Link><Link to="/faq">{c.faq}</Link><Link to="/orders">{c.orders}</Link><Link to="/gift-cards">{c.gift}</Link></nav><a className="atelier-back-top" href="#hero" aria-label={c.back}><ArrowUp size={23} strokeWidth={1} /><span>{c.back}</span></a></div><div className="atelier-footer-bottom atelier-shell"><span>© {new Date().getFullYear()} LUXX</span><span>EVERY WOMAN, HER OWN SIGNATURE.</span><div><Link to="/privacy-policy">{c.privacy}</Link><Link to="/terms">{c.terms}</Link></div></div></footer>
    </div>
  );
}
