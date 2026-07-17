import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getActiveMobileNavId,
  MOBILE_NAV_ROUTE_GROUPS,
} from '../../config/mobileNavigation';
import { GlassSurface } from '../ui';
import './MobileNavbar.css';

const MobileNavbar = () => {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { pathname } = useLocation();

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
      icon: Compass,
      label: 'Kashf et',
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
    <nav className="mobile-bottom-nav border-none" aria-label={t('mobileNav.ariaLabel', 'Asosiy mobil navigatsiya')}>
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
    </nav>
  );
};

export default MobileNavbar;
