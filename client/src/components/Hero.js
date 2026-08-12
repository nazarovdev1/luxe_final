import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, Gem, Play, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(useGSAP);

const Hero = () => {
  const { t } = useLanguage();
  const root = useRef(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.luxx-hero-image', { scale: 1.08, autoAlpha: 0, duration: 1.05 }, 0)
      .from('.luxx-hero-kicker', { y: 24, autoAlpha: 0, duration: 0.58 }, 0.42)
      .from('.luxx-hero-word', { yPercent: 118, rotate: 2, duration: 0.82, stagger: 0.09 }, 0.5)
      .from('.luxx-hero-copy', { y: 20, autoAlpha: 0, duration: 0.55 }, 0.78)
      .from('.luxx-hero-action', { y: 16, autoAlpha: 0, duration: 0.44, stagger: 0.08 }, 0.88)
      .from('.luxx-hero-side-note', { x: 24, autoAlpha: 0, duration: 0.48 }, 0.9)
      .to('.luxx-hero-intro-mark', { yPercent: -36, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 0.28)
      .to('.luxx-hero-intro', { scaleY: 0, transformOrigin: 'top center', duration: 0.78, ease: 'power4.inOut' }, 0.43)
      .set('.luxx-hero-intro', { autoAlpha: 0, pointerEvents: 'none' });

    const image = root.current?.querySelector('.luxx-hero-image');
    const glow = root.current?.querySelector('.luxx-hero-glow');
    const moveImageX = image ? gsap.quickTo(image, 'x', { duration: 0.9, ease: 'power3.out' }) : null;
    const moveImageY = image ? gsap.quickTo(image, 'y', { duration: 0.9, ease: 'power3.out' }) : null;
    const moveGlowX = glow ? gsap.quickTo(glow, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
    const moveGlowY = glow ? gsap.quickTo(glow, 'y', { duration: 1.1, ease: 'power3.out' }) : null;

    const onMove = event => {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * 14;
      moveImageX?.(x);
      moveImageY?.(y);
      moveGlowX?.(-x * 1.5);
      moveGlowY?.(-y * 1.5);
    };

    root.current?.addEventListener('pointermove', onMove, { passive: true });
    return () => root.current?.removeEventListener('pointermove', onMove);
  }, { scope: root });

  return (
    <section id="hero" ref={root} className="luxx-hero">
      <div className="luxx-hero-noise" aria-hidden="true" />
      <div className="luxx-hero-stage">
        <div className="luxx-hero-image-shell" aria-hidden="true">
          <div className="luxx-hero-image-fill" />
          <img
            className="luxx-hero-image"
            src="/heroimg.jpg"
            alt=""
            width="2304"
            height="1536"
            fetchPriority="high"
            decoding="async"
          />
          <div className="luxx-hero-image-shade" />
          <div className="luxx-hero-glow" />
        </div>

        <div className="luxx-hero-serial" aria-hidden="true">
          <span>01</span>
          <i />
          <span>26</span>
        </div>

        <div className="luxx-hero-layout">
          <div className="luxx-hero-copy-column">
            <div className="luxx-hero-kicker">
              <Gem size={13} />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="luxx-hero-title" aria-label={`${t('hero.title1')} ${t('hero.title2')}`}>
              <span className="luxx-hero-title-mask"><span className="luxx-hero-word">{t('hero.title1')}</span></span>
              <span className="luxx-hero-title-mask luxx-hero-title-offset"><span className="luxx-hero-word">{t('hero.title2')}</span></span>
            </h1>

            <p className="luxx-hero-copy">{t('hero.description')}</p>

            <div className="luxx-hero-actions">
              <Link to="/products?filter=new" className="luxx-hero-action luxx-hero-primary">
                <span>{t('hero.viewCollection')}</span>
                <ArrowDownRight size={18} />
              </Link>
              <Link to="/#home-lookbook" className="luxx-hero-action luxx-hero-secondary">
                <Play size={13} fill="currentColor" />
                <span>{t('hero.lookbook')}</span>
              </Link>
            </div>
          </div>

          <aside className="luxx-hero-side-note">
            <span className="luxx-hero-side-label"><Sparkles size={12} /> YANGI NASHR</span>
            <p>Har bir chiqishingiz uchun yaratilgan sokin ishonch.</p>
            <Link to="/products?filter=new" aria-label={t('hero.viewCollection')}><ArrowRight size={18} /></Link>
          </aside>
        </div>

        <div className="luxx-hero-bottomline" aria-hidden="true">
          <span>EST. TASHKENT</span>
          <div><i /><span>SCROLL TO EXPLORE</span></div>
          <span>WOMEN'S EDIT 2026</span>
        </div>
        <div className="luxx-hero-intro" aria-hidden="true">
          <span className="luxx-hero-intro-mark">LUXX</span>
          <span className="luxx-hero-intro-caption">TOSHKENT · 2026</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
