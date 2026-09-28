import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  Heart,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import toast from 'react-hot-toast';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, getAllImageUrls, resolveImageUrl } from '../utils/image';
import { apiFetch } from '../services/api';
import LookDetailModal from './LookDetailModal';
import QuickViewModal from './QuickViewModal';
import copy from '../data/atelierHomeCopy';
import './coutureHome.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fallbackImage = (event) => {
  if (!event.currentTarget.src.endsWith('/placeholder.jpg')) {
    event.currentTarget.src = '/placeholder.jpg';
  }
};

export default function CoutureHomeSections() {
  const { language, t } = useLanguage();
  const c = copy[language] || copy.uz;
  const root = useRef(null);
  const navigate = useNavigate();

  // Contexts
  const { products, isLoading } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // State
  const [activeCategory, setActiveCategory] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [looks, setLooks] = useState([]);
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [params, setParams] = useSearchParams();

  const selectedLookId = params.get('look');

  // Load Lookbooks
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/looks')
      .then((result) => {
        if (!cancelled && result.success && Array.isArray(result.data)) {
          const validLooks = result.data.filter((l) => (l._id || l.id) && resolveImageUrl(l.heroImage));
          if (validLooks.length) setLooks(validLooks.slice(0, 3));
        }
      })
      .catch(() => {
        /* Keep fallback looks */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackLookImages = ['/second_pose.jpg', '/about_photo.jpg', '/heroimgg.jpg'];
  const scenes = looks.length
    ? looks
    : c.fallbackLooks.map((title, i) => ({
        title,
        heroImage: fallbackLookImages[i % fallbackLookImages.length]
      }));

  const currentLook = scenes[Math.min(activeLookIndex, scenes.length - 1)] || scenes[0];

  // Categories & Capsule Selection
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const seasonalSelection = useMemo(() => {
    return [...products]
      .filter((p) => p.id && (!activeCategory || p.category === activeCategory))
      .sort((a, b) => (new Date(b.createdAt || 0).getTime() || 0) - (new Date(a.createdAt || 0).getTime() || 0))
      .slice(0, 4);
  }, [products, activeCategory]);

  // GSAP Animations
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Reveal lines & titles
      root.current?.querySelectorAll('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true
          }
        });
      });

      // 2. Parallax portraits
      root.current?.querySelectorAll('[data-parallax]').forEach((frame) => {
        const img = frame.querySelector('img');
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -6, scale: 1.08 },
            {
              yPercent: 6,
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          );
        }
      });
    });

    // 3. Pinned Runway on Desktop
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const runwaySection = root.current?.querySelector('.couture-section-runway');
      const track = root.current?.querySelector('.couture-runway-track');

      if (runwaySection && track) {
        const getDistance = () => track.scrollWidth - window.innerWidth + 140;

        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: runwaySection,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const total = c.runwayItems.length || 4;
              const idx = Math.min(Math.floor(self.progress * total) + 1, total);
              const counter = root.current?.querySelector('.couture-runway-counter span');
              if (counter) counter.textContent = String(idx).padStart(2, '0');
            }
          }
        });
      }
    });

    const refreshOnLoad = () => ScrollTrigger.refresh();
    const imgs = [...(root.current?.querySelectorAll('img') || [])];
    imgs.forEach((img) => img.addEventListener('load', refreshOnLoad, { once: true }));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', refreshOnLoad));
      media.revert();
    };
  }, { scope: root, dependencies: [seasonalSelection, language, activeLookIndex], revertOnUpdate: true });

  const openLookModal = (look) => {
    const next = new URLSearchParams(params);
    next.set('look', look._id || look.id || '1');
    setParams(next, { preventScrollReset: true });
  };

  const closeLookModal = () => {
    const next = new URLSearchParams(params);
    next.delete('look');
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const handleFavoriteClick = (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFavorite(productId);
  };

  const handleQuickAdd = (product) => {
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    toast.success(`${product.name} savatga qo‘shildi!`);
  };

  return (
    <div ref={root} className="couture-home">
      {/* --------------------------------------------------------------------
          01 / FALSAFA — THE MONOLITH MANIFESTO
          -------------------------------------------------------------------- */}
      <section className="couture-section-manifesto" id="manifesto">
        <div className="couture-shell">
          <div className="couture-manifesto-grid">
            <div className="couture-manifesto-text" data-reveal>
              <span className="couture-kicker">{c.manifestoKicker}</span>
              <h2 className="couture-title couture-manifesto-title">{c.manifestoTitle}</h2>
              <p className="couture-lead">{c.manifestoLead}</p>
              <div style={{ marginTop: '40px' }}>
                <Link to="/about" className="couture-btn-outline">
                  <span>{c.manifestoLink}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="couture-manifesto-portrait" data-parallax>
              <img src="/about_photo.jpg" alt="LUXX Manifesto" onError={fallbackImage} loading="lazy" />
              <div className="couture-manifesto-caption">FIG. 01 — THE ART OF PRESENCE</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          02 / PODIUM — THE ARCHITECTURAL RUNWAY
          -------------------------------------------------------------------- */}
      <section className="couture-section-runway" id="runway">
        <div className="couture-shell">
          <div className="couture-runway-topline" data-reveal>
            <div>
              <span className="couture-kicker">{c.runwayKicker}</span>
              <h2 className="couture-title couture-runway-title">{c.runwayTitle}</h2>
              <p className="couture-lead" style={{ marginTop: '12px', fontSize: '15px' }}>
                {c.runwaySubtitle}
              </p>
            </div>
            <div className="couture-runway-counter">
              <span>01</span>
              <i />
              <span>{String(c.runwayItems.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="couture-runway-container">
          <div className="couture-runway-track">
            {c.runwayItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="couture-runway-card"
                onClick={() => navigate('/products')}
              >
                <div className="couture-runway-card-photo">
                  <img src={item.image} alt={item.title} onError={fallbackImage} loading="lazy" />
                  <div className="couture-runway-card-shade" />
                </div>
                <div className="couture-runway-card-content">
                  <div className="couture-runway-card-meta">
                    {item.material} · {item.origin}
                  </div>
                  <h3 className="couture-title couture-runway-card-title">{item.title}</h3>
                  <p className="couture-runway-card-desc">{item.desc}</p>
                  <div className="couture-runway-card-foot">
                    <span className="couture-runway-price">{item.price}</span>
                    <span className="couture-runway-link">
                      <span>KASHF ETISH</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          03 / GARDEBOR — CURATED EDITORIAL CAPSULE
          -------------------------------------------------------------------- */}
      <section className="couture-section-capsule" id="products">
        <div className="couture-shell">
          <div className="couture-capsule-head" data-reveal>
            <div>
              <span className="couture-kicker">{c.capsuleKicker}</span>
              <h2 className="couture-title couture-capsule-title">{c.capsuleTitle}</h2>
            </div>
            <Link to="/products" className="couture-kicker" style={{ textDecoration: 'none' }}>
              <span>{c.catalogue}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Clean Underline Category Filter */}
          <div className="couture-filter-bar" data-reveal>
            <button
              type="button"
              className={`couture-filter-btn ${activeCategory === '' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              {c.all} ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`couture-filter-btn ${activeCategory === cat ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} ({products.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>

          {/* Asymmetric Gallery Grid */}
          <div className="couture-gallery-grid" aria-busy={isLoading}>
            {seasonalSelection.length ? (
              seasonalSelection.map((product, index) => {
                const images = getAllImageUrls(product);
                const isSaved = isFavorite(product.id);
                const priceNum = Number(product.price);
                const isHeroTile = index === 0;

                return (
                  <article
                    key={product.id}
                    className={`couture-gallery-tile ${isHeroTile ? 'is-hero' : ''}`}
                    data-reveal
                  >
                    <div className="couture-tile-photo">
                      <Link to={`/product/${product.id}`}>
                        <img
                          className="couture-photo-primary"
                          src={getImageUrl(product)}
                          alt={product.name}
                          loading="lazy"
                          onError={fallbackImage}
                        />
                        {images[1] && (
                          <img
                            className="couture-photo-secondary"
                            src={images[1]}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </Link>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        className={`couture-tile-fav ${isSaved ? 'is-saved' : ''}`}
                        aria-label={isSaved ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga saqlash'}
                        onClick={() => handleFavoriteClick(product.id)}
                      >
                        <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>

                      {/* Hover Actions */}
                      <div className="couture-tile-hover-bar">
                        <button
                          type="button"
                          className="couture-tile-btn couture-tile-btn-view"
                          onClick={() => setQuickViewProduct(product)}
                        >
                          <Eye size={13} />
                          <span>{c.view}</span>
                        </button>
                        <button
                          type="button"
                          className="couture-tile-btn couture-tile-btn-cart"
                          onClick={() => handleQuickAdd(product)}
                        >
                          <ShoppingBag size={13} />
                          <span>{c.quickAdd}</span>
                        </button>
                      </div>
                    </div>

                    <div className="couture-tile-info">
                      <div className="couture-tile-cat">{product.category || 'Atelier'}</div>
                      <h3 className="couture-title couture-tile-title">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      <div className="couture-tile-price">
                        {Number.isFinite(priceNum) && priceNum > 0
                          ? `${new Intl.NumberFormat('ru-RU').format(priceNum)} ${t('common.sum')}`
                          : c.price}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                <p>{c.empty}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          04 / OBRAZLAR — THE SPLIT LOOKBOOK
          -------------------------------------------------------------------- */}
      <section className="couture-section-lookbook" id="home-lookbook">
        <div className="couture-shell">
          <div className="couture-lookbook-layout">
            {/* Left Narrative */}
            <div data-reveal>
              <span className="couture-kicker">{c.lookbookKicker}</span>
              <h2 className="couture-title couture-lookbook-title">{c.lookbookTitle}</h2>
              <p className="couture-lead">{c.lookbookQuote}</p>

              <div className="couture-lookbook-tabs">
                {scenes.map((scene, idx) => (
                  <button
                    type="button"
                    key={scene._id || scene.id || idx}
                    className={`couture-lookbook-tab ${activeLookIndex === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveLookIndex(idx)}
                  >
                    <span>{String(idx + 1).padStart(2, '0')}. {scene.title}</span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>

              <Link to="/lookbooks" className="couture-kicker" style={{ textDecoration: 'none' }}>
                <span>{c.allLooks}</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Right Photo Frame */}
            <div className="couture-lookbook-photo-frame" data-parallax>
              <img
                key={currentLook.heroImage}
                src={resolveImageUrl(currentLook.heroImage)}
                alt={currentLook.title}
                onError={fallbackImage}
                loading="lazy"
              />
              <div className="couture-lookbook-frame-overlay">
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: 'var(--c-gold)' }}>
                    LUXX ARCHIVE
                  </div>
                  <div style={{ fontFamily: "'Brilliant', Georgia, serif", fontSize: '28px', textTransform: 'uppercase' }}>
                    {currentLook.title}
                  </div>
                </div>
                <button
                  type="button"
                  className="couture-btn-solid"
                  onClick={() => openLookModal(currentLook)}
                >
                  <span>{c.openLook}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          05 / MATOLAR — THE MATTER OF LUXURY (4 CLEAN COLUMNS)
          -------------------------------------------------------------------- */}
      <section className="couture-section-fabrics" id="fabrics">
        <div className="couture-shell">
          <div className="couture-fabrics-head" data-reveal>
            <span className="couture-kicker">{c.fabricsKicker}</span>
            <h2 className="couture-title couture-fabrics-title">{c.fabricsTitle}</h2>
            <p className="couture-lead" style={{ marginTop: '12px' }}>{c.fabricsSubtitle}</p>
          </div>

          <div className="couture-fabrics-grid">
            {c.fabricsList.map((fabric, idx) => (
              <div key={idx} className="couture-fabric-col" data-reveal>
                <div>
                  <div className="couture-fabric-num">{fabric.num}</div>
                  <h3 className="couture-title couture-fabric-name">{fabric.name}</h3>
                  <div className="couture-fabric-sub">{fabric.subtitle}</div>
                </div>
                <p className="couture-fabric-desc">{fabric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          06 / ATELIER CONCIERGE & FINALE & FOOTER
          -------------------------------------------------------------------- */}
      <section className="couture-section-concierge" id="concierge">
        <div className="couture-shell">
          <div data-reveal>
            <span className="couture-kicker">{c.conciergeKicker}</span>
            <h2 className="couture-title couture-concierge-title">{c.conciergeTitle}</h2>
          </div>

          <div className="couture-concierge-list">
            {c.conciergeRows.map((row, idx) => (
              <Link
                key={idx}
                to={idx === 1 ? '/faq' : '/contact'}
                className="couture-concierge-row"
                data-reveal
              >
                <div className="couture-concierge-row-num">{row.num}</div>
                <div className="couture-title couture-concierge-row-title">{row.title}</div>
                <div className="couture-concierge-row-desc">{row.desc}</div>
                <div className="couture-kicker">
                  <span>{row.action}</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Grand Finale Banner */}
      <section className="couture-section-finale" data-parallax>
        <div className="couture-finale-bg">
          <img src="/second_pose.jpg" alt="" onError={fallbackImage} loading="lazy" />
        </div>
        <div className="couture-shell couture-finale-inner" data-reveal>
          <span className="couture-kicker">{c.finaleKicker}</span>
          <h2 className="couture-title couture-finale-title">{c.finaleTitle}</h2>
          <Link to="/products" className="couture-btn-solid">
            <span>{c.finaleAction}</span>
            <ArrowDownRight size={18} />
          </Link>
        </div>
      </section>

      {/* Midnight Black Footer */}
      <footer className="couture-footer" id="footer">
        <div className="couture-shell">
          <div className="couture-footer-grid">
            <div className="couture-footer-brand">
              <h2 className="couture-title">LUXX</h2>
              <p>{c.footerCopy}</p>
              <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', color: 'var(--c-gold)' }}>
                TASHKENT · EST. 2026
              </span>
            </div>

            <div className="couture-footer-col">
              <h4>KASHF ETING</h4>
              <ul>
                <li><Link to="/products">Katalog</Link></li>
                <li><Link to="/lookbooks">Lookbook</Link></li>
                <li><Link to="/about">Biz haqimizda</Link></li>
                <li><Link to="/blog">Uslub jurnali</Link></li>
              </ul>
            </div>

            <div className="couture-footer-col">
              <h4>SIZ UCHUN</h4>
              <ul>
                <li><Link to="/contact">Aloqa</Link></li>
                <li><Link to="/faq">Savollar</Link></li>
                <li><Link to="/orders">Buyurtmalar</Link></li>
                <li><Link to="/gift-cards">Sovg‘a kartalari</Link></li>
              </ul>
            </div>

            <div className="couture-footer-col">
              <h4>ATELIER MA’LUMOT</h4>
              <p style={{ fontSize: '13px', color: 'var(--c-text-muted)', lineHeight: '1.7' }}>
                Toshkent, O‘zbekiston.<br />
                Har bir chiqishingiz uchun yaratilgan sokin ishonch.
              </p>
            </div>
          </div>

          <div className="couture-footer-bottom">
            <span>© {new Date().getFullYear()} LUXX ATELIER. {c.rights}</span>
            <div>
              <Link to="/privacy-policy">Maxfiylik</Link>
              <Link to="/terms">Foydalanish shartlari</Link>
              <a href="#hero" style={{ marginLeft: '24px', color: 'var(--c-gold)' }}>
                <span>{c.backToTop}</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedLookId && <LookDetailModal lookId={selectedLookId} onClose={closeLookModal} />}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}
    </div>
  );
}
