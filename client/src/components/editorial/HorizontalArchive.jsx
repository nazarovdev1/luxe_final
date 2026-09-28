import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getImageUrl } from '../../utils/image';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const formatPrice = (price) => {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) return 'Narxini aniqlashtiring';
  return new Intl.NumberFormat('ru-RU').format(num) + " so'm";
};

export default function HorizontalArchive() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const { products } = useProducts();
  const { language } = useLanguage();

  // Mix products with editorial imagery
  const archiveItems = useMemo(() => {
    const p1 = products[0] || { name: 'Kastyum Shim', price: 1499000, category: 'Kastyum shim' };
    const p2 = products[1] || { name: 'Printli Jaket Set', price: 1549000, category: 'Dvoyka va troyka' };
    const p3 = products[2] || { name: 'Bordo Blazer-Palto', price: 2599000, category: 'Palto plash' };

    return [
      {
        type: 'product',
        num: '01',
        title: p1.name,
        category: p1.category || 'Atelier Selection',
        price: formatPrice(p1.price),
        image: getImageUrl(p1, '/heroimg.jpg'),
        link: p1.id ? `/product/${p1.id}` : '/products',
        badge: 'ARCHIVE 01',
      },
      {
        type: 'editorial',
        num: '02',
        title: 'SILK & CASHMERE DIALOGUE',
        category: 'EDITORIAL FRAME',
        sub: 'Toshkent atelyesi · 2026',
        image: '/about_photo.jpg',
        link: '/about',
        badge: 'EDITORIAL',
      },
      {
        type: 'product',
        num: '03',
        title: p2.name,
        category: p2.category || 'Atelier Selection',
        price: formatPrice(p2.price),
        image: getImageUrl(p2, '/second_pose.jpg'),
        link: p2.id ? `/product/${p2.id}` : '/products',
        badge: 'ARCHIVE 03',
      },
      {
        type: 'editorial',
        num: '04',
        title: 'TACTILE SILUET DETAIL',
        category: 'MATO MAHORATI',
        sub: 'BIELLA VIRGIN WOOL',
        image: '/heroimgg.jpg',
        link: '/about',
        badge: 'TEXTURE',
      },
      {
        type: 'product',
        num: '05',
        title: p3.name,
        category: p3.category || 'Atelier Selection',
        price: formatPrice(p3.price),
        image: getImageUrl(p3, '/look.jpg'),
        link: p3.id ? `/product/${p3.id}` : '/products',
        badge: 'ARCHIVE 05',
      },
      {
        type: 'editorial',
        num: '06',
        title: 'TIMELESS MONOCHROME',
        category: 'CAMPAIGN FINALE',
        sub: 'Limited Production · Tashkent',
        image: '/look2.jpg',
        link: '/lookbooks',
        badge: 'CAMPAIGN',
      },
    ];
  }, [products]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth <= 1024) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const getDistance = () => track.scrollWidth - window.innerWidth + 120;

    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: sectionRef, dependencies: [archiveItems] });

  const text = {
    uz: {
      kicker: '04 / FIZIK ARCHIV',
      title: 'ARXIV KRONIKASI',
      action: 'KATALOGNI OCHISH',
    },
    ru: {
      kicker: '04 / ФИЗИЧЕСКИЙ АРХИВ',
      title: 'ХРОНИКА АРХИВА',
      action: 'ОТКРЫТЬ КАТАЛОГ',
    },
    en: {
      kicker: '04 / PHYSICAL ARCHIVE',
      title: 'CHRONICLE OF PIECES',
      action: 'EXPLORE CATALOGUE',
    },
  }[language] || {
    kicker: '04 / FIZIK ARCHIV',
    title: 'ARXIV KRONIKASI',
    action: 'KATALOGNI OCHISH',
  };

  return (
    <section ref={sectionRef} className="e-archive-section" aria-label="Editorial Archive Rail">
      <div className="luxx-editorial-shell">
        <div className="e-archive-head">
          <div>
            <span className="e-label">{text.kicker}</span>
            <h2 className="e-serif-heading" style={{ fontSize: 'clamp(2rem, 3.2vw, 3.8rem)', marginTop: '8px' }}>
              {text.title}
            </h2>
          </div>

          <Link to="/products" className="e-action-link">
            <span>{text.action}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="e-archive-track-wrap">
        <div ref={trackRef} className="e-archive-track">
          {archiveItems.map((item) => (
            <article key={item.num} className="e-archive-card">
              <span className="e-archive-num-watermark" aria-hidden="true">
                {item.num}
              </span>

              <Link to={item.link} className="e-archive-photo-shell" aria-label={item.title}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
                />
                <span className="e-archive-badge">{item.badge}</span>
              </Link>

              <div className="e-archive-meta">
                <span className="e-archive-cat">{item.category}</span>
                <Link to={item.link} className="e-archive-title">
                  {item.title}
                </Link>
                {item.price ? (
                  <div className="e-archive-sub" style={{ fontWeight: 600, color: 'var(--e-text)' }}>
                    {item.price}
                  </div>
                ) : (
                  <div className="e-archive-sub">{item.sub}</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
