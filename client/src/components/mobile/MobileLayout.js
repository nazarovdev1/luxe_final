import React, { useState } from 'react';
import MobileNavbar from './MobileNavbar';
import SearchModal from '../SearchModal';

import { useLocation } from 'react-router-dom';
import { shouldHideMobileBottomNav } from '../../config/mobileNavigation';

const MobileLayout = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const shouldHideBottomNav = shouldHideMobileBottomNav(location.pathname);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden w-full relative">
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
