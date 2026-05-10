import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, ShoppingCart, User, Gem, Play } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileNavbar = ({ onVisualSearch }) => {
    const { totalItems } = useCart();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: t('nav.home'), path: '/mobile' },
        { icon: ShoppingBag, label: t('nav.shop'), path: '/mobile/products' },
        { icon: Play, label: 'Reels', path: '/mobile/reels' },
        { icon: ShoppingCart, label: t('nav.cart'), path: '/mobile/cart', badge: totalItems },
        { icon: User, label: t('nav.profile'), path: isAuthenticated ? '/mobile/profile' : '/mobile/login' },
    ];

    // Navbar is now visible on all pages EXCEPT product details (to show Add to Cart button cleanly)
    const isProductPage = location.pathname.includes('/product/');
    if (isProductPage) return null;

    return (
        <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px]">
            <div className="relative rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center px-1 py-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        if (item.action) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className="relative flex flex-col items-center justify-center w-full py-3 text-gray-500 hover:text-gray-300 transition-all duration-300"
                                >
                                    <div className="relative">
                                        <Icon className="h-6 w-6 stroke-[1.5]" />
                                        {item.label === 'Visual' && (
                                            <span className="absolute -top-2.5 -right-3.5 px-1 py-0.5 bg-[#d6b47c] text-black text-[7px] font-black rounded-md transform rotate-12 shadow-sm border border-black/10">
                                                BETA
                                            </span>
                                        )}
                                    </div>
                                    <span className="absolute bottom-1 text-[9px] font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `relative flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                            <Icon
                                                className={`h-6 w-6 transition-all duration-300 ${isActive ? 'stroke-[2] text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'stroke-[1.5]'
                                                    }`}
                                            />

                                            {item.badge > 0 && (
                                                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white text-[9px] font-bold text-black ring-2 ring-[#0f0f0f]">
                                                    {item.badge > 9 ? '9+' : item.badge}
                                                </span>
                                            )}
                                        </div>

                                        <span className={`absolute bottom-1 text-[9px] font-medium tracking-wide transition-all duration-300 ${isActive
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-2'
                                            }`}>
                                            {item.label}
                                        </span>

                                        {isActive && (
                                            <div className="absolute -bottom-1.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-white/20 blur-[4px]" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default MobileNavbar;
