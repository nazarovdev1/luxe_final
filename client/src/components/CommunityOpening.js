import React, { useRef } from 'react';
import { Crown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import './CommunityOpening.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const openings = {
  community: { index: '01', kicker: 'THE PEOPLE / LUXX', title: ['Uslub —', 'birga yaratiladi.'], note: 'COMMUNITY', image: '/editorial/community-editorial-2026.png', alt: 'LUXX moda hamjamiyati obrazi' },
  challenges: { index: '02', kicker: 'A NEW CREATIVE ARENA', title: ['O‘z uslubingni', 'ko‘rsat.'], note: 'CHALLENGES', image: '/editorial/challenges-editorial-2026.png', alt: 'Ijodiy moda obrazi' },
  live: { index: '03', kicker: 'ON AIR / LUXX', title: ['Moda ayni', 'lahzada.'], note: 'LIVE', image: '/editorial/live-editorial-2026.png', alt: 'Jonli moda efiri obrazi' },
  vip: { index: '04', kicker: 'THE PRIVATE CIRCLE', title: ['Oddiy a’zolik', 'emas.'], note: 'VIP CLUB', image: '/editorial/vip-editorial-2026.png', alt: 'LUXX premium tajribasi' },
  eco: { index: '05', kicker: 'A MORE CONSIDERED FUTURE', title: ['Go‘zallikning', 'izi yengil.'], note: 'ECO IMPACT', image: '/editorial/eco-editorial-2026.png', alt: 'Mas’uliyatli moda va hunarmandchilik' },
};

