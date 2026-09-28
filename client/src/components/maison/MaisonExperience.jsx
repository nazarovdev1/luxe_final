import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Eye, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import QuickViewModal from '../QuickViewModal';
import './maisonExperience.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fallbackProducts = [
  { id: 'editorial-01', name: 'Nocturne drape', category: 'LUXX EDIT', price: null, image: '/second_pose.jpg', editorial: true },
  { id: 'editorial-02', name: 'Soft architecture', category: 'ATELIER', price: null, image: '/heroimgg.jpg', editorial: true },
  { id: 'editorial-03', name: 'Quiet movement', category: 'SIGNATURE', price: null, image: '/about_photo.jpg', editorial: true },
  { id: 'editorial-04', name: 'After dark', category: 'EDITION 04', price: null, image: '/look2.jpg', editorial: true },
];

const formatPrice = (value, fallback) => {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return fallback;
  return `${new Intl.NumberFormat('ru-RU').format(price)} so‘m`;
};

export default function MaisonExperience() {
  const root = useRef(null);
  const storyTrack = useRef(null);
  const { language } = useLanguage();
  const { products } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeService, setActiveService] = useState(0);

  const words = {
    uz: {
      edition: 'LUXX · WOMEN’S EDIT 2026',
      introTop: 'Ayol o‘zini qulay his qilganida,',
      introMain: 'butun xona\nuni his qiladi.',
      introBody: 'Biz kiyimni tanaga moslashtiramiz — ayolni kiyimga emas. Har bir chiziq erkinlik, har bir mato esa sokin ishonch uchun tanlangan.',
      introLink: 'Falsafamiz',
      storyLabel: 'THE FEELING · 01—03',
      storyHint: 'Siljiting',
      collectionEyebrow: 'PRIVATE EDIT · 04',
      collectionTitle: 'Siz uchun\nsaralangan.',
      collectionBody: 'Kamroq, lekin aniqroq. Garderobingizda qoladigan va har gal o‘zingizdek his qildiradigan siluetlar.',
      allProducts: 'Barcha kiyimlar',
      quickView: 'Tezkor ko‘rish',
      priceRequest: 'Narxini aniqlashtiring',
      lookLabel: 'A COMPLETE MOOD · 05',
      lookTitle: 'Kiyim emas.\nSizning\nkayfiyatingiz.',
      lookBody: 'Bir-biri bilan gaplashadigan ranglar, teksturalar va proporsiyalar. Tayyor obraz — ertalabki tanlovni yengillashtiradi.',
      lookCta: 'Lookbook’ni ochish',
      atelierLabel: 'THE LUXX RITUAL · 06',
      atelierTitle: 'Sizni\neshitadigan\nxizmat.',
      atelierBody: 'Shaxsiy fittingdan eshigingizgacha — har bir detal sizning vaqtingiz va komfortingizni asrash uchun.',
      concierge: 'Konsyerj bilan bog‘lanish',
      footerCopy: 'Toshkentda yaratilgan zamonaviy ayollar garderobi. Sokin, aniq va unutilmas.',
      rights: 'Barcha huquqlar himoyalangan.',
      back: 'Yuqoriga',
    },
    ru: {
      edition: 'LUXX · WOMEN’S EDIT 2026',
      introTop: 'Когда женщине по-настоящему комфортно,',
      introMain: 'это чувствует\nвся комната.',
      introBody: 'Мы создаём одежду для тела — не подстраиваем женщину под одежду. Каждая линия дарит свободу, каждая ткань — тихую уверенность.',
      introLink: 'Наша философия',
      storyLabel: 'THE FEELING · 01—03',
      storyHint: 'Листайте',
      collectionEyebrow: 'PRIVATE EDIT · 04',
      collectionTitle: 'Выбрано\nдля вас.',
      collectionBody: 'Меньше, но точнее. Силуэты, которые остаются в гардеробе и каждый раз возвращают ощущение себя.',
      allProducts: 'Вся коллекция',
      quickView: 'Быстрый просмотр',
      priceRequest: 'Уточнить цену',
      lookLabel: 'A COMPLETE MOOD · 05',
      lookTitle: 'Не вещь.\nВаше\nнастроение.',
      lookBody: 'Цвета, фактуры и пропорции, которые говорят друг с другом. Готовый образ делает утренний выбор легче.',
      lookCta: 'Открыть lookbook',
      atelierLabel: 'THE LUXX RITUAL · 06',
      atelierTitle: 'Сервис,\nкоторый слышит\nвас.',
      atelierBody: 'От личной примерки до вашей двери — каждая деталь бережёт ваше время и комфорт.',
      concierge: 'Связаться с консьержем',
      footerCopy: 'Современный женский гардероб, созданный в Ташкенте. Тихий, точный и незабываемый.',
      rights: 'Все права защищены.',
      back: 'Наверх',
    },
    en: {
      edition: 'LUXX · WOMEN’S EDIT 2026',
      introTop: 'When a woman feels entirely at ease,',
      introMain: 'the whole room\nfeels it.',
      introBody: 'We fit the garment to the woman, never the woman to the garment. Every line is made for freedom; every fabric, for quiet confidence.',
      introLink: 'Our philosophy',
      storyLabel: 'THE FEELING · 01—03',
      storyHint: 'Keep moving',
      collectionEyebrow: 'PRIVATE EDIT · 04',
      collectionTitle: 'Curated\nfor you.',
      collectionBody: 'Fewer, more exacting pieces. Silhouettes that stay in your wardrobe and always feel unmistakably yours.',
      allProducts: 'Explore all pieces',
      quickView: 'Quick view',
      priceRequest: 'Price on request',
      lookLabel: 'A COMPLETE MOOD · 05',
      lookTitle: 'Not an item.\nYour state\nof mind.',
      lookBody: 'Colour, texture and proportion in conversation. A complete look that makes the morning decision effortless.',
      lookCta: 'Open the lookbook',
      atelierLabel: 'THE LUXX RITUAL · 06',
      atelierTitle: 'Service\nthat listens.',
      atelierBody: 'From private fitting to your door, every detail is designed to protect your time and comfort.',
      concierge: 'Speak to concierge',
      footerCopy: 'A modern women’s wardrobe created in Tashkent. Quiet, precise and unforgettable.',
      rights: 'All rights reserved.',
      back: 'Back to top',
    },
  }[language] || null;

  const copy = words || {
    edition: 'LUXX · WOMEN’S EDIT 2026', introTop: 'Ayol o‘zini qulay his qilganida,', introMain: 'butun xona\nuni his qiladi.',
    introBody: 'Biz kiyimni tanaga moslashtiramiz — ayolni kiyimga emas.', introLink: 'Falsafamiz', storyLabel: 'THE FEELING · 01—03', storyHint: 'Siljiting',
    collectionEyebrow: 'PRIVATE EDIT · 04', collectionTitle: 'Siz uchun\nsaralangan.', collectionBody: 'Kamroq, lekin aniqroq.', allProducts: 'Barcha kiyimlar', quickView: 'Tezkor ko‘rish', priceRequest: 'Narxini aniqlashtiring',
    lookLabel: 'A COMPLETE MOOD · 05', lookTitle: 'Kiyim emas.\nSizning\nkayfiyatingiz.', lookBody: 'Tayyor obraz — ertalabki tanlovni yengillashtiradi.', lookCta: 'Lookbook’ni ochish',
    atelierLabel: 'THE LUXX RITUAL · 06', atelierTitle: 'Sizni\neshitadigan\nxizmat.', atelierBody: 'Har bir detal sizning vaqtingiz va komfortingizni asrash uchun.', concierge: 'Konsyerj bilan bog‘lanish',
    footerCopy: 'Toshkentda yaratilgan zamonaviy ayollar garderobi.', rights: 'Barcha huquqlar himoyalangan.', back: 'Yuqoriga',
  };

  const stories = {
    uz: [
      { number: '01', word: 'MAYINLIK', title: 'Tana bemalol\nnafas oladi.', body: 'Yumshoq qatlamlar va o‘ylangan proporsiya harakatni cheklamaydi — siz kun bo‘yi o‘zingiz bo‘lib qolasiz.', image: '/editorial/story-softness-v2.png' },
      { number: '02', word: 'QOMAT', title: 'Aniq kesim.\nYengil his.', body: 'Tuzilma qomatni bosmaydi, uni davom ettiradi. Kuch va nazokat bir xil chiziqda uchrashadi.', image: '/editorial/story-posture-v2.png' },
      { number: '03', word: 'HUZUR', title: 'Urinmasdan\nsezilish.', body: 'Siz kirganingizda avval kiyim emas, sokin ishonchingiz seziladi.', image: '/editorial/story-presence-v2.png' },
    ],
    ru: [
      { number: '01', word: 'НЕЖНОСТЬ', title: 'Тело свободно\nдышит.', body: 'Мягкие слои и выверенные пропорции не сковывают движения — весь день вы остаётесь собой.', image: '/editorial/story-softness-v2.png' },
      { number: '02', word: 'ОСАНКА', title: 'Точный крой.\nЛёгкое чувство.', body: 'Конструкция не подавляет фигуру, а продолжает её. Сила и нежность встречаются в одной линии.', image: '/editorial/story-posture-v2.png' },
      { number: '03', word: 'ПОКОЙ', title: 'Заметна\nбез усилий.', body: 'Когда вы входите, сначала чувствуют вашу тихую уверенность — не одежду.', image: '/editorial/story-presence-v2.png' },
    ],
    en: [
      { number: '01', word: 'SOFTNESS', title: 'The body is free\nto breathe.', body: 'Soft layers and considered proportion never restrict movement, so you remain yourself all day.', image: '/editorial/story-softness-v2.png' },
      { number: '02', word: 'POSTURE', title: 'Exact cut.\nEffortless feeling.', body: 'Structure never overpowers the body; it extends it. Strength and delicacy meet in one line.', image: '/editorial/story-posture-v2.png' },
      { number: '03', word: 'PRESENCE', title: 'Noticed without\ntrying.', body: 'When you enter, the room notices your quiet confidence before the clothes.', image: '/editorial/story-presence-v2.png' },
    ],
  }[language] || [];

  const services = {
    uz: [
      { num: '01', title: 'Shaxsiy fitting', body: 'Atelyedagi sokin uchrashuv: qomat, odat va kun tartibingizga mos tavsiyalar.', image: '/editorial/atelier-fitting-v2.png' },
      { num: '02', title: 'Obraz konsyerji', body: 'Bir tadbir yoki butun mavsum uchun tayyor, o‘zaro uyg‘un garderob.', image: '/editorial/atelier-concierge-v2.png' },
      { num: '03', title: 'Nozik yetkazish', body: 'Har bir buyum tekshiriladi, ehtiyotkor qadoqlanadi va siz tanlagan vaqtda yetkaziladi.', image: '/editorial/atelier-delivery-v2.png' },
    ],
    ru: [
      { num: '01', title: 'Личная примерка', body: 'Спокойная встреча в ателье и рекомендации с учётом фигуры, привычек и ритма жизни.', image: '/editorial/atelier-fitting-v2.png' },
      { num: '02', title: 'Консьерж образа', body: 'Цельный гардероб для одного события или всего сезона.', image: '/editorial/atelier-concierge-v2.png' },
      { num: '03', title: 'Бережная доставка', body: 'Каждая вещь проверяется, деликатно упаковывается и приезжает в выбранное вами время.', image: '/editorial/atelier-delivery-v2.png' },
    ],
    en: [
      { num: '01', title: 'Private fitting', body: 'A calm atelier appointment, shaped around your form, habits and daily rhythm.', image: '/editorial/atelier-fitting-v2.png' },
      { num: '02', title: 'Look concierge', body: 'A complete, harmonious wardrobe for one occasion or the entire season.', image: '/editorial/atelier-concierge-v2.png' },
      { num: '03', title: 'Considered delivery', body: 'Every piece is inspected, delicately wrapped and delivered at the time you choose.', image: '/editorial/atelier-delivery-v2.png' },
    ],
  }[language] || [];

  const showcase = useMemo(() => {
    const real = products.filter((product) => product?.id).slice(0, 4);
    return fallbackProducts.map((fallback, index) => real[index] || fallback);
  }, [products]);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const mm = gsap.matchMedia();

    gsap.utils.toArray('.mh-reveal').forEach((element) => {
      gsap.fromTo(element, { y: 46, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        ease: 'power4.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      });
    });

    gsap.utils.toArray('.mh-image-reveal').forEach((element) => {
      gsap.fromTo(element, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.35,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: element, start: 'top 82%', once: true },
      });
    });

    mm.add('(min-width: 1025px)', () => {
      const track = storyTrack.current;
      if (!track) return undefined;

      const tween = gsap.to(track, {
        xPercent: -66.6667,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mh-story',
          start: 'top top',
          end: () => `+=${window.innerWidth * 2.15}`,
          pin: true,
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.to('.mh-look-image-primary', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '.mh-look', start: 'top bottom', end: 'bottom top', scrub: 1.1 },
      });

      return () => tween.kill();
    });

    return () => mm.revert();
  }, { scope: root, dependencies: [language] });

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.mh-curation-item', { y: 28, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.mh-curation-list', start: 'top 84%', once: true },
    });
  }, { scope: root, dependencies: [showcase.map((item) => item.id).join('|')], revertOnUpdate: true });

  const openProduct = (product) => {
    if (!product.editorial) setQuickViewProduct(product);
  };

  return (
    <main ref={root} className="maison-home" aria-label="LUXX maison experience">
      <section className="mh-opening" id="maison-intro">
        <div className="mh-opening-orbit" aria-hidden="true"><span>LUXX</span></div>
        <div className="mh-shell mh-opening-grid">
          <div className="mh-opening-copy mh-reveal">
            <span className="mh-label"><Sparkles size={12} /> {copy.edition}</span>
            <p className="mh-opening-prelude">{copy.introTop}</p>
            <h2>{copy.introMain.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
            <div className="mh-opening-lower">
              <p>{copy.introBody}</p>
              <Link to="/about" className="mh-text-link"><span>{copy.introLink}</span><ArrowUpRight size={15} /></Link>
            </div>
          </div>

          <div className="mh-opening-art mh-image-reveal">
            <div className="mh-opening-art-main"><img src="/editorial/opening-main-v2.png" alt="LUXX ayollar kolleksiyasi" loading="lazy" /></div>
            <div className="mh-opening-art-detail"><img src="/editorial/opening-detail-v2.png" alt="LUXX mato va detal" loading="lazy" /></div>
            <span className="mh-opening-caption">FIG. 01 — SOFT POWER</span>
          </div>
        </div>
      </section>

      <div className="mh-marquee" aria-hidden="true">
        <div className="mh-marquee-track">
          {[0, 1].map((group) => (
            <div className="mh-marquee-group" key={group}>
              <span>SOFTNESS IS POWER</span><i />
              <span>COMFORT IS LUXURY</span><i />
              <span>PRESENCE IS PERSONAL</span><i />
            </div>
          ))}
        </div>
      </div>

      <section className="mh-story" aria-label="LUXX feeling story">
        <div className="mh-story-topline">
          <span>{copy.storyLabel}</span>
          <span>{copy.storyHint} <ArrowRight size={14} /></span>
        </div>
        <div ref={storyTrack} className="mh-story-track">
          {stories.map((story) => (
            <article className="mh-story-panel" key={story.number}>
              <div className="mh-story-number">{story.number}</div>
              <div className="mh-story-ghost" aria-hidden="true">{story.word}</div>
              <div className="mh-story-image"><img src={story.image} alt="" loading="lazy" /></div>
              <div className="mh-story-copy">
                <span>{story.word}</span>
                <h3>{story.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h3>
                <p>{story.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mh-collection" id="products">
        <div className="mh-shell">
          <header className="mh-curation-head mh-reveal">
            <div className="mh-curation-heading">
              <span className="mh-label">{copy.collectionEyebrow}</span>
              <h2>{copy.collectionTitle.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
            </div>
            <div className="mh-curation-note">
              <span>04 / 06</span>
              <p>{copy.collectionBody}</p>
              <Link to="/products" className="mh-text-link"><span>{copy.allProducts}</span><ArrowRight size={15} /></Link>
            </div>
          </header>

          <div className="mh-curation-stage">
            <Link to="/products" className="mh-curation-portrait mh-curation-portrait-main mh-image-reveal" aria-label={copy.allProducts}>
              <img src="/editorial/private-edit-tailoring.png" alt="LUXX bordo kostyum editorial obrazi" loading="lazy" />
              <span className="mh-curation-figure">FIG. 04 — QUIET AUTHORITY</span>
            </Link>

            <aside className="mh-curation-panel">
              <div className="mh-curation-monogram" aria-hidden="true">L</div>
              <div className="mh-curation-panel-top">
                <span>THE PRIVATE EDIT</span>
                <p>TAILORED IN TASHKENT<br />WOMEN’S EDIT · 2026</p>
              </div>

              <Link to="/products" className="mh-curation-portrait mh-curation-portrait-secondary mh-image-reveal" aria-label={copy.allProducts}>
                <img src="/editorial/private-edit-evening.png" alt="LUXX qora atlas ko‘ylak editorial obrazi" loading="lazy" />
                <span>02</span>
              </Link>

              <div className="mh-curation-list" aria-label={copy.collectionTitle.replace('\n', ' ')}>
                {showcase.map((product, index) => {
                  const link = product.editorial ? '/products' : `/product/${product.id}`;
                  return (
                    <article className="mh-curation-item" key={product.id}>
                      <span className="mh-curation-item-index">0{index + 1}</span>
                      <div>
                        <span>{product.category || 'LUXX ATELIER'}</span>
                        <h3><Link to={link}>{product.name}</Link></h3>
                      </div>
                      <div className="mh-curation-item-action">
                        <span>{formatPrice(product.price, copy.priceRequest)}</span>
                        <button type="button" onClick={() => openProduct(product)} aria-label={`${copy.quickView}: ${product.name}`} disabled={product.editorial}>
                          {product.editorial ? <ArrowUpRight size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>

            <div className="mh-curation-seal" aria-hidden="true">
              <span>CURATED</span><strong>04</strong><span>FOR YOU</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mh-look" id="home-lookbook">
        <div className="mh-look-images" aria-hidden="true">
          <div className="mh-look-image-primary"><img src="/editorial/lookbook-mood-v2.png" alt="" loading="lazy" /></div>
          <div className="mh-look-image-secondary"><img src="/editorial/lookbook-detail-v2.png" alt="" loading="lazy" /></div>
        </div>
        <div className="mh-look-veil" />
        <div className="mh-shell mh-look-content mh-reveal">
          <span className="mh-label">{copy.lookLabel}</span>
          <h2>{copy.lookTitle.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
          <p>{copy.lookBody}</p>
          <Link to="/lookbooks" className="mh-light-button"><span>{copy.lookCta}</span><ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="mh-atelier">
        <div className="mh-shell mh-atelier-grid">
          <div className="mh-atelier-copy mh-reveal">
            <span className="mh-label">{copy.atelierLabel}</span>
            <h2>{copy.atelierTitle.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
            <p>{copy.atelierBody}</p>
            <Link to="/contact" className="mh-dark-button"><span>{copy.concierge}</span><ArrowUpRight size={16} /></Link>
          </div>
          <div className="mh-services">
            <div className="mh-service-visual mh-image-reveal">
              {services.map((service, index) => (
                <img key={service.num} className={index === activeService ? 'is-active' : ''} src={service.image} alt="" loading="lazy" />
              ))}
              <span>ATELIER · TASHKENT</span>
            </div>
            <div className="mh-service-list">
              {services.map((service, index) => (
                <button type="button" key={service.num} className={index === activeService ? 'is-active' : ''} onMouseEnter={() => setActiveService(index)} onFocus={() => setActiveService(index)} onClick={() => setActiveService(index)}>
                  <span>{service.num}</span>
                  <span><strong>{service.title}</strong><small>{service.body}</small></span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="mh-footer">
        <div className="mh-shell">
          <div className="mh-footer-main">
            <div><div className="mh-footer-mark">LUXX</div><p>{copy.footerCopy}</p></div>
            <nav aria-label="Footer">
              <div><span>EXPLORE</span><Link to="/products">Kolleksiya</Link><Link to="/lookbooks">Lookbook</Link><Link to="/about">Maison</Link></div>
              <div><span>CARE</span><Link to="/contact">Aloqa</Link><Link to="/faq">Savollar</Link><Link to="/orders">Buyurtmalar</Link></div>
              <div><span>FOLLOW</span><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://t.me/" target="_blank" rel="noreferrer">Telegram</a></div>
            </nav>
          </div>
          <div className="mh-footer-base"><span>© {new Date().getFullYear()} LUXX · {copy.rights}</span><a href="#hero">{copy.back} ↑</a></div>
        </div>
      </footer>

      {quickViewProduct && <QuickViewModal isOpen product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </main>
  );
}
