import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BoutiqueExperience() {
  const { language } = useLanguage();

  const services = {
    uz: [
      {
        num: '01',
        title: 'SHAXSIY STILIST KONSULTATSIYASI',
        desc: 'Qomatingiz va o‘ziga xos didingizga mos kiyimlar ansamblini tanlashda professional stilistimiz yordam beradi.',
        image: '/second_pose.jpg',
        badge: 'SHAXSIY XIZMAT',
        link: '/contact',
      },
      {
        num: '02',
        title: 'UYDA KIYIB KO‘RISH (TOSHKENT)',
        desc: 'Tanlagan modellaringizni kuryerimiz 3 xil o‘lchamda uyingizga yetkazadi. Sinab ko‘rib, sizga yoqqanini olasiz.',
        image: '/about_photo.jpg',
        badge: 'QULAYLIK',
        link: '/faq',
      },
      {
        num: '03',
        title: 'EKSLYUZIV QORA BAXMAL QADOQ',
        desc: 'Har bir buyurtma Luxx qora qutisi, ipak lenta va maxsus parfyum kartochkasi bilan yetkaziladi.',
        image: '/look.jpg',
        badge: 'HAUTE COUTURE EMBALLAGE',
        link: '/contact',
      },
      {
        num: '04',
        title: 'ATELIER INDIVIDUAL XIZMATI',
        desc: 'Maxsus tadbirlar yoki shaxsiy o‘lchamlar bo‘yicha atelyemiz ustalaridan yakkama-yakka xizmat.',
        image: '/heroimgg.jpg',
        badge: 'ATELIER PRIVÉ',
        link: '/contact',
      },
    ],
    ru: [
      {
        num: '01',
        title: 'КОНСУЛЬТАЦИЯ ПЕРСОНАЛЬНОГО СТИЛИСТА',
        desc: 'Профессиональный стилист поможет подобрать идеальный капсульный гардероб с учетом ваших предпочтений.',
        image: '/second_pose.jpg',
        badge: 'ПЕРСОНАЛЬНЫЙ СЕРВИС',
        link: '/contact',
      },
      {
        num: '02',
        title: 'ПРИМЕРКА НА ДОМУ (ТАШКЕНТ)',
        desc: 'Курьер доставит выбранные модели в 3 размерах к вам домой. Примерьте в спокойной обстановке и выберите лучшее.',
        image: '/about_photo.jpg',
        badge: 'КОМФОРТ',
        link: '/faq',
      },
      {
        num: '03',
        title: 'ЭКСКЛЮЗИВНАЯ БАРХАТНАЯ УПАКОВКА',
        desc: 'Каждый заказ упакован в фирменный черный бокс с шелковой лентой и селективной парфюмерной карточкой.',
        image: '/look.jpg',
        badge: 'HAUTE COUTURE EMBALLAGE',
        link: '/contact',
      },
      {
        num: '04',
        title: 'ИНДИВИДУАЛЬНЫЙ СЕРВИС АТЕЛЬЕ',
        desc: 'Индивидуальная подгонка и пошив для исключительных событий с ведущими мастерами ателье.',
        image: '/heroimgg.jpg',
        badge: 'ATELIER PRIVÉ',
        link: '/contact',
      },
    ],
    en: [
      {
        num: '01',
        title: 'PERSONAL STYLIST CONSULTATION',
        desc: 'Dedicated guidance from an atelier stylist to curate ensembles tailored to your rhythm and posture.',
        image: '/second_pose.jpg',
        badge: 'PRIVATE CONCIERGE',
        link: '/contact',
      },
      {
        num: '02',
        title: 'HOME FITTING (TASHKENT METRO)',
        desc: 'Our private courier presents selected silhouettes in multiple sizing variations at your residence.',
        image: '/about_photo.jpg',
        badge: 'DISCRETION',
        link: '/faq',
      },
      {
        num: '03',
        title: 'BESPOKE BLACK VELVET PACKAGING',
        desc: 'Each piece arrives encased in archival matte-black boxes, hand-tied ribbon, and signature fragrance note.',
        image: '/look.jpg',
        badge: 'HAUTE COUTURE EMBALLAGE',
        link: '/contact',
      },
      {
        num: '04',
        title: 'ATELIER PRIVATE CONSULTATION',
        desc: 'One-on-one appointments for gala attire and personalized garment finishing in our Tashkent space.',
        image: '/heroimgg.jpg',
        badge: 'ATELIER PRIVÉ',
        link: '/contact',
      },
    ],
  }[language] || [
    {
      num: '01',
      title: 'SHAXSIY STILIST KONSULTATSIYASI',
      desc: 'Qomatingiz va o‘ziga xos didingizga mos kiyimlar ansamblini tanlashda professional stilistimiz yordam beradi.',
      image: '/second_pose.jpg',
      badge: 'SHAXSIY XIZMAT',
      link: '/contact',
    },
    {
      num: '02',
      title: 'UYDA KIYIB KO‘RISH (TOSHKENT)',
      desc: 'Tanlagan modellaringizni kuryerimiz 3 xil o‘lchamda uyingizga yetkazadi. Sinab ko‘rib, sizga yoqqanini olasiz.',
      image: '/about_photo.jpg',
      badge: 'QULAYLIK',
      link: '/faq',
    },
    {
      num: '03',
      title: 'EKSLYUZIV QORA BAXMAL QADOQ',
      desc: 'Har bir buyurtma Luxx qora qutisi, ipak lenta va maxsus parfyum kartochkasi bilan yetkaziladi.',
      image: '/look.jpg',
      badge: 'HAUTE COUTURE EMBALLAGE',
      link: '/contact',
    },
    {
      num: '04',
      title: 'ATELIER INDIVIDUAL XIZMATI',
      desc: 'Maxsus tadbirlar yoki shaxsiy o‘lchamlar bo‘yicha atelyemiz ustalaridan yakkama-yakka xizmat.',
      image: '/heroimgg.jpg',
      badge: 'ATELIER PRIVÉ',
      link: '/contact',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = services[activeIndex] || services[0];

  const text = {
    uz: {
      kicker: '06 / ATELIER CONCIERGE',
      title: 'BUTIK DARAJASIDAGI XIZMAT',
    },
    ru: {
      kicker: '06 / КОНСЬЕРЖ АТЕЛЬЕ',
      title: 'СЕРВИС УРОВНЯ ВЫСОКОГО БУТИКА',
    },
    en: {
      kicker: '06 / ATELIER CONCIERGE',
      title: 'BOUTIQUE-LEVEL SERVICE',
    },
  }[language] || {
    kicker: '06 / ATELIER CONCIERGE',
    title: 'BUTIK DARAJASIDAGI XIZMAT',
  };

  return (
    <section className="e-services-section" aria-label="Boutique Services">
      <div className="luxx-editorial-shell">
        <div style={{ marginBottom: '40px' }}>
          <span className="e-label">{text.kicker}</span>
          <h2 className="e-serif-heading" style={{ fontSize: 'clamp(2rem, 3.4vw, 4rem)', marginTop: '10px' }}>
            {text.title}
          </h2>
        </div>

        <div className="e-services-grid">
          {/* Left Column: Interactive Service Rows */}
          <div className="e-services-list">
            {services.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <Link
                  key={item.num}
                  to={item.link}
                  className={`e-service-item ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                >
                  <div className="e-service-item-head">
                    <div className="e-service-meta">
                      <span className="e-service-num">{item.num}</span>
                      <h3 className="e-service-title">{item.title}</h3>
                    </div>
                    <ArrowUpRight
                      size={20}
                      style={{
                        opacity: isActive ? 1 : 0.4,
                        color: isActive ? 'var(--e-gold)' : 'inherit',
                        transition: 'opacity 200ms ease, color 200ms ease',
                      }}
                    />
                  </div>

                  <p className="e-service-desc">{item.desc}</p>
                </Link>
              );
            })}
          </div>

          {/* Right Column: Visual Area that transforms on hover */}
          <div className="e-services-preview" aria-hidden="true">
            {services.map((item, idx) => (
              <img
                key={item.num}
                className={`e-services-preview-img ${activeIndex === idx ? 'is-active' : ''}`}
                src={item.image}
                alt={item.title}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = '/heroimgg.jpg'; }}
              />
            ))}

            <div className="e-services-preview-overlay">
              <span style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.22em', color: 'var(--e-gold)', textTransform: 'uppercase' }}>
                {activeService.badge}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--e-text)' }}>
                {activeService.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
