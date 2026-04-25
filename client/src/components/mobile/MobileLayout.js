import React, { useState } from 'react';
import MobileNavbar from './MobileNavbar';
import SearchModal from '../SearchModal';

import { useLocation } from 'react-router-dom';

const MobileLayout = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const shouldHideBottomNav =
        location.pathname === '/mobile/checkout' ||
        location.pathname.startsWith('/mobile/lookbooks/');
    const layoutPaddingClass = shouldHideBottomNav ? 'pb-0' : 'pb-20';

    return (
        <div className={`min-h-screen bg-[#0a0a0f] text-white ${layoutPaddingClass} overflow-x-hidden w-full relative`}>
            {/* Main Content - No top padding */}
            <main>
                {children}
            </main>

            {/* Search Modal */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Bottom Navigation */}
            {!shouldHideBottomNav && (
                <MobileNavbar onSearchClick={() => setIsSearchOpen(true)} />
            )}
        </div>
    );
};

export default MobileLayout;
