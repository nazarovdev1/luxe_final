import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronRight,
  Crown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

const isMacOS = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');

const Navbar = ({ onSearchClick, onCartClick, onVisualSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const navItems = [
    { name: t('nav.home'), sectionId: 'hero' },
    { name: t('nav.clothes'), link: '/products' },
    { name: t('nav.looks'), link: '/lookbooks' },
    {
      name: t('nav.events'),
      dropdown: [
        { name: t('nav.reels'), link: '/reels' },
        { name: t('nav.community'), link: '/style-feed' },
        { name: t('nav.challenges'), link: '/challenges' },
        { name: t('nav.live'), link: '/live' },
        { name: t('nav.vipClub'), link: '/vip-club' },
        { name: t('nav.ecoImpact'), link: '/eco-impact' },
        { name: t('nav.giftCard'), link: '/gift-cards' },
        { name: t('nav.blog'), link: '/blog' },
      ]
    },
    { name: t('nav.about'), sectionId: 'about' },
  ];

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const scrollToSection = sectionId => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    if (onSearchClick) onSearchClick();
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
      return;
    }
    navigate('/checkout');
  };

  const isItemActive = item => {
    if (item.link) return location.pathname === item.link;
    if (item.sectionId === 'hero') return location.pathname === '/';
    return false;
  };

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 pointer-events-auto ${isScrolled
        ? 'bg-[#0a0a0a]/75 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
            <div className="relative h-[76px] flex items-center justify-between">
            <Link to="/" className="flex items-center shrink-0">
              <img src="/logonav.png" alt="Luxx logo" className="h-16 w-[90px] object-contain" />
            </Link>

            <div className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-10 mx-8">
              {navItems.map(item => {
                const active = isItemActive(item) || (item.dropdown && item.dropdown.some(sub => isItemActive(sub)));
                const baseClass = `relative group py-1 text-[13px] font-medium tracking-[0.05em] uppercase whitespace-nowrap transition-all duration-300 ${active
                  ? 'text-[#d6b47c]'
                  : 'text-white hover:text-[#d6b47c]'
                  }`;

                const underline = <span className={`absolute bottom-0 left-0 h-[1.5px] bg-[#d6b47c] transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>;

                if (item.dropdown) {
                  return (
                    <div key={item.name} className="relative group cursor-pointer h-full flex items-center">
                      <div className={baseClass + " flex items-center gap-1.5"}>
                        {item.name}
                        <ChevronRight className="w-3.5 h-3.5 rotate-90 transition-transform duration-300 group-hover:-rotate-90" />
                        {underline}
                      </div>
                      <div className="absolute top-[35px] left-1/2 -translate-x-1/2 mt-4 w-48 py-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl flex flex-col z-50">
                        {item.dropdown.map(subItem => (
                          <Link
                            key={subItem.name}
                            to={subItem.link}
                            className={`px-5 py-2.5 text-[12px] font-medium tracking-[0.05em] uppercase transition-colors ${isItemActive(subItem) ? 'text-[#d6b47c] bg-white/5' : 'text-gray-400 hover:text-[#d6b47c] hover:bg-white/5'}`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return item.link ? (
                  <Link key={item.name} to={item.link} className={baseClass}>
                    {item.name}
                    {underline}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={e => handleNavClick(e, item.sectionId)}
                    className={baseClass}
                  >
                    {item.name}
                    {underline}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              <button
                onClick={handleSearchClick}
                className="hidden lg:flex items-center gap-2.5 h-9 pl-3.5 pr-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-200 cursor-pointer group"
                aria-label="Qidiruv"
              >
                <Search className="w-4 h-4 text-[#fff] group-hover:text-[#d6b47c] transition-colors" />
                <span className="text-[13px] text-[#fff] group-hover:text-[#666] transition-colors">{t('nav.searchPlaceholder')}</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-[#fff] font-mono">{isMacOS ? '⌘K' : 'Ctrl K'}</kbd>
              </button>
              <button
                onClick={handleSearchClick}
                className="lg:hidden text-white hover:text-[#d6b47c] transition-colors duration-300"
                aria-label="Qidiruv"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* <button
                onClick={onVisualSearch}
                className="text-white hover:text-[#d6b47c] transition-colors duration-300"
                aria-label={t('nav.visualSearch')}
              >
                <Camera className="h-5 w-5" />
              </button> */}


              <button
                onClick={handleCartClick}
                className="relative text-white hover:text-[#d6b47c] transition-colors duration-300"
                aria-label={t('nav.cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#d6b47c] text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="hidden lg:inline-flex px-3.5 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center justify-center rounded-[14px] bg-[#f4f4f4] px-[17px] py-2.5 text-[12px] font-semibold tracking-[0.05em] uppercase text-[#1a1a1a] hover:bg-white transition-colors"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="h-10 w-10 rounded-xl border border-[#d6b47c]/30 bg-gradient-to-b from-white/[0.16] via-white/[0.08] to-white/[0.03] backdrop-blur-md text-neutral-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(142,166,214,0.12),0_8px_24px_rgba(4,8,20,0.45)] hover:text-white hover:from-white/[0.2] hover:via-white/[0.1] hover:to-white/[0.05] hover:border-[#d6b47c]/45 transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="text-sm font-semibold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#8ea6d6]/25 bg-[#111725]/95 backdrop-blur-xl p-2 shadow-2xl">
                      <div className="px-3 py-2 border-b border-[#8ea6d6]/20">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{t('nav.account')}</p>
                        <p className="mt-1 text-sm font-medium text-neutral-200 truncate">{t('nav.hello')}, {user?.username}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t('nav.adminPanel')}
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        {t('nav.myOrders')}
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="md:hidden h-10 w-10 rounded-xl border border-[#d6b47c]/30 bg-gradient-to-b from-white/[0.16] via-white/[0.08] to-white/[0.03] backdrop-blur-md text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(142,166,214,0.12),0_8px_24px_rgba(4,8,20,0.45)] hover:text-white hover:from-white/[0.2] hover:via-white/[0.1] hover:to-white/[0.05] hover:border-[#d6b47c]/45 transition-all duration-200 flex items-center justify-center"
                aria-label="Menyu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden relative pb-3">
              <div className="rounded-2xl border border-[#8ea6d6]/25 bg-[#0f1422]/92 backdrop-blur-xl p-2.5 space-y-1.5">
                {navItems.map(item => {
                  if (item.dropdown) {
                    return (
                      <div key={item.name} className="flex flex-col rounded-xl overflow-hidden bg-white/[0.02]">
                        <div className="flex items-center justify-between px-3 py-2.5 text-sm text-neutral-400 font-medium">
                          {item.name}
                        </div>
                        <div className="flex flex-col pl-4 border-l border-white/5 ml-3 space-y-1 mb-2">
                          {item.dropdown.map(subItem => (
                            <Link
                              key={subItem.name}
                              to={subItem.link}
                              className={`px-3 py-2 text-xs rounded-xl transition-colors ${isItemActive(subItem) ? 'text-[#d6b47c] bg-[#d6b47c]/10' : 'text-neutral-300 hover:bg-white/[0.06]'}`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const content = (
                    <span className="flex items-center justify-between w-full">
                      <span>{item.name}</span>
                      <ChevronRight className="h-4 w-4 text-neutral-500" />
                    </span>
                  );

                  return item.link ? (
                    <Link
                      key={item.name}
                      to={item.link}
                      className="flex items-center rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.name}
                      onClick={e => handleNavClick(e, item.sectionId)}
                      className="w-full text-left flex items-center rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                    >
                      {content}
                    </button>
                  );
                })}

                <div className="border-t border-[#8ea6d6]/20 pt-1.5 mt-1.5">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('nav.adminPanel')}
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.orders')}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center rounded-xl px-3 py-2.5 text-sm text-neutral-200 hover:bg-white/[0.06] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.login')}
                      </Link>
                      <Link
                        to="/register"
                        className="mt-1 flex items-center justify-center rounded-xl bg-[#f5f5f5] px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#1a1a1a]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t('nav.register')}
                      </Link>
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-[#d6b47c]/30 bg-black/25 px-3 py-2 text-xs text-neutral-400 flex items-center gap-2 mt-1">
                  <Crown className="h-3.5 w-3.5 text-[#d6b47c]" />
                  {t('nav.premiumNav')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

/* ─── Language Switcher Component ─────────────────────────────── */
const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, languageInfo, availableLanguages } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
        title="Tilni o'zgartirish"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{language}</span>
      </button>

      {/* Mobile: always show */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{language}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-40 rounded-xl border border-white/10 bg-[#11131e]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  lang.isActive
                    ? 'bg-[#d6b47c]/10 text-[#d6b47c]'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="font-medium">{lang.code.toUpperCase()}</span>
                {lang.isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d6b47c]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
