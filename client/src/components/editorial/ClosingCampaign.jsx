import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ClosingCampaign() {
  const { language } = useLanguage();

  const content = {
    uz: {
      city: 'LUXX / TASHKENT · EST. 2026',
      title: 'KEYINGI OBRAZINGIZ SHU YERDAN BOSHLANADI.',
      cta: 'KOLLEKSIYANI KO‘RISH',
    },
    ru: {
      city: 'LUXX / ТАШКЕНТ · EST. 2026',
      title: 'ВАШ СЛЕДУЮЩИЙ ОБРАЗ НАЧИНАЕТСЯ ЗДЕСЬ.',
      cta: 'СМОТРЕТЬ КОЛЛЕКЦИЮ',
    },
    en: {
      city: 'LUXX / TASHKENT · EST. 2026',
      title: 'YOUR NEXT SILHOUETTE COMMENCES HERE.',
      cta: 'EXPLORE COLLECTION',
    },
  }[language] || {
    city: 'LUXX / TASHKENT · EST. 2026',
    title: 'KEYINGI OBRAZINGIZ SHU YERDAN BOSHLANADI.',
    cta: 'KOLLEKSIYANI KO‘RISH',
  };

  return (
    <section className="e-closing-section" aria-label="Closing Campaign">
      <div className="e-closing-bg">
        <img
          src="/second_pose.jpg"
          alt="LUXX Final Frame"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
        />
        <div className="e-closing-shade" />
      </div>

      <div className="e-closing-inner">
        <span className="e-closing-city">{content.city}</span>

        <h2 className="e-closing-title">{content.title}</h2>

        <Link to="/products?filter=new" className="e-closing-action">
          <span>{content.cta}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
