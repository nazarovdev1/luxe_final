import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, Truck, RotateCcw, CreditCard, AlertTriangle, Phone, Mail, Calendar } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const TermsOfService = () => {
    const { t } = useLanguage();

    const sections = [
        {
            icon: <ShoppingCart className="w-6 h-6" />,
            titleKey: 'terms.section1Title',
            contentKey: 'terms.section1Items'
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            titleKey: 'terms.section2Title',
            contentKey: 'terms.section2Items'
        },
        {
            icon: <Truck className="w-6 h-6" />,
            titleKey: 'terms.section3Title',
            contentKey: 'terms.section3Items'
        },
        {
            icon: <RotateCcw className="w-6 h-6" />,
            titleKey: 'terms.section4Title',
            contentKey: 'terms.section4Items'
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            titleKey: 'terms.section5Title',
            contentKey: 'terms.section5Items'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title={t('terms.title')}
                description={t('terms.title') + ' - Luxx.uz'}
            />

            {/* Header */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t('terms.backHome')}</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                {t('terms.title')}
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {t('terms.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Introduction */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-3xl p-6 md:p-8 border border-blue-500/20 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {t('terms.introTitle')}
                    </h2>
                    <p className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('terms.introBody') }} />
                    <div className="flex items-center space-x-2 mt-4 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{t('terms.lastUpdated')}</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                                    {section.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {t(section.titleKey)}
                                </h3>
                            </div>
                            <ul className="space-y-2 ml-13">
                                {Array.isArray(t(section.contentKey)) ? (
                                    t(section.contentKey).map((item, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : null}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Warranty Section */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {t('terms.warrantyTitle')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        {t('terms.warrantyBody')}
                    </p>
                    <p className="text-gray-400 text-sm">
                        {t('terms.warrantyNote')}
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-3xl p-6 md:p-8 border border-cyan-500/20 mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                        {t('terms.contactTitle')}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {t('terms.contactBody')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="tel:+998884299969"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Phone className="w-5 h-5 text-cyan-400" />
                            <span className="text-white">{t('terms.contactPhone')}</span>
                        </a>
                        <a
                            href="mailto:support@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white">{t('terms.contactEmail')}</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    {t('terms.disclaimer')}
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default TermsOfService;
