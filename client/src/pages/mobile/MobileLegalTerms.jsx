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

const MobileLegalTerms = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [openAccordion, setOpenAccordion] = useState({
    'terms-01': true,
    'terms-02': false,
    'terms-03': false,
    'terms-04': false,
    'terms-05': false
  });

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Luxx.uz Foydalanish Shartlari",
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

  const highlights = useMemo(() => [
    { num: '01', title: "50,000 so'm", desc: "Minimal xarid miqdori" },
    { num: '02', title: "Naqd & Karta", desc: "Qulay to'lov shakllari" },
    { num: '03', title: "24 Soatda", desc: "Toshkent bo'ylab yetkazish" },
    { num: '04', title: "14 Kun", desc: "Qaytarish va almashtirish" }
  ], []);

  const sections = useMemo(() => [
    {
      id: 'terms-01',
      category: 'order',
      number: '01',
      title: t('terms.section1Title') || "Buyurtma berish tartibi",
      items: [
        "Mahsulotni tanlang va savatga qo'shing",
        "Telefon raqami va aniq manzilni ko'rsating",
        "Kuryerlik xizmati jo'natishdan oldin bog'lanadi",
        "Minimal xarid summasi: 50,000 so'm"
      ]
    },
    {
      id: 'terms-02',
      category: 'payment',
      number: '02',
      title: t('terms.section2Title') || "To'lov shartlari",
      items: [
        "Qabul qilganda naqd pul bilan to'lash",
        "Kuryer terminali orqali (Uzcard / Humo / Visa)",
        "Saytda yoki ilovada Click va Payme orqali",
        "Yashirin to'lov va foizlarsiz sof narx"
      ]
    },
    {
      id: 'terms-03',
      category: 'delivery',
      number: '03',
      title: t('terms.section3Title') || "Yetkazib berish",
      items: [
        "Toshkent bo'ylab 24 soat ichida yetkazish",
        "O'zbekiston viloyatlariga tezkor pochta (2-3 kun)",
        "Kuryer oldida mahsulotni ko'rib olish imkoni"
      ]
    },
    {
      id: 'terms-04',
      category: 'returns',
      number: '04',
      title: t('terms.section4Title') || "Qaytarish va almashtirish",
      items: [
        "Xarid kunidan boshlab 14 kun ichida",
        "Mahsulot kiyilmagan va yuvilmagan bo'lishi shart",
        "Asl zavod birkalari va qadog'i saqlangan bo'lishi zarur",
        "Pul 3 bank ish kuni ichida to'liq qaytariladi"
      ]
    },
    {
      id: 'terms-05',
      category: 'warranty',
      number: '05',
      title: t('terms.section5Title') || "Sifat kafolati",
      items: [
        "100% asl va sertifikatlangan mahsulotlar",
        "Nuqson aniqlanganda bepul almashtirib berish",
        "Iste'molchilar huquqlari to'liq kafolatlanadi"
      ]
    }
  ], [t]);

  const filterTabs = [
    { id: 'all', label: 'Barchasi' },
    { id: 'order', label: 'Buyurtma' },
    { id: 'payment', label: "To'lov" },
    { id: 'delivery', label: 'Yetkazish' },
    { id: 'returns', label: 'Qaytarish' }
  ];

  const visibleSections = useMemo(() => {
    if (selectedFilter === 'all') return sections;
    return sections.filter((s) => s.category === selectedFilter || selectedFilter === 'all');
  }, [sections, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f5f5f3] pb-28">
      <SEO
        title={`${t('terms.title') || 'Foydalanish Shartlari'} — Luxx.uz`}
        description={t('terms.subtitle') || "Luxx.uz rasmiy foydalanish shartlari."}
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
          Luxx Oferta
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
          Ommaviy Oferta Shartnomasi • V2.2
        </span>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Foydalanish Shartlari
        </h1>

        <p className="text-xs text-neutral-400 font-light leading-relaxed mb-3">
          Luxx.uz onlayn do'konidan xarid qilish, to'lov va kuryerlik yetkazib berish qoidalari.
        </p>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
          <Calendar className="w-3 h-3 text-[#c9a96e]" />
          <span>Yangilangan: 20-yanvar, 2026</span>
        </div>
      </div>

      {/* 4 Highlights Grid (Clean Typographic, NO icon boxes) */}
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

        {/* 14-Day Return Checklist Mobile Card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="border-b border-white/[0.06] pb-2">
            <span className="font-mono text-[10px] text-[#c9a96e] uppercase block">
              Nazorat Ro'yxati
            </span>
            <h4 className="text-sm font-medium text-white">Qaytarish Talablari</h4>
          </div>
          <div className="space-y-2 text-xs text-neutral-400 font-light">
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-1.5 shrink-0" />
              <span>14 kun ichida almashtirish kafolati</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-1.5 shrink-0" />
              <span>Kiyilmagan, asl birka va qadoq saqlangan holda</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-1.5 shrink-0" />
              <span>Elektron chek yoki buyurtma raqami mavjudligi</span>
            </p>
          </div>
        </div>
      </div>

      {/* Support Concierge Section */}
      <div className="px-4 mt-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#c9a96e]/10 to-white/[0.02] border border-[#c9a96e]/20">
          <h3 className="text-sm font-medium text-white mb-1">
            Xarid bo'yicha savollaringiz bormi?
          </h3>
          <p className="text-xs text-neutral-400 font-light mb-4">
            Mijozlar xizmati xaridingizni qulay amalga oshirishda yordam beradi.
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
          O'zbekiston Respublikasi Fuqarolik Kodeksiga muvofiq ommaviy oferta hisoblanadi.
        </p>
      </div>
    </div>
  );
};

export default MobileLegalTerms;
