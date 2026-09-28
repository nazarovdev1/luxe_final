import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Share2,
  Check,
  ChevronDown
} from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileLegalPrivacy = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [openAccordion, setOpenAccordion] = useState({
    'sec-01': true,
    'sec-02': false,
    'sec-03': false,
    'sec-04': false,
    'sec-05': false,
    'sec-cookie': false
  });

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Luxx.uz Maxfiylik Siyosati",
          url: window.location.href
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 4 Commitments (Editorial, NO icon boxes)
  const highlights = useMemo(() => [
    { num: '01', title: "100% Shifrlash", desc: "256-bit SSL va xavfsiz ulanish" },
    { num: '02', title: "Sotilmaydi", desc: "Begona shaxslarga berilmaydi" },
    { num: '03', title: "To'liq Nazorat", desc: "Istalgan vaqtda o'chirish huquqi" },
    { num: '04', title: "Karta Saqlanmaydi", desc: "Click va Payme orqali to'g'ridan-to'g'ri" }
  ], []);

  const sections = useMemo(() => [
    {
      id: 'sec-01',
      category: 'data',
      number: '01',
      title: t('privacy.section1Title') || "Qanday ma'lumotlar yig'iladi",
      items: [
        "Ism, familiya va telefon raqami",
        "Yetkazib berish manzili va mo'ljal",
        "Buyurtma tarixi va xaridlar ro'yxati",
        "Elektron pochta (ixtiyoriy ravishda)"
      ]
    },
    {
      id: 'sec-02',
      category: 'usage',
      number: '02',
      title: t('privacy.section2Title') || "Foydalanish maqsadi",
      items: [
        "Buyurtmalarni tezkor qayta ishlash va ombordan yig'ish",
        "Kuryer yetib borishi haqida mijozga aloqa",
        "Xizmat sifatini muntazam yaxshilash",
        "Faqat sizga tegishli chegirma va tavsiyalar"
      ]
    },
    {
      id: 'sec-03',
      category: 'security',
      number: '03',
      title: t('privacy.section3Title') || "Ma'lumotlar xavfsizligi",
      items: [
        "Shifrlangan ma'lumotlar bazasi",
        "256-bitli SSL xavfsiz transport qatlami",
        "Plastik karta raqamlari serverda saqlanmaydi",
        "Faqat vakolatli xodimlar kirish huquqiga ega"
      ]
    },
    {
      id: 'sec-04',
      category: 'notifications',
      number: '04',
      title: t('privacy.section4Title') || "Xabarlar va bildirishnomalar",
      items: [
        "Buyurtma holati bo'yicha SMS xabarnomalar",
        "Yetkazib berish vaqti haqida kuryer qo'ng'irog'i",
        "Istalgan paytda xabarlardan voz kechish imkoniyati"
      ]
    },
    {
      id: 'sec-05',
      category: 'rights',
      number: '05',
      title: t('privacy.section5Title') || "Sizning huquqlaringiz",
      items: [
        "Ma'lumotlaringiz nusxasini talab qilish",
        "Ma'lumotlarni o'zgartirish yoki to'g'rilash",
        "Shaxsiy profilingizni to'liq o'chirish"
      ]
    }
  ], [t]);

  const filterTabs = [
    { id: 'all', label: 'Barchasi' },
    { id: 'data', label: "Ma'lumotlar" },
    { id: 'security', label: 'Xavfsizlik' },
    { id: 'rights', label: 'Huquqlar' }
  ];

  const visibleSections = useMemo(() => {
    if (selectedFilter === 'all') return sections;
    return sections.filter((s) => s.category === selectedFilter || selectedFilter === 'all');
  }, [sections, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f3] pb-28">
      <SEO
        title={`${t('privacy.title') || 'Maxfiylik Siyosati'} — Luxx.uz`}
        description={t('privacy.seoDesc') || "Luxx.uz mobil maxfiylik siyosati."}
      />

      {/* iOS Style Frosted Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-300 active:scale-95 transition-all p-1"
          aria-label="Orqaga"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>

        <span className="text-xs font-mono tracking-widest text-[#c9a96e] uppercase">
          Luxx Legal
        </span>

        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-full bg-white/[0.04] text-neutral-300 active:scale-95 transition-all"
          aria-label="Ulashish"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </header>

      {/* Hero Header */}
      <div className="px-4 pt-6 pb-4">
        <span className="text-[10px] font-mono tracking-wider uppercase text-[#c9a96e] block mb-2">
          Rasmiy Huquqiy Hujjat • V2.4
        </span>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Maxfiylik Siyosati
        </h1>

        <p className="text-xs text-neutral-400 font-light leading-relaxed mb-3">
          Sizning shaxsiy ma'lumotlaringiz xavfsizligi va daxlsizligi — biz uchun birlamchi qadriyat.
        </p>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
          <Calendar className="w-3 h-3 text-[#c9a96e]" />
          <span>Yangilangan: 20-yanvar, 2026</span>
        </div>
      </div>

      {/* 4 Pillars Grid (Clean Typographic, NO icon boxes) */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-2.5">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1"
            >
              <span className="font-mono text-[10px] text-[#c9a96e] block">{h.num}</span>
              <h4 className="text-xs font-medium text-white">{h.title}</h4>
              <p className="text-[11px] text-neutral-400 font-light leading-tight">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="sticky top-14 z-40 bg-[#0a0a0b]/90 backdrop-blur-xl py-2.5 px-4 border-b border-white/[0.06] overflow-x-auto no-scrollbar flex items-center gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-150 active:scale-95 ${
              selectedFilter === tab.id
                ? 'bg-[#c9a96e] text-black font-medium'
                : 'bg-white/[0.04] text-neutral-400 border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion Clauses */}
      <div className="px-4 py-4 space-y-3">
        {visibleSections.map((section) => {
          const isOpen = openAccordion[section.id];
          return (
            <div
              key={section.id}
              className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(section.id)}
                className="w-full p-4 flex items-center justify-between text-left active:bg-white/[0.04] transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#c9a96e] block uppercase">
                    Bo'lim {section.number}
                  </span>
                  <h3 className="text-sm font-medium text-white">
                    {section.title}
                  </h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#c9a96e]' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
                  <ul className="space-y-2.5">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-light leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {/* Cookie Policy Card */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleAccordion('sec-cookie')}
            className="w-full p-4 flex items-center justify-between text-left active:bg-white/[0.04] transition-colors"
          >
            <div>
              <span className="text-[10px] font-mono text-[#c9a96e] block uppercase">
                Bo'lim 06
              </span>
              <h3 className="text-sm font-medium text-white">
                Cookie sozlamalari
              </h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${openAccordion['sec-cookie'] ? 'rotate-180 text-[#c9a96e]' : ''}`} />
          </button>

          {openAccordion['sec-cookie'] && (
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] text-xs text-neutral-300 font-light leading-relaxed space-y-3">
              <p>
                Sayt qulay ishlashi, savatdagi tovarlarni saqlab qolish va anonim analitika uchun cookie-fayllardan foydalaniladi.
              </p>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                <span>Zaruriy tizim cookie-fayllari</span>
                <span className="text-[10px] font-mono text-emerald-400">FAOL</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Concierge Section */}
      <div className="px-4 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#c9a96e]/10 to-white/[0.02] border border-[#c9a96e]/20">
          <h3 className="text-sm font-medium text-white mb-1">
            Savol yoki arizangiz bormi?
          </h3>
          <p className="text-xs text-neutral-400 font-light mb-4">
            Shaxsiy ma'lumotlaringiz bo'yicha DPO mutaxassislarimiz yordamga tayyor.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:+998884299969"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.06] active:bg-white/[0.12] text-white text-xs font-medium border border-white/[0.08] active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#c9a96e]" />
              <span>Qo'ng'iroq</span>
            </a>
            <a
              href="mailto:support@luxx.uz"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#c9a96e] text-black text-xs font-medium active:scale-95 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>
        </div>

        <p className="text-[11px] text-neutral-600 text-center font-light mt-4 leading-relaxed">
          O'zbekiston Respublikasi «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuni asosida tuzilgan.
        </p>
      </div>
    </div>
  );
};

export default MobileLegalPrivacy;
