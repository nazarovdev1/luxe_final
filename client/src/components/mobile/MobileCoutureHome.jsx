import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Crown, Gem, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';
import './mobileCoutureHome.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const imageOf = (item) => item?.image || item?.images?.[0] || item?.heroImage || '/mobile.jpg';
const idOf = (item) => item?._id || item?.id;

const money = (value) => {
  const amount = Number(value || 0);
  return amount ? amount.toLocaleString('uz-UZ').replace(/,/g, '.') : '';
};

const SectionHeading = ({ index, eyebrow, title, action, to }) => (
  <header className="mch-heading" data-couture-reveal>
    <div>
      <p className="mch-kicker"><span>{index}</span>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {action && to && <Link to={to} className="mch-text-link">{action}<ArrowRight size={15} /></Link>}
  </header>
);

const CoutureHero = ({ product, returning }) => {
  const heroRef = useRef(null);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || returning) {
      gsap.set('[data-hero-reveal]', { autoAlpha: 1, yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)' });
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    timeline
      .fromTo('.mch-hero__image', { scale: 1.09, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.35 })
      .fromTo('.mch-hero__rail', { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0.35)
      .fromTo('[data-hero-reveal]', { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.05, stagger: 0.09 }, 0.4)
      .fromTo('.mch-hero__actions', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, 1.05);

    gsap.to('.mch-hero__image', {
      yPercent: 7,
      scale: 1.04,
      ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.7 },
    });
  }, { scope: heroRef, dependencies: [returning] });

  return (
    <section className="mch-hero" ref={heroRef} aria-label="LUXX couture collection">
      <div className="mch-hero__media" aria-hidden="true">
        <img className="mch-hero__image" src="/hero-back.png" alt="" fetchpriority="high" />
        <div className="mch-hero__shade" />
        <div className="mch-hero__light" />
      </div>
      <div className="mch-hero__edition"><span className="mch-hero__rail" />LUXX / 2026 EDITION</div>
      <div className="mch-hero__copy">
        <div className="mch-hero__word"><span data-hero-reveal>LUXX</span></div>
        <div className="mch-hero__word mch-hero__word--accent"><span data-hero-reveal>COUTURE</span></div>
        <p className="mch-hero__lead"><span data-hero-reveal>Nafislik shovqin qilmaydi.<br />U xonaga sizdan oldin kiradi.</span></p>
        <div className="mch-hero__actions">
          <Link to="/mobile/products" className="mch-button mch-button--gold">Kolleksiyani kashf etish<ArrowRight size={16} /></Link>
          {product && <Link to={`/mobile/product/${idOf(product)}`} className="mch-button mch-button--ghost">Featured look</Link>}
        </div>
      </div>
      <a href="#new-arrivals" className="mch-hero__scroll"><span>SCROLL TO DISCOVER</span><ArrowDown size={15} /></a>
    </section>
  );
};