export function useCommunityMotion(scope) {
  useGSAP(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = scope.current;
    if (!root) return;
    const hero = root.querySelector('.community-opening');
    if (!hero) return;

    const variant = hero.dataset.variant || 'community';
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Common ambient entrance for top index and footer discover bars
    tl.fromTo(
      hero.querySelectorAll('.community-opening__index, .community-opening__footer'),
      { opacity: 0, y: (i) => (i === 0 ? -12 : 12) },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 },
      0.05
    );

    if (variant === 'community') {
      // ── 1. COMMUNITY: Film Aperture & Two-Sided Iris Curtain Split ──
      const leftCurtain = hero.querySelector('.co-curtain--left');
      const rightCurtain = hero.querySelector('.co-curtain--right');
      const iris = hero.querySelector('.co-iris-flare');
      const lines = hero.querySelectorAll('.community-opening__title span');
      const photo = hero.querySelector('.community-opening__photo img');
      const copyEls = hero.querySelectorAll('.community-opening__kicker, .community-opening__copy > p, .community-opening__actions');

      if (leftCurtain && rightCurtain) {
        tl.to(leftCurtain, { scaleX: 0, transformOrigin: 'left', duration: 1.1, ease: 'power4.inOut' }, 0)
          .to(rightCurtain, { scaleX: 0, transformOrigin: 'right', duration: 1.1, ease: 'power4.inOut' }, 0);
      }
      if (iris) {
        tl.fromTo(iris, { scale: 0.3, opacity: 0 }, { scale: 2.2, opacity: 0.6, duration: 1.3, ease: 'power2.out' }, 0.15)
          .to(iris, { opacity: 0, duration: 0.8 }, 0.8);
      }
      tl.fromTo(lines, 
        { yPercent: 110, rotate: 2, opacity: 0 }, 
        { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power3.out' }, 
        0.25
      );
      if (photo) {
        tl.fromTo(photo, 
          { scale: 1.25, rotateY: -8, opacity: 0 }, 
          { scale: 1, rotateY: 0, opacity: 1, duration: 1.6, ease: 'power3.out' }, 
          0.2
        );
      }
      tl.fromTo(copyEls, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12 }, 0.55);

    } else if (variant === 'challenges') {
      // ── 2. CHALLENGES: Runway Arena Spotlight & Angular Laser Sweep ──
      const slash = hero.querySelector('.co-laser-slash');
      const spot = hero.querySelector('.co-spotlight-beam');
      const lines = hero.querySelectorAll('.community-opening__title span');
      const photo = hero.querySelector('.community-opening__photo');
      const copyEls = hero.querySelectorAll('.community-opening__kicker, .community-opening__copy > p, .community-opening__actions');

      if (slash) {
        tl.fromTo(slash, 
          { xPercent: -100, opacity: 1 }, 
          { xPercent: 200, opacity: 0, duration: 0.85, ease: 'power4.inOut' }, 
          0
        );
      }
      if (spot) {
        tl.fromTo(spot, { scale: 0.2, opacity: 0 }, { scale: 1.4, opacity: 0.35, duration: 1.4, ease: 'power3.out' }, 0.1);
      }
      tl.fromTo(lines, 
        { skewX: -14, yPercent: 110, opacity: 0 }, 
        { skewX: 0, yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.1, ease: 'back.out(1.5)' }, 
        0.25
      );
      if (photo) {
        tl.fromTo(photo, 
          { scale: 0.9, opacity: 0, filter: 'brightness(1.8) contrast(1.3)' }, 
          { scale: 1, opacity: 1, filter: 'brightness(1) contrast(1)', duration: 1.3, ease: 'power3.out' }, 
          0.3
        );
      }
      tl.fromTo(copyEls, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 0.5);

    } else if (variant === 'live') {
      // ── 3. LIVE: Broadcast Studio Anamorphic Flare & Live EQ Frequency ──
      const flare = hero.querySelector('.co-anamorphic-flare');
      const onAir = hero.querySelector('.co-live-on-air-tag');
      const eqBars = hero.querySelectorAll('.co-live-eq i');
      const lines = hero.querySelectorAll('.community-opening__title span');
      const photo = hero.querySelector('.community-opening__photo');
      const copyEls = hero.querySelectorAll('.community-opening__kicker, .community-opening__copy > p, .community-opening__actions');

      if (flare) {
        tl.fromTo(flare, 
          { scaleX: 0, opacity: 1 }, 
          { scaleX: 1.2, opacity: 0, duration: 0.9, ease: 'expo.out' }, 
          0
        );
      }
      if (onAir) {
        tl.fromTo(onAir, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.25);
      }
      if (eqBars.length) {
        tl.fromTo(eqBars, 
          { scaleY: 0.2 }, 
          { scaleY: 1, duration: 0.35, stagger: { each: 0.08, repeat: 3, yoyo: true }, ease: 'power1.inOut' }, 
          0.2
        );
      }
      tl.fromTo(lines, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.14, ease: 'power2.out' }, 
        0.3
      );
      if (photo) {
        tl.fromTo(photo, 
          { rotate: 6, scale: 1.14, opacity: 0 }, 
          { rotate: 2, scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out' }, 
          0.2
        );
      }
      tl.fromTo(copyEls, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.5);

    } else if (variant === 'vip') {
      // ── 4. VIP: Private Vault Door Parting, Gold Aura & Seal Crest ──
      const leftGate = hero.querySelector('.co-vault-gate--left');
      const rightGate = hero.querySelector('.co-vault-gate--right');
      const goldAura = hero.querySelector('.co-gold-aura');
      const seal = hero.querySelector('.co-vip-seal');
      const lines = hero.querySelectorAll('.community-opening__title span');
      const photo = hero.querySelector('.community-opening__photo');
      const copyEls = hero.querySelectorAll('.community-opening__kicker, .community-opening__copy > p, .community-opening__actions');

      if (leftGate && rightGate) {
        tl.fromTo(leftGate, { xPercent: 0 }, { xPercent: -102, duration: 1.5, ease: 'power3.inOut' }, 0.1)
          .fromTo(rightGate, { xPercent: 0 }, { xPercent: 102, duration: 1.5, ease: 'power3.inOut' }, 0.1);
      }
      if (goldAura) {
        tl.fromTo(goldAura, { scale: 0.2, opacity: 0 }, { scale: 1.6, opacity: 0.35, duration: 1.6, ease: 'power2.out' }, 0.3);
      }
      if (seal) {
        tl.fromTo(seal, { scale: 0.4, rotate: -45, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.7)' }, 0.45);
      }
      tl.fromTo(lines, 
        { yPercent: 90, opacity: 0 }, 
        { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.16, ease: 'power3.out' }, 
        0.4
      );
      if (photo) {
        tl.fromTo(photo, 
          { scale: 1.15, opacity: 0, filter: 'sepia(0.8) brightness(1.2)' }, 
          { scale: 1, opacity: 1, filter: 'sepia(0.25) brightness(1)', duration: 1.8, ease: 'power3.out' }, 
          0.35
        );
      }
      tl.fromTo(copyEls, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.14 }, 0.65);

    } else if (variant === 'eco') {
      // ── 5. ECO: Botanical Bloom Arch & Emerald Mist Ripple ──
      const ring = hero.querySelector('.co-eco-arch-ring');
      const mist = hero.querySelector('.co-eco-mist');
      const lines = hero.querySelectorAll('.community-opening__title span');
      const photo = hero.querySelector('.community-opening__photo');
      const copyEls = hero.querySelectorAll('.community-opening__kicker, .community-opening__copy > p, .community-opening__actions');

      if (ring) {
        tl.fromTo(ring, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'expo.out' }, 0.1);
      }
      if (mist) {
        tl.fromTo(mist, { opacity: 0, scale: 0.7 }, { opacity: 0.4, scale: 1.2, duration: 2, ease: 'sine.out' }, 0.2);
      }
      tl.fromTo(lines, 
        { y: 50, opacity: 0, filter: 'blur(8px)' }, 
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.18, ease: 'power2.out' }, 
        0.3
      );
      if (photo) {
        tl.fromTo(photo, 
          { y: 60, scale: 1.08, opacity: 0 }, 
          { y: 0, scale: 1, opacity: 1, duration: 1.7, ease: 'sine.out' }, 
          0.2
        );
      }
      tl.fromTo(copyEls, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.15 }, 0.6);
    }
  }, { scope });

  useGSAP((context, contextSafe) => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = scope.current;
    if (!root) return;
    const observed = new WeakSet();
    const animateContent = contextSafe(() => {
      let created = false;
      const sections = Array.from(root.querySelectorAll('.community-content > *')).filter(el => !el.matches('script, style'));
      sections.forEach((section, index) => {
        if (observed.has(section) || section.matches('.vip-editorial-content') || section.querySelector('.community-motion-card')) return;
        observed.add(section);
        created = true;
        gsap.fromTo(section, { y: index % 2 ? 56 : 38, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.95, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: section, start: 'top 90%', once: true, invalidateOnRefresh: true },
        });
      });
      root.querySelectorAll('.community-motion-card').forEach((card, index) => {
        if (observed.has(card)) return;
        observed.add(card);
        created = true;
        gsap.fromTo(card, { y: 42, opacity: 0, rotate: index % 2 ? 1.2 : -1.2 }, {
          y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 94%', once: true },
        });
      });
      if (created) ScrollTrigger.refresh();
    });
    animateContent();
    const content = root.querySelector('.community-content');
    if (!content) return;
    const observer = new MutationObserver(() => animateContent());
    observer.observe(content, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, { scope });
}

