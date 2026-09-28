import React from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FilterDrawer = ({ isOpen, onClose, categories, selectedCategory, onCategoryChange, searchText, onSearchChange, sortBy, onSortChange }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;
  const sortOptions = [
    { label: t('filterDrawer.sortFeatured'), value: 'featured' },
    { label: t('filterDrawer.sortNew'), value: 'newest' },
    { label: t('filterDrawer.sortRating'), value: 'rating' },
    { label: t('filterDrawer.sortPriceLow'), value: 'price-low' },
    { label: t('filterDrawer.sortPriceHigh'), value: 'price-high' },
  ];

  return createPortal((
    <div className="catalogue-drawer" role="dialog" aria-modal="true" aria-label={t('filterDrawer.title')}>
      <button type="button" className="catalogue-drawer__backdrop" onClick={onClose} aria-label={t('common.close', 'Yopish')} />
      <aside className="catalogue-drawer__panel">
        <header><div><span>LUXX / EDIT</span><h2>{t('filterDrawer.title')}</h2></div><button type="button" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="catalogue-drawer__content">
          <section><label htmlFor="catalogue-search">01 / {t('common.search')}</label><div className="catalogue-drawer__search"><Search aria-hidden="true" /><input id="catalogue-search" type="search" value={searchText} onChange={(event) => onSearchChange(event.target.value)} placeholder={t('filterDrawer.searchPlaceholder')} /></div></section>
          <section><p>02 / {t('common.filter')}</p><div className="catalogue-drawer__categories">{categories.map((category) => <button type="button" key={category.name} onClick={() => onCategoryChange(category.name)} className={selectedCategory === category.name ? 'is-active' : ''}><span>{category.name}</span><small>{String(category.count).padStart(2, '0')}</small>{selectedCategory === category.name && <Check aria-hidden="true" />}</button>)}</div></section>
          <section><p>03 / {t('filterDrawer.sortLabel')}</p><div className="catalogue-drawer__sort">{sortOptions.map((option) => <button type="button" key={option.value} onClick={() => onSortChange(option.value)} className={sortBy === option.value ? 'is-active' : ''}>{option.label}{sortBy === option.value && <Check aria-hidden="true" />}</button>)}</div></section>
        </div>
        <footer><button type="button" onClick={onClose}>{t('filterDrawer.viewResults')}<ArrowRight aria-hidden="true" /></button></footer>
      </aside>
    </div>
  ), document.body);
};

export default FilterDrawer;
