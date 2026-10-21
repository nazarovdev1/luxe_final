import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, RefreshCw, WifiOff } from 'lucide-react';
import SEO from '../../components/SEO';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import { Empty, SoftImage, TopBar } from '../ui';
import './lookbooks.css';

const WORDS = {
  uz: {
    title: 'Obrazlar',
    kicker: 'Lookbook',
    heading: ['Tayyor', 'obrazlar'],
    lead: "Stilistlarimiz bir-biriga mos qilib yig'gan to'plamlar. Obrazni oching va bir bosishda savatga qo'shing.",
    all: 'Barchasi',
    look: 'Obraz',
    pieces: (n) => `${n} ta buyum`,
    count: (n) => `${n} ta obraz`,
    empty: "Bu bo'limda hozircha obraz yo'q",
    emptyText: 'Boshqa toifani tanlang yoki barcha obrazlarni ko‘ring.',
    errorTitle: 'Obrazlar ochilmadi',
    errorText: "Internet yoki server bilan aloqa uzildi. Qayta urinib ko'ring.",
    retry: 'Qayta urinish',
    shop: "Katalogga o'tish",
  },
  ru: {
    title: 'Образы',
    kicker: 'Лукбук',
    heading: ['Готовые', 'образы'],
    lead: 'Комплекты, которые наши стилисты собрали вместе. Откройте образ и добавьте его в корзину одним нажатием.',
    all: 'Все',
    look: 'Образ',
    pieces: (n) => `${n} шт.`,
    count: (n) => `Образов: ${n}`,
    empty: 'В этом разделе пока нет образов',
    emptyText: 'Выберите другую категорию или посмотрите все образы.',
    errorTitle: 'Образы не открылись',
    errorText: 'Нет связи с интернетом или сервером. Попробуйте ещё раз.',
    retry: 'Повторить',
    shop: 'В каталог',
  },
  en: {
    title: 'Looks',
    kicker: 'Lookbook',
    heading: ['Complete', 'looks'],
    lead: 'Outfits our stylists put together. Open a look and add the whole thing to your bag in one tap.',
    all: 'All',
    look: 'Look',
    pieces: (n) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
    count: (n) => `${n} ${n === 1 ? 'look' : 'looks'}`,
    empty: 'No looks here yet',
    emptyText: 'Pick another category or browse every look.',
    errorTitle: 'Looks did not load',
    errorText: 'The connection to the internet or server dropped. Please try again.',
    retry: 'Try again',
    shop: 'Go to the catalogue',
  },
};

export const lookIdOf = (look) => look?._id || look?.id;

export const lookImageOf = (look) => look?.heroImage || getImageUrl(look, '/mobile.jpg');

const pieceCount = (look) => (look.products?.length
  ? look.products.length
  : (look.items || []).reduce((sum, item) => sum + (item.count || 1), 0));

const LookSkeleton = () => (
  <div className="mlb-card" aria-hidden="true">
    <div className="m-skel" style={{ aspectRatio: '4 / 5' }} />
    <div className="m-skel m-skel--line" style={{ width: '30%' }} />
    <div className="m-skel m-skel--line" style={{ width: '70%', height: 20 }} />
  </div>
);

export default function Lookbooks() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const result = await apiFetch('/api/looks', { signal: controller.signal });
      if (result.success && Array.isArray(result.data)) setLooks(result.data);
      else setFailed(true);
    } catch (error) {
      console.error('Failed to fetch looks:', error);
      setFailed(true);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const found = new Set();
    looks.forEach((look) => (look.items || []).forEach((item) => item.category && found.add(item.category)));
    return Array.from(found);
  }, [looks]);

  const shown = useMemo(() => (filter === 'all'
    ? looks
    : looks.filter((look) => (look.items || []).some((item) => item.category === filter))), [looks, filter]);

  return (
    <div className="m-page mlb">
      <SEO title={w.title} canonicalPath="/lookbooks" />
      <TopBar title={w.title} back={false} />

      <header className="mlb-head m-pad">
        <p className="m-kicker">{w.kicker}</p>
        <h1 className="m-h1">{w.heading[0]} <em>{w.heading[1]}</em></h1>
        <p className="m-body">{w.lead}</p>
      </header>

      {failed ? (
        <Empty
          icon={WifiOff}
          title={w.errorTitle}
          text={w.errorText}
          action={<button type="button" className="m-btn m-btn--ghost" onClick={load}><RefreshCw className="h-4 w-4" />{w.retry}</button>}
        />
      ) : (
        <>
          {categories.length > 1 && (
            <div className="m-chips m-pad mlb-chips" role="group" aria-label={w.title}>
              {['all', ...categories].map((cat) => (
                <button key={cat} type="button" className={`m-chip ${filter === cat ? 'is-on' : ''}`} aria-pressed={filter === cat} onClick={() => setFilter(cat)}>
                  {cat === 'all' ? w.all : cat}
                </button>
              ))}
            </div>
          )}

          {!loading && <p className="m-small m-pad mlb-count">{w.count(shown.length)}</p>}

          <div className="mlb-list m-pad">
            {loading && !looks.length
              ? [0, 1].map((i) => <LookSkeleton key={i} />)
              : shown.map((look, index) => {
                const count = pieceCount(look);
                return (
                  <Link key={lookIdOf(look)} to={`/mobile/lookbooks/${lookIdOf(look)}`} className="mlb-card">
                    <span className="mlb-card__frame">
                      <SoftImage src={lookImageOf(look)} alt={look.title} eager={index === 0} />
                      <span className="mlb-card__no">{String(index + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="mlb-card__meta">
                      <span className="m-kicker">{w.look}{count ? ` · ${w.pieces(count)}` : ''}</span>
                      <span className="mlb-card__title">{look.title}</span>
                      {look.description && <span className="mlb-card__text">{look.description}</span>}
                    </span>
                  </Link>
                );
              })}
          </div>

          {!loading && !shown.length && (
            <Empty
              icon={Camera}
              title={w.empty}
              text={w.emptyText}
              action={filter !== 'all'
                ? <button type="button" className="m-link" onClick={() => setFilter('all')}>{w.all}</button>
                : <Link to="/mobile/products" className="m-link">{w.shop}</Link>}
            />
          )}
        </>
      )}
    </div>
  );
}
