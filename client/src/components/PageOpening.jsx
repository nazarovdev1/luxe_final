import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PageOpening.css';

gsap.registerPlugin(ScrollTrigger);

const SKIP_LABEL = { uz: 'O‘tkazib yuborish', ru: 'Пропустить', en: 'Skip' };

const afterFirstRender = () => new Promise((resolve) => {
  const settle = () => requestAnimationFrame(() => requestAnimationFrame(resolve));
  if ('requestIdleCallback' in window) window.requestIdleCallback(settle, { timeout: 450 });
  else window.setTimeout(settle, 150);
});

const setChromeHidden = (hidden) => {
  window.dispatchEvent(new CustomEvent('luxx:chrome-visibility', { detail: { hidden } }));
};

/**
 * Full-screen page opening shared by the main pages.
 *  - plays on every visit (refresh and revisits included), except for reduced-motion users
 *  - portalled to <body> so no page stacking context can paint over it
 *  - hides the site navbar while it plays, skippable with the button or Esc
 *  - `build(tl, overlay)` adds the page's own choreography to a GSAP timeline;
 *    the shell then fades the overlay away and removes it
 *  - a safety timeout guarantees the page is never left behind the overlay
 */
export default function PageOpening({ id, language = 'uz', className = '', build, children, maxDuration = 9000 }) {
  const overlayRef = useRef(null);
  const timelineRef = useRef(null);
  const runRef = useRef(0);
  const skipRef = useRef(null);
  if (skipRef.current === null) {
    skipRef.current = (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  const [active, setActive] = useState(!skipRef.current);

  const finish = () => {
    setChromeHidden(false);
    setActive(false);
    ScrollTrigger.refresh();
  };

  const skip = () => {
    timelineRef.current?.progress(1);
    finish();
  };

  useEffect(() => {
    if (skipRef.current) return undefined;
    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    runRef.current += 1;
    const runId = runRef.current;
    setChromeHidden(true);

    const start = async () => {
      // Give the overlay's images a moment so nothing flashes in empty.
      const images = Array.from(overlay.querySelectorAll('img'));
      await Promise.race([
        Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
      // Let the page mounting underneath finish its heavy first render before animating,
      // otherwise the first frames stutter. The overlay is already opaque, so nothing shows.
      await afterFirstRender();
      if (runId !== runRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finish });
      timelineRef.current = tl;
      build(tl, overlay);
      tl.to(overlay, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' });
    };
    start();

    const safety = window.setTimeout(() => {
      if (runId === runRef.current) skip();
    }, maxDuration);

    const onKey = (event) => { if (event.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);

    return () => {
      runRef.current += 1;
      window.clearTimeout(safety);
      window.removeEventListener('keydown', onKey);
      timelineRef.current?.kill();
      setChromeHidden(false);
    };
    // The opening runs once per mount; build is read at start.
  }, []);

  if (!active) return null;

  return createPortal(
    <div ref={overlayRef} className={`page-opening ${className}`} role="dialog" aria-label="LUXX">
      {children}
      <button type="button" className="page-opening__skip" onClick={skip}>
        {SKIP_LABEL[language] || SKIP_LABEL.uz} <kbd>ESC</kbd>
      </button>
    </div>,
    document.body,
  );
}
