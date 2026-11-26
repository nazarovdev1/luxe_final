import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './AuthStitchOpening.css';

// Login opening "Tikuv": on atelier paper the name is drawn in thread, a needle runs a seam
// under it, then the paper is cut on a slant and the two pieces slide away to reveal the page.
const CAPTION = {
  uz: 'QO‘LDA TANLANGAN · TOSHKENT',
  ru: 'ОТОБРАНО ВРУЧНУЮ · ТАШКЕНТ',
  en: 'HAND PICKED · TASHKENT',
};

const FONT = 'italic 500 300px "Cormorant Garamond"';

const shouldSkip = () => {
  if (typeof window === 'undefined') return true;
  // The mobile app already plays its own section opening on the way here.
  if (window.location.pathname.startsWith('/mobile')) return true;
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
};

// Waits briefly for the display font so the name is not drawn in a fallback face.
const whenFontReady = () => {
  if (!document.fonts?.load) return Promise.resolve();
  const timeout = new Promise((resolve) => { window.setTimeout(resolve, 700); });
  return Promise.race([document.fonts.load(FONT), timeout]).catch(() => {});
};

function Half({ side, caption }) {
  return (
    <div className={`stitch-op__half stitch-op__half--${side}`}>
      <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" focusable="false">
        {/* The fill sits above the thread, hiding where the glyph outlines cross. */}
        <text className="stitch-op__line" x="640" y="450">Luxx</text>
        <text className="stitch-op__fill" x="640" y="450">Luxx</text>
        <line className="stitch-op__seam" x1="300" y1="521" x2="300" y2="521" />
        <text className="stitch-op__caption" x="640" y="565">{caption}</text>
      </svg>
    </div>
  );
}

export default function AuthStitchOpening({ language = 'uz' }) {
  const rootRef = useRef(null);
  const timeline = useRef(null);
  const [isDone, setIsDone] = useState(shouldSkip);
  const caption = CAPTION[language] || CAPTION.uz;

  useEffect(() => {
    if (isDone) return undefined;
    let cancelled = false;

    whenFontReady().then(() => {
      const root = rootRef.current;
      if (cancelled || !root) return;
      const all = (selector) => root.querySelectorAll(selector);
      const one = (selector) => root.querySelector(selector);
      const needle = one('.stitch-op__needle');

      timeline.current = gsap.timeline({ onComplete: () => setIsDone(true) })
        .to(all('.stitch-op__line'), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(all('.stitch-op__fill'), { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.05)
        .to(all('.stitch-op__seam'), { attr: { x2: 980 }, duration: 0.9, ease: 'power1.inOut' }, 0.9)
        .set(needle, { opacity: 1 }, 0.9)
        .to(needle, { x: 680, duration: 0.9, ease: 'power1.inOut' }, 0.9)
        .fromTo(needle, { y: -5 }, { y: 5, duration: 0.1, repeat: 8, yoyo: true, ease: 'sine.inOut' }, 0.9)
        .fromTo(all('.stitch-op__caption'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 1.35)
        .to(needle, { opacity: 0, duration: 0.2 }, 1.85)
        .to(one('.stitch-op__cut line'), { attr: { x2: 100, y2: 38 }, duration: 0.45, ease: 'expo.inOut' }, 2.0)
        .to(one('.stitch-op__cut'), { opacity: 0, duration: 0.15 }, 2.45)
        .to(one('.stitch-op__half--top'), { yPercent: -66, xPercent: 6, duration: 1, ease: 'power4.inOut' }, 2.4)
        .to(one('.stitch-op__half--bottom'), { yPercent: 66, xPercent: -6, duration: 1, ease: 'power4.inOut' }, 2.4);
    });

    return () => {
      cancelled = true;
      timeline.current?.kill();
    };
  }, [isDone]);

  if (isDone) return null;

  // A click skips straight to the page for anyone who has seen it before.
  return (
    <div ref={rootRef} className="stitch-op" aria-hidden="true" onClick={() => timeline.current?.progress(1)}>
      <Half side="top" caption={caption} />
      <Half side="bottom" caption={caption} />
      <svg className="stitch-op__overlay" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" focusable="false">
        <g className="stitch-op__needle">
          <line x1="265" y1="521" x2="335" y2="521" />
          <ellipse cx="323" cy="521" rx="6" ry="2.6" />
        </g>
      </svg>
      <svg className="stitch-op__overlay stitch-op__cut" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <line x1="0" y1="62" x2="0" y2="62" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