export default function CommunityOpening({ variant, description, children }) {
  const data = openings[variant];
  const photoRef = useRef(null);

  return (
    <section className={`community-opening community-opening--${variant}`} data-variant={variant} aria-label={data.note}>
      {/* ── Variant Decorative Effects ── */}
      {variant === 'community' && (
        <>
          <div className="co-curtain co-curtain--left" aria-hidden="true" />
          <div className="co-curtain co-curtain--right" aria-hidden="true" />
          <div className="co-iris-flare" aria-hidden="true" />
        </>
      )}

      {variant === 'challenges' && (
        <>
          <div className="co-laser-slash" aria-hidden="true" />
          <div className="co-spotlight-beam" aria-hidden="true" />
        </>
      )}

      {variant === 'live' && (
        <>
          <div className="co-anamorphic-flare" aria-hidden="true" />
          <div className="co-live-on-air-tag" aria-hidden="true">
            <span className="co-live-radar" />
            <span>STUDIO / 108.4 MHz</span>
            <div className="co-live-eq">
              <i /><i /><i /><i /><i />
            </div>
          </div>
        </>
      )}

      {variant === 'vip' && (
        <>
          <div className="co-vault-gate co-vault-gate--left" aria-hidden="true" />
          <div className="co-vault-gate co-vault-gate--right" aria-hidden="true" />
          <div className="co-gold-aura" aria-hidden="true" />
          <div className="co-vip-seal" aria-hidden="true">
            <Crown className="w-5 h-5 text-[#d6b47c]" />
          </div>
        </>
      )}

      {variant === 'eco' && (
        <>
          <div className="co-eco-arch-ring" aria-hidden="true" />
          <div className="co-eco-mist" aria-hidden="true" />
        </>
      )}

      <div className="community-opening__index"><span>LUXX / WORLD</span><span>{data.index} — 07</span></div>
      <div className="community-opening__copy">
        <div className="community-opening__kicker"><i />{data.kicker}</div>
        <h1 className="community-opening__title"><span>{data.title[0]}</span><span><em>{data.title[1]}</em></span></h1>
        <p>{description}</p>
        <div className="community-opening__actions">{children}</div>
      </div>
      <div className="community-opening__photo" ref={photoRef}>
        <img src={data.image} alt={data.alt} loading="eager" />
        <span className="community-opening__photo-label">{data.note} / 2026</span>
      </div>
      <div className="community-opening__footer"><span>SCROLL TO DISCOVER</span><span className="community-opening__rule" /><span>{data.note}</span></div>
    </section>
  );
}

