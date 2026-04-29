import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import PremiumHomeSections from '../components/PremiumHomeSections';
import AllProducts from '../components/AllProducts';
import About from '../components/About';
import Footer from '../components/Footer';

import SEO from '../components/SEO';

const Home = () => {
  const location = useLocation();

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
    <div>
      <SEO
        title="Ayollar kiyimlari, luxury kiyimlar va paltolar | Женская одежда"
        description="Luxx.uz - ayollar uchun premium va luxury kiyimlar onlayn do'koni. Yozgi kiyimlar, paltolar va zamonaviy kolleksiyalar. Женская одежда премиум-класса в Ташкенте."
        keywords="luxx.uz, luxe uz, luxury uz, luxe, luxury, ayollar kiyimlari, luxury kiyimlar, paltolar, premium kiyimlar, moda do'kon, женская одежда ташкент, купить платье ташкент"
        canonicalPath="/"
      />
      <Hero />
      <PremiumHomeSections />
      <AllProducts />
      <About />
      <Footer />
    </div>
  );
};

export default Home;

