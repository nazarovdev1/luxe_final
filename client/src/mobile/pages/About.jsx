import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Gem, ShieldCheck, Truck, UserRound } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPolicyCopy } from '../../config/policies';
import { SoftImage, TopBar } from '../ui';
import './about.css';

const WORDS = {
  uz: {
    title: 'Biz haqimizda',
    kicker: 'Luxx · Toshkent',
    lead: "Har bir ayol o'z uslubida o'zini qulay, nafis va ishonchli his qilishga loyiq.",
    manifestoKicker: 'Bizning qadriyatimiz',
    manifesto: "Luxx — ayol o'zini go'zal, erkin va ishonchli his qilishi uchun yaratilgan zamonaviy moda makoni. Biz nafis fasonlar, sifatli matolar va e'tiborli xizmatni bir joyda birlashtiramiz.",
    quote: ['Sifat, uslub va xizmat —', "bir xil darajada premium bo'lishi kerak."],
    quoteNote: "Biz uchun moda shunchaki kiyim emas. Bu kayfiyat, o'ziga bo'lgan mehr va har kuni o'zingizni tanlash hissi. Shu sabab har bir buyurtma mayda detallargacha g'amxo'rlik bilan tayyorlanadi.",
    pillarsKicker: 'Bizning qarashimiz',
    pillars: [
      ['Premium sifat', "Yoqimli matolar, aniq bichim va uzoq vaqt go'zalligini saqlaydigan detallar."],
      ['Siz uchun yaratilgan', "O'lcham va obraz tanlashdan buyurtmani qabul qilishgacha samimiy yordam."],
      ['Yetkazib berish', null],
      ['Ishonchli xizmat', null],
    ],
    journeyKicker: "Bizning yo'limiz",
    journey: [
      ['2025', 'Boutique bosqichi', 'Ayollar uchun saralangan kichik kapsula kolleksiya bilan ish boshladik va har bir mijozni yaqindan tingladik.'],
      ['2026', 'Raqamli atelye', "Onlayn xaridni chiroyli, sodda va ishonchli tajribaga aylantirdik — tanlovdan yetkazib berishgacha."],
      ['Hozir', 'Luxx Signature', "Bugun biz O'zbekiston ayollari uchun nafis, zamonaviy va o'ziga xos obrazlarni birlashtirgan moda makonimiz."],
    ],
    shop: "Kolleksiyani ko'rish",
    contact: "Biz bilan bog'lanish",
  },
  ru: {
    title: 'О нас',
    kicker: 'Luxx · Ташкент',
    lead: 'Каждая женщина заслуживает чувствовать себя комфортно, изящно и уверенно в собственном стиле.',
    manifestoKicker: 'Наши ценности',
    manifesto: 'Luxx — это современное пространство моды, созданное для того, чтобы каждая женщина чувствовала себя красивой, свободной и уверенной. Мы объединяем изящные силуэты, качественные ткани и заботливый сервис.',
    quote: ['Качество, стиль и сервис —', 'должны быть одинаково премиальными.'],
    quoteNote: 'Для нас мода — это не просто одежда. Это настроение, любовь к себе и ежедневный выбор в свою пользу. Поэтому каждый заказ создаётся с заботой о мельчайших деталях.',
    pillarsKicker: 'Наше видение',
    pillars: [
      ['Премиальное качество', 'Приятные ткани, точный крой и детали, которые надолго сохраняют красоту.'],
      ['Создано для вас', 'Заботливая помощь с размером и образом — от выбора до получения заказа.'],
      ['Доставка', null],
      ['Надёжный сервис', null],
    ],
    journeyKicker: 'Наш путь',
    journey: [
      ['2025', 'Этап бутика', 'Мы начали с небольшой капсульной коллекции для женщин и внимательно прислушивались к каждой клиентке.'],
      ['2026', 'Цифровое ателье', 'Мы превратили онлайн-покупку в красивый, простой и надёжный опыт — от выбора до доставки.'],
      ['Сейчас', 'Luxx Signature', 'Сегодня мы объединяем изящные, современные и самобытные образы для женщин Узбекистана.'],
    ],
    shop: 'Смотреть коллекцию',
    contact: 'Связаться с нами',
  },
  en: {
    title: 'About us',
    kicker: 'Luxx · Tashkent',
    lead: 'Every woman deserves to feel comfortable, elegant and confident in her own style.',
    manifestoKicker: 'Our values',
    manifesto: 'Luxx is a modern fashion space created for women to feel beautiful, free and confident. We bring refined silhouettes, quality fabrics and thoughtful service together in one place.',
    quote: ['Quality, style and service —', 'should be equally premium.'],
    quoteNote: 'Fashion is more than clothing to us. It is a mood, an act of self-love and the feeling of choosing yourself every day. That is why every order is prepared with care for the smallest details.',
    pillarsKicker: 'Our vision',
    pillars: [
      ['Premium quality', 'Beautiful fabrics, precise tailoring and details designed to last.'],
      ['Made for you', 'Thoughtful help with sizing and styling, from selection to delivery.'],
      ['Delivery', null],
      ['Trusted service', null],
    ],
    journeyKicker: 'Our journey',
    journey: [
      ['2025', 'Boutique phase', 'We began with a curated capsule collection for women and listened closely to every client.'],
      ['2026', 'Digital atelier', 'We turned online shopping into a beautiful, simple and dependable experience, from selection to delivery.'],
      ['Now', 'Luxx Signature', 'Today we unite refined, modern and distinctive looks for the women of Uzbekistan.'],
    ],
    shop: 'See the collection',
    contact: 'Get in touch',
  },
};

