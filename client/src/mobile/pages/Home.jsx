import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Search, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { CONTACT, getPolicyCopy } from '../../config/policies';
import { getImageUrl } from '../../utils/image';
import { openMobileSearch } from '../../components/mobile/MobileLayout';
import StyleDeck from '../StyleDeck';
import { LanguageSwitch, SoftImage, money, productIdOf, productPath } from '../ui';
import './home.css';

const WORDS = {
  uz: {
    title: ['Bugun kimdek', 'kiyinasiz?'],
    lead: "O'ngga suring — saqlaysiz. Chapga — keyingisi. Bosing — ko'rasiz.",
    collection: 'Kolleksiya',
    all: 'Barchasi',
    departments: "Bo'limlar",
    pieces: (n) => `${n} model`,
    originalKicker: 'Original · hujjati bilan',
    originalLead: "Kelib chiqishi tasdiqlangan. Hujjatini fitting paytida ko'rsatamiz.",
    view: "Ko'rish",
    servicesTitle: ['Atelier', 'sizga keladi'],
    services: [
      ["Uyda kiyib ko'rish", "Kuryer bir nechta o'lchamni olib keladi. Yoqqanini qoldirasiz."],
      ['Shaxsiy fitting', 'Amir Temur 12 dagi atelierda, faqat siz va stilist.'],
      ['Obraz konsyerji', "To'y, uchrashuv yoki safar uchun obrazni biz tanlaymiz."],
    ],
    book: "Fitting'ga yozilish",
    looksTitle: ['Tayyor', 'obrazlar'],
    looksLead: "Stilist yig'gan to'liq obrazlar.",
    hours: 'Har kuni, 09:00 — 22:00',
    privacy: 'Maxfiylik',
    terms: 'Shartlar',
  },
  ru: {
    title: ['Кем вы будете', 'сегодня?'],
    lead: 'Вправо — сохранить. Влево — дальше. Нажмите — посмотреть.',
    collection: 'Коллекция',
    all: 'Все',
    departments: 'Разделы',
    pieces: (n) => `${n} моделей`,
    originalKicker: 'Оригинал · с документами',
    originalLead: 'Происхождение подтверждено. Документы покажем на примерке.',
    view: 'Смотреть',
    servicesTitle: ['Ателье', 'приезжает к вам'],
    services: [
      ['Примерка дома', 'Курьер привезёт несколько размеров. Оставите то, что понравится.'],
      ['Личная примерка', 'В ателье на Амира Темура, 12 — только вы и стилист.'],
      ['Консьерж по образу', 'Подберём образ для свадьбы, встречи или поездки.'],
    ],
    book: 'Записаться на примерку',
    looksTitle: ['Готовые', 'образы'],
    looksLead: 'Полные образы от стилиста.',
    hours: 'Ежедневно, 09:00 — 22:00',
    privacy: 'Конфиденциальность',
    terms: 'Условия',
  },
  en: {
    title: ['Who will you', 'be today?'],
    lead: 'Swipe right to save, left to pass, tap to look closer.',
    collection: 'Collection',
    all: 'All',
    departments: 'Departments',
    pieces: (n) => `${n} pieces`,
    originalKicker: 'Original · with papers',
    originalLead: 'Verified origin. We show the papers at your fitting.',
    view: 'View',
    servicesTitle: ['The atelier', 'comes to you'],
    services: [
      ['Try on at home', 'A courier brings a few sizes. Keep what you love.'],
      ['Private fitting', 'At the atelier on Amir Temur 12 — just you and a stylist.'],
      ['Styling concierge', 'We choose the look for a wedding, a meeting or a trip.'],
    ],
    book: 'Book a fitting',
    looksTitle: ['Complete', 'looks'],
    looksLead: 'Full outfits put together by a stylist.',
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
  const { totalItems } = useCart();

  const list = useMemo(() => (products || []).filter(Boolean), [products]);
  const newest = useMemo(() => [...list].sort(byNewest), [list]);
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

  return (
    <div className="m-page mh">
      <header className="mh-bar m-pad">
        <span className="mh-logo">Luxx</span>
        <span className="mh-bar__acts">
          <button type="button" className="m-icon-btn" onClick={openMobileSearch} aria-label="Qidiruv"><Search className="h-5 w-5" strokeWidth={1.5} /></button>
          <Link to="/mobile/cart" className="m-icon-btn" aria-label="Savat">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && <span className="m-icon-btn__dot">{totalItems > 9 ? '9+' : totalItems}</span>}
          </Link>
        </span>
      </header>

      <section className="mh-intro m-pad">
        <h1 className="mh-title"><span>{w.title[0]}</span> <em>{w.title[1]}</em></h1>
        <p className="m-body">{w.lead}</p>
      </section>

      <StyleDeck products={newest} loading={loading} />

      <ul className="mh-facts m-pad" aria-label="Xizmat shartlari">
        {policy.facts.map(([big, small]) => <li key={big}><strong>{big}</strong><span>{small}</span></li>)}
      </ul>

      <section className="m-section">
        <div className="mh-head m-pad">
          <h2 className="m-h2">{w.collection}</h2>
          <Link to="/mobile/products" className="m-link">{w.all}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mh-rail">
          {(loading ? Array.from({ length: 3 }) : newest).map((product, i) => (product ? (
            <Link key={productIdOf(product)} to={productPath(product)} className="mh-arch">
              <span className="mh-arch__ph"><SoftImage src={getImageUrl(product)} alt={product.name} /></span>
              <b>{product.name}</b>
              <small>{money(product.price, language)}</small>
            </Link>
          ) : <div key={i} className="mh-arch" aria-hidden="true"><span className="mh-arch__ph m-skel" /></div>))}
        </div>
      </section>

      {departments.length > 0 && (
        <section className="m-section m-pad">
          <div className="mh-head"><h2 className="m-h2">{w.departments}</h2></div>
          <div className="mh-depts">
            {departments.map((dept) => (
              <Link key={dept.name} to={`/mobile/products?category=${encodeURIComponent(dept.name)}`} className="mh-dept">
                <SoftImage src={dept.image} alt="" />
                <span><strong>{dept.name}</strong><small>{w.pieces(dept.count)}</small></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {original && (
        <section className="m-section m-pad">
          <Link to={productPath(original)} className="mh-original">
            <span className="mh-original__ph"><SoftImage src={getImageUrl(original)} alt={original.name} /></span>
            <span className="m-kicker">{w.originalKicker}</span>
            <span className="m-h1">{original.brand || original.name}</span>
            <span className="m-body">{w.originalLead}</span>
            <span className="m-btn m-btn--ghost">{w.view}<ArrowRight className="h-4 w-4" /></span>
          </Link>
        </section>
      )}

      <section className="m-section m-pad mh-services">
        <span className="mh-services__ph"><SoftImage src="/editorial/atelier-fitting-v2.png" alt="" /></span>
        <h2 className="m-h1">{w.servicesTitle[0]} <em>{w.servicesTitle[1]}</em></h2>
        <ol className="mh-services__list">
          {w.services.map(([name, text]) => (
            <li key={name}><strong>{name}</strong><span>{text}</span></li>
          ))}
        </ol>
        <a href={CONTACT.phoneHref} className="m-btn m-btn--solid m-btn--block"><Phone className="h-4 w-4" />{w.book}</a>
      </section>

      <section className="m-section m-pad">
        <Link to="/mobile/lookbooks" className="mh-looks">
          <SoftImage src="/editorial/opening-main-v2.png" alt="" />
          <span className="mh-looks__copy">
            <span className="m-h1">{w.looksTitle[0]} <em>{w.looksTitle[1]}</em></span>
            <span className="m-body">{w.looksLead}</span>
          </span>
        </Link>
      </section>

      <footer className="mh-foot m-pad">
        <span className="mh-logo">Luxx</span>
        <div className="m-rows">
          <a className="m-row" href={CONTACT.phoneHref}><Phone className="h-4 w-4" />{CONTACT.phone}</a>
          <div className="m-row">{CONTACT.address}</div>
          <div className="m-row">{w.hours}</div>
        </div>
        <div className="mh-foot__end">
          <LanguageSwitch />
          <span>
            <Link to="/mobile/privacy-policy">{w.privacy}</Link>
            <Link to="/mobile/terms">{w.terms}</Link>
          </span>
        </div>
        <p className="m-small">© {new Date().getFullYear()} Luxx.uz · {CONTACT.email}</p>
      </footer>
    </div>
  );
}
