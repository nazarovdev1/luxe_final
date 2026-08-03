import React, { useRef } from 'react';
import { ArrowDown, ArrowUpRight, Gem, Percent } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const formatPrice = (price) => (typeof price === 'number' ? price : 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const localize = (value, lang) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.uz || value.ru || value.en || '';
};

const BundleHero = ({ bundle, products, discountPercent }) => {
  const { t, language } = useLanguage();
  const root = useRef(null);
  const currency = language === 'en' ? 'UZS' : "so'm";
  const title = localize(bundle.title, language);
  const description = localize(bundle.description, language);
  const images = products.map((product) => product.image).filter(Boolean).slice(0, 4);
  const originalPrice = bundle.originalPrice || products.reduce((sum, product) => sum + (product.price || 0), 0);
  const discountedPrice = bundle.discountedPrice || originalPrice;
  const savings = Math.max(0, originalPrice - discountedPrice);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.bundle-hero-panel', { clipPath: 'inset(0 0 100% 0)', duration: 1.05, stagger: 0.12, ease: 'power4.inOut' })
      .from('.bundle-hero-kicker', { y: 22, autoAlpha: 0, duration: 0.5 }, 0.36)
      .from('.bundle-hero-title-line', { yPercent: 115, rotate: 1.5, duration: 0.8, stagger: 0.1 }, 0.48)
      .from('.bundle-hero-copy, .bundle-hero-price', { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, 0.85)
      .from('.bundle-hero-meta', { x: 18, autoAlpha: 0, duration: 0.45, stagger: 0.07 }, 0.95);

    gsap.to('.bundle-hero-panel:first-child img', {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  }, { scope: root });

  return (
    <section ref={root} className="bundle-hero" aria-label={title}>
      <div className={`bundle-hero-grid bundle-hero-grid-${Math.max(images.length, 1)}`} aria-hidden="true">
        {(images.length ? images : ['/placeholder.jpg']).map((image, index) => (
          <div className="bundle-hero-panel" key={`${image}-${index}`}><img src={image} alt="" /></div>
        ))}
      </div>
      <div className="bundle-hero-wash" aria-hidden="true" />
      <div className="bundle-hero-frame" aria-hidden="true" />

      <div className="bundle-hero-content">
        <div className="bundle-hero-main">
          <div className="bundle-hero-kicker"><Gem size={13} /><span>LUXX CURATED SET · 01</span></div>
          <div className="bundle-hero-title">
            {title.split(' ').map((word, index) => <span className="bundle-hero-title-mask" key={`${word}-${index}`}><span className="bundle-hero-title-line">{word}</span></span>)}
          </div>
          {description && <p className="bundle-hero-copy">{description}</p>}
        </div>

        <aside className="bundle-hero-order">
          <span className="bundle-hero-meta">{products.length.toString().padStart(2, '0')} {t('bundleDetail.itemsCountLabel')}</span>
          <span className="bundle-hero-meta"><Percent size={13} /> {discountPercent}% {t('bundleDetail.discountBadge')}</span>
          <span className="bundle-hero-meta"><ArrowUpRight size={14} /> TANLANGAN LOOK</span>
        </aside>

        <div className="bundle-hero-price">
          <span>{t('bundleDetail.bundlePriceLabel')}</span>
          <strong>{formatPrice(discountedPrice)} <i>{currency}</i></strong>
          {savings > 0 && <p>{formatPrice(originalPrice)} {currency} o‘rniga · <b>{formatPrice(savings)} {currency} tejaysiz</b></p>}
        </div>
      </div>

      <div className="bundle-hero-scroll"><span>{t('bundleDetail.viewLabel')}</span><ArrowDown size={15} /></div>
    </section>
  );
};

export default BundleHero;