const chapterCopy = {
  community: { number: '01', eyebrow: 'REAL PEOPLE. REAL STYLE.', title: 'Hamjamiyat kundaligi', copy: 'Har bir obraz — bir ayolning o‘ziga xos qarashi. Bu yerda ilhom bir-birimizdan boshlanadi.' },
  challenges: { number: '02', eyebrow: 'THE CREATIVE ARENA', title: 'Maydon sizniki', copy: 'Qoidalar emas, shaxsiy uslub gapirsin. Ishlarni ko‘ring, yoqqan obrazga ovoz bering.' },
  live: { number: '03', eyebrow: 'THE LIVE EDIT', title: 'Efir ichida', copy: 'Jonli uchrashuvlar, yangi obrazlar va sizning savollaringiz — hammasi shu yerda.' },
  vip: { number: '04', eyebrow: 'THE PRIVATE CIRCLE', title: 'Imtiyoz — e’tibor', copy: 'Har bir daraja shunchaki raqam emas. Bu sizga yanada yaqinroq xizmat va tajriba.' },
  eco: { number: '05', eyebrow: 'CONSIDERED CHOICES', title: 'Har tanlovning izi', copy: 'Sifatli kiyim uzoq yashaydi. O‘zingiz va atrofingiz uchun ongliroq tanlovlarni ko‘ring.' },
};

export function CommunityChapter({ variant, aside }) {
  const data = chapterCopy[variant];
  return <div className={`community-chapter community-chapter--${variant}`}>
    <div className="community-chapter__top"><span>{data.number} / {data.eyebrow}</span><span>LUXX — 2026</span></div>
    <div className="community-chapter__grid"><h2>{data.title}</h2><div><p>{data.copy}</p>{aside}</div></div>
  </div>;
}
