import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loading from './components/Loading';

import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy load components
const Navbar = React.lazy(() => import('./components/Navbar'));
const Home = React.lazy(() => import('./pages/Home'));
const Admin = React.lazy(() => import('./pages/Admin'));
const ProductView = React.lazy(() => import('./pages/ProductView'));
const AllProducts = React.lazy(() => import('./pages/AllProducts'));
const SearchModal = React.lazy(() => import('./components/SearchModal'));
const CartDropdown = React.lazy(() => import('./components/CartDropdown'));
const LoginForm = React.lazy(() => import('./components/LoginForm'));
const RegisterForm = React.lazy(() => import('./components/RegisterForm'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Orders = React.lazy(() => import('./pages/Orders'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const Lookbooks = React.lazy(() => import('./pages/Lookbooks'));
const LookbookBuilder = React.lazy(() => import('./pages/LookbookBuilder'));
const StyleFeed = React.lazy(() => import('./pages/StyleFeed'));
const VIPClub = React.lazy(() => import('./pages/VIPClub'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const LiveStreams = React.lazy(() => import('./pages/LiveStreams'));
const LiveStreamView = React.lazy(() => import('./pages/LiveStreamView'));
const EcoImpact = React.lazy(() => import('./pages/EcoImpact'));
const Reels = React.lazy(() => import('./pages/Reels'));
const GiftCards = React.lazy(() => import('./pages/GiftCards'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const BundleDetail = React.lazy(() => import('./pages/BundleDetail'));
const MobileApp = lazyWithRetry(() => import('./MobileApp'));
const AnnouncementBanner = React.lazy(() => import('./components/AnnouncementBanner'));
const VisualSearch = lazyWithRetry(() => import('./components/VisualSearch'));
import { ProductProvider } from './contexts/ProductContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ScrollToTop from './components/ScrollToTop';


import { useLocation } from 'react-router-dom';
import { usePWA } from './hooks/usePWA';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';

// Device detection helper
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
};

// Bot detection - don't redirect search engine crawlers
const isBot = () => {
  return /Googlebot|Google-InspectionTool|GoogleOther|APIs-Google|bingbot|Baiduspider|yandex|DuckDuckBot|Slurp|msnbot|facebookexternalhit|Twitterbot|LinkedInBot/i.test(
    navigator.userAgent
  );
};

function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = location.pathname.startsWith('/mobile');
  const showDesktopChrome = !isMobile && !['/login', '/register', '/checkout', '/reels', '/live/'].some(path => location.pathname.startsWith(path));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        setIsCartOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto redirect based on device
  useEffect(() => {
    const isMobileUser = isMobileDevice();
    const isOnMobilePath = location.pathname.startsWith('/mobile');
    const isOnAdminPath = location.pathname.startsWith('/admin');

    // Don't redirect admin pages or search engine bots
    if (isOnAdminPath || isBot()) return;

    // Mobile user on desktop path -> redirect to mobile
    if (isMobileUser && !isOnMobilePath) {
      setIsRedirecting(true);
      const mobilePath = '/mobile' + location.pathname;
      navigate(mobilePath, { replace: true });
      return;
    }

    // Desktop user on mobile path -> redirect to desktop
    if (!isMobileUser && isOnMobilePath) {
      setIsRedirecting(true);
      const desktopPath = location.pathname.replace('/mobile', '') || '/';
      navigate(desktopPath, { replace: true });
      return;
    }

    setIsRedirecting(false);
  }, [location.pathname, navigate]);

  const openSearch = () => {
    setIsCartOpen(false);
    setIsSearchOpen(true);
  };
  const closeSearch = () => setIsSearchOpen(false);

  const openCart = () => {
    setIsSearchOpen(false);
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  // Show loading while redirecting to avoid flashing wrong content
  if (isRedirecting) return <Loading />;

  // Avoid blocking search bots with a loading-only screen
  if (
    isMobileDevice() &&
    !isBot() &&
    !location.pathname.startsWith('/mobile') &&
    !location.pathname.startsWith('/admin')
  ) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <React.Suspense fallback={<Loading />}>
        {/* Fixed Header Container (Banner + Navbar) */}
        {showDesktopChrome && (
          <>
            <AnnouncementBanner />
            <Navbar onSearchClick={openSearch} onCartClick={openCart} /* onVisualSearch={() => setIsVisualSearchOpen(true)} */ />
          </>
        )}

        {/* Main Content Area */}
        <div className="relative z-10">
          {showDesktopChrome && (
            <>
              <CartDropdown isOpen={isCartOpen} onClose={closeCart} />
              <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
            </>
          )}
          {/* {isVisualSearchOpen && (
            <React.Suspense fallback={<Loading />}>
              <VisualSearch onClose={() => setIsVisualSearchOpen(false)} />
            </React.Suspense>
          )} */}
          <Routes>
            {/* Mobile version - separate layout */}
            <Route path="/mobile/*" element={<MobileApp />} />

            {/* Desktop version */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductView />} />
            <Route path="/bundle/:id" element={<React.Suspense fallback={<Loading />}><BundleDetail /></React.Suspense>} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/lookbooks" element={<Lookbooks />} />
            <Route path="/lookbook-builder" element={<React.Suspense fallback={<Loading />}><LookbookBuilder /></React.Suspense>} />
            <Route path="/style-feed" element={<React.Suspense fallback={<Loading />}><StyleFeed /></React.Suspense>} />
            <Route path="/vip-club" element={<React.Suspense fallback={<Loading />}><VIPClub /></React.Suspense>} />
            <Route path="/challenges" element={<React.Suspense fallback={<Loading />}><Challenges /></React.Suspense>} />
            <Route path="/live" element={<React.Suspense fallback={<Loading />}><LiveStreams /></React.Suspense>} />
<Route path="/live/:id" element={<React.Suspense fallback={<Loading />}><LiveStreamView /></React.Suspense>} />
<Route path="/eco-impact" element={<React.Suspense fallback={<Loading />}><EcoImpact /></React.Suspense>} />
<Route path="/reels" element={<React.Suspense fallback={<Loading />}><Reels /></React.Suspense>} />
<Route path="/reels/:id" element={<React.Suspense fallback={<Loading />}><Reels /></React.Suspense>} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
<Route path="/gift-cards" element={<React.Suspense fallback={<Loading />}><GiftCards /></React.Suspense>} />
<Route path="/blog" element={<React.Suspense fallback={<Loading />}><Blog /></React.Suspense>} />
<Route path="/blog/:slug" element={<React.Suspense fallback={<Loading />}><BlogPost /></React.Suspense>} />
<Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </React.Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1025',
            color: '#fff',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  const pwa = usePWA()

  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductProvider>
        <CartProvider>
          <FavoritesProvider>
            <NotificationProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <OfflineIndicator isOnline={pwa.isOnline} updateAvailable={pwa.updateAvailable} onUpdate={pwa.updateApp} />
                <MainContent />
                <InstallPrompt isInstallable={pwa.isInstallable} onInstall={pwa.installApp} />
              </Router>
            </NotificationProvider>
          </FavoritesProvider>
        </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
