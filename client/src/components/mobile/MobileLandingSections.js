import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER — number scrolls up on viewport enter
───────────────────────────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTs = null;
          const duration = 1200;
          const step = (timestamp) => {
            if (!startTs) startTs = timestamp;
            const progress = Math.min((timestamp - startTs) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─────────────────────────────────────────────────────────────
   MOBILE HERO — 5-layer cinematic depth system
───────────────────────────────────────────────────────────── */
export const MobileHero = ({ product, onScrollToProducts }) => {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bgShift = scrollY * 0.18;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* HERO WRAPPER */
        .mh-hero {
          position: relative;
          height: 100svh;
          min-height: 680px;
          overflow: hidden;
          background: #05050a;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        /* DEPTH 0 — BG */
        .mh-bg {
          position: absolute;
          inset: -8% -2%;
          z-index: 0;
          will-change: transform;
        }
        .mh-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .mh-bg-ov-v {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(5,5,10,0.12) 0%,
            rgba(5,5,10,0.04) 30%,
            rgba(5,5,10,0.55) 65%,
            rgba(5,5,10,1) 100%
          );
        }
        .mh-bg-ov-h {
          position: absolute; inset: 0;
          background: linear-gradient(to right,
            rgba(5,5,10,0.82) 0%,
            rgba(5,5,10,0.15) 50%,
            rgba(5,5,10,0.5) 100%
          );
        }

        /* DEPTH 1 — ORB ATMOSPHERE */
        .mh-orbs {
          position: absolute; inset: 0;
          z-index: 1; pointer-events: none; overflow: hidden;
        }
        .mh-orb {
          position: absolute; border-radius: 50%;
        }
        .mh-orb-1 {
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(214,180,124,0.14), transparent 70%);
          filter: blur(45px);
          top: 5%; left: -8%;
          animation: mhf1 9s ease-in-out infinite;
        }
        .mh-orb-2 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(214,180,124,0.07), transparent 70%);
          filter: blur(55px);
          top: 28%; right: -14%;
          animation: mhf2 12s ease-in-out infinite;
        }
        .mh-orb-3 {
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(170,140,210,0.09), transparent 70%);
          filter: blur(30px);
          bottom: 32%; left: 18%;
          animation: mhf3 8s ease-in-out infinite 1s;
        }
        .mh-orb-4 {
          width: 80px; height: 80px;
          background: radial-gradient(circle, rgba(214,180,124,0.18), transparent 70%);
          filter: blur(18px);
          top: 52%; right: 8%;
          animation: mhf1 7s ease-in-out infinite reverse;
        }
        @keyframes mhf1 {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(14px,-18px); }
          66% { transform: translate(-10px,13px); }
        }
        @keyframes mhf2 {
          0%,100% { transform: translate(0,0); }
          40% { transform: translate(-18px,22px); }
          70% { transform: translate(9px,-13px); }
        }
        @keyframes mhf3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(7px,-10px) scale(1.05); }
        }

        /* DEPTH 2 — SCAN LINE FX */
        .mh-scan {
          position: absolute; inset: 0;
          z-index: 2; pointer-events: none; overflow: hidden;
        }
        .mh-scan::after {
          content: '';
          position: absolute;
          top: -2px; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, rgba(214,180,124,0.5), transparent);
          animation: mh-scanline 6s linear infinite;
        }
        @keyframes mh-scanline {
          0% { top: -2px; opacity: 0; }
          4% { opacity: 1; }
          96% { opacity: 0.25; }
          100% { top: 100%; opacity: 0; }
        }

        /* DEPTH 3 — CORNER ACCENTS + DOTS */
        .mh-corner {
          position: absolute; width: 18px; height: 18px;
          z-index: 3; pointer-events: none;
          opacity: 0;
          animation: mh-fadein 1s ease 0.3s forwards;
        }
        .mh-corner-tl { top: 18px; left: 18px; border-top: 1.5px solid rgba(214,180,124,0.45); border-left: 1.5px solid rgba(214,180,124,0.45); }
        .mh-corner-tr { top: 18px; right: 18px; border-top: 1.5px solid rgba(214,180,124,0.45); border-right: 1.5px solid rgba(214,180,124,0.45); }
        .mh-dots-grid {
          position: absolute; top: 22px; right: 40px; z-index: 3;
          display: grid; grid-template-columns: repeat(4,1fr); gap: 5px;
          pointer-events: none;
          opacity: 0;
          animation: mh-fadein 1s ease 0.6s forwards;
        }
        .mh-dot { width: 2.5px; height: 2.5px; border-radius: 50%; background: rgba(214,180,124,0.3); }
        .mh-dot:nth-child(3n) { background: rgba(214,180,124,0.12); }

        /* DEPTH 4 — MAIN CONTENT */
        .mh-content {
          position: relative; z-index: 10;
          padding: 0 20px 28px;
          display: flex; flex-direction: column;
        }

        /* Badge */
        .mh-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 13px 5px 8px; width: fit-content;
          border-radius: 100px;
          border: 1px solid rgba(214,180,124,0.28);
          background: rgba(214,180,124,0.07);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          margin-bottom: 14px;
          opacity: 0; animation: mh-slideup 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
        }
        .mh-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #d6b47c;
          animation: mh-pulse 2s ease-in-out infinite;
        }
        @keyframes mh-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.45; transform:scale(0.75); }
        }
        .mh-badge-txt {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase; color: #d6b47c;
        }

        /* Headline */
        .mh-title {
          margin: 0 0 13px;
          opacity: 0; animation: mh-slideup 0.85s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
        }
        .mh-tl1 {
          display: block;
          font-size: clamp(50px, 14.5vw, 76px);
          font-weight: 200; line-height: 0.92;
          color: #f4f1eb; letter-spacing: -0.025em;
        }
        .mh-tl2 {
          display: block;
          font-size: clamp(50px, 14.5vw, 76px);
          font-weight: 200; line-height: 0.92;
          color: #d6b47c; letter-spacing: -0.025em;
          font-style: italic;
        }
        .mh-tl3 {
          display: block;
          font-size: clamp(24px, 7vw, 40px);
          font-weight: 300; line-height: 1.1;
          color: rgba(244,241,235,0.45); letter-spacing: 0.1em;
          margin-top: 6px;
        }

        /* Desc */
        .mh-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px; line-height: 1.7;
          color: rgba(244,241,235,0.5);
          max-width: 280px; margin: 0 0 22px;
          opacity: 0; animation: mh-slideup 0.85s cubic-bezier(0.22,1,0.36,1) 0.46s forwards;
        }

        /* CTAs */
        .mh-ctas {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
          opacity: 0; animation: mh-slideup 0.85s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .mh-btn-p {
          display: flex; align-items: center; gap: 7px;
          padding: 0 22px; height: 46px;
          background: #d6b47c; color: #080602;
          border: none; border-radius: 0 20px 0 20px;
          font-family: 'Inter', sans-serif;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none; flex-shrink: 0;
          box-shadow: 0 6px 24px rgba(214,180,124,0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .mh-btn-p:active { transform: scale(0.96); box-shadow: 0 2px 10px rgba(214,180,124,0.2); }
        .mh-btn-s {
          display: flex; align-items: center; gap: 7px;
          padding: 0 18px; height: 46px;
          background: rgba(255,255,255,0.055);
          color: rgba(244,241,235,0.75);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 100px;
          font-family: 'Inter', sans-serif;
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.07em;
          text-decoration: none; flex-shrink: 0;
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .mh-btn-s:active { transform: scale(0.96); background: rgba(255,255,255,0.09); }

        /* Stats */
        .mh-stats {
          display: flex; align-items: stretch; gap: 0;
          background: rgba(255,255,255,0.033);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          overflow: hidden;
          margin-bottom: 10px;
          opacity: 0; animation: mh-slideup 0.85s cubic-bezier(0.22,1,0.36,1) 0.75s forwards;
        }
        .mh-stat {
          flex: 1; padding: 14px 8px; text-align: center;
        }
        .mh-stat + .mh-stat {
          border-left: 1px solid rgba(255,255,255,0.06);
        }
        .mh-stat-n {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 24px; font-weight: 700;
          color: #fff; line-height: 1; margin-bottom: 4px;
        }
        .mh-stat-l {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 9px; color: rgba(255,255,255,0.3);
          text-transform: uppercase; letter-spacing: 0.07em;
        }

        /* Premium card */
        .mh-pc {
          display: flex; align-items: flex-start; gap: 11px;
          padding: 13px 15px;
          background: rgba(214,180,124,0.065);
          border: 1px solid rgba(214,180,124,0.16);
          border-radius: 16px;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          opacity: 0; animation: mh-slideup 0.85s cubic-bezier(0.22,1,0.36,1) 0.9s forwards;
        }
        .mh-pc-icon {
          width: 30px; height: 30px; flex-shrink: 0;
          background: rgba(214,180,124,0.1);
          border: 1px solid rgba(214,180,124,0.18);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .mh-pc-title {
          font-family: 'Inter', sans-serif;
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #d6b47c; margin-bottom: 3px;
        }
        .mh-pc-desc {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px; line-height: 1.55;
          color: rgba(244,241,235,0.4);
        }

        /* Scroll hint */
        .mh-scroll {
          position: absolute; bottom: 8px; left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          opacity: 0; animation: mh-fadein 1s ease 1.3s forwards;
        }
        .mh-scroll span {
          font-family: 'Inter', sans-serif;
          font-size: 7.5px; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
        }
        .mh-scroll-icon {
          width: 13px; height: 13px; color: rgba(255,255,255,0.18);
          animation: mh-bounce 2.2s ease-in-out infinite;
        }
        @keyframes mh-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        /* KEY ANIMATIONS */
        @keyframes mh-slideup {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mh-fadein {
          from { opacity: 0; } to { opacity: 1; }
        }

        /* REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          .mh-badge,.mh-title,.mh-desc,.mh-ctas,.mh-stats,.mh-pc,.mh-scroll,.mh-corner,.mh-dots-grid {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .mh-orb-1,.mh-orb-2,.mh-orb-3,.mh-orb-4,
          .mh-badge-dot,.mh-scroll-icon,.mh-scan::after { animation: none !important; }
        }
      `}</style>

      <section className="mh-hero" aria-label="Bosh sahifa hero">

        {/* DEPTH 0 — Background with parallax */}
        <div
          className="mh-bg"
          aria-hidden="true"
          style={{ transform: `translateY(${bgShift}px)` }}
        >
          <img src="/333-mobile.webp" alt="" fetchPriority="high" width={800} height={1200} decoding="async" />
          <div className="mh-bg-ov-v" />
          <div className="mh-bg-ov-h" />
        </div>

        {/* DEPTH 1 — Atmospheric orbs */}
        <div className="mh-orbs" aria-hidden="true">
          <div className="mh-orb mh-orb-1" />
          <div className="mh-orb mh-orb-2" />
          <div className="mh-orb mh-orb-3" />
          <div className="mh-orb mh-orb-4" />
        </div>

        {/* DEPTH 2 — Scan line */}
        <div className="mh-scan" aria-hidden="true" />

        {/* DEPTH 3 — Decorative accents */}
        <div className="mh-corner mh-corner-tl" aria-hidden="true" />
        <div className="mh-corner mh-corner-tr" aria-hidden="true" />
        <div className="mh-dots-grid" aria-hidden="true">
          {[...Array(16)].map((_, i) => <div key={i} className="mh-dot" />)}
        </div>

        {/* DEPTH 4 — Main content */}
        <div className="mh-content">
          <div className="mh-badge">
            <div className="mh-badge-dot" />
            <span className="mh-badge-txt">{t('premiumHome.heroTopTag')}</span>
          </div>

          <h1 className="mh-title">
            <span className="mh-tl1">{t('premiumHome.heroNewLine1')}</span>
            <span className="mh-tl2">{t('premiumHome.heroNewLine2')}</span>
            <span className="mh-tl3">{t('premiumHome.heroYear')}</span>
          </h1>

          <p className="mh-desc">{t('premiumHome.heroDesc')}</p>

          <div className="mh-ctas">
            <Link to="/mobile/products?filter=new" className="mh-btn-p">
              {t('premiumHome.heroViewButton')}
              <ArrowRight size={13} />
            </Link>
            <button
              className="mh-btn-s"
              onClick={() => document.getElementById('lookbook-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('premiumHome.heroLookbookButton')}
              <ShoppingBag size={13} />
            </button>
          </div>

          <div className="mh-stats">
            <div className="mh-stat">
              <span className="mh-stat-n"><AnimatedCounter target={50} suffix="+" /></span>
              <span className="mh-stat-l">{t('premiumHome.heroStatProducts')}</span>
            </div>
            <div className="mh-stat">
              <span className="mh-stat-n"><AnimatedCounter target={4} suffix="+" /></span>
              <span className="mh-stat-l">{t('premiumHome.heroStatCategories')}</span>
            </div>
            <div className="mh-stat">
              <span className="mh-stat-n"><AnimatedCounter target={3} suffix="h" /></span>
              <span className="mh-stat-l">Yetkazish</span>
            </div>
          </div>

          {/* <div className="mh-pc">
            <div className="mh-pc-icon">
              <Sparkles size={13} color="#d6b47c" />
            </div>
            <div>
              <p className="mh-pc-title">{t('premiumHome.heroPremiumBadge')}</p>
              <p className="mh-pc-desc">{t('premiumHome.heroPremiumDesc')}</p>
            </div>
          </div> */}
        </div>

        {/* DEPTH 5 — Scroll hint */}
        <div className="mh-scroll">
          <span>Scroll</span>
          <ChevronDown className="mh-scroll-icon" />
        </div>
      </section>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   BRAND JOURNEY — cinematic reveal on scroll
───────────────────────────────────────────────────────────── */
export const BrandJourney = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* BRAND JOURNEY — warm dark luxury, image 1 style */
        .bj-wrap {
          position: relative;
          min-height: 292px;
          overflow: hidden;
          background: #0e0b06;
          border-top: 1px solid rgba(201,169,110,0.22);
          border-bottom: 1px solid rgba(201,169,110,0.16);
        }

        /* Right-side image panel */
        .bj-img-panel {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 67%;
          z-index: 1;
        }
        .bj-img-panel img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: 56% 18%;
          opacity: 0.95;
        }
        /* Gradient overlays */
        .bj-ov-left {
          position: absolute; inset-y: 0; left: 0; width: 100%;
          background: linear-gradient(to right, #0e0b06 0%, #0e0b06 35%, rgba(14,11,6,.74) 56%, rgba(14,11,6,.12) 100%);
          z-index: 2;
        }
        .bj-ov-top {
          position: absolute; inset-x: 0; top: 0; height: 36%;
          background: linear-gradient(to bottom, rgba(14,11,6,.75), transparent);
          z-index: 2;
        }
        .bj-ov-bottom {
          position: absolute; inset-x: 0; bottom: 0; height: 52%;
          background: linear-gradient(to top, #0e0b06 12%, rgba(14,11,6,.48), transparent);
          z-index: 2;
        }

        /* Content */
        .bj-content {
          position: relative; z-index: 10;
          min-height: 292px; display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 28px 13px 19px;
        }

        /* Eyebrow — "— HOZIR" */
        .bj-eye {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
          opacity: 0; transform: translateX(-16px);
          transition: opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s;
        }
        .bj-wrap.vis .bj-eye { opacity: 1; transform: translateX(0); }
        .bj-eyeline { width: 20px; height: 1px; background: #c9a96e; }
        .bj-eyetxt {
          font-family: 'Inter', sans-serif;
          font-size: 8.5px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #c9a96e;
        }

        /* Big heading — font-brilliant (Desktop premium font) */
        .bj-ttl {
          margin: 0 0 9px;
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.85s ease 0.25s, transform 0.85s cubic-bezier(0.22,1,0.36,1) 0.25s;
        }
        .bj-wrap.vis .bj-ttl { opacity: 1; transform: translateY(0); }
        .bj-ttl-line1 {
          display: block;
          font-size: clamp(38px, 11vw, 46px);
          line-height: .88;
          color: #d9b86f;
          letter-spacing: -0.01em;
          font-weight: 400;
        }
        .bj-ttl-line2 {
          display: block;
          font-size: clamp(38px, 11vw, 46px);
          line-height: .88;
          color: #f0ebe0;
          letter-spacing: -0.01em;
          font-weight: 400;
        }

        /* Description */
        .bj-txt {
          font-family: 'Inter', sans-serif;
          font-size: 11px; line-height: 1.48;
          color: rgba(240,235,224,0.45);
          max-width: 178px;
          margin-bottom: 14px;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.8s ease 0.42s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.42s;
        }
        .bj-wrap.vis .bj-txt { opacity: 1; transform: translateY(0); }

        /* KO'RISH button — pill with border like image 1 */
        .bj-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0 17px; height: 34px; width: fit-content;
          border: 1.5px solid rgba(201,169,110,0.55);
          border-radius: 100px;
          font-family: 'Inter', sans-serif;
          font-size: 8.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #f0ebe0; text-decoration: none;
          background: rgba(201,169,110,0.07);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          opacity: 0; transform: translateY(12px);
          transition: opacity 0.8s ease 0.58s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.58s,
                      background 0.2s ease;
        }
        .bj-wrap.vis .bj-btn { opacity: 1; transform: translateY(0); }
        .bj-btn:active { background: rgba(201,169,110,0.15); transform: scale(0.97); }

        @media (prefers-reduced-motion: reduce) {
          .bj-eye,.bj-ttl,.bj-txt,.bj-btn {
            transition: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <section ref={ref} className={`bj-wrap${vis ? ' vis' : ''}`} aria-label="Brand tarixi">

        {/* Right-side image */}
        <div className="bj-img-panel" aria-hidden="true">
          <img src="/luxxjarayon-background.png" alt="" loading="lazy" />
          <div className="bj-ov-left" />
          <div className="bj-ov-top" />
          <div className="bj-ov-bottom" />
        </div>

        {/* Content */}
        <div className="bj-content">
          <div className="bj-eye">
            <div className="bj-eyeline" />
            <span className="bj-eyetxt">{t('premiumHome.journeyTopTag')}</span>
          </div>

          <h2 className="bj-ttl font-brilliant">
            <span className="bj-ttl-line1">{t('premiumHome.journeyBrandTitle').split(' ').slice(0, Math.ceil(t('premiumHome.journeyBrandTitle').split(' ').length / 2)).join(' ')}</span>
            <span className="bj-ttl-line2">{t('premiumHome.journeyBrandTitle').split(' ').slice(Math.ceil(t('premiumHome.journeyBrandTitle').split(' ').length / 2)).join(' ')}</span>
          </h2>

          <p className="bj-txt">{t('premiumHome.journeyBrandDesc')}</p>

          <Link to="/mobile/lookbooks" className="bj-btn">
            {t('premiumHome.heroViewButton')} <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   MANIFESTO — brand values glassmorphism card
───────────────────────────────────────────────────────────── */
export const Manifesto = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .mf-wrap { padding: 0 16px 40px; background: #05050a; }
        .mf-card {
          position: relative; overflow: hidden;
          border-radius: 26px;
          border: 1px solid rgba(214,180,124,0.12);
          background: linear-gradient(135deg, rgba(214,180,124,0.055) 0%, rgba(5,5,10,0.92) 60%);
          padding: 26px 22px;
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1);
        }
        .mf-wrap.vis .mf-card { opacity:1; transform:translateY(0); }
        .mf-g1 { position:absolute; top:-40px; right:-40px; width:170px; height:170px; border-radius:50%; background:radial-gradient(circle,rgba(214,180,124,0.09),transparent 70%); filter:blur(30px); pointer-events:none; }
        .mf-g2 { position:absolute; bottom:-40px; left:-40px; width:150px; height:150px; border-radius:50%; background:radial-gradient(circle,rgba(140,100,200,0.07),transparent 70%); filter:blur(25px); pointer-events:none; }
        .mf-tag { font-family:'Inter',sans-serif; font-size:8.5px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(244,241,235,0.28); display:block; margin-bottom:14px; }
        .mf-q { font-size:clamp(19px,5.5vw,25px); font-weight:300; line-height:1.3; color:#f4f1eb; margin:0 0 12px; letter-spacing:-0.01em; }
        .mf-q em { font-style:normal; color:#d6b47c; font-weight:500; }
        .mf-body { font-family:'Inter',sans-serif; font-size:11.5px; line-height:1.7; color:rgba(244,241,235,0.38); margin:0 0 22px; }
        .mf-acts { display:flex; gap:9px; }
        .mf-btn-m {
          flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
          height:43px; background:#f4f1eb; color:#07060300;
          border-radius:13px;
          font-family:'Inter',sans-serif; font-size:9.5px; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; color:#070603;
          transition:transform 0.15s ease;
        }
        .mf-btn-m:active { transform:scale(0.97); }
        .mf-btn-g {
          flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
          height:43px; background:transparent; color:rgba(244,241,235,0.65);
          border:1px solid rgba(255,255,255,0.1); border-radius:13px;
          font-family:'Inter',sans-serif; font-size:9.5px; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; text-decoration:none;
          transition:transform 0.15s ease, background 0.15s ease;
        }
        .mf-btn-g:active { transform:scale(0.97); background:rgba(255,255,255,0.05); }
        @media (prefers-reduced-motion:reduce) {
          .mf-card { transition:none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>

      <section ref={ref} className={`mf-wrap${vis ? ' vis' : ''}`}>
        <div className="mf-card">
          <div className="mf-g1" aria-hidden="true" />
          <div className="mf-g2" aria-hidden="true" />
          <span className="mf-tag">{t('premiumHome.manifestoTopTag')}</span>
          <h2 className="mf-q">
            {t('premiumHome.manifestoQuote1')}
            <em>{t('premiumHome.manifestoQuote2')}</em>
          </h2>
          <p className="mf-body">{t('premiumHome.manifestoBody')}</p>
          <div className="mf-acts">
            <Link to="/mobile/products" className="mf-btn-m">
              {t('premiumHome.manifestoCollectionBtn')} <ArrowRight size={11} />
            </Link>
            <Link to="/contact" className="mf-btn-g">
              {t('premiumHome.manifestoContactBtn')} <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};


