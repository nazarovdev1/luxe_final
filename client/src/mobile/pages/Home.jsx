import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Phone, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import { CONTACT, getPolicyCopy } from '../../config/policies';
import { getImageUrl } from '../../utils/image';
import { openMobileSearch } from '../../components/mobile/MobileLayout';
import { LanguageSwitch, ProductGrid, SectionHead, SoftImage } from '../ui';
import './home.css';

const WORDS = {
  uz: {
    kicker: 'Toshkent · Atelier',
    title: ['Uyda kiyib ko\'ring,', 'yoqsa to\'laysiz.'],
    lead: 'Premium ayollar kiyimi — shu kuni eshigingizgacha.',
    shop: 'Kolleksiya',
    call: "Qo'ng'iroq",
    sections: 'Bo\'limlar',
    pieces: (n) => `${n} model`,
    arrivals: 'Yangi kelganlar',
    all: 'Hammasi',
    originalKicker: 'Original · hujjati bilan',
    originalLead: "Kelib chiqishi tasdiqlangan model. Hujjatini fitting paytida ko'rsatamiz.",
    view: "Ko'rish",
    servicesKicker: 'Xizmat',
    servicesTitle: ['Atelier', 'sizga keladi.'],
    services: [
      ["Uyda kiyib ko'rish", "Kuryer bir nechta o'lchamni olib keladi. Yoqqanini qoldirasiz."],
      ['Shaxsiy fitting', 'Amir Temur 12 dagi atelierda, faqat siz va stilist.'],
      ['Obraz konsyerji', "To'y, uchrashuv yoki safar uchun obrazni biz tanlaymiz."],
    ],
    book: "Fitting'ga yozilish",
    looksKicker: 'Looklar',
    looksTitle: ['Tayyor', 'obrazlar.'],
    looksLead: "Stilist yig'gan to'liq obrazlar — boshdan oyoqqacha.",
    openLooks: "Looklarni ko'rish",
    visit: 'Atelier',
    hours: 'Har kuni, 09:00 — 22:00',
    privacy: 'Maxfiylik',
    terms: 'Shartlar',
  },
  ru: {
    kicker: 'Ташкент · Ателье',
    title: ['Примерьте дома,', 'платите, если нравится.'],
    lead: 'Премиальная женская одежда — к вашей двери в тот же день.',
    shop: 'Коллекция',
    call: 'Позвонить',
    sections: 'Разделы',
    pieces: (n) => `${n} моделей`,
    arrivals: 'Новые поступления',
    all: 'Все',
    originalKicker: 'Оригинал · с документами',
    originalLead: 'Происхождение подтверждено. Документы покажем на примерке.',
    view: 'Смотреть',
    servicesKicker: 'Сервис',
    servicesTitle: ['Ателье', 'приезжает к вам.'],
    services: [
      ['Примерка дома', 'Курьер привезёт несколько размеров. Оставите то, что понравится.'],
      ['Личная примерка', 'В ателье на Амира Темура, 12 — только вы и стилист.'],
      ['Консьерж по образу', 'Подберём образ для свадьбы, встречи или поездки.'],
    ],
    book: 'Записаться на примерку',
    looksKicker: 'Образы',
    looksTitle: ['Готовые', 'образы.'],
    looksLead: 'Полные образы от стилиста — с головы до ног.',
    openLooks: 'Смотреть образы',
    visit: 'Ателье',
    hours: 'Ежедневно, 09:00 — 22:00',
    privacy: 'Конфиденциальность',
    terms: 'Условия',
  },
  en: {
    kicker: 'Tashkent · Atelier',
    title: ['Try it on at home,', 'pay if you love it.'],
    lead: 'Premium womenswear — at your door the same day.',
    shop: 'Collection',
    call: 'Call',
    sections: 'Departments',
    pieces: (n) => `${n} pieces`,
    arrivals: 'New arrivals',
    all: 'All',
    originalKicker: 'Original · with papers',
    originalLead: 'Verified origin. We show the papers at your fitting.',
    view: 'View',
    servicesKicker: 'Service',
    servicesTitle: ['The atelier', 'comes to you.'],
    services: [
      ['Try on at home', 'A courier brings a few sizes. Keep what you love.'],
      ['Private fitting', 'At the atelier on Amir Temur 12 — just you and a stylist.'],
      ['Styling concierge', 'We choose the look for a wedding, a meeting or a trip.'],
    ],
    book: 'Book a fitting',
    looksKicker: 'Looks',
    looksTitle: ['Complete', 'looks.'],
    looksLead: 'Full outfits put together by a stylist, head to toe.',
    openLooks: 'See the looks',
    visit: 'Atelier',
    hours: 'Daily, 09:00 — 22:00',
    privacy: 'Privacy',
    terms: 'Terms',
  },
};

