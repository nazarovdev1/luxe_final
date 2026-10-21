import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import { openMobileSearch } from '../../components/mobile/MobileLayout';
import { Empty, ProductGrid, Sheet, TopBar } from '../ui';
import './catalogue.css';

const PAGE = 12;

const WORDS = {
  uz: {
    title: 'Katalog',
    all: 'Hammasi',
    newOnly: 'Yangi',
    count: (n) => `${n} ta model`,
    sort: 'Saralash',
    sorts: { new: 'Avval yangilari', priceAsc: 'Arzonroq avval', priceDesc: 'Qimmatroq avval' },
    more: "Yana ko'rsatish",
    emptyTitle: 'Hech narsa topilmadi',
    emptyText: "Filtrni o'zgartirib ko'ring yoki barcha modellarni ko'ring.",
    reset: 'Filtrni tozalash',
    searchFor: 'Qidiruv',
  },
  ru: {
    title: 'Каталог',
    all: 'Все',
    newOnly: 'Новинки',
    count: (n) => `${n} моделей`,
    sort: 'Сортировка',
    sorts: { new: 'Сначала новые', priceAsc: 'Сначала дешевле', priceDesc: 'Сначала дороже' },
    more: 'Показать ещё',
    emptyTitle: 'Ничего не найдено',
    emptyText: 'Измените фильтр или посмотрите все модели.',
    reset: 'Сбросить фильтр',
    searchFor: 'Поиск',
  },
  en: {
    title: 'Catalogue',
    all: 'All',
    newOnly: 'New',
    count: (n) => `${n} pieces`,
    sort: 'Sort',
    sorts: { new: 'Newest first', priceAsc: 'Price: low to high', priceDesc: 'Price: high to low' },
    more: 'Show more',
    emptyTitle: 'Nothing found',
    emptyText: 'Change the filter or browse every piece.',
    reset: 'Clear filter',
    searchFor: 'Search',
  },
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[‘’ʻʼ`´]/g, "'").trim();
const toNumber = (value) => (typeof value === 'number' ? value : Number(String(value || '').replace(/[^\d.]/g, '')) || 0);
const isNew = (product) => product.isNewCollection === true || String(product.badge || '').toUpperCase() === 'NEW';

export default function Catalogue() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const { products, isLoading } = useProducts();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const newOnly = params.get('filter') === 'new';
  const query = params.get('q') || '';
  const [sort, setSort] = useState('new');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE);

  const list = useMemo(() => (products || []).filter(Boolean), [products]);
  const categories = useMemo(() => {
    const counts = new Map();
    list.forEach((product) => { if (product.category) counts.set(product.category, (counts.get(product.category) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [list]);

  const filtered = useMemo(() => {
    const term = normalize(query);
    const result = list.filter((product) => (
      (!category || product.category === category)
      && (!newOnly || isNew(product))
      && (!term || normalize(`${product.name} ${product.category} ${product.brand || ''}`).includes(term))
    ));
    const sorted = [...result];
    if (sort === 'priceAsc') sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
    else if (sort === 'priceDesc') sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
    else sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return sorted;
  }, [list, category, newOnly, query, sort]);

  useEffect(() => { setVisible(PAGE); }, [category, newOnly, query, sort]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next, { replace: true });
  };

  const loading = isLoading && !list.length;
  const filtersOn = Boolean(category || newOnly || query);

  return (
    <div className="m-page mc">
      <TopBar
        title={w.title}
        back={false}
        right={(
          <button type="button" className="m-icon-btn" onClick={openMobileSearch} aria-label={w.searchFor}>
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      />

      <div className="mc-filters">
        <div className="m-chips m-pad" role="tablist">
          <button type="button" className={`m-chip ${!category && !newOnly ? 'is-on' : ''}`} onClick={() => update({ category: '', filter: '' })}>{w.all}</button>
          <button type="button" className={`m-chip ${newOnly ? 'is-on' : ''}`} onClick={() => update({ filter: newOnly ? '' : 'new' })}>{w.newOnly}</button>
          {categories.map((name) => (
            <button key={name} type="button" className={`m-chip ${category === name ? 'is-on' : ''}`} onClick={() => update({ category: category === name ? '' : name })}>
              {name}
            </button>
          ))}
        </div>
        <div className="mc-tools m-pad">
          {query ? (
            <button type="button" className="mc-query" onClick={() => update({ q: '' })}>
              «{query}» <X className="h-3.5 w-3.5" />
            </button>
          ) : <span className="m-small">{loading ? '' : w.count(filtered.length)}</span>}
          <button type="button" className="mc-sort" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            {w.sorts[sort]}
          </button>
        </div>
      </div>

      <div className="m-pad mc-body">
        {!loading && !filtered.length ? (
          <Empty
            icon={Search}
            title={w.emptyTitle}
            text={w.emptyText}
            action={filtersOn && <button type="button" className="m-btn m-btn--ghost" onClick={() => update({ category: '', filter: '', q: '' })}>{w.reset}</button>}
          />
        ) : (
          <>
            <ProductGrid products={filtered.slice(0, visible)} loading={loading} skeletons={6} />
            {visible < filtered.length && (
              <button type="button" className="m-btn m-btn--ghost m-btn--block mc-more" onClick={() => setVisible((n) => n + PAGE)}>
                {w.more} · {filtered.length - visible}
              </button>
            )}
          </>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={w.sort}>
        <div className="m-rows">
          {Object.entries(w.sorts).map(([key, label]) => (
            <button key={key} type="button" className="m-row" onClick={() => { setSort(key); setSheetOpen(false); }}>
              {label}
              {sort === key && <span className="m-row__end"><Check className="h-4 w-4" /></span>}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