const NewArrivals = ({ products }) => (
  <section className="mch-section mch-arrivals" id="new-arrivals">
    <SectionHeading index="01" eyebrow="NEW IN ATELIER" title={<>Yangi <em>kelganlar</em></>} action="Barchasi" to="/mobile/products" />
    <div className="mch-runway">
      {products.slice(0, 3).map((product, index) => (
        <Link to={`/mobile/product/${idOf(product)}`} className={`mch-runway__card mch-runway__card--${index + 1}`} key={idOf(product)} data-couture-card>
          <div className="mch-runway__image"><img src={imageOf(product)} alt={product.name} loading={index ? 'lazy' : 'eager'} /></div>
          <span className="mch-runway__number">0{index + 1}</span>
          <div className="mch-runway__copy">
            <p>{product.category || 'LUXX COLLECTION'}</p>
            <h3>{product.name}</h3>
            <div><strong>{money(product.price)} so‘m</strong><ArrowRight size={16} /></div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

const CuratedSet = ({ bundle }) => {
  if (!bundle) return null;
  const products = bundle.products || [];
  const discount = bundle.discountType === 'percentage'
    ? Number(bundle.discountValue || 0)
    : bundle.originalPrice ? Math.round(((bundle.originalPrice - bundle.discountedPrice) / bundle.originalPrice) * 100) : 0;

  return (
    <section className="mch-section mch-curated" data-couture-reveal>
      <div className="mch-curated__top"><p><Gem size={13} /> LUXX CURATED SET</p>{discount > 0 && <span>−{discount}%</span>}</div>
      <h2>Bir qarash.<br /><em>To‘liq obraz.</em></h2>
      <Link className="mch-curated__stage" to={`/mobile/bundle/${idOf(bundle)}`}>
        <div className="mch-curated__images">
          {(products.length ? products.slice(0, 3) : [bundle]).map((product, index) => (
            <figure key={idOf(product) || index} style={{ '--i': index }}><img src={imageOf(product)} alt={product.name || bundle.title} loading="lazy" /></figure>
          ))}
        </div>
        <div className="mch-curated__copy">
          <p>{products.length} TA MAHSULOT / BIR KOMPOZITSIYA</p>
          <h3>{bundle.title}</h3>
          <div className="mch-curated__price">
            {bundle.originalPrice && <del>{money(bundle.originalPrice)}</del>}
            <strong>{money(bundle.discountedPrice || bundle.originalPrice)} so‘m</strong>
          </div>
          <span className="mch-curated__cta">To‘plamni ko‘rish<ArrowRight size={16} /></span>
        </div>
      </Link>
    </section>
  );
};

const Departments = ({ categories }) => (
  <section className="mch-section mch-departments">
    <SectionHeading index="03" eyebrow="FASHION DEPARTMENTS" title={<>O‘z <em>uslubingizni</em><br />tanlang</>} action="Katalog" to="/mobile/products" />
    <div className="mch-departments__track">
      {categories.map((category, index) => (
        <Link key={category.name} to={`/mobile/products?category=${encodeURIComponent(category.name)}`} className="mch-department" data-couture-card>
          <img src={category.image} alt={category.name} loading="lazy" />
          <div className="mch-department__veil" />
          <span>0{index + 1}</span>
          <div><p>{category.count} MODEL</p><h3>{category.name}</h3><ArrowRight size={18} /></div>
        </Link>
      ))}
    </div>
  </section>
);

const Universe = ({ items }) => (
  <section className="mch-universe">
    <div className="mch-universe__orb" aria-hidden="true" />
    <div className="mch-universe__intro" data-couture-reveal><p>04 / LUXX UNIVERSE</p><h2>Moda — faqat<br />kiyim <em>emas.</em></h2></div>
    <nav className="mch-universe__index" aria-label="LUXX platformalari">
      {items.map((item, index) => (
        <Link to={item.mobilePath} key={item.id} data-couture-reveal style={{ '--accent': item.color || '#d8b36a' }}>
          <span>0{index + 1}</span><strong>{item.label}</strong><ArrowRight size={18} />
        </Link>
      ))}
    </nav>
  </section>
);

const Bestsellers = ({ products }) => {
  if (!products.length) return null;
  return (
    <section className="mch-section mch-best">
      <SectionHeading index="05" eyebrow="MOST WANTED" title={<>Hamma izlayotgan<br /><em>obrazlar</em></>} action="Ko‘rish" to="/mobile/products" />
      <Link to={`/mobile/product/${idOf(products[0])}`} className="mch-best__lead" data-couture-card>
        <div className="mch-best__picture"><img src={imageOf(products[0])} alt={products[0].name} loading="lazy" /><span>NO.01</span></div>
        <div className="mch-best__lead-copy"><p><Crown size={13} /> HOUSE ICON</p><h3>{products[0].name}</h3><div><span><Star size={13} fill="currentColor" /> {(products[0].rating || 5).toFixed(1)}</span><strong>{money(products[0].price)} so‘m</strong></div></div>
      </Link>
      <div className="mch-best__list">
        {products.slice(1).map((product, index) => (
          <Link to={`/mobile/product/${idOf(product)}`} key={idOf(product)} data-couture-reveal>
            <span>0{index + 2}</span><img src={imageOf(product)} alt={product.name} loading="lazy" />
            <div><p>{product.category}</p><h3>{product.name}</h3><strong>{money(product.price)} so‘m</strong></div><ArrowRight size={17} />
          </Link>
        ))}
      </div>
    </section>
  );
};

const Editorial = ({ looks, fallbackProducts, onOpenLook }) => {
  const entries = looks.length ? looks.slice(0, 4).map((look) => ({ ...look, image: look.heroImage, isLook: true })) : fallbackProducts.slice(0, 4);
  return (
    <section className="mch-section mch-editorial">
      <SectionHeading index="06" eyebrow="SHOP THE EDITORIAL" title={<>Kadrdan<br /><em>garderobga</em></>} action="Lookbook" to="/mobile/lookbooks" />
      <div className="mch-film" data-couture-reveal>
        <div className="mch-film__holes" aria-hidden="true" />
        <div className="mch-film__track">
          {entries.map((entry, index) => entry.isLook ? (
            <button type="button" key={idOf(entry)} onClick={() => onOpenLook(idOf(entry))} className="mch-film__frame">
              <img src={entry.image} alt={entry.title} loading="lazy" /><span>FRAME 0{index + 1}</span><strong>{entry.title}</strong>
            </button>
          ) : (
            <Link key={idOf(entry)} to={`/mobile/product/${idOf(entry)}`} className="mch-film__frame">
              <img src={imageOf(entry)} alt={entry.name} loading="lazy" /><span>FRAME 0{index + 1}</span><strong>{entry.name}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Finale = ({ voices }) => (
  <>
    <section className="mch-voices">
      <p className="mch-kicker"><span>07</span>CLIENT NOTES</p>
      {voices.map((voice, index) => (
        <blockquote key={voice.id} data-couture-reveal>
          <span>“</span><p>{voice.quote}</p><footer>{voice.name}<i />{voice.rating} / 5</footer><b>0{index + 1}</b>
        </blockquote>
      ))}
    </section>
    <section className="mch-finale">
      <img src="/images/mobile/couture-manifesto.webp" alt="" loading="lazy" aria-hidden="true" />
      <div className="mch-finale__shade" />
      <div className="mch-finale__copy" data-couture-reveal>
        <p>LUXX MANIFESTO / TASHKENT</p>
        <h2>Siz modaga<br />ergashmaysiz.<br /><em>Uni yaratasiz.</em></h2>
        <div className="mch-finale__trust"><span><ShieldCheck size={17} />14 kun kafolat</span><span><Truck size={17} />Tez yetkazish</span><span><Sparkles size={17} />Original sifat</span></div>
        <Link to="/mobile/products" className="mch-button mch-button--gold">Barcha mahsulotlarni ko‘rish<ArrowRight size={16} /></Link>
      </div>
      <p className="mch-finale__signature">LUXX</p>
    </section>
  </>
);

const LoadingScene = () => (
  <div className="mch-loading" role="status"><span /><p>ATELIER TAYYORLANMOQDA</p></div>
);

export default function MobileCoutureHome({ products, newestProducts, categories, bestsellers, bundle, looks, voices, universeItems, isLoading, onOpenLook }) {
  const root = useRef(null);
  const returning = useMemo(() => Boolean(sessionStorage.getItem('mobileCoutureSeen') || window.scrollY > 40), []);

  useEffect(() => { sessionStorage.setItem('mobileCoutureSeen', '1'); }, []);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set('[data-couture-reveal], [data-couture-card]', { autoAlpha: 1, clearProps: 'transform,clipPath' });
      return;
    }

    gsap.utils.toArray('[data-couture-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 34, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'clamp(top 88%)', once: true },
      });
    });
    gsap.utils.toArray('[data-couture-card]').forEach((element) => {
      const image = element.querySelector('img');
      gsap.fromTo(element, { clipPath: 'inset(12% 0% 12% 0%)', y: 42, autoAlpha: 0 }, {
        clipPath: 'inset(0% 0% 0% 0%)', y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'clamp(top 90%)', once: true },
      });
      if (image) gsap.fromTo(image, { scale: 1.1 }, { scale: 1, duration: 1.35, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'clamp(top 90%)', once: true } });
    });
  }, { scope: root, dependencies: [products.length, looks.length] });

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const images = root.current?.querySelectorAll('img') || [];
    let pending = 0;
    images.forEach((img) => {
      if (!img.complete) { pending += 1; img.addEventListener('load', refresh, { once: true }); img.addEventListener('error', refresh, { once: true }); }
    });
    const timer = window.setTimeout(refresh, pending ? 500 : 60);
    return () => window.clearTimeout(timer);
  }, [products.length, looks.length]);

  if (isLoading && !products.length) return <LoadingScene />;

  return (
    <main className="mch" ref={root}>
      <CoutureHero product={newestProducts[0]} returning={returning} />
      <NewArrivals products={newestProducts} />
      <CuratedSet bundle={bundle} />
      <Departments categories={categories} />
      <Universe items={universeItems} />
      <Bestsellers products={bestsellers} />
      <Editorial looks={looks} fallbackProducts={newestProducts} onOpenLook={onOpenLook} />
      <Finale voices={voices} />
    </main>
  );
}