const byNewest = (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

export default function Home() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const policy = getPolicyCopy(language);
  const { products, isLoading } = useProducts();

  const list = useMemo(() => (products || []).filter(Boolean), [products]);
  const arrivals = useMemo(() => [...list].sort(byNewest).slice(0, 4), [list]);
  const original = useMemo(() => list.find((product) => product.authenticity?.isOriginal), [list]);
  const departments = useMemo(() => {
    const grouped = new Map();
    list.forEach((product) => {
      if (!product.category) return;
      const entry = grouped.get(product.category) || { name: product.category, count: 0, image: getImageUrl(product) };
      entry.count += 1;
      grouped.set(product.category, entry);
    });
    return [...grouped.values()].sort((a, b) => b.count - a.count);
  }, [list]);
  const loading = isLoading && !list.length;

  // The first screen never waits for the API: the hero is static, products fill in behind it.
  return (
    <div className="m-page mh">
      <section className="mh-hero">
        <SoftImage src="/editorial/private-edit-evening.png" alt="" eager className="mh-hero__img" fetchpriority="high" />
        <div className="mh-hero__shade" aria-hidden="true" />
        <header className="mh-bar">
          <LanguageSwitch />
          <span className="mh-bar__logo">LUXX</span>
          <button type="button" className="m-icon-btn" onClick={openMobileSearch} aria-label="Qidiruv">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>
        <div className="mh-hero__copy m-pad">
          <p className="m-kicker mh-hero__kicker">{w.kicker}</p>
          <h1 className="mh-hero__title">
            {w.title.map((line, i) => (
              <span key={line}><span>{i === w.title.length - 1 ? <em>{line}</em> : line}</span></span>
            ))}
          </h1>
          <p className="mh-hero__lead">{w.lead}</p>
          <div className="mh-hero__actions">
            <Link to="/mobile/products" className="m-btn m-btn--solid">{w.shop}<ArrowRight className="h-4 w-4" /></Link>
            <a href={CONTACT.phoneHref} className="m-btn m-btn--ghost"><Phone className="h-4 w-4" />{w.call}</a>
          </div>
        </div>
      </section>

      <ul className="mh-facts m-pad" aria-label="Xizmat shartlari">
        {policy.facts.map(([big, small]) => (
          <li key={big}><strong>{big}</strong><span>{small}</span></li>
        ))}
      </ul>

      <section className="m-section">
        <div className="m-pad"><SectionHead kicker={w.sections} /></div>
        <div className="mh-depts">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <div key={i} className="mh-dept m-skel" aria-hidden="true" />)
            : departments.map((dept) => (
              <Link key={dept.name} to={`/mobile/products?category=${encodeURIComponent(dept.name)}`} className="mh-dept">
                <SoftImage src={dept.image} alt="" />
                <span className="mh-dept__label">
                  <strong>{dept.name}</strong>
                  <small>{w.pieces(dept.count)}</small>
                </span>
              </Link>
            ))}
        </div>
      </section>

      <section className="m-section m-pad">
        <SectionHead
          kicker={w.arrivals}
          action={<Link to="/mobile/products" className="m-link">{w.all}<ArrowUpRight className="h-3.5 w-3.5" /></Link>}
        />
        <ProductGrid products={arrivals} loading={loading} />
      </section>

      {original && (
        <section className="m-section m-pad">
          <Link to={`/mobile/product/${original.id || original._id}`} className="mh-original">
            <span className="mh-original__img"><SoftImage src={getImageUrl(original)} alt={original.name} /></span>
            <span className="mh-original__copy">
              <span className="m-kicker">{w.originalKicker}</span>
              <span className="m-h2">{original.brand || original.name}</span>
              <span className="m-body">{w.originalLead}</span>
              <span className="m-link">{w.view}<ArrowUpRight className="h-3.5 w-3.5" /></span>
            </span>
          </Link>
        </section>
      )}

      <section className="m-section">
        <div className="mh-services">
          <SoftImage src="/editorial/atelier-fitting-v2.png" alt="" className="mh-services__img" />
          <div className="mh-services__copy m-pad">
            <p className="m-kicker">{w.servicesKicker}</p>
            <h2 className="m-h1">{w.servicesTitle[0]} <em>{w.servicesTitle[1]}</em></h2>
            <ol className="mh-services__list">
              {w.services.map(([name, text], i) => (
                <li key={name}>
                  <span className="mh-services__num">{String(i + 1).padStart(2, '0')}</span>
                  <span><strong>{name}</strong><span>{text}</span></span>
                </li>
              ))}
            </ol>
            <a href={CONTACT.phoneHref} className="m-btn m-btn--solid m-btn--block"><Phone className="h-4 w-4" />{w.book}</a>
          </div>
        </div>
      </section>

      <section className="m-section m-pad">
        <Link to="/mobile/lookbooks" className="mh-looks">
          <SoftImage src="/editorial/opening-main-v2.png" alt="" />
          <span className="mh-looks__copy">
            <span className="m-kicker">{w.looksKicker}</span>
            <span className="m-h1">{w.looksTitle[0]} <em>{w.looksTitle[1]}</em></span>
            <span className="m-body">{w.looksLead}</span>
            <span className="m-link">{w.openLooks}<ArrowUpRight className="h-3.5 w-3.5" /></span>
          </span>
        </Link>
      </section>

      <footer className="mh-foot m-pad">
        <span className="mh-foot__logo">LUXX</span>
        <div className="m-rows">
          <a className="m-row" href={CONTACT.phoneHref}>{CONTACT.phone}<span className="m-row__end">{w.call}</span></a>
          <a className="m-row" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <div className="m-row">{CONTACT.address}<span className="m-row__end">{w.visit}</span></div>
          <div className="m-row">{w.hours}</div>
        </div>
        <div className="mh-foot__end">
          <LanguageSwitch />
          <span>
            <Link to="/mobile/privacy-policy">{w.privacy}</Link>
            <Link to="/mobile/terms">{w.terms}</Link>
          </span>
        </div>
        <p className="m-small">© {new Date().getFullYear()} Luxx.uz</p>
      </footer>
    </div>
  );
}
