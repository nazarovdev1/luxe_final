import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getActiveMobileNavId } from '../../config/mobileNavigation';

// Hides the bar while the on-screen keyboard is up, so it never sits on top of a field.
const useKeyboardOpen = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const update = () => setOpen(window.innerHeight - viewport.height > 160);
    viewport.addEventListener('resize', update);
    return () => viewport.removeEventListener('resize', update);
  }, []);
  return open;
};

const MobileNavbar = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const keyboardOpen = useKeyboardOpen();

  const items = [
    { id: 'home', path: '/mobile', icon: Home, label: t('nav.home', 'Asosiy') },
    { id: 'shop', path: '/mobile/products', icon: LayoutGrid, label: t('mobileNav.catalogue', 'Katalog') },
    { id: 'looks', path: '/mobile/lookbooks', icon: BookOpen, label: t('nav.looks', 'Looklar') },
    { id: 'cart', path: '/mobile/cart', icon: ShoppingBag, label: t('nav.cart', 'Savat'), badge: totalItems },
    { id: 'profile', path: isAuthenticated ? '/mobile/profile' : '/mobile/login', icon: User, label: t('nav.profile', 'Profil') },
  ];
  const activeId = getActiveMobileNavId(pathname);

  return (
    <nav className={`m-nav ${keyboardOpen ? 'm-nav--hidden' : ''}`} aria-label={t('mobileNav.ariaLabel', 'Asosiy mobil navigatsiya')}>
      {items.map(({ id, path, icon: Icon, label, badge }) => (
        <Link key={id} to={path} className="m-nav__item" aria-current={activeId === id ? 'page' : undefined} aria-label={label}>
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.5} />
          <span aria-hidden="true">{label}</span>
          {badge > 0 && <span className="m-nav__badge">{badge > 9 ? '9+' : badge}</span>}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavbar;
