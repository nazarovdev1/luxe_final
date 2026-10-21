import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowUpRight, X } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageUrl } from '../utils/image';
import { formatPrice, getActiveSale } from '../utils/productDisplay';
import './searchPanel.css';

const RECENT_KEY = 'luxx_recent_searches';
const MAX_RECENT = 5;
const MAX_RESULTS = 8;

const WORDS = {
  uz: {
    kicker: 'Luxx · Qidiruv',
    placeholder: 'Nimani qidiryapsiz?',
    close: 'Yopish',
    popular: 'Ko\'p qidiriladi',
    terms: ['Palto', 'Kostyum', "Ko'ylak", 'Bluzka', 'Yubka'],
    recent: 'Siz qidirgansiz',
    clear: 'Tozalash',
    arrivals: 'Yangi kelganlar',
    found: (n) => `${n} ta topildi`,
    viewAll: (n) => `Barcha ${n} natijani ko'rish`,
    none: (q) => `"${q}" bo'yicha hech narsa topilmadi.`,
    noneHint: "Boshqa so'z bilan urinib ko'ring yoki konsyerjga yozing — topib beramiz.",
    catalogue: "Katalogni ko'rish",
    hints: ['harakat', 'ochish', 'yopish'],
  },
  ru: {
    kicker: 'Luxx · Поиск',
    placeholder: 'Что вы ищете?',
    close: 'Закрыть',
    popular: 'Часто ищут',
    terms: ['Пальто', 'Костюм', 'Платье', 'Блузка', 'Юбка'],
    recent: 'Вы искали',
    clear: 'Очистить',
    arrivals: 'Новые поступления',
    found: (n) => `Найдено: ${n}`,
    viewAll: (n) => `Смотреть все ${n}`,
    none: (q) => `По запросу «${q}» ничего не найдено.`,
    noneHint: 'Попробуйте другое слово или напишите консьержу — мы найдём.',
    catalogue: 'Открыть каталог',
    hints: ['выбор', 'открыть', 'закрыть'],
  },
  en: {
    kicker: 'Luxx · Search',
    placeholder: 'What are you looking for?',
    close: 'Close',
    popular: 'Often searched',
    terms: ['Coat', 'Suit', 'Dress', 'Blouse', 'Skirt'],
    recent: 'Your searches',
    clear: 'Clear',
    arrivals: 'New arrivals',
    found: (n) => `${n} found`,
    viewAll: (n) => `View all ${n}`,
    none: (q) => `Nothing found for "${q}".`,
    noneHint: 'Try another word, or write to the concierge — we will find it.',
    catalogue: 'Browse the catalogue',
    hints: ['move', 'open', 'close'],
  },
};

