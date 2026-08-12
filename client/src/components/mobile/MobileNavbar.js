import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Home, Navigation, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getActiveMobileNavId,
  MOBILE_NAV_ROUTE_GROUPS,
} from '../../config/mobileNavigation';
import { GlassSurface } from '../ui';
import './MobileNavbar.css';

const LANGS = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

const MobileNavbar = () => {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { pathname } = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const syncKeyboardState = () => {
      const heightGap = window.innerHeight - viewport.height;
      setKeyboardOpen(heightGap > 120);
    };

    syncKeyboardState();
    viewport.addEventListener('resize', syncKeyboardState);
    viewport.addEventListener('scroll', syncKeyboardState);
    return () => {
      viewport.removeEventListener('resize', syncKeyboardState);
      viewport.removeEventListener('scroll', syncKeyboardState);
    };
  }, []);

  const navItems = [
    {
      id: 'home',
      path: '/mobile',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.home,
      icon: Home,
      label: t('nav.home', 'Asosiy'),
    },
    {
      id: 'shop',
      path: '/mobile/products',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.shop,
      icon: ShoppingBag,
      label: t('nav.shop', "Do'kon"),
    },
    {
      id: 'explore',
      path: '/mobile/events',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.explore,
      icon: Navigation,
      label: t('mobileNav.explore', 'Kashf et'),
    },
    {
      id: 'cart',
      path: '/mobile/cart',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.cart,
      icon: ShoppingCart,
      label: t('nav.cart', 'Savat'),
      badge: totalItems,
    },
    {
      id: 'profile',
      path: isAuthenticated ? '/mobile/profile' : '/mobile/login',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.profile,
      icon: User,
      label: t('nav.profile', 'Profil'),
    },
  ];

  const activeId = getActiveMobileNavId(pathname);
  const activeIndex = navItems.findIndex((item) => item.id === activeId);

  const currentLang = (availableLanguages || LANGS).find((l) => l.code === language) || { code: language, label: (language || 'uz').toUpperCase() };

  return (
    <nav className={`mobile-bottom-nav border-none${keyboardOpen ? ' mobile-bottom-nav--keyboard-hidden' : ''}`} aria-label={t('mobileNav.ariaLabel', 'Asosiy mobil navigatsiya')}>
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={999}
        borderWidth={0}
        brightness={35}
        opacity={0.95}
        blur={12}
        displace={3.2}
        backgroundOpacity={0.05}
        saturation={1.8}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={16}
        className="mobile-bottom-nav__pill"
        style={{ '--active-index': Math.max(activeIndex, 0) }}
      >
        {/* Animated "active capsule" that slides behind the current nav item */}
        <div
          className={`mobile-bottom-nav__indicator${activeIndex >= 0 ? ' mobile-bottom-nav__indicator--visible' : ''}`}
          aria-hidden="true"
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;

          return (
            <Link
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`mobile-bottom-nav__item${isActive ? ' mobile-bottom-nav__item--active' : ''}`}
            >
              <span className="mobile-bottom-nav__content">
                <span className="mobile-bottom-nav__icon-wrap">
                  <Icon className="mobile-bottom-nav__icon" aria-hidden="true" />
                  <span className="mobile-bottom-nav__active-dot mb-[6px]" aria-hidden="true" />
                  {item.badge > 0 && (
                    <span className="mobile-bottom-nav__badge" aria-label={`${item.badge} ${item.label}`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span className="mobile-bottom-nav__label">{item.label}</span>
              </span>
            </Link>
          );
        })}

      </GlassSurface>

      {/* Language control lives outside the primary navigation */}
        <div className={`mobile-bottom-nav__language-orb${langOpen ? ' mobile-bottom-nav__language-orb--open' : ''}`}>
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-label={t('mobileNav.changeLanguage')}
            title={t('mobileNav.changeLanguage')}
            className="mobile-bottom-nav__language-trigger"
          >
            <Globe className="mobile-bottom-nav__language-icon" aria-hidden="true" />
            <span>{currentLang.label}</span>
          </button>
          {langOpen && (
            <div className="mobile-bottom-nav__lang-menu" role="menu">
              {(availableLanguages || LANGS).map((lng) => (
                <button
                  key={lng.code}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLanguage(lng.code);
                    setLangOpen(false);
                  }}
                  className={`mobile-bottom-nav__lang-option${lng.code === language ? ' mobile-bottom-nav__lang-option--active' : ''}`}
                >
                  <span className="mobile-bottom-nav__lang-flag" aria-hidden="true">{lng.flag || ''}</span>
                  <span>{(lng.label || lng.code).toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
    </nav>
  );
};

export default MobileNavbar;
