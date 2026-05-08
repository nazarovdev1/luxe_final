import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, Truck, RotateCcw, CreditCard, AlertTriangle, Phone, Mail, Calendar } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileTermsOfService = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const sections = [
        {
            icon: <ShoppingCart className="w-5 h-5" />,
            title: t('terms.ordering'),
            content: [
                t('terms.orderingStep1'),
                t('terms.orderingStep2'),
                t('terms.orderingStep3'),
                `${t('terms.minOrder')}: 50,000 ${t('common.sum')}`
            ]
        },
        {
            icon: <CreditCard className="w-5 h-5" />,
            title: t('terms.payment'),
            content: [
                t('terms.paymentCash'),
                t('terms.paymentClick'),
                t('terms.paymentCard')
            ]
        },
        {
            icon: <Truck className="w-5 h-5" />,
            title: t('terms.delivery'),
            content: [
                t('terms.deliveryTashkent'),
                t('terms.deliveryFree')
            ]
        },
        {
            icon: <RotateCcw className="w-5 h-5" />,
            title: t('terms.returns'),
            content: [
                t('terms.returns14'),
                t('terms.returnsOriginal'),
                t('terms.returnsTags')
            ]
        },
        {
            icon: <AlertTriangle className="w-5 h-5" />,
            title: t('terms.important'),
            content: [
                t('terms.importantCancel'),
                t('terms.importantSale'),
                t('terms.importantPrice')
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-24 animate-page-slide-right">
            <SEO
                title={t('terms.seoTitle')}
                description={t('terms.seoDesc')}
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span>{t('common.back')}</span>
                    </button>
                </div>
            </div>

            {/* Title Section */}
            <div className="px-4 py-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {t('terms.title')}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Xarid qilishdan oldin o'qing
                        </p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-2xl p-5 border border-blue-500/20 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        <strong>Luxx.uz</strong> dan xarid qilishdan oldin ushbu shartlar bilan tanishing.
                        Buyurtma berish orqali siz rozilik bildirasiz.
                    </p>
                    <div className="flex items-center space-x-2 mt-3 text-xs text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Yangilangan: 20-yanvar, 2026</span>
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
                                <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white">
                                    {section.title}
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3 text-gray-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Warranty */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                    <h3 className="text-base font-semibold text-white mb-2">
                        ✅ Kafolat
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Barcha mahsulotlar sifat kafolati bilan sotiladi.
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-2xl p-5 border border-cyan-500/20 mt-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                        Savollaringiz bormi?
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a
                            href="tel:+998884299969"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Phone className="w-5 h-5 text-cyan-400" />
                            <span className="text-white text-sm">+998 88 429 99 69</span>
                        </a>
                        <a
                            href="mailto:support@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white text-sm">support@luxx.uz</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-xs mt-6 px-4">
                    O'zbekiston Respublikasi qonunchiligiga muvofiq tuzilgan.
                </p>
            </div>
        </div>
    );
};

export default MobileTermsOfService;
