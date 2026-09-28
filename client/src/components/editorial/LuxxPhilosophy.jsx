import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LuxxPhilosophy() {
  const { language } = useLanguage();

  const content = {
    uz: {
      kicker: '05 / LUXX FALSAFASI',
      line1: 'LUXX SIZNI BOSHQACHA KO‘RSATISH UCHUN EMAS.',
      line2: 'SIZNI O‘ZINGIZDEK KUCHLI KO‘RSATISH UCHUN.',
      body: 'Biz kiyimlarni qoidalar uchun emas, erkinlik uchun tikamiz. Sokin hashamat — o‘z tanangiz, o‘z qadringiz va o‘z qadamlaringizga bo‘lgan to‘liq ishonchdir.',
      stamp: 'ATELIER FALSAFASI · 2026',
      link: 'BIZ HAQIMIZDA BATAFSIL',
    },
    ru: {
      kicker: '05 / ФИЛОСОФИЯ LUXX',
      line1: 'LUXX НЕ ДЛЯ ТОГО, ЧТОБЫ КАЗАТЬСЯ ДРУГОЙ.',
      line2: 'А ЧТОБЫ БЫТЬ ТАКОЙ ЖЕ СИЛЬНОЙ, КАК ВЫ ЕСТЬ.',
      body: 'Мы создаем одежду не ради мимолетных трендов, а ради свободы. Тихая роскошь — это спокойная уверенность в каждом вашем шаге.',
      stamp: 'ФИЛОСОФИЯ АТЕЛЬЕ · 2026',
      link: 'ПОДРОБНЕЕ О НАС',
    },
    en: {
      kicker: '05 / LUXX PHILOSOPHY',
      line1: 'LUXX IS NOT TO MAKE YOU APPEAR DIFFERENT.',
      line2: 'IT IS TO REVEAL YOU JUST AS STRONG AS YOU ARE.',
      body: 'We shape garments not to impose constraints, but to grant presence and autonomy. Quiet luxury is complete confidence in your own skin.',
      stamp: 'ATELIER ETHOS · 2026',
      link: 'DISCOVER OUR STORY',
    },
  }[language] || {
    kicker: '05 / LUXX FALSAFASI',
    line1: 'LUXX SIZNI BOSHQACHA KO‘RSATISH UCHUN EMAS.',
    line2: 'SIZNI O‘ZINGIZDEK KUCHLI KO‘RSATISH UCHUN.',
    body: 'Biz kiyimlarni qoidalar uchun emas, erkinlik uchun tikamiz. Sokin hashamat — o‘z tanangiz, o‘z qadringiz va o‘z qadamlaringizga bo‘lgan to‘liq ishonchdir.',
    stamp: 'ATELIER FALSAFASI · 2026',
    link: 'BIZ HAQIMIZDA BATAFSIL',
  };

  return (
    <section className="e-philosophy-section" aria-label="Brand Philosophy">
      <div className="luxx-editorial-shell">
        <div className="e-philosophy-grid">
          {/* Dominant Emotional Statement */}
          <div className="e-philosophy-content">
            <span className="e-label">{content.kicker}</span>

            <h2 className="e-philosophy-statement">
              {content.line1}
              <span className="highlight">{content.line2}</span>
            </h2>

            <p className="e-philosophy-body">{content.body}</p>

            <div>
              <Link to="/about" className="e-action-link">
                <span>{content.link}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Unexpected Atmospheric Visual */}
          <div className="e-philosophy-visual-shell">
            <img
              src="/about_photo.jpg"
              alt="LUXX Philosophy"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
            />
            <div className="e-philosophy-stamp">{content.stamp}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
