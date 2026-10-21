import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LegalPage from './Legal';

// The legal wording below is kept exactly as published; only the layout changed.
const HIGHLIGHTS = [
  { num: '01', title: "100% Shifrlash", desc: "256-bit SSL va xavfsiz ulanish" },
  { num: '02', title: "Sotilmaydi", desc: "Begona shaxslarga berilmaydi" },
  { num: '03', title: "To'liq Nazorat", desc: "Istalgan vaqtda o'chirish huquqi" },
  { num: '04', title: "Karta Saqlanmaydi", desc: "To'lov yetkazilganda, naqd" },
];

export default function Privacy() {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'sec-01',
      number: '01',
      title: t('privacy.section1Title') || "Qanday ma'lumotlar yig'iladi",
      items: [
        "Ism, familiya va telefon raqami",
        "Yetkazib berish manzili va mo'ljal",
        "Buyurtma tarixi va xaridlar ro'yxati",
        "Elektron pochta (ixtiyoriy ravishda)",
      ],
    },
    {
      id: 'sec-02',
      number: '02',
      title: t('privacy.section2Title') || "Foydalanish maqsadi",
      items: [
        "Buyurtmalarni tezkor qayta ishlash va ombordan yig'ish",
        "Kuryer yetib borishi haqida mijozga aloqa",
        "Xizmat sifatini muntazam yaxshilash",
        "Faqat sizga tegishli chegirma va tavsiyalar",
      ],
    },
    {
      id: 'sec-03',
      number: '03',
      title: t('privacy.section3Title') || "Ma'lumotlar xavfsizligi",
      items: [
        "Shifrlangan ma'lumotlar bazasi",
        "256-bitli SSL xavfsiz transport qatlami",
        "Plastik karta raqamlari serverda saqlanmaydi",
        "Faqat vakolatli xodimlar kirish huquqiga ega",
      ],
    },
    {
      id: 'sec-04',
      number: '04',
      title: t('privacy.section4Title') || "Xabarlar va bildirishnomalar",
      items: [
        "Buyurtma holati bo'yicha SMS xabarnomalar",
        "Yetkazib berish vaqti haqida kuryer qo'ng'irog'i",
        "Istalgan paytda xabarlardan voz kechish imkoniyati",
      ],
    },
    {
      id: 'sec-05',
      number: '05',
      title: t('privacy.section5Title') || "Sizning huquqlaringiz",
      items: [
        "Ma'lumotlaringiz nusxasini talab qilish",
        "Ma'lumotlarni o'zgartirish yoki to'g'rilash",
        "Shaxsiy profilingizni to'liq o'chirish",
      ],
    },
    {
      id: 'sec-cookie',
      number: '06',
      title: 'Cookie sozlamalari',
      body: (
        <>
          <p>Sayt qulay ishlashi, savatdagi tovarlarni saqlab qolish va anonim analitika uchun cookie-fayllardan foydalaniladi.</p>
          <div className="mlg-note"><span>Zaruriy tizim cookie-fayllari</span><b>FAOL</b></div>
        </>
      ),
    },
  ];

  return (
    <LegalPage
      seo={{
        title: `${t('privacy.title') || 'Maxfiylik Siyosati'} — Luxx.uz`,
        description: t('privacy.seoDesc') || "Luxx.uz mobil maxfiylik siyosati.",
      }}
      shareTitle="Luxx.uz Maxfiylik Siyosati"
      label="Luxx Legal"
      kicker="Rasmiy Huquqiy Hujjat • V2.4"
      title="Maxfiylik Siyosati"
      lead="Sizning shaxsiy ma'lumotlaringiz xavfsizligi va daxlsizligi — biz uchun birlamchi qadriyat."
      updated="Yangilangan: 20-yanvar, 2026"
      highlights={HIGHLIGHTS}
      sections={sections}
      help={{
        title: 'Savol yoki arizangiz bormi?',
        text: "Shaxsiy ma'lumotlaringiz bo'yicha DPO mutaxassislarimiz yordamga tayyor.",
      }}
      footnote="O'zbekiston Respublikasi «Shaxsga doir ma'lumotlar to'g'risida»gi Qonuni asosida tuzilgan."
    />
  );
}
