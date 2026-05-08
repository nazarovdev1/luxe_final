import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FAQ = () => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Buyurtmani qanday berish mumkin?",
            answer: "Buyurtma berish uchun mahsulotni tanlang, kerakli rang va o'lchamni belgilang va 'Savatga qo'shish' tugmasini bosing. Keyin savatga o'tib, 'Buyurtmani rasmiylashtirish' tugmasini bosing va kerakli ma'lumotlarni to'ldiring."
        },
        {
            question: "Yetkazib berish qancha vaqt oladi?",
            answer: (
                <>
                    Toshkent shahri bo'ylab yetkazib berish <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500 font-semibold">3-6 soat</span> ichida amalga oshiriladi. Boshqa viloyatlarga yetkazib berish hozircha mavjud emas :( | Barcha buyurtmalar bepul yetkazib beriladi.
                </>
            )
        },
        {
            question: "To'lov usullari qanday?",
            answer: "Naqd pul orqali, Click va Payme orqali to'lov tez orada amalga oshiriladi. Mahsulot yetkazib berilganda naqd to'lash imkoniyati mavjud."
        },
        {
            question: "Mahsulotni qaytarish mumkinmi?",
            answer: "Ha, agar mahsulot sizga mos kelmasa yoki nuqsoni bo'lsa, 14 kun ichida qaytarish mumkin. Mahsulot yangi holatda bo'lishi va etiketkalari saqlanishi kerak."
        },
        {
            question: "Mahsulot sifati kafolatlanganmi?",
            answer: "Albatta! Barcha mahsulotlarimiz yuqori sifatli materiallardan tayyorlangan va sifat nazoratidan o'tgan. Biz har bir mahsulot uchun 30 kunlik kafolat beramiz."
        },
        {
            question: "O'lchamni qanday tanlash kerak?",
            answer: "Har bir mahsulot sahifasida o'lchamlar jadvali mavjud. Agar o'lchamni tanlashda qiyinchilik bo'lsa, bizning qo'llab-quvvatlash xizmatimiz bilan bog'laning, sizga yordam beramiz."
        },
        {
            question: "Chegirmalar va aksiyalar bormi?",
            answer: "Ha, biz muntazam ravishda chegirmalar va aksiyalar o'tkazamiz. Yangiliklar va maxsus takliflardan xabardor bo'lish uchun bizning ijtimoiy tarmoqlarimizga obuna bo'ling."
        },
        {
            question: "Buyurtmani qanday kuzatish mumkin?",
            answer: "Buyurtma rasmiylashtirilgandan so'ng, siz telefon raqamingizga SMS orqali buyurtma holati haqida xabar olasiz. Shuningdek, bizning qo'llab-quvvatlash xizmatimizga qo'ng'iroq qilib buyurtma holatini bilib olishingiz mumkin."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-[#0c0815] relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 mb-6">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">{t('faq.badge')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('faq.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-500">{t('faq.title2')}</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-2xl transition-all duration-300 ${openIndex === index
                                    ? 'bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/30'
                                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                                } border backdrop-blur-sm`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openIndex === index
                                            ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500'
                                            : 'bg-white/10 group-hover:bg-purple-500/20'
                                        }`}>
                                        <span className={`text-sm font-semibold ${openIndex === index ? 'text-white' : 'text-gray-400'}`}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className={`text-lg font-medium transition-colors ${openIndex === index ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                        }`}>
                                        {faq.question}
                                    </span>
                                </div>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openIndex === index
                                        ? 'bg-purple-500/20 rotate-180'
                                        : 'bg-white/5 group-hover:bg-white/10'
                                    }`}>
                                    <ChevronDown className={`w-4 h-4 transition-colors ${openIndex === index ? 'text-purple-400' : 'text-gray-500'
                                        }`} />
                                </div>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}>
                                <div className="px-6 pb-5 pl-[4.5rem] text-gray-400 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-3xl border border-purple-500/20">
                        <div className="w-14 h-14 bg-none rounded-2xl flex items-center justify-center">
                            <MessageCircle className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg mb-1">{t('faq.ctaTitle')}</p>
                            <p className="text-gray-400 text-sm">{t('faq.ctaDescription')}</p>
                        </div>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30"
                        >
                            {t('faq.ctaButton')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
