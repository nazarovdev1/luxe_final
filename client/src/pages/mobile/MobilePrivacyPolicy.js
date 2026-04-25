import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail, Phone, Calendar } from 'lucide-react';
import SEO from '../../components/SEO';

const MobilePrivacyPolicy = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <Database className="w-5 h-5" />,
            title: "Qanday ma'lumotlar yig'iladi",
            content: [
                "Ism va familiya",
                "Telefon raqami",
                "Yetkazib berish manzili",
                "Elektron pochta manzili (ixtiyoriy)",
                "Buyurtma tarixi va afzalliklar"
            ]
        },
        {
            icon: <Eye className="w-5 h-5" />,
            title: "Ma'lumotlardan foydalanish maqsadi",
            content: [
                "Buyurtmalarni qayta ishlash va yetkazib berish",
                "Mijozlar bilan bog'lanish",
                "Xizmat sifatini yaxshilash",
                "Shaxsiylashtirilgan tavsiyalar berish"
            ]
        },
        {
            icon: <Lock className="w-5 h-5" />,
            title: "Ma'lumotlar xavfsizligi",
            content: [
                "Barcha ma'lumotlar shifrlangan holda saqlanadi",
                "Faqat vakolatli xodimlar kirish huquqiga ega",
                "To'lov ma'lumotlari bizda saqlanmaydi",
                "SSL sertifikati orqali himoyalangan"
            ]
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: "Sizning huquqlaringiz",
            content: [
                "Ma'lumotlaringizni ko'rish huquqi",
                "Ma'lumotlarni tuzatish huquqi",
                "Ma'lumotlarni o'chirish huquqi",
                "Marketing xabarlaridan voz kechish huquqi"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-24 animate-page-slide-right">
            <SEO
                title="Maxfiylik siyosati"
                description="Luxx.uz maxfiylik siyosati - Shaxsiy ma'lumotlaringiz qanday himoyalanishini bilib oling."
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span>Orqaga</span>
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
                            Maxfiylik siyosati
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Ma'lumotlaringiz xavfsizligi
                        </p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 rounded-2xl p-5 border border-purple-500/20 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        <strong>Luxx.uz</strong> sifatida biz sizning shaxsiy ma'lumotlaringiz
                        xavfsizligini ta'minlashga alohida e'tibor qaratamiz.
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
                                <div className="w-9 h-9 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                                    {section.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white">
                                    {section.title}
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3 text-gray-300 text-sm">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Cookie */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                    <h3 className="text-base font-semibold text-white mb-2">
                        🍪 Cookie fayllar
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Sayt ishlashini yaxshilash uchun cookie fayllardan foydalanamiz.
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 rounded-2xl p-5 border border-fuchsia-500/20 mt-6">
                    <h3 className="text-lg font-bold text-white mb-3">
                        Savollaringiz bormi?
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a
                            href="tel:+998901234567"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Phone className="w-5 h-5 text-fuchsia-400" />
                            <span className="text-white text-sm">+998 90 123 45 67</span>
                        </a>
                        <a
                            href="mailto:info@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 active:bg-white/20 px-4 py-3 rounded-xl"
                        >
                            <Mail className="w-5 h-5 text-purple-400" />
                            <span className="text-white text-sm">info@luxx.uz</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-xs mt-6 px-4">
                    Ushbu maxfiylik siyosati O'zbekiston Respublikasi qonunchiligiga muvofiq tuzilgan.
                </p>
            </div>
        </div>
    );
};

export default MobilePrivacyPolicy;
