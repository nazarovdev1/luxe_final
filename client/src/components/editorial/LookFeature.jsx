import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LookFeature({ onOpenLook }) {
  const { language } = useLanguage();

  const content = {
    uz: {
      lookNum: 'LOOK 04 · THE AFTERNOON EDIT',
      title: 'TAYYOR OBRAZ, BIRGINA MAHSULOT EMAS',
      quote: 'Kun davomida o‘zini ko‘rsatishga urinmaydigan, baribir ko‘zga tashlanadigan mukammal uyg‘unlik.',
      desc: 'Har bir kiyim alohida go‘zal, ammo ular bir-birini to‘ldirganda haqiqiy shaxsiyat namoyon bo‘ladi.',
      cta: 'OBRAZNI KO‘RISH',
    },
    ru: {
      lookNum: 'LOOK 04 · THE AFTERNOON EDIT',
      title: 'ЦЕЛОСТНЫЙ ОБРАЗ, А НЕ ПРОСТО ВЕЩЬ',
      quote: 'Гармония, которая не пытается привлечь внимание криком, но неизбежно притягивает взгляды.',
      desc: 'Каждая вещь прекрасна сама по себе, но в ансамбле они рождают неповторимое ощущение стиля.',
      cta: 'СМОТРЕТЬ ОБРАЗ',
    },
    en: {
      lookNum: 'LOOK 04 · THE AFTERNOON EDIT',
      title: 'A COMPLETE MOOD, NOT JUST AN ITEM',
      quote: 'Effortless composure that never strives for attention, yet inevitably commands it all day.',
      desc: 'Individual pieces hold elegance, but their dialogue together defines unmistakable presence.',
      cta: 'EXPLORE THE LOOK',
    },
  }[language] || {
    lookNum: 'LOOK 04 · THE AFTERNOON EDIT',
    title: 'TAYYOR OBRAZ, BIRGINA MAHSULOT EMAS',
    quote: 'Kun davomida o‘zini ko‘rsatishga urinmaydigan, baribir ko‘zga tashlanadigan mukammal uyg‘unlik.',
    desc: 'Har bir kiyim alohida go‘zal, ammo ular bir-birini to‘ldirganda haqiqiy shaxsiyat namoyon bo‘ladi.',
    cta: 'OBRAZNI KO‘RISH',
  };

  return (
    <section className="e-look-feature-section" aria-label="Featured Look">
      <div className="e-look-bg-wrap">
        <img
          className="e-look-bg-img"
          src="/images/home/art-of-style-bg.png"
          alt="LUXX Look 04"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/look.jpg'; }}
        />
        <div className="e-look-shade-left" />
      </div>

      <div className="luxx-editorial-shell">
        <div className="e-look-content">
          <span className="e-look-kicker">
            <Sparkles size={12} />
            <span>{content.lookNum}</span>
          </span>

          <h2 className="e-look-title">{content.title}</h2>

          <p className="e-look-quote">{content.quote}</p>

          <div>
            <Link
              to="/lookbooks"
              className="e-look-btn"
              onClick={(e) => {
                if (onOpenLook) {
                  e.preventDefault();
                  onOpenLook();
                }
              }}
            >
              <span>{content.cta}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
