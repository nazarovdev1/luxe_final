import React, { useState } from 'react';
import MobileNavbar from './MobileNavbar';
import SearchModal from '../SearchModal';

import { useLocation } from 'react-router-dom';
import { shouldHideMobileBottomNav } from '../../config/mobileNavigation';
import './mobileAtmosphere.css';

const MobileLayout = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const shouldHideBottomNav = shouldHideMobileBottomNav(location.pathname);

    return (
        <div className="mobile-atmosphere min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden w-full relative">
            <div className="mobile-atmosphere__field" aria-hidden="true">
                <i className="mobile-atmosphere__halo mobile-atmosphere__halo--gold" />
                <i className="mobile-atmosphere__halo mobile-atmosphere__halo--violet" />
                <i className="mobile-atmosphere__ribbon" />
                <i className="mobile-atmosphere__stars" />
            </div>
            <main>
                {children}
            </main>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* {isVisualSearchOpen && (
                <Suspense fallback={<Loading />}>
                    <VisualSearch onClose={() => setIsVisualSearchOpen(false)} />
                </Suspense>
            )} */}


            {!shouldHideBottomNav && (
                <MobileNavbar /* onVisualSearch={() => setIsVisualSearchOpen(true)} */ />
            )}
        </div>
    );
};

export default MobileLayout;
