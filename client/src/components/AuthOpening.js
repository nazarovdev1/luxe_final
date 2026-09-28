import React, { useRef, useState, useEffect } from 'react';
import { Crown, Gem } from 'lucide-react';
import { gsap } from 'gsap';
import './AuthOpening.css';

/**
 * AuthOpening
 * Ultra-Luxury Haute-Couture Cinematic Openings for Login & Register.
 * 
 * Variant 'register': "The 3D VIP Pass Noir Unboxing & Portal Zoom"
 * Variant 'login': "The Cinematic Runway Spotlight & Atelier Monograph Lens"
 * 
 * Strict Compliance:
 * - NO background boxes behind icons
 * - NO 4-pointed Sparkles
 * - Distinct, jaw-dropping cinematic motion
 */
export default function AuthOpening({ variant = 'login' }) {
  const rootRef = useRef(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsDone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        setIsDone(true);
        if (root) root.style.display = 'none';
      }
    });

    if (variant === 'register') {
      // ════════════════════════════════════════════════════════════
      // REGISTER: 3D VIP Pass Noir Unboxing & Dimensional Portal
      // ════════════════════════════════════════════════════════════
      const card = root.querySelector('.vip-card-stage');
      const cardGleam = root.querySelector('.vip-card-gleam');
      const chipLine = root.querySelector('.vip-card-chip');
      const badgeText = root.querySelectorAll('.vip-card-anim');
      const bgCurtain = root.querySelector('.vip-backdrop');

      // 1. Initial 3D float-in
      tl.fromTo(card,
        {
          rotateY: -35,
          rotateX: 20,
          scale: 0.65,
          y: 40,
          opacity: 0,
          filter: 'blur(10px)'
        },
        {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.65,
          ease: 'power3.out'
        },
        0
      );

      // 2. Chip line draws horizontally
      if (chipLine) {
        tl.fromTo(chipLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.4, ease: 'power2.inOut' },
          0.2
        );
      }

      // 3. Staggered typography inside card
      if (badgeText && badgeText.length > 0) {
        tl.fromTo(badgeText,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
          0.25
        );
      }

      // 4. Liquid gold gleam sweeps across the card
      if (cardGleam) {
        tl.fromTo(cardGleam,
          { xPercent: -150, opacity: 0 },
          { xPercent: 150, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          0.35
        );
      }

      // 5. Card gentle float pause
      tl.to(card,
        {
          rotateY: 8,
          rotateX: -4,
          scale: 1.03,
          duration: 0.4,
          ease: 'sine.inOut'
        },
        0.65
      );

      // 6. Grand Portal Fly-Through (Card zooms through camera into register page)
      tl.to(card,
        {
          scale: 3.5,
          opacity: 0,
          filter: 'blur(20px)',
          duration: 0.55,
          ease: 'power3.in'
        },
        1.05
      );

      if (bgCurtain) {
        tl.to(bgCurtain,
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut'
          },
          1.1
        );
      }

    } else {
      // ════════════════════════════════════════════════════════════
      // LOGIN: Cinematic Runway Spotlight & Anamorphic Monograph
      // ════════════════════════════════════════════════════════════
      const monograph = root.querySelector('.login-mono-wrap');
      const lightBeam = root.querySelector('.login-light-beam');
      const progressLine = root.querySelector('.login-progress-fill');
      const monoTexts = root.querySelectorAll('.login-mono-anim');
      const bgCurtain = root.querySelector('.login-backdrop');

      // 1. Anamorphic beam streaks across
      if (lightBeam) {
        tl.fromTo(lightBeam,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.45, ease: 'power3.inOut' },
          0
        );
      }

      // 2. Monograph unmasks with luxury scale
      tl.fromTo(monograph,
        { scale: 0.85, opacity: 0, filter: 'blur(12px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' },
        0.1
      );

      if (monoTexts && monoTexts.length > 0) {
        tl.fromTo(monoTexts,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' },
          0.2
        );
      }

      // 3. Precision hairline progress draws to 100%
      if (progressLine) {
        tl.fromTo(progressLine,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.5, ease: 'power2.inOut' },
          0.35
        );
      }

      // 4. Climax: Spotlight bursts and dissolves into page
      tl.to(monograph,
        { scale: 1.15, opacity: 0, filter: 'blur(16px)', duration: 0.45, ease: 'power2.in' },
        0.9
      );

      if (lightBeam) {
        tl.to(lightBeam,
          { opacity: 0, scaleY: 4, duration: 0.35, ease: 'power2.out' },
          0.9
        );
      }

      if (bgCurtain) {
        tl.to(bgCurtain,
          { opacity: 0, duration: 0.45, ease: 'power2.inOut' },
          0.95
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [variant]);

  if (isDone) return null;

  if (variant === 'register') {
    return (
      <div ref={rootRef} className="luxx-cinematic-opening-root" aria-hidden="true">
        {/* Deep Midnight Backdrop */}
        <div className="vip-backdrop" />

        {/* Ambient Radial Spotlight */}
        <div className="vip-ambient-orb" />

        {/* 3D Perspective Stage for VIP Pass */}
        <div className="vip-perspective-container">
          <div className="vip-card-stage">
            {/* Liquid Gold Gleam Sweep */}
            <div className="vip-card-gleam" />

            {/* Top Bar: Pure Crown & Maison Label */}
            <div className="vip-card-top vip-card-anim">
              <Crown className="w-6 h-6 text-[#e8c87a] stroke-[1.6]" />
              <span className="vip-card-serial">NOUVEAU MEMBRE &bull; 2026</span>
            </div>

            {/* Center: Chip Graphic & Monogram */}
            <div className="vip-card-middle vip-card-anim">
              <div className="vip-card-chip" />
              <h2 className="vip-card-brand">MAISON LUXX</h2>
              <p className="vip-card-privilege">VIP PRIVILÈGE &bull; NOIR</p>
            </div>

            {/* Bottom Bar: Access Credentials */}
            <div className="vip-card-bottom vip-card-anim">
              <span className="vip-card-num">№ 7709 &bull; ATELIER ADHÉSION</span>
              <span className="vip-card-status">ACCÈS CONFIRMÉ</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN VARIANT
  return (
    <div ref={rootRef} className="luxx-cinematic-opening-root" aria-hidden="true">
      {/* Deep Midnight Backdrop */}
      <div className="login-backdrop" />

      {/* Horizontal Anamorphic Light Beam */}
      <div className="login-light-beam" />

      {/* Central High-Fashion Monograph */}
      <div className="login-mono-wrap">
        <div className="login-mono-anim mb-3 flex items-center justify-center">
          <Gem className="w-9 h-9 text-[#e8c87a] stroke-[1.5] drop-shadow-[0_0_20px_rgba(232,200,122,0.6)]" />
        </div>

        <p className="login-mono-anim login-mono-atelier">LUXX ARCHIVE &bull; COLLECTION 2026</p>
        
        <h1 className="login-mono-anim login-mono-title">LUXX</h1>

        {/* Precision Progress Seam */}
        <div className="login-progress-track login-mono-anim">
          <div className="login-progress-fill" />
        </div>

        <p className="login-mono-anim login-mono-status">AUTHENTICATING PRIVATE CLIENT</p>
      </div>
    </div>
  );
}
