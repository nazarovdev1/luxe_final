import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/mobile/MobileLayout';
import Loading from './components/Loading';
import SEO from './components/SEO';

// Lazy load pages to avoid circular dependencies and improve performance
const MobileHome = lazy(() => import('./pages/mobile/MobileHome'));
const MobileProducts = lazy(() => import('./pages/mobile/MobileProducts'));
const MobileSearch = lazy(() => import('./pages/mobile/MobileSearch'));
const MobileEvents = lazy(() => import('./pages/mobile/MobileEvents'));
const MobileProductView = lazy(() => import('./pages/mobile/MobileProductView'));
const MobileCart = lazy(() => import('./pages/mobile/MobileCart'));
const MobileCheckout = lazy(() => import('./pages/mobile/MobileCheckout'));
const MobileAdmin = lazy(() => import('./pages/mobile/MobileAdmin'));
const MobileAdminEdit = lazy(() => import('./pages/mobile/MobileAdminEdit'));
const MobileProfile = lazy(() => import('./pages/mobile/MobileProfile'));
const MobileOrders = lazy(() => import('./pages/mobile/MobileOrders'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const RegisterForm = lazy(() => import('./components/RegisterForm'));
const MobilePrivacyPolicy = lazy(() => import('./pages/mobile/MobilePrivacyPolicy'));
const MobileTermsOfService = lazy(() => import('./pages/mobile/MobileTermsOfService'));
const MobileLookbooks = lazy(() => import('./pages/mobile/MobileLookbooks'));
const MobileLookDetail = lazy(() => import('./pages/mobile/MobileLookDetail'));
const MobileVIPClub = lazy(() => import('./pages/mobile/MobileVIPClub'));
const MobileEcoImpact = lazy(() => import('./pages/mobile/MobileEcoImpact'));
const MobileLive = lazy(() => import('./pages/mobile/MobileLive'));
const LiveStreamView = lazy(() => import('./pages/LiveStreamView'));
const MobileStyleFeed = lazy(() => import('./pages/mobile/MobileStyleFeed'));
const MobileChallenges = lazy(() => import('./pages/mobile/MobileChallenges'));
const MobileReels = lazy(() => import('./pages/mobile/MobileReels'));
const GiftCards = lazy(() => import('./pages/GiftCards'));
const Blog = lazy(() => import('./pages/Blog'));
const MobileBundles = lazy(() => import('./pages/mobile/MobileBundles'));
const MobileBundleDetail = lazy(() => import('./pages/mobile/MobileBundleDetail'));
const MobileBlogPost = lazy(() => import('./pages/mobile/MobileBlogPost'));
const NotFound = lazy(() => import('./pages/NotFound'));

const MobileApp = () => {
    return (
        <MobileLayout>
            <SEO title="Premium Fashion Store" noIndex={true} canonicalPath="/" />
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<MobileHome />} />
                    <Route path="/about" element={<Navigate to="/#about" replace />} />
                    <Route path="/products" element={<MobileProducts />} />
                    <Route path="/search" element={<MobileSearch />} />
                    <Route path="/events" element={<MobileEvents />} />
                    <Route path="/product/:id" element={<MobileProductView />} />
                    <Route path="/cart" element={<MobileCart />} />
                    <Route path="/checkout" element={<MobileCheckout />} />
                    <Route path="/profile" element={<MobileProfile />} />
                    <Route path="/orders" element={<MobileOrders />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/admin" element={<MobileAdmin />} />
                    <Route path="/admin/new" element={<MobileAdminEdit />} />
                    <Route path="/admin/edit/:id" element={<MobileAdminEdit />} />
                    <Route path="/privacy-policy" element={<MobilePrivacyPolicy />} />
                    <Route path="/terms" element={<MobileTermsOfService />} />
                    <Route path="/lookbooks" element={<MobileLookbooks />} />
                    <Route path="/lookbooks/:id" element={<MobileLookDetail />} />
                    <Route path="/vip-club" element={<MobileVIPClub />} />
                    <Route path="/eco-impact" element={<MobileEcoImpact />} />
                    <Route path="/live" element={<MobileLive />} />
                    <Route path="/live/:id" element={<LiveStreamView />} />
                    <Route path="/style-feed" element={<MobileStyleFeed />} />
                    <Route path="/challenges" element={<MobileChallenges />} />
                    <Route path="/reels" element={<MobileReels />} />
                    <Route path="/reels/:id" element={<MobileReels />} />
                    <Route path="/gift-cards" element={<GiftCards />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/bundles" element={<MobileBundles />} />
                    <Route path="/bundle/:id" element={<MobileBundleDetail />} />
                    <Route path="/blog/:slug" element={<MobileBlogPost />} />
                    <Route path="/faq" element={<Navigate to="/mobile/profile" replace />} />
                    <Route path="/contact" element={<Navigate to="/mobile/profile" replace />} />
                    <Route path="/lookbook-builder" element={<Navigate to="/mobile/lookbooks" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </MobileLayout>
    );
};

export default MobileApp;
