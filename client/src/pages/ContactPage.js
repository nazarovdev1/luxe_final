import React from 'react';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const ContactPage = () => {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <SEO
                title={t('contactPage.seoTitle')}
                description={t('contactPage.seoDesc')}
                keywords={t('contactPage.seoKeywords')}
            />
            <div className="pt-20">
                <Contact />
                <Footer />
            </div>
        </div>
    );
};

export default ContactPage;
