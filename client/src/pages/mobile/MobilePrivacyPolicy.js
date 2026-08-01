import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail, Phone, Calendar } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';

const MobilePrivacyPolicy = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const sections = [
        {
            icon: <Database className="w-5 h-5" />,
            titleKey: 'privacy.section1Title',
            contentKey: 'privacy.section1Items'
        },
        {
            icon: <Eye className="w-5 h-5" />,
            titleKey: 'privacy.section2Title',
            contentKey: 'privacy.mobileSection2Items'
        },
        {
            icon: <Lock className="w-5 h-5" />,
            titleKey: 'privacy.section3Title',
            contentKey: 'privacy.mobileSection3Items'
        },
        {
            icon: <Shield className="w-5 h-5" />,
            titleKey: 'privacy.section5Title',
            contentKey: 'privacy.mobileSection4Items'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-24 animate-page-slide-right">
            <SEO
                title={t('privacy.seoTitle')}
                description={t('privacy.seoDesc')}
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span>{t('privacy.mobileBack')}</span>
                    </button>
                </div>
            </div>

            {/* Title Section */}
            <div className="px-4 py-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {t('privacy.title')}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {t('privacy.mobileSubtitle')}
                        </p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 rounded-2xl p-5 border border-purple-500/20 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t('privacy.mobileIntro') }} />
                    <div className="flex items-center space-x-2 mt-3 text-xs text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{t('privacy.mobileLastUpdated')}</span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white/5 rounded-2xl p-4 border border-white/10"
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white">
                                    {t(section.titleKey)}
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {Array.isArray(t(section.contentKey)) ? (
                                    t(section.contentKey).map((item, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-gray-300 text-sm">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : null}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Cookie */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                    <h3 className="text-base font-semibold text-white mb-2">
                        {t('privacy.mobileCookieTitle')}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {t('privacy.mobileCookieBody')}
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 rounded-2xl p-5 border border-fuchsia-500/20 mt-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                        {t('privacy.contactTitle')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a
                            href="tel:+998901234567"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Phone className="w-5 h-5 text-fuchsia-400" />
                            <span className="text-white text-sm">{t('privacy.mobileContactPhone')}</span>
                        </a>
                        <a
                            href="mailto:info@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Mail className="w-5 h-5 text-purple-400" />
                            <span className="text-white text-sm">{t('privacy.mobileContactEmail')}</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-xs mt-6 px-4">
                    {t('privacy.mobileDisclaimer')}
                </p>
            </div>
        </div>
    );
};

export default MobilePrivacyPolicy;