const PILLAR_ICONS = [Gem, UserRound, Truck, ShieldCheck];
const GALLERY = ['/editorial/about-atelier-v2.png', '/editorial/about-manifesto-v2.png', '/editorial/about-craft-v2.png'];

export default function About() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const policy = getPolicyCopy(language);
  // Delivery and trust lines come from the shop policy so they never drift from checkout.
  const pillarText = [w.pillars[0][1], w.pillars[1][1], `${policy.delivery}.`, `${policy.tryOn}. ${policy.returns}.`];

  return (
    <div className="m-page mab">
      <SEO title={w.title} description={w.manifesto} canonicalPath="/about" />
      <TopBar title={w.title} />

      <section className="mab-hero">
        <SoftImage src="/second_pose.jpg" alt="Luxx" eager className="mab-hero__img" />
        <span className="mab-hero__shade" aria-hidden="true" />
        <div className="mab-hero__copy m-pad">
          <p className="m-kicker">{w.kicker}</p>
          <h1 className="mab-hero__title">Luxx</h1>
          <p className="mab-hero__lead">{w.lead}</p>
        </div>
      </section>

      <ul className="mab-facts m-pad">
        {policy.facts.map(([value, label]) => (
          <li key={label}><strong>{value}</strong><span>{label}</span></li>
        ))}
      </ul>

      <section className="m-section m-pad">
        <p className="m-kicker">{w.manifestoKicker}</p>
        <p className="mab-manifesto">{w.manifesto}</p>
      </section>

      <div className="mab-gallery" aria-hidden="true">
        {GALLERY.map((src) => (
          <span key={src} className="mab-gallery__frame"><SoftImage src={src} alt="" /></span>
        ))}
      </div>

      <section className="m-section m-pad">
        <blockquote className="mab-quote">
          <p>{w.quote[0]} <em>{w.quote[1]}</em></p>
        </blockquote>
        <p className="m-body mab-quote__note">{w.quoteNote}</p>
      </section>

      <section className="m-section m-pad">
        <p className="m-kicker">{w.pillarsKicker}</p>
        <ul className="mab-pillars">
          {w.pillars.map(([title], index) => {
            const Icon = PILLAR_ICONS[index];
            return (
              <li key={title}>
                <Icon className="h-5 w-5" strokeWidth={1.3} />
                <div>
                  <h3 className="m-h3">{title}</h3>
                  <p className="m-body">{pillarText[index]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="m-section m-pad">
        <p className="m-kicker">{w.journeyKicker}</p>
        <ol className="mab-journey">
          {w.journey.map(([year, title, text]) => (
            <li key={title}>
              <span className="mab-journey__year">{year}</span>
              <div>
                <h3 className="m-h3">{title}</h3>
                <p className="m-body">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mab-cta m-pad">
        <Link to="/mobile/products" className="m-btn m-btn--solid m-btn--block">{w.shop}<ArrowUpRight className="h-4 w-4" /></Link>
        <Link to="/mobile/contact" className="m-btn m-btn--ghost m-btn--block">{w.contact}</Link>
      </div>
    </div>
  );
}
