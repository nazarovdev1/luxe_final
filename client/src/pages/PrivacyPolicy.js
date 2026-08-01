import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail, Phone, Calendar } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
    const { t } = useLanguage();

    const sections = [
        {
            icon: <Database className="w-6 h-6" />,
            titleKey: 'privacy.section1Title',
            contentKey: 'privacy.section1Items'
        },
        {
            icon: <Eye className="w-6 h-6" />,
            titleKey: 'privacy.section2Title',
            contentKey: 'privacy.section2Items'
        },
        {
            icon: <Lock className="w-6 h-6" />,
            titleKey: 'privacy.section3Title',
            contentKey: 'privacy.section3Items'
        },
        {
            icon: <Bell className="w-6 h-6" />,
            titleKey: 'privacy.section4Title',
            contentKey: 'privacy.section4Items'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            titleKey: 'privacy.section5Title',
            contentKey: 'privacy.section5Items'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title={t('privacy.seoTitle')}
                description={t('privacy.seoDesc')}
            />

            {/* Header */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t('privacy.backHome')}</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                {t('privacy.title')}
                            </h1>
                            <p className="text-gray-400 mt-1">
                                {t('privacy.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Introduction */}
                <div className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 rounded-3xl p-6 md:p-8 border border-purple-500/20 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {t('privacy.introTitle')}
                    </h2>
                    <p className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('privacy.introBody') }} />
                    <div className="flex items-center space-x-2 mt-4 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{t('privacy.lastUpdated')}</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
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
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : null}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Cookie Policy */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {t('privacy.cookieTitle')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        {t('privacy.cookieBody')}
                    </p>
                    <p className="text-gray-400 text-sm">
                        {t('privacy.cookieNote')}
                    </p>
                </div>

                {/* Third Parties */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {t('privacy.thirdPartyTitle')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        {t('privacy.thirdPartyBody')}
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{t('privacy.thirdPartyItem1')}</span>
                        </li>
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{t('privacy.thirdPartyItem2')}</span>
                        </li>
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{t('privacy.thirdPartyItem3')}</span>
                        </li>
                    </ul>
                    <p className="text-gray-400 text-sm mt-4">
                        {t('privacy.thirdPartyNote')}
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 rounded-3xl p-6 md:p-8 border border-fuchsia-500/20 mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                        {t('privacy.contactTitle')}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {t('privacy.contactBody')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="tel:+998884299969"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Phone className="w-5 h-5 text-fuchsia-400" />
                            <span className="text-white">{t('privacy.contactPhone')}</span>
                        </a>
                        <a
                            href="mailto:support@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Mail className="w-5 h-5 text-purple-400" />
                            <span className="text-white">{t('privacy.contactEmail')}</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    {t('privacy.disclaimer')}
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
