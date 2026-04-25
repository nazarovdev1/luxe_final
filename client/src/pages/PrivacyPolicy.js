import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail, Phone, Calendar } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    const sections = [
        {
            icon: <Database className="w-6 h-6" />,
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
            icon: <Eye className="w-6 h-6" />,
            title: "Ma'lumotlardan foydalanish maqsadi",
            content: [
                "Buyurtmalarni qayta ishlash va yetkazib berish",
                "Mijozlar bilan bog'lanish (buyurtma holati, aksiyalar)",
                "Xizmat sifatini yaxshilash",
                "Shaxsiylashtirilgan tavsiyalar berish",
                "Qonuniy talablarni bajarish"
            ]
        },
        {
            icon: <Lock className="w-6 h-6" />,
            title: "Ma'lumotlar xavfsizligi",
            content: [
                "Barcha ma'lumotlar shifrlangan holda saqlanadi",
                "Faqat vakolatli xodimlar kirish huquqiga ega",
                "Muntazam xavfsizlik tekshiruvlari o'tkaziladi",
                "To'lov ma'lumotlari bizda saqlanmaydi",
                "SSL sertifikati orqali himoyalangan ulanish"
            ]
        },
        {
            icon: <Bell className="w-6 h-6" />,
            title: "Xabarlar va bildirishnomalar",
            content: [
                "Buyurtma holati haqida SMS xabarnomalar",
                "Maxsus takliflar va chegirmalar (rozilik bilan)",
                "Muhim yangiliklar va o'zgarishlar",
                "Xabarlardan voz kechish istalgan vaqtda mumkin"
            ]
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Sizning huquqlaringiz",
            content: [
                "Ma'lumotlaringizni ko'rish huquqi",
                "Ma'lumotlarni tuzatish huquqi",
                "Ma'lumotlarni o'chirish huquqi",
                "Marketing xabarlaridan voz kechish huquqi",
                "Shikoyat qilish huquqi"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title="Maxfiylik siyosati"
                description="Luxx.uz maxfiylik siyosati - Shaxsiy ma'lumotlaringiz qanday himoyalanishini bilib oling."
            />

            {/* Header */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Bosh sahifa</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Maxfiylik siyosati
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Shaxsiy ma'lumotlaringiz biz uchun muhim
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
                        Hurmatli mijoz!
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        <strong>Luxx.uz</strong> onlayn do'koni sifatida biz sizning shaxsiy ma'lumotlaringiz
                        xavfsizligini ta'minlashga alohida e'tibor qaratamiz. Ushbu maxfiylik siyosati
                        qanday ma'lumotlar yig'ilishi, ulardan qanday foydalanilishi va ular qanday
                        himoyalanishini tushuntiradi.
                    </p>
                    <div className="flex items-center space-x-2 mt-4 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Oxirgi yangilanish: 20-yanvar, 2026-yil</span>
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
                                    {section.title}
                                </h3>
                            </div>
                            <ul className="space-y-2 ml-13">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3 text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Cookie Policy */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        🍪 Cookie fayllar haqida
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Biz sayt ishlashini yaxshilash uchun cookie fayllardan foydalanamiz.
                        Cookie fayllar sizning qurilmangizda saqlanadigan kichik matn fayllari bo'lib,
                        ular saytda qulay tajriba yaratishga yordam beradi.
                    </p>
                    <p className="text-gray-400 text-sm">
                        Saytimizdan foydalanishda davom etish orqali siz cookie fayllar ishlatilishiga
                        rozilik bildirasiz.
                    </p>
                </div>

                {/* Third Parties */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Uchinchi taraflar
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Biz sizning ma'lumotlaringizni quyidagi hollarda uchinchi taraflarga
                        taqdim etishimiz mumkin:
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Yetkazib berish xizmatlari (manzil va telefon raqami)</span>
                        </li>
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>To'lov tizimlari (xavfsiz to'lovni amalga oshirish uchun)</span>
                        </li>
                        <li className="flex items-start space-x-3 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Qonun talabiga ko'ra davlat organlariga</span>
                        </li>
                    </ul>
                    <p className="text-gray-400 text-sm mt-4">
                        Biz sizning ma'lumotlaringizni hech qachon reklama maqsadlarida sotmaymiz
                        yoki uchinchi taraflarga bermaymiz.
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 rounded-3xl p-6 md:p-8 border border-fuchsia-500/20 mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                        Savollaringiz bormi?
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Maxfiylik siyosati yoki shaxsiy ma'lumotlaringiz haqida savollaringiz
                        bo'lsa, biz bilan bog'laning:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="tel:+998884299969"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Phone className="w-5 h-5 text-fuchsia-400" />
                            <span className="text-white">+998 88 429 99 69</span>
                        </a>
                        <a
                            href="mailto:support@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Mail className="w-5 h-5 text-purple-400" />
                            <span className="text-white">support@luxx.uz</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Ushbu maxfiylik siyosati O'zbekiston Respublikasi qonunchiligiga muvofiq
                    tuzilgan va istalgan vaqtda o'zgartirilishi mumkin. O'zgarishlar saytda
                    e'lon qilinadi.
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
