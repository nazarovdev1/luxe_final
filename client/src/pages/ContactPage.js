import React from 'react';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <SEO
                title="Biz bilan bog'laning - Luxx.uz"
                description="Luxx.uz bilan bog'laning. Telefon, Telegram va xabar yuborish orqali biz bilan aloqa qiling."
                keywords="aloqa, bog'lanish, telefon, telegram, xabar"
            />
            <div className="pt-20">
                <Contact />
                <Footer />
            </div>
        </div>
    );
};

export default ContactPage;
