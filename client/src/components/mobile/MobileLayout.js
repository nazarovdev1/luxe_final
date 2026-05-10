import React, { useState, lazy, Suspense } from 'react';
import MobileNavbar from './MobileNavbar';
import SearchModal from '../SearchModal';
import Loading from '../Loading';

import { useLocation } from 'react-router-dom';

import { lazyWithRetry } from '../../utils/lazyWithRetry';

const VisualSearch = lazyWithRetry(() => import('../VisualSearch'));

const MobileLayout = ({ children }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
    const location = useLocation();
    const shouldHideBottomNav =
        location.pathname === '/mobile/checkout' ||
        location.pathname.startsWith('/mobile/lookbooks/') ||
        location.pathname === '/mobile/reels' ||
        location.pathname.startsWith('/mobile/bundle/') ||
        location.pathname.startsWith('/mobile/live/');
    const layoutPaddingClass = shouldHideBottomNav ? 'pb-0' : 'pb-20';

    return (
        <div className={`min-h-screen bg-[#0a0a0f] text-white ${layoutPaddingClass} overflow-x-hidden w-full relative`}>
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