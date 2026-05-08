import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import PremiumHomeSections from '../components/PremiumHomeSections';
import AllProducts from '../components/AllProducts';
import ProductBundles from '../components/ProductBundles';
import About from '../components/About';
import Footer from '../components/Footer';
import RecentlyViewed from '../components/RecentlyViewed';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

import SEO from '../components/SEO';
import ParticleCanvas from '../components/ParticleCanvas';

const Home = () => {
  const location = useLocation();
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    // Handle hash-based scrolling when coming from another page
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Delay to ensure component is fully rendered
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#060a14] relative overflow-hidden">
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b47c]/[0.02] blur-[120px] z-0" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-white/[0.01] blur-[100px] z-0" />
      <ParticleCanvas />

      <SEO
        title="Ayollar kiyimlari, luxury kiyimlar va paltolar | Женская одежда"
        description="Luxx.uz - ayollar uchun premium va luxury kiyimlar onlayn do'koni. Yozgi kiyimlar, paltolar va zamonaviy kolleksiyalar. Женская одежда премиум-класса в Ташкенте."
        keywords="luxx.uz, luxe uz, luxury uz, luxe, luxury, ayollar kiyimlari, luxury kiyimlar, paltolar, premium kiyimlar, moda do'kon, женская одежда ташкент, купить платье ташкент"
        canonicalPath="/"
      />
      
      <div className="relative z-10">
        <Hero />
        <PremiumHomeSections />
      <AllProducts />
      <ProductBundles />
      <RecentlyViewed items={recentlyViewed} onClear={clearRecentlyViewed} />
      <About />
      <Footer />
      </div>
    </div>
  );
};

export default Home;

