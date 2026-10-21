import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileNavbar from './MobileNavbar';
import SearchModal from '../SearchModal';
import { shouldHideMobileBottomNav } from '../../config/mobileNavigation';
import '../../mobile/atelier.css';

// Any screen can open search with: window.dispatchEvent(new Event('luxx:open-search'))
export const openMobileSearch = () => window.dispatchEvent(new Event('luxx:open-search'));

const MobileLayout = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const hideNav = shouldHideMobileBottomNav(pathname);

  useEffect(() => {
    const open = () => setIsSearchOpen(true);
    window.addEventListener('luxx:open-search', open);
    return () => window.removeEventListener('luxx:open-search', open);
  }, []);

  useEffect(() => { setIsSearchOpen(false); }, [pathname]);

  return (
    <div className="m">
      <main>{children}</main>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {!hideNav && <MobileNavbar />}
    </div>
  );
};

export default MobileLayout;
