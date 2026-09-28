import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import MaisonExperience from '../components/maison/MaisonExperience';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const location = useLocation();
  const { t } = useLanguage();
  useEffect(() => {
    if (!location.hash) return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start',
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [location.hash]);
  return (
    <div className="couture-homepage">
      <SEO title={t('home.seoTitle')} description={t('home.seoDesc')} keywords={t('home.seoKeywords')} canonicalPath="/" />
      <Hero />
      <MaisonExperience />
    </div>
  );
};
export default Home;
