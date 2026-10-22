import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

const COPY = {
  uz: {
    title: 'Bu sahifa topilmadi',
    text: "Havola eskirgan yoki manzilda xato bor. Kolleksiyadan qidirib ko'ring yoki bosh sahifaga qayting.",
    collection: "Kolleksiyani ko'rish",
    home: 'Bosh sahifa',
  },
  ru: {
    title: 'Страница не найдена',
    text: 'Ссылка устарела или в адресе ошибка. Посмотрите коллекцию или вернитесь на главную.',
    collection: 'Смотреть коллекцию',
    home: 'На главную',
  },
  en: {
    title: 'Page not found',
    text: 'The link is out of date or the address has a typo. Browse the collection or go back home.',
    collection: 'View the collection',
    home: 'Home',
  },
};

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.uz;
  const base = location.pathname.startsWith('/mobile') ? '/mobile' : '';

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-[#07080c] px-4 py-32 text-center text-[#f4f1eb]">
      <SEO title="Sahifa topilmadi | Luxx.uz" noIndex={true} />
      <div className="max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d6b47c]">404</p>
        <h1 className="mt-5 font-serif text-4xl font-normal leading-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-[#9aa3b2]">{copy.text}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <Link
            to={`${base}/products`}
            className="inline-flex min-h-[48px] items-center gap-3 bg-[#f4f1eb] px-7 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0f0e0d] transition-colors hover:bg-[#d6b47c]"
          >
            {copy.collection} <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link
            to={base || '/'}
            className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#d6b47c] hover:text-[#f4f1eb]"
          >
            {copy.home}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
