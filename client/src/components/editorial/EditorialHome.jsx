import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';
import copy from '../../data/atelierHomeCopy';
import LookDetailModal from '../LookDetailModal';
import QuickViewModal from '../QuickViewModal';

import EditorialIntro from './EditorialIntro';
import CuratedProducts from './CuratedProducts';
import SignatureScrollStory from './SignatureScrollStory';
import CategoryEditorial from './CategoryEditorial';
import LookFeature from './LookFeature';
import HorizontalArchive from './HorizontalArchive';
import LuxxPhilosophy from './LuxxPhilosophy';
import BoutiqueExperience from './BoutiqueExperience';
import ClosingCampaign from './ClosingCampaign';

import './editorialHome.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function EditorialHome() {
  const root = useRef(null);
  const { language } = useLanguage();
  const c = copy[language] || copy.uz;

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [params, setParams] = useSearchParams();
  const selectedLookId = params.get('look');

  const openLookModal = (lookId = '1') => {
    const next = new URLSearchParams(params);
    next.set('look', typeof lookId === 'object' ? (lookId._id || lookId.id || '1') : String(lookId));
    setParams(next, { preventScrollReset: true });
  };

  const closeLookModal = () => {
    const next = new URLSearchParams(params);
    next.delete('look');
    setParams(next, { replace: true, preventScrollReset: true });
  };

  useGSAP(() => {
    const refreshOnLoad = () => ScrollTrigger.refresh();
    const imgs = [...(root.current?.querySelectorAll('img') || [])];
    imgs.forEach((img) => img.addEventListener('load', refreshOnLoad, { once: true }));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', refreshOnLoad));
    };
  }, { scope: root, dependencies: [language] });

  return (
    <main ref={root} className="luxx-editorial-main" id="main-content">
      {/* 01 / THE EDIT — Curated Fashion Story Transition */}
      <EditorialIntro />

      {/* 02 / PRODUCT DISCOVERY — Asymmetric Editorial Catalog */}
      <CuratedProducts onQuickView={setQuickViewProduct} />

      {/* 03 / SIGNATURE SCROLL MOMENT — 100vh Sticky Stage (01 Silhouette / 02 Texture / 03 Presence) */}
      <SignatureScrollStory />

      {/* 04 / CATEGORY CHRONICLE — Magazine Headline Discovery */}
      <CategoryEditorial />

      {/* 05 / A LOOK, NOT A PRODUCT — Cinematic Mood Feature */}
      <LookFeature onOpenLook={() => openLookModal('1')} />

      {/* 06 / HORIZONTAL EDITORIAL ARCHIVE — Mixed Products & Fabric Rail */}
      <HorizontalArchive />

      {/* 07 / LUXX PHILOSOPHY — Dominant Emotional Statement */}
      <LuxxPhilosophy />

      {/* 08 / ATELIER SERVICES — Interactive Boutique Experience */}
      <BoutiqueExperience />

      {/* 09 / CLOSING CAMPAIGN — Pre-Footer Final Frame */}
      <ClosingCampaign />

      {/* --------------------------------------------------------------------
          EXISTING MIDNIGHT BLACK FOOTER (PRESERVED UNTOUCHED)
          -------------------------------------------------------------------- */}
      <footer className="couture-footer" id="footer">
        <div className="luxx-editorial-shell">
          <div className="couture-footer-grid">
            <div className="couture-footer-brand">
              <h2>LUXX</h2>
              <p>{c.footerCopy}</p>
              <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em', color: 'var(--e-gold)' }}>
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
              <p style={{ fontSize: '13px', color: 'var(--e-text-muted)', lineHeight: '1.7' }}>
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
              <a href="#hero" style={{ marginLeft: '24px', color: 'var(--e-gold)' }}>
                <span>{c.backToTop}</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Shared Modals */}
      {selectedLookId && <LookDetailModal lookId={selectedLookId} onClose={closeLookModal} />}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}
    </main>
  );
}
