import React, { useRef, useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { gsap } from 'gsap';
import AuthStitchOpening from './AuthStitchOpening';
import './AuthOpening.css';

/**
 * AuthOpening
 * Ultra-Luxury Haute-Couture Cinematic Openings for Login & Register.
 * 
 * Variant 'register': "The 3D VIP Pass Noir Unboxing & Portal Zoom"
 * Variant 'login': the "Tikuv" stitch opening (see AuthStitchOpening.jsx)
 * 
 * Strict Compliance:
 * - NO background boxes behind icons
 * - NO 4-pointed Sparkles
 * - Distinct, jaw-dropping cinematic motion
 */
function RegisterOpening() {
  const rootRef = useRef(null);
  // The mobile app already plays its own section opening (MobileTabOpening)
  // on the way here, so this cinematic would be a second intro in a row.
  const [isDone, setIsDone] = useState(
    () => typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile'),
  );

  useEffect(() => {
    if (typeof window === 'undefined' || isDone) return;
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

    return () => {
      tl.kill();
    };
  // isDone only gates the first run; finishing must not restart the timeline.
  }, []);

  if (isDone) return null;

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

export default function AuthOpening({ variant = 'login', language = 'uz' }) {
  return variant === 'register' ? <RegisterOpening /> : <AuthStitchOpening language={language} />;
}
