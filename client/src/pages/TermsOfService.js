import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, Truck, RotateCcw, CreditCard, AlertTriangle, Phone, Mail, Calendar } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const TermsOfService = () => {
    const sections = [
        {
            icon: <ShoppingCart className="w-6 h-6" />,
            title: "Buyurtma berish tartibi",
            content: [
                "Mahsulotni tanlang va savatga qo'shing",
                "Telefon raqamingiz va manzilni to'g'ri kiriting",
                "Buyurtma tasdiqlanganidan so'ng operator siz bilan bog'lanadi",
                "Buyurtma minimal miqdori 50,000 so'mdan boshlanadi",
                "Bir nechta mahsulotni bitta buyurtmada olish mumkin"
            ]
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "To'lov shartlari",
            content: [
                "Naqd pul orqali mahsulotni qabul qilganda to'lash",
                "Click yoki Payme orqali oldindan to'lash",
                "Plastik karta orqali kuryerga to'lash",
                "Oldindan to'lov qaytarilmaydigan holatlar mavjud",
                "Chegirmalar boshqa aksiyalar bilan qo'shilmaydi"
            ]
        },
        {
            icon: <Truck className="w-6 h-6" />,
            title: "Yetkazib berish",
            content: [
                "Toshkent shahri bo'ylab 1-2 soat ichida",
                "Tez orada viloyatlarga yetkazib berish hizmati mavjud bo'ladi",
                "Yetkazib berish bepul",
                "Kuryer siz bilan oldindan bog'lanadi",
                "Manzilni aniq ko'rsating, aks holda yetkazish kechikishi mumkin"
            ]
        },
        {
            icon: <RotateCcw className="w-6 h-6" />,
            title: "Qaytarish va almashtirish",
            content: [
                "Mahsulotni 14 kun ichida qaytarish mumkin",
                "Mahsulot asl ko'rinishini saqlab qolgan bo'lishi kerak",
                "Teglar va qadoq buzilmagan bo'lishi shart",
                "Pul mablag'i 3-5 ish kuni ichida qaytariladi"
            ]
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: "Muhim shartlar",
            content: [
                "Buyurtma tasdiqlangandan keyin bekor qilish huquqiga egasiz",
                "Rasm va haqiqiy rang ozgina farq qilishi mumkin",
                "Narxlar oldindan ogohlantirmasdan o'zgarishi mumkin",
                "Akkaunt ma'lumotlarini o'zgartirish foydalanuvchi javobgarligida"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <SEO
                title="Foydalanish shartlari"
                description="Luxx.uz foydalanish shartlari - Buyurtma, to'lov, yetkazib berish va qaytarish qoidalari."
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
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Foydalanish shartlari
                            </h1>
                            <p className="text-gray-400 mt-1">
                                Xarid qilishdan oldin o'qib chiqing
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
                        Hurmatli mijoz!
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                        <strong>Luxx.uz</strong> onlayn do'konidan xarid qilishingizdan oldin ushbu foydalanish
                        shartlari bilan tanishib chiqishingizni so'raymiz. Buyurtma berish orqali siz ushbu
                        shartlarga rozilik bildirasiz.
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
                            className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
                                    {section.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {section.title}
                                </h3>
                            </div>
                            <ul className="space-y-2 ml-13">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start space-x-3 text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Warranty Section */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        ✅ Kafolat
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Barcha mahsulotlar sifat kafolati bilan sotiladi. Agar mahsulotda ishlab
                        chiqarish nuqsoni aniqlansa, biz uni bepul almashtiramiz yoki pulni qaytaramiz.
                    </p>
                    <p className="text-gray-400 text-sm">
                        Kafolat buzilgan, ishlatilgan yoki noto'g'ri saqlangan mahsulotlarga tegishli emas.
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 rounded-3xl p-6 md:p-8 border border-cyan-500/20 mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                        Savollaringiz bormi?
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Foydalanish shartlari haqida savollaringiz bo'lsa, biz bilan bog'laning:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="tel:+998884299969"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Phone className="w-5 h-5 text-cyan-400" />
                            <span className="text-white">+998 88 429 99 69</span>
                        </a>
                        <a
                            href="mailto:support@luxx.uz"
                            className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-colors"
                        >
                            <Mail className="w-5 h-5 text-blue-400" />
                            <span className="text-white">support@luxx.uz</span>
                        </a>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    Ushbu foydalanish shartlari O'zbekiston Respublikasi qonunchiligiga muvofiq
                    tuzilgan va istalgan vaqtda o'zgartirilishi mumkin.
                </p>
            </div>

            <Footer />
        </div>
    );
};

export default TermsOfService;
