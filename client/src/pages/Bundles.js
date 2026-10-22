import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import useProductService from '../server/server';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import './Bundles.css';

const COPY = {
  uz: {
    kicker: "To'plamlar",
    title: 'Tayyor obrazlar,',
    accent: 'birga olsangiz arzonroq',
    lead: "Bir-biriga mos keladigan kiyimlarni bitta to'plamga yig'dik. To'plamni olsangiz, har birini alohida sotib olgandan arzonga tushadi. O'lcham va rangni har bir kiyim uchun alohida tanlaysiz.",
    items: 'ta kiyim',
    separately: 'Alohida olsangiz',
    bundlePrice: "To'plam narxi",
    save: 'tejaysiz',
    view: "To'plamni ko'rish",
    emptyTitle: "Hozircha to'plam yo'q",
    emptyText: "Yangi to'plamlar tez orada qo'shiladi. Ungacha kolleksiyadagi kiyimlarni ko'rib chiqing.",
    emptyCta: "Kolleksiyaga o'tish",
    currency: "so'm",
    seoTitle: "To'plamlar | Luxx.uz",
    seoDescription: "Bir-biriga mos kiyimlardan tuzilgan tayyor to'plamlar. Birga olsangiz, alohida olgandan arzonroq.",
  },
  ru: {
    kicker: 'Комплекты',
    title: 'Готовые образы,',
    accent: 'вместе выгоднее',
    lead: 'Мы собрали вещи, которые подходят друг другу, в один комплект. Комплект стоит дешевле, чем те же вещи по отдельности. Размер и цвет выбираете для каждой вещи отдельно.',
    items: 'вещи',
    separately: 'По отдельности',
    bundlePrice: 'Цена комплекта',
    save: 'экономии',
    view: 'Смотреть комплект',
    emptyTitle: 'Пока нет комплектов',
    emptyText: 'Новые комплекты скоро появятся. А пока посмотрите коллекцию.',
    emptyCta: 'В коллекцию',
    currency: 'сум',
    seoTitle: 'Комплекты | Luxx.uz',
    seoDescription: 'Готовые комплекты из вещей, которые подходят друг другу. Вместе дешевле, чем по отдельности.',
  },
  en: {
    kicker: 'Sets',
    title: 'Complete looks,',
    accent: 'better together',
    lead: 'We put pieces that belong together into one set. A set costs less than buying the same pieces one by one. You choose the size and colour for each piece.',
    items: 'pieces',
    separately: 'Bought separately',
    bundlePrice: 'Set price',
    save: 'saved',
    view: 'View the set',
    emptyTitle: 'No sets yet',
    emptyText: 'New sets are on their way. Meanwhile, browse the collection.',
    emptyCta: 'Go to collection',
    currency: 'UZS',
    seoTitle: 'Sets | Luxx.uz',
    seoDescription: 'Ready-made sets of pieces that belong together. Cheaper together than one by one.',
  },
};

const formatPrice = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const localize = (value, language) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.uz || value.ru || value.en || '';
};

const productImage = (product) => {
  const first = product?.image || product?.images?.[0];
  if (!first) return '';
  return typeof first === 'string' ? first : first.url || '';
};

const BundleCardSkeleton = () => (
  <div className="bundles-card bundles-card--skeleton" aria-hidden="true">
    <div className="bundles-card__photos"><span /><span /></div>
    <div className="bundles-card__body">
      <span className="bundles-skeleton-line w-24" />
      <span className="bundles-skeleton-line bundles-skeleton-line--title w-3/4" />
      <span className="bundles-skeleton-line w-full" />
      <span className="bundles-skeleton-line w-2/3" />
    </div>
  </div>
);

const Bundles = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.uz;
  const { getAllBundles } = useProductService();
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllBundles()
      .then((result) => {
        if (cancelled) return;
        const list = Array.isArray(result?.data) ? result.data : [];
        setBundles(list.filter((bundle) => bundle.isActive && bundle.products?.length));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
    // Load once: getAllBundles is recreated on every render by the service hook.
  }, []);

  return (
    <main className="bundles-page">
      <SEO title={copy.seoTitle} description={copy.seoDescription} canonicalPath="/bundles" />

      <header className="bundles-intro">
        <p className="bundles-kicker">{copy.kicker}</p>
        <h1>{copy.title} <em>{copy.accent}</em></h1>
        <p className="bundles-lead">{copy.lead}</p>
      </header>

      <section className="bundles-list" aria-busy={isLoading}>
        {isLoading && <BundleCardSkeleton />}

        {!isLoading && bundles.length === 0 && (
          <div className="bundles-empty">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyText}</p>
            <Link to="/products">{copy.emptyCta} <ArrowRight size={16} strokeWidth={1.5} /></Link>
          </div>
        )}

        {!isLoading && bundles.map((bundle) => {
          const id = bundle._id || bundle.id;
          const title = localize(bundle.title, language);
          const description = localize(bundle.description, language);
          const products = bundle.products.slice(0, 4);
          const original = Number(bundle.originalPrice) || bundle.products.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
          const price = Number(bundle.discountedPrice) || original;
          const savings = Math.max(0, original - price);

          return (
            <Link key={id} to={`/bundle/${id}`} className="bundles-card">
              <div className="bundles-card__photos">
                {products.map((product, index) => (
                  <img
                    key={product._id || index}
                    src={productImage(product) || '/placeholder.jpg'}
                    alt={product.name || ''}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>

              <div className="bundles-card__body">
                <p className="bundles-card__count">{bundle.products.length} {copy.items}</p>
                <h2>{title}</h2>
                {description && <p className="bundles-card__description">{description}</p>}

                <ul className="bundles-card__items">
                  {bundle.products.map((product, index) => (
                    <li key={product._id || index}>
                      <span>{product.name}</span>
                      <span>{formatPrice(product.price)} {copy.currency}</span>
                    </li>
                  ))}
                </ul>

                <dl className="bundles-card__prices">
                  {savings > 0 && (
                    <div>
                      <dt>{copy.separately}</dt>
                      <dd><s>{formatPrice(original)} {copy.currency}</s></dd>
                    </div>
                  )}
                  <div className="bundles-card__total">
                    <dt>{copy.bundlePrice}</dt>
                    <dd>{formatPrice(price)} {copy.currency}</dd>
                  </div>
                </dl>
                {savings > 0 && <p className="bundles-card__save">{formatPrice(savings)} {copy.currency} {copy.save}</p>}

                <span className="bundles-card__cta">{copy.view} <ArrowRight size={16} strokeWidth={1.5} /></span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
};

export default Bundles;
