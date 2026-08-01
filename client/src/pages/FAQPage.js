import React from 'react';
import FAQ from '../components/FAQ';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const FAQ_IDS = ['ordering', 'delivery', 'payment', 'returns', 'quality', 'sizing', 'promotions', 'tracking'];

const FAQPage = () => {
    const { t, language } = useLanguage();

    const faqItems = FAQ_IDS.map((id) => ({
        question: t(`faqItems.${id}.question`),
        answer: t(`faqItems.${id}.answer`),
    }));

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    const seoTitle = language === 'ru'
        ? 'Часто задаваемые вопросы — Luxx.uz'
        : language === 'en'
            ? 'Frequently Asked Questions — Luxx.uz'
            : "Ko'p beriladigan savollar - Luxx.uz";

    const seoDescription = language === 'ru'
        ? 'Часто задаваемые вопросы и ответы о Luxx.uz. Заказ, доставка, оплата и возврат.'
        : language === 'en'
            ? 'Frequently asked questions and answers about Luxx.uz. Ordering, delivery, payment, and returns.'
            : "Luxx.uz haqida ko'p beriladigan savollar va javoblar. Buyurtma berish, yetkazib berish, to'lov va qaytarish haqida ma'lumot.";

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords="savollar, FAQ, yordam, buyurtma, yetkazib berish, to'lov"
                structuredData={faqSchema}
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
