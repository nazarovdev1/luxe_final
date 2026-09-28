import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Printer,
  Copy,
  Check,
  Phone,
  Mail,
  Share2
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const LegalPrivacy = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);
  const progressBarRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSection, setActiveSection] = useState('sec-collection');
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections = useMemo(() => [
    {
      id: 'sec-collection',
      number: '01',
      title: t('privacy.section1Title') || "Qanday ma'lumotlar yig'iladi",
      intro: "Luxx.uz platformasida xarid jarayonini amalga oshirish, buyurtmani tasdiqlash va tezkor yetkazib berish maqsadida faqat zaruriy shaxsiy ma'lumotlar to'planadi.",
      items: [
        { label: "Identifikatsiya ma'lumotlari", desc: "Mijozning ismi, familiyasi va murojaat shakli." },
        { label: "Bog'lanish vositalari", desc: "Telefon raqami (buyurtmani kuryer orqali yetkazishda qo'ng'iroq qilish va SMS yuborish uchun)." },
        { label: "Yetkazib berish manzili", desc: "Shahar, tuman, ko'cha, uy raqami hamda kuryer uchun qo'shimcha mo'ljallar." },
        { label: "Elektron pochta (ixtiyoriy)", desc: "Elektron fiskal chek va buyurtma hisob-fakturasini yuborish uchun." },
        { label: "Xaridlar tarixi", desc: "Savat tarkibi, avvalgi buyurtmalar ro'yxati va saralangan sevimlilar." }
      ],
      legalNote: "Biz hech qachon foydalanuvchilarning biometrik yoki o'ta maxfiy shaxsiy ma'lumotlarini so'ramaymiz va saqlamaymiz."
    },
    {
      id: 'sec-usage',
      number: '02',
      title: t('privacy.section2Title') || "Ma'lumotlardan foydalanish maqsadi",
      intro: "To'plangan barcha axborotlar qat'iy ravishda belgilangan tijorat va logistika maqsadlarida ishlatiladi:",
      items: [
        { label: "Buyurtmalarni qayta ishlash", desc: "Ombordan tovarlarni yig'ish, sifatini tekshirish va kuryerga topshirish." },
        { label: "Mijozlar bilan tezkor aloqa", desc: "Buyurtma holati, kuryerning yetib borish vaqti yoki noaniqliklarni kelishish." },
        { label: "Servis sifatini nazorat qilish", desc: "Sayt ishlash tezligini monitoring qilish va xarid tajribasini soddalashtirish." },
        { label: "Qonuniy talablarga rioya etish", desc: "O'zbekiston Respublikasi soliq va fiskal qonunchiligiga binoan cheklar rasmiylashtirish." }
      ],
      legalNote: "Ma'lumotlar faqat siz tanlagan xizmatni to'liq bajarish uchun kerak bo'lgan darajadagina ishlovdan o'tkaziladi."
    },
    {
      id: 'sec-security',
      number: '03',
      title: t('privacy.section3Title') || "Ma'lumotlar xavfsizligi va shifrlash",
      intro: "Mijozlar ma'lumotlari xavfsizligini ta'minlash bizning ustuvor texnik majburiyatimizdir.",
      items: [
        { label: "256-bitli SSL/TLS shifrlash", desc: "Sayt va foydalanuvchi qurilmasi o'rtasidagi barcha ulanishlar bank darajasidagi shifrlangan kanal orqali o'tadi." },
        { label: "Plastik karta ma'lumotlari", desc: "To'lovlar to'g'ridan-to'g'ri Click va Payme litsenziyalangan shlyuzlarida bajariladi. Karta raqamlari yoki CVV kodlari bizning serverlarimizda aslo saqlanmaydi." },
        { label: "Cheklangan xodimlar kirishi", desc: "Faqat buyurtmani yetkazuvchi mas'ul xodimlarga kerakli darajada kirish ruxsati beriladi." },
        { label: "Avtomatlashtirilgan xavfsizlik auditi", desc: "Server tizimlari muntazam ravishda zaifliklarga qarshi sinovdan o'tkaziladi." }
      ],
      legalNote: "Har qanday xavfsizlik hodisasi ro'y berganda foydalanuvchilar qonun doirasida darhol xabardor qilinadi."
    },
    {
      id: 'sec-notifications',
      number: '04',
      title: t('privacy.section4Title') || "Xabarnomalar va bildirishnomalar",
      intro: "Biz faqat xaridingiz bilan bevosita bog'liq bo'lgan xabarlarni yuboramiz:",
      items: [
        { label: "Tranzaksiya SMSlari", desc: "Buyurtma qabul qilingani, tasdiqlangani va kuryerga berilgani haqida xabarlar." },
        { label: "Kuryer qo'ng'irog'i", desc: "Manzilga yetib borishdan 15-30 daqiqa oldin kuryer tomonidan aniqlashtirish." },
        { label: "Marketing va maxsus takliflar", desc: "Faqat foydalanuvchi shaxsiy kabinetida ixtiyoriy ravishda obuna bo'lgan taqdirdagina yuboriladi." }
      ],
      legalNote: "Istalgan vaqtda profil sozlamalaridan marketing xabarlaridan bitta harakat bilan voz kechishingiz mumkin."
    },
    {
      id: 'sec-rights',
      number: '05',
      title: t('privacy.section5Title') || "Sizning huquqlaringiz",
      intro: "O'zbekiston Respublikasining «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuniga muvofiq quyidagi to'liq huquqlarga egasiz:",
      items: [
        { label: "Ma'lumotlar nusxasini talab qilish", desc: "Bizda mavjud bo'lgan shaxsiy profilingiz yozuvlari to'g'risida to'liq hisobot olish." },
        { label: "Tuzatish va yangilash", desc: "Eskirgan yoki xato kiritilgan ma'lumotlarni o'zgartirish." },
        { label: "To'liq o'chirish huquqi", desc: "Profilingizni va buyurtmalar tarixi bilan bog'liq ma'lumotlarni bazamizdan butunlay o'chirishni talab qilish." },
        { label: "Rozilikni qaytarib olish", desc: "Avval berilgan ma'lumotlarni qayta ishlash roziligini istalgan payt bekor qilish." }
      ],
      legalNote: "Ma'lumotlarni o'chirish bo'yicha arizalar DPO (Ma'lumotlar himoyachisi) tomonidan 24 soat ichida bajariladi."
    }
  ], [t]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchIntro = s.intro.toLowerCase().includes(q);
      const matchItems = s.items.some(
        (it) => it.label.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q)
      );
      return matchTitle || matchIntro || matchItems;
    });
  }, [sections, searchQuery]);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.1
          }
        });
      }

      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('[data-hero-kicker]', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo('[data-hero-title]', { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
        .fromTo('[data-hero-lead]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo('[data-hero-actions]', { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');

      gsap.fromTo(
        '[data-pillar-item]',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-pillars-grid]',
            start: 'top 85%',
            once: true
          }
        }
      );

      const articles = gsap.utils.toArray('[data-legal-article]');
      articles.forEach((art) => {
        gsap.fromTo(
          art,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: art,
              start: 'top 82%',
              once: true
            }
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0b] text-[#f5f5f3] selection:bg-[#c9a96e]/25 selection:text-white print:bg-white print:text-black">
      <SEO
        title={`${t('privacy.title') || 'Maxfiylik Siyosati'} — Luxx.uz`}
        description={t('privacy.seoDesc') || "Luxx.uz shaxsiy ma'lumotlarni saqlash va xavfsizlik siyosati."}
      />

      {/* Top Reading Progress Bar (Hidden in Print) */}
      <div className="fixed top-[76px] left-0 right-0 h-[2px] bg-white/[0.04] z-30 pointer-events-none print:hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#c9a96e] via-[#dfc48e] to-[#c9a96e] origin-left scale-x-0"
        />
      </div>

      {/* Hero Section */}
      <header className="relative pt-32 sm:pt-36 pb-16 border-b border-white/[0.08] print:pt-0 print:pb-4 print:border-b-0 overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-[#c9a96e]/[0.07] via-transparent to-transparent blur-3xl pointer-events-none print:hidden" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 print:px-0 print:max-w-full">
          {/* Print-only Official Letterhead */}
          <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-bold tracking-widest text-black block">LUXX.UZ</span>
                <span className="text-xs uppercase tracking-wider text-neutral-600 block">Rasmiy Huquqiy Nizom • Maxfiylik Siyosati</span>
              </div>
              <div className="text-right text-xs text-neutral-600 font-mono">
                <p>Hujjat kodi: LUX-PRV-2026</p>
                <p>Sana: 20-yanvar, 2026-yil</p>
                <p>Toshkent, O'zbekiston</p>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation (Web only) */}
          <div data-hero-kicker className="flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase text-neutral-400 mb-6 print:hidden">
            <Link to="/" className="text-neutral-400 hover:text-[#c9a96e] transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bosh sahifa</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-neutral-400">Huquqiy hujjatlar</span>
            <span className="text-white/20">/</span>
            <span className="text-[#c9a96e]">Maxfiylik Siyosati</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl print:max-w-full">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#c9a96e] mb-3 print:hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
                <span>Rasmiy Huquqiy Nizom • Versiya 2.4</span>
              </div>

              <h1 data-hero-title className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white mb-5 leading-[1.1] print:text-2xl print:font-bold print:text-black print:mb-3">
                Maxfiylik va Shaxsiy Ma'lumotlar Daxlsizligi
              </h1>

              <p data-hero-lead className="text-base sm:text-lg text-neutral-400 font-light leading-relaxed max-w-2xl print:text-neutral-800 print:text-xs print:mb-2 print:max-w-full">
                Sizning ishonchingiz va shaxsiy ma'lumotlaringiz daxlsizligi — Luxx brendining birlamchi qadriyatidir. Ushbu hujjat platformada ma'lumotlarni to'plash, qayta ishlash va xavfsizligini kafolatlashning rasmiy tartibini belgilaydi.
              </p>
            </div>

            {/* Action Buttons (Web only) */}
            <div data-hero-actions className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] transition-all active:scale-[0.97]"
                title="Hujjat havolasini nusxalash"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Nusxalandi' : 'Havolani nusxalash'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.08] transition-all active:scale-[0.97]"
                title="Hujjatni chop etish yoki PDF sifatida saqlash"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish / PDF</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-mono print:hidden">
            <span>Oxirgi rasmiy yangilanish: 20-yanvar, 2026-yil</span>
            <span className="text-white/20">•</span>
            <span>O'qish vaqti: ~3 daqiqa</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400">Yuridik kuchga ega</span>
          </div>
        </div>
      </header>

      {/* 4 Pillars Section */}
      <section data-pillars-grid className="py-14 border-b border-white/[0.08] bg-white/[0.01] print:py-4 print:border-b print:border-neutral-300 print:bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-full">
          <div className="flex items-center justify-between mb-8 print:mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c9a96e] print:text-black print:font-bold">
              Asosiy Kafolatlar • Key Commitments
            </span>
            <span className="text-xs text-neutral-400 font-light hidden sm:inline print:hidden">
              Foydalanuvchilarimiz uchun 4 ta daxlsiz tamoyil
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 print:grid-cols-2 print:gap-4">
            <div data-pillar-item className="border-t border-[#c9a96e]/40 pt-5 space-y-2 print:border-t-0 print:pt-0 print:space-y-1">
              <span className="font-mono text-xs text-[#c9a96e] block print:text-black print:font-bold">01 / SHIFRLASH</span>
              <h2 className="text-base font-medium text-white tracking-tight print:text-black print:font-bold print:text-xs">100% Shifrlangan Aloqa</h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed print:text-neutral-800 print:text-[10pt]">
                Barcha so'rovlar va tranzaksiyalar 256-bitli SSL/TLS transport protokoli orqali xavfsiz uzatiladi.
              </p>
            </div>

            <div data-pillar-item className="border-t border-[#c9a96e]/40 pt-5 space-y-2 print:border-t-0 print:pt-0 print:space-y-1">
              <span className="font-mono text-xs text-[#c9a96e] block print:text-black print:font-bold">02 / DAXLSIZLIK</span>
              <h2 className="text-base font-medium text-white tracking-tight print:text-black print:font-bold print:text-xs">Hech Qachon Sotilmaydi</h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed print:text-neutral-800 print:text-[10pt]">
                Shaxsiy ma'lumotlaringiz begona marketing agentliklariga yoki uchinchi shaxslarga aslo berilmaydi.
              </p>
            </div>

            <div data-pillar-item className="border-t border-[#c9a96e]/40 pt-5 space-y-2 print:border-t-0 print:pt-0 print:space-y-1">
              <span className="font-mono text-xs text-[#c9a96e] block print:text-black print:font-bold">03 / NAZORAT</span>
              <h2 className="text-base font-medium text-white tracking-tight print:text-black print:font-bold print:text-xs">To'liq Nazorat Sizda</h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed print:text-neutral-800 print:text-[10pt]">
                Istalgan vaqtda profilingizni, buyurtmalar tarixingizni yoki ma'lumotlaringizni o'chirish huquqiga egasiz.
              </p>
            </div>

            <div data-pillar-item className="border-t border-[#c9a96e]/40 pt-5 space-y-2 print:border-t-0 print:pt-0 print:space-y-1">
              <span className="font-mono text-xs text-[#c9a96e] block print:text-black print:font-bold">04 / MOLIYA</span>
              <h2 className="text-base font-medium text-white tracking-tight print:text-black print:font-bold print:text-xs">Karta Ma'lumotlari Saqlanmaydi</h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed print:text-neutral-800 print:text-[10pt]">
                To'lovlar to'g'ridan-to'g'ri Click va Payme litsenziyalangan bank shlyuzlarida bajariladi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 print:py-4 print:px-0 print:max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 print:block print:w-full">
          {/* Left Column: TOC (Hidden in Print) */}
          <aside className="lg:col-span-4 print:hidden">
            <div className="sticky top-28 space-y-6">
              {/* Document Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hujjatdan qidirish (karta, manzil, o'chirish)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.03] border border-white/[0.08] focus:border-[#c9a96e]/50 focus:bg-white/[0.06] rounded-xl text-white placeholder-neutral-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Minimalist Editorial TOC */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#c9a96e] mb-4">
                  Mundarija
                </div>

                <nav className="space-y-1">
                  {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={(e) => {
                          e.currentTarget.blur();
                          scrollToSection(section.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg transition-all duration-150 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:scale-[0.98] ${
                          isActive
                            ? 'bg-[#c9a96e]/10 text-[#c9a96e] font-medium border-l-2 border-[#c9a96e]'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-[#c9a96e]">{section.number}</span>
                          <span className="truncate">{section.title}</span>
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full transition-opacity ${isActive ? 'bg-[#c9a96e] opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      scrollToSection('sec-cookies');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-neutral-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-all outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-l-2 border-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#c9a96e]">06</span>
                      <span>Cookie sozlamalari</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      scrollToSection('sec-contact');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-neutral-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-all outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-l-2 border-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#c9a96e]">07</span>
                      <span>DPO Aloqa markazi</span>
                    </span>
                  </button>
                </nav>
              </div>

              {/* Concierge DPO Card */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c9a96e] block">
                  Ma'lumotlar Himoyasi Xizmati
                </span>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Profilingizni o'chirish yoki ma'lumotlar nusxasini olish bo'yicha maslahat:
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href="mailto:support@luxx.uz"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-neutral-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#c9a96e]" />
                      <span>support@luxx.uz</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
                  </a>
                  <a
                    href="tel:+998884299969"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-neutral-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#c9a96e]" />
                      <span>+998 88 429 99 69</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Detailed Articles */}
          <div className="lg:col-span-8 space-y-12 print:w-full print:space-y-6">
            {filteredSections.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] text-center print:hidden">
                <p className="text-sm text-neutral-300 font-medium mb-1">Mos keluvchi modda topilmadi</p>
                <p className="text-xs text-neutral-500">"{searchQuery}" so'zi bo'yicha ma'lumot yo'q. Boshqa kalit so'z bilan izlang.</p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  data-legal-article
                  className="scroll-mt-32 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-6 print:p-0 print:border-b print:border-neutral-300 print:bg-transparent print:rounded-none print:space-y-3 print:pb-4 print:mb-4"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5 print:border-b-0 print:pb-1">
                    <div>
                      <span className="font-mono text-xs text-[#c9a96e] tracking-widest uppercase block mb-1 print:text-black print:font-bold">
                        BO'LIM {section.number}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight print:text-black print:font-bold print:text-base">
                        {section.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="text-neutral-500 hover:text-[#c9a96e] p-2 rounded-lg transition-colors text-xs flex items-center gap-1 shrink-0 print:hidden"
                      title="Havola"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm text-neutral-300 font-light leading-relaxed print:text-neutral-900 print:text-xs">
                    {section.intro}
                  </p>

                  <div className="space-y-4 pt-2 print:space-y-2">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 print:gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 shrink-0 print:bg-black" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-white print:text-black print:font-semibold print:text-xs">{item.label}</p>
                          <p className="text-xs text-neutral-400 font-light leading-relaxed print:text-neutral-800 print:text-[10pt]">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {section.legalNote && (
                    <div className="pt-4 border-t border-white/[0.04] print:border-t-0 print:pt-2">
                      <div className="border-l-2 border-[#c9a96e] pl-4 py-1 print:border-black">
                        <p className="text-xs text-neutral-400 font-light italic leading-relaxed print:text-neutral-700">
                          {section.legalNote}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}

            {/* Cookie Policy Section */}
            <section
              id="sec-cookies"
              data-legal-article
              className="scroll-mt-32 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-6 print:p-0 print:border-b print:border-neutral-300 print:bg-transparent print:rounded-none print:space-y-3 print:pb-4 print:mb-4"
            >
              <div className="border-b border-white/[0.06] pb-5 print:border-b-0 print:pb-1">
                <span className="font-mono text-xs text-[#c9a96e] tracking-widest uppercase block mb-1 print:text-black print:font-bold">
                  BO'LIM 06
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight print:text-black print:font-bold print:text-base">
                  Cookie Fayllar va Maxfiylik Sozlamalari
                </h2>
              </div>

              <p className="text-sm text-neutral-300 font-light leading-relaxed print:text-neutral-900 print:text-xs">
                Sayt qulay ishlashi, savat ma'lumotlarini saqlab qolish va anonim analitika uchun cookie-fayllardan foydalanamiz:
              </p>

              <div className="space-y-3 pt-2 print:space-y-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 print:p-0 print:border-0">
                  <div>
                    <p className="text-sm font-medium text-white print:text-black print:font-semibold print:text-xs">1. Zaruriy tizim cookie fayllari</p>
                    <p className="text-xs text-neutral-400 font-light print:text-neutral-800 print:text-[10pt]">Savat holati, xavfsiz ulanish va avtorizatsiya sessiyasi.</p>
                  </div>
                  <span className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 print:hidden">
                    Doim Faol
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 print:p-0 print:border-0">
                  <div>
                    <p className="text-sm font-medium text-white print:text-black print:font-semibold print:text-xs">2. Analitika va sifat nazorati</p>
                    <p className="text-xs text-neutral-400 font-light print:text-neutral-800 print:text-[10pt]">Sayt tezligi va sahifa xatoliklarini aniqlovchi anonim statistika.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCookiePreferences((p) => ({ ...p, analytics: !p.analytics }))}
                    className={`px-3 py-1 text-xs rounded-full border transition-all active:scale-[0.97] shrink-0 print:hidden ${
                      cookiePreferences.analytics
                        ? 'bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/40'
                        : 'bg-white/[0.04] text-neutral-400 border-white/[0.08]'
                    }`}
                  >
                    {cookiePreferences.analytics ? 'Yoqilgan' : "O'chirilgan"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 print:p-0 print:border-0">
                  <div>
                    <p className="text-sm font-medium text-white print:text-black print:font-semibold print:text-xs">3. Shaxsiylashtirilgan tavsiyalar</p>
                    <p className="text-xs text-neutral-400 font-light print:text-neutral-800 print:text-[10pt]">Mijoz qiziqqan kolleksiyalar va brendlar bo'yicha mos tavsiyalar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCookiePreferences((p) => ({ ...p, marketing: !p.marketing }))}
                    className={`px-3 py-1 text-xs rounded-full border transition-all active:scale-[0.97] shrink-0 print:hidden ${
                      cookiePreferences.marketing
                        ? 'bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/40'
                        : 'bg-white/[0.04] text-neutral-400 border-white/[0.08]'
                    }`}
                  >
                    {cookiePreferences.marketing ? 'Yoqilgan' : "O'chirilgan"}
                  </button>
                </div>
              </div>
            </section>

            {/* Support Concierge Section */}
            <section
              id="sec-contact"
              data-legal-article
              className="scroll-mt-32 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#c9a96e]/[0.08] via-white/[0.02] to-transparent border border-[#c9a96e]/25 space-y-6 print:p-0 print:bg-transparent print:border-0 print:space-y-2"
            >
              <div>
                <span className="font-mono text-xs text-[#c9a96e] tracking-widest uppercase block mb-1 print:text-black print:font-bold">
                  BO'LIM 07 • BOG'LANISH
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-2 print:text-black print:font-bold print:text-base">
                  DPO (Ma'lumotlar Himoyachisi) Xizmati
                </h2>
                <p className="text-sm text-neutral-300 font-light leading-relaxed max-w-xl print:text-neutral-800 print:text-xs">
                  Shaxsiy ma'lumotlaringizni tahrirlash, o'chirish yoki e'tiroz bildirish bo'yicha mas'ul huquqiy mutaxassislarimiz bilan bog'laning:
                </p>
              </div>

              {/* Web Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
                <a
                  href="tel:+998884299969"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/[0.08] transition-all active:scale-[0.97]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#c9a96e]" />
                  <span>+998 88 429 99 69</span>
                </a>

                <a
                  href="mailto:support@luxx.uz"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#c9a96e] hover:bg-[#d4b87a] text-black text-xs font-medium transition-all active:scale-[0.97]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@luxx.uz</span>
                </a>
              </div>

              {/* Print-only Contact Info */}
              <div className="hidden print:block text-xs text-neutral-800 pt-1">
                <p><strong>Telefon:</strong> +998 88 429 99 69 &nbsp;|&nbsp; <strong>Elektron pochta:</strong> support@luxx.uz &nbsp;|&nbsp; <strong>Veb-sayt:</strong> https://luxx.uz</p>
              </div>
            </section>

            {/* Legal Disclaimer Footer (Web only) */}
            <div className="text-center py-6 print:hidden">
              <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto">
                Ushbu maxfiylik siyosati O'zbekiston Respublikasining «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuniga muvofiq ishlab chiqilgan. Luxx.uz ma'muriyati zarurat tug'ilganda hujjatga o'zgartirish kiritish huquqini o'zida saqlab qoladi.
              </p>
            </div>

            {/* Print-only Official Closing */}
            <div className="hidden print:block pt-6 mt-6 border-t-2 border-black text-xs text-neutral-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-black uppercase">Yuridik Kuch va Tasdiq:</p>
                  <p className="mt-1 max-w-lg">Ushbu hujjat elektron shaklda Luxx.uz platformasida tasdiqlangan bo'lib, O'zbekiston Respublikasining «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuniga muvofiq rasmiy yuridik kuchga ega.</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">«LUXX ONLINE STORE» MCHJ</p>
                  <p className="mt-1">https://luxx.uz | support@luxx.uz</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Website Footer (Hidden in Print) */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default LegalPrivacy;