// Uzbek is typed with several apostrophe variants (o' o‘ o`); treat them as one.
const normalize = (value) => String(value || '')
  .toLowerCase()
  .replace(/[‘’ʻʼ`´]/g, "'")
  .trim();

const searchable = (product) => normalize([product.name, product.category, product.brand].filter(Boolean).join(' '));

const productId = (product) => product.id || product._id;

const readRecent = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(saved) ? saved.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};

const writeRecent = (list) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
};

// Wraps the matched part of a name in a gold mark.
const Highlight = ({ text, query }) => {
  const source = String(text || '');
  const index = normalize(source).indexOf(normalize(query));
  if (!query || index < 0) return source;
  return (
    <>
      {source.slice(0, index)}
      <mark>{source.slice(index, index + query.trim().length)}</mark>
      {source.slice(index + query.trim().length)}
    </>
  );
};

const ResultCard = ({ product, query, active, onOpen, onHover }) => {
  const sale = getActiveSale(product);
  return (
    <button
      type="button"
      className={`sp-card ${active ? 'is-active' : ''}`}
      onClick={onOpen}
      onMouseEnter={onHover}
      data-sp-reveal
    >
      <span className="sp-card__frame">
        <img src={getImageUrl(product)} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="sp-card__meta">
        {product.brand && <span className="sp-card__brand">{product.brand}</span>}
        <span className="sp-card__name"><Highlight text={product.name} query={query} /></span>
        <span className="sp-card__price">
          {formatPrice(product.price)}
          {sale.active && <s>{formatPrice(sale.originalPrice)}</s>}
        </span>
      </span>
    </button>
  );
};

const SearchModal = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(-1);
  const [recent, setRecent] = useState(readRecent);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const closingRef = useRef(false);

  const index = useMemo(
    () => (products || []).filter(Boolean).map((product) => ({ product, text: searchable(product) })),
    [products],
  );

  const term = normalize(query);
  const matches = useMemo(
    () => (term ? index.filter((item) => item.text.includes(term)).map((item) => item.product) : []),
    [index, term],
  );
  const results = matches.slice(0, MAX_RESULTS);
  const arrivals = useMemo(() => (products || []).filter(Boolean).slice(-4).reverse(), [products]);

  // Mount on open; on close, play the exit before unmounting.
  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
      setMounted(true);
    }
  }, [isOpen]);

  const finishClose = useCallback(() => {
    setMounted(false);
    setQuery('');
    setSelected(-1);
  }, []);

  useEffect(() => {
    if (isOpen || !mounted || closingRef.current) return;
    closingRef.current = true;
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
      return;
    }
    gsap.timeline({ onComplete: finishClose })
      .to(root.querySelectorAll('[data-sp-reveal]'), { y: -12, autoAlpha: 0, duration: 0.25, stagger: 0.015, ease: 'power2.in' }, 0)
      .to(root.querySelector('.sp-panel'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' }, 0.05)
      .to(root.querySelector('.sp-scrim'), { autoAlpha: 0, duration: 0.4 }, 0.2);
  }, [isOpen, mounted, finishClose]);

  // Entrance: the curtain drops from under the navbar, then the words and pieces settle in.
  useLayoutEffect(() => {
    if (!mounted || !isOpen) return undefined;
    const root = rootRef.current;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus({ preventScroll: true });
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => { document.body.style.overflow = ''; };
    }

    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.sp-scrim', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo('.sp-panel', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' }, 0)
        .from('.sp-head__line', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.35)
        .from('[data-sp-reveal]', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.035 }, 0.4);
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [mounted, isOpen]);

  // New results rise in as the query changes.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !term || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(root.querySelectorAll('.sp-results [data-sp-reveal]'),
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.03, ease: 'power3.out', overwrite: true });
  }, [term, results.length]);

  const remember = (value) => {
    const clean = value.trim();
    if (!clean) return;
    const next = [clean, ...recent.filter((item) => normalize(item) !== normalize(clean))].slice(0, MAX_RECENT);
    setRecent(next);
    writeRecent(next);
  };

  const openProduct = (product) => {
    remember(query);
    navigate(`/product/${productId(product)}`);
    onClose();
  };

  const openAll = () => {
    remember(query);
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products');
    onClose();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setSelected((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setSelected((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selected >= 0 && results.at(selected)) openProduct(results.at(selected));
      else if (results.length === 1) openProduct(results.at(0));
      else if (term) openAll();
    }
  };

  const pick = (value) => {
    setQuery(value);
    setSelected(-1);
    inputRef.current?.focus();
  };

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div ref={rootRef} className="sp" role="dialog" aria-modal="true" aria-label={w.placeholder} onKeyDown={onKeyDown}>
      <div className="sp-scrim" onClick={onClose} aria-hidden="true" />
      <div className="sp-panel" data-lenis-prevent>
        <div className="sp-inner">
          <div className="sp-top" data-sp-reveal>
            <span className="sp-kicker">{w.kicker}</span>
            <button type="button" className="sp-close" onClick={onClose}>
              {w.close}
              <kbd>Esc</kbd>
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="sp-head">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setSelected(-1); }}
              placeholder={w.placeholder}
              className="sp-input"
              spellCheck="false"
              autoComplete="off"
              aria-label={w.placeholder}
            />
            {query && (
              <button type="button" className="sp-clear" onClick={() => pick('')} aria-label={w.clear}>
                <X className="h-5 w-5" />
              </button>
            )}
            <span className="sp-head__line" aria-hidden="true" />
          </label>

          {!term ? (
            <div className="sp-idle">
              <div className="sp-col">
                <p className="sp-label" data-sp-reveal>{w.popular}</p>
                <ol className="sp-terms">
                  {w.terms.map((item, i) => (
                    <li key={item} data-sp-reveal>
                      <button type="button" onClick={() => pick(item)}>
                        <span className="sp-terms__num">{String(i + 1).padStart(2, '0')}</span>
                        {item}
                      </button>
                    </li>
                  ))}
                </ol>
                {recent.length > 0 && (
                  <div className="sp-recent" data-sp-reveal>
                    <div className="sp-recent__head">
                      <p className="sp-label">{w.recent}</p>
                      <button type="button" onClick={() => { setRecent([]); writeRecent([]); }}>{w.clear}</button>
                    </div>
                    <div className="sp-recent__list">
                      {recent.map((item) => (
                        <button key={item} type="button" onClick={() => pick(item)}>{item}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {arrivals.length > 0 && (
                <div className="sp-col sp-col--wide">
                  <div className="sp-row-head" data-sp-reveal>
                    <p className="sp-label">{w.arrivals}</p>
                    <button type="button" className="sp-link" onClick={openAll}>
                      {w.catalogue}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="sp-grid sp-grid--four">
                    {arrivals.map((product) => (
                      <ResultCard key={productId(product)} product={product} query="" onOpen={() => openProduct(product)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results.length ? (
            <div className="sp-results">
              <div className="sp-row-head" data-sp-reveal>
                <p className="sp-label">{w.found(matches.length)}</p>
                {matches.length > results.length && (
                  <button type="button" className="sp-link" onClick={openAll}>
                    {w.viewAll(matches.length)}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="sp-grid">
                {results.map((product, i) => (
                  <ResultCard
                    key={productId(product)}
                    product={product}
                    query={query}
                    active={selected === i}
                    onOpen={() => openProduct(product)}
                    onHover={() => setSelected(i)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="sp-results sp-empty">
              <p className="sp-empty__title" data-sp-reveal>{w.none(query.trim())}</p>
              <p className="sp-empty__hint" data-sp-reveal>{w.noneHint}</p>
              <div className="sp-recent__list" data-sp-reveal>
                {w.terms.map((item) => (
                  <button key={item} type="button" onClick={() => pick(item)}>{item}</button>
                ))}
              </div>
            </div>
          )}

          <div className="sp-foot" data-sp-reveal>
            <span><kbd>↑</kbd><kbd>↓</kbd>{w.hints[0]}</span>
            <span><kbd>Enter</kbd>{w.hints[1]}</span>
            <span><kbd>Esc</kbd>{w.hints[2]}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SearchModal;
