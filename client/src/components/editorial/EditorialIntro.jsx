import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function EditorialIntro() {
  const root = useRef(null);
  const { language } = useLanguage();

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const img = root.current?.querySelector('.e-intro-img');
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.12, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        }
      );
    }
  }, { scope: root });

  const content = {
    uz: {
      index: '01 / THE EDIT · CURATED BY LUXX',
      quote: 'Har bir obraz — kayfiyatning davomi.',
      quoteSub: 'kiyim emas. sizning sahnangiz.',
      desc: 'Sokin nafosat shovqin solmaydi, ammo xonadagi butun e’tiborni o‘ziga qaratadi. Toshkent atelyemizda qo‘lda yaratilgan cheklangan sonli siluetlar.',
      badgeTitle: 'EDITION 2026',
      badgeCaption: 'ARXITEKTURAL SILUETLAR',
      link: 'OBRAZLAR JURNALI',
    },
    ru: {
      index: '01 / THE EDIT · CURATED BY LUXX',
      quote: 'Каждый образ — продолжение настроения.',
      quoteSub: 'не просто одежда. ваша сцена.',
      desc: 'Тихая роскошь не кричит, но притягивает все взгляды. Лимитированные архитектурные силуэты, созданные в нашем ташкентском ателье.',
      badgeTitle: 'EDITION 2026',
      badgeCaption: 'АРХИТЕКТУРНЫЕ СИЛУЭТЫ',
      link: 'ЖУРНАЛ ОБРАЗОВ',
    },
    en: {
      index: '01 / THE EDIT · CURATED BY LUXX',
      quote: 'Every silhouette is an extension of poise.',
      quoteSub: 'not just garments. your stage.',
      desc: 'Understated elegance speaks without loud gestures. Limited archival pieces crafted by hand in our Tashkent atelier.',
      badgeTitle: 'EDITION 2026',
      badgeCaption: 'ARCHITECTURAL SILHOUETTES',
      link: 'VIEW LOOKBOOK',
    },
  }[language] || {
    index: '01 / THE EDIT · CURATED BY LUXX',
    quote: 'Har bir obraz — kayfiyatning davomi.',
    quoteSub: 'kiyim emas. sizning sahnangiz.',
    desc: 'Sokin nafosat shovqin solmaydi, ammo xonadagi butun e’tiborni o‘ziga qaratadi. Toshkent atelyemizda qo‘lda yaratilgan cheklangan sonli siluetlar.',
    badgeTitle: 'EDITION 2026',
    badgeCaption: 'ARXITEKTURAL SILUETLAR',
    link: 'OBRAZLAR JURNALI',
  };

  return (
    <section ref={root} className="e-intro-section" aria-label="The Edit">
      <div className="luxx-editorial-shell">
        <div className="e-intro-grid">
          {/* Left Column: Quiet editorial typography and deliberate spacing */}
          <div className="e-intro-aside">
            <div className="e-intro-meta">
              <span className="e-intro-index">{content.index}</span>
              <h2 className="e-intro-quote">
                {content.quote}
                <em>{content.quoteSub}</em>
              </h2>
            </div>

            <p className="e-intro-desc">{content.desc}</p>

            <div>
              <Link to="/lookbooks" className="e-action-link">
                <span>{content.link}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column: High-fashion portrait occupying dominant space */}
          <div className="e-intro-media-wrap">
            <img
              className="e-intro-img"
              src="/second_pose.jpg"
              alt="LUXX The Edit"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
            />
            <div className="e-intro-badge">
              <span className="e-intro-badge-title">{content.badgeTitle}</span>
              <span className="e-intro-badge-caption">{content.badgeCaption}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
