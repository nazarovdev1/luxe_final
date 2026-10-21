import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LegalPage from './Legal';

// The legal wording below is kept exactly as published; only the layout changed.
const HIGHLIGHTS = [
  { num: '01', title: "50,000 so'm", desc: "Minimal xarid miqdori" },
  { num: '02', title: "Naqd & Karta", desc: "Qulay to'lov shakllari" },
  { num: '03', title: "24 Soatda", desc: "Toshkent bo'ylab yetkazish" },
  { num: '04', title: "14 Kun", desc: "Qaytarish va almashtirish" },
];

export default function Terms() {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'terms-01',
      number: '01',
      title: t('terms.section1Title') || "Buyurtma berish tartibi",
      items: [
        "Mahsulotni tanlang va savatga qo'shing",
        "Telefon raqami va aniq manzilni ko'rsating",
        "Kuryerlik xizmati jo'natishdan oldin bog'lanadi",
        "Minimal xarid summasi: 50,000 so'm",
      ],
    },
    {
      id: 'terms-02',
      number: '02',
      title: t('terms.section2Title') || "To'lov shartlari",
      items: [
        "Qabul qilganda naqd pul bilan to'lash",
        "Avval uyda kiyib ko'rasiz, keyin to'laysiz",
        "Yashirin to'lov va foizlarsiz sof narx",
      ],
    },
    {
      id: 'terms-03',
      number: '03',
      title: t('terms.section3Title') || "Yetkazib berish",
      items: [
        "Toshkent bo'ylab 24 soat ichida yetkazish",
        "O'zbekiston viloyatlariga tezkor pochta (2-3 kun)",
        "Kuryer oldida mahsulotni ko'rib olish imkoni",
      ],
    },
    {
      id: 'terms-04',
      number: '04',
      title: t('terms.section4Title') || "Qaytarish va almashtirish",
      items: [
        "Xarid kunidan boshlab 14 kun ichida",
        "Mahsulot kiyilmagan va yuvilmagan bo'lishi shart",
        "Asl zavod birkalari va qadog'i saqlangan bo'lishi zarur",
        "Pul 3 bank ish kuni ichida to'liq qaytariladi",
      ],
    },
    {
      id: 'terms-05',
      number: '05',
      title: t('terms.section5Title') || "Sifat kafolati",
      items: [
        "100% asl va sertifikatlangan mahsulotlar",
        "Nuqson aniqlanganda bepul almashtirib berish",
        "Iste'molchilar huquqlari to'liq kafolatlanadi",
      ],
    },
    {
      id: 'terms-returns',
      kicker: "Nazorat Ro'yxati",
      title: 'Qaytarish Talablari',
      items: [
        "14 kun ichida almashtirish kafolati",
        "Kiyilmagan, asl birka va qadoq saqlangan holda",
        "Elektron chek yoki buyurtma raqami mavjudligi",
      ],
    },
  ];

  return (
    <LegalPage
      seo={{
        title: `${t('terms.title') || 'Foydalanish Shartlari'} — Luxx.uz`,
        description: t('terms.subtitle') || "Luxx.uz rasmiy foydalanish shartlari.",
      }}
      shareTitle="Luxx.uz Foydalanish Shartlari"
      label="Luxx Oferta"
      kicker="Ommaviy Oferta Shartnomasi • V2.2"
      title="Foydalanish Shartlari"
      lead="Luxx.uz onlayn do'konidan xarid qilish, to'lov va kuryerlik yetkazib berish qoidalari."
      updated="Yangilangan: 20-yanvar, 2026"
      highlights={HIGHLIGHTS}
      sections={sections}
      help={{
        title: "Xarid bo'yicha savollaringiz bormi?",
        text: 'Mijozlar xizmati xaridingizni qulay amalga oshirishda yordam beradi.',
      }}
      footnote="O'zbekiston Respublikasi Fuqarolik Kodeksiga muvofiq ommaviy oferta hisoblanadi."
    />
  );
}
