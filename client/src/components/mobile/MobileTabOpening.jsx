import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getActiveMobileNavId } from '../../config/mobileNavigation';
import './mobileTabOpening.css';

const TAB_LABELS = {
  home: ['nav.home', 'Asosiy'],
  shop: ['nav.shop', "Do'kon"],
  lookbook: ['mobileLookbooks.title', 'Lookbook'],
  cart: ['nav.cart', 'Savat'],
  profile: ['nav.profile', 'Profil'],
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Plays a short "curtain" opening when the visitor moves to another bottom-nav
 * section: a gold hairline draws, the section name settles in, and the veil
 * lifts to reveal the page. Moves inside one section (shop → bundles) and the
 * very first page load do not play it.
 */
const MobileTabOpening = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const activeId = getActiveMobileNavId(pathname);
  const [previousId, setPreviousId] = useState(activeId);
  const [opening, setOpening] = useState(null);

  // Decided during render, not in an effect: the veil must be in the very same
  // commit as the new page, otherwise the page flashes for a frame first.
  if (activeId !== previousId) {
    setPreviousId(activeId);
    if (activeId && TAB_LABELS[activeId] && !prefersReducedMotion()) {
      setOpening({ id: activeId, run: (opening?.run || 0) + 1 });
    }
  }


  // Safety net: if the browser skips animationend (backgrounded tab), still clear the veil.
  useEffect(() => {
    if (!opening) return undefined;
    const timer = window.setTimeout(() => setOpening(null), 1200);
    return () => window.clearTimeout(timer);
  }, [opening]);

  if (!opening) return null;

  const [key, fallback] = TAB_LABELS[opening.id];

  return (
    <div
      key={opening.run}
      className="mobile-tab-opening"
      aria-hidden="true"
      data-testid="mobile-tab-opening"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setOpening(null);
      }}
    >
      <span className="mobile-tab-opening__glow" />
      <span className="mobile-tab-opening__label">{t(key, fallback)}</span>
      <span className="mobile-tab-opening__line" />
      <span className="mobile-tab-opening__brand">LUXX</span>
    </div>
  );
};

export default MobileTabOpening;
