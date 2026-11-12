import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getActiveMobileNavId,
  MOBILE_NAV_ROUTE_GROUPS,
} from '../../config/mobileNavigation';
import './MobileNavbar.css';

// Language lives in the home hero and the profile page (MobileLanguageSwitch),
// so nothing floats over the content above the dock.
const MobileNavbar = () => {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();
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
      id: 'lookbook',
      path: '/mobile/lookbooks',
      matchPrefixes: MOBILE_NAV_ROUTE_GROUPS.lookbook,
      icon: BookOpen,
      label: t('mobileLookbooks.title', 'Lookbook'),
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

  return (
    <nav className={`mobile-bottom-nav border-none${keyboardOpen ? ' mobile-bottom-nav--keyboard-hidden' : ''}`} aria-label={t('mobileNav.ariaLabel', 'Asosiy mobil navigatsiya')}>
      <div
        className="mobile-bottom-nav__pill"
        style={{ '--active-index': Math.max(activeIndex, 0) }}
      >
        <span className="mobile-bottom-nav__shine" aria-hidden="true" />

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

      </div>

    </nav>
  );
};

export default MobileNavbar;
