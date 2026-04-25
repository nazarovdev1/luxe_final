import React from 'react';
import FAQ from '../components/FAQ';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const FAQPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <SEO
                title="Ko'p beriladigan savollar - Luxx.uz"
                description="Luxx.uz haqida ko'p beriladigan savollar va javoblar. Buyurtma berish, yetkazib berish, to'lov va qaytarish haqida ma'lumot."
                keywords="savollar, FAQ, yordam, buyurtma, yetkazib berish, to'lov"
            />
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>
            <div className="pt-16">
                <FAQ />
                <Footer />
            </div>
        </div>
    );
};

export default FAQPage;
