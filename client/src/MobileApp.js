import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/mobile/MobileLayout';
import MobileHome from './pages/mobile/MobileHome';
import SEO from './components/SEO';
import MobileProducts from './pages/mobile/MobileProducts';
import MobileSearch from './pages/mobile/MobileSearch';
import MobileProductView from './pages/mobile/MobileProductView';
import MobileCart from './pages/mobile/MobileCart';
import MobileCheckout from './pages/mobile/MobileCheckout';
import MobileAdmin from './pages/mobile/MobileAdmin';
import MobileAdminEdit from './pages/mobile/MobileAdminEdit';
import MobileProfile from './pages/mobile/MobileProfile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import MobilePrivacyPolicy from './pages/mobile/MobilePrivacyPolicy';
import MobileTermsOfService from './pages/mobile/MobileTermsOfService';
import MobileLookbooks from './pages/mobile/MobileLookbooks';
import MobileLookDetail from './pages/mobile/MobileLookDetail';
import MobileVIPClub from './pages/mobile/MobileVIPClub';
import MobileEcoImpact from './pages/mobile/MobileEcoImpact';
import MobileLive from './pages/mobile/MobileLive';
import MobileStyleFeed from './pages/mobile/MobileStyleFeed';
import MobileChallenges from './pages/mobile/MobileChallenges';
import MobileReels from './pages/mobile/MobileReels';
import LiveStreamView from './pages/LiveStreamView';
import NotFound from './pages/NotFound';

const MobileApp = () => {
    return (
        <MobileLayout>
            <SEO title="Mobile Versiya" noIndex={true} canonicalPath="/" />
            <Routes>
                <Route path="/" element={<MobileHome />} />
                <Route path="/about" element={<Navigate to="/#about" replace />} />
                <Route path="/products" element={<MobileProducts />} />
                <Route path="/search" element={<MobileSearch />} />
                <Route path="/product/:id" element={<MobileProductView />} />
                <Route path="/cart" element={<MobileCart />} />
                <Route path="/checkout" element={<MobileCheckout />} />
                <Route path="/profile" element={<MobileProfile />} />
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
<Route path="*" element={<NotFound />} />
            </Routes>
        </MobileLayout>
    );
};

export default MobileApp;
