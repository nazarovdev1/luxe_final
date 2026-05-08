import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, X, Clock, TrendingUp, Package, ArrowRight } from 'lucide-react';

const RECENT_KEY = 'luxx_recent_searches';
const MAX_RECENT = 5;

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [selected, setSelected] = useState(-1);
  const { products } = useProducts();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const TRENDING_TERMS = [t('search.trending1'), t('search.trending2'), t('search.trending3'), t('search.trending4'), t('search.trending5')];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecent = useCallback((term) => {
    if (!term.trim()) return;
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const updated = [term, ...saved.filter(t => t !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(products.filter(p => p.name.toLowerCase().includes(q)));
    setSelected(-1);
  }, [query, products]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(i => results.length ? (i + 1) % results.length : -1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(i => results.length ? (i - 1 + results.length) % results.length : -1);
      } else if (e.key === 'Enter' && selected >= 0 && results[selected]) {
        e.preventDefault();
        goProduct(results[selected].id);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, results, selected]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelected(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selected >= 0 && listRef.current) {
      const el = listRef.current.children[selected];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const goProduct = (id) => {
    saveRecent(query);
    navigate(`/product/${id}`);
    onClose();
    setQuery('');
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[14vh] bg-black/60 backdrop-blur-xl"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ animation: 'searchFadeIn .15s ease-out' }}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/98 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        style={{ animation: 'searchScaleIn .2s cubic-bezier(.16,1,.3,1)' }}
      >
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-white/[0.06]">
          <Search className="w-[18px] h-[18px] text-[#d6b47c] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent text-[#f4f1eb] text-[15px] placeholder:text-[#444] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 rounded-md hover:bg-white/[0.06] text-[#555] hover:text-[#999] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:block px-2 py-1 rounded-lg bg-white/[0.05] text-[10px] text-[#555] font-mono tracking-wide">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {!query.trim() ? (
            <div className="p-5">
              {recent.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-semibold">{t('search.recentTitle')}</span>
                    <button
                      onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                      className="text-[10px] uppercase tracking-[0.15em] text-[#444] hover:text-[#d6b47c] transition-colors"
                    >
                      {t('search.recentClear')}
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {recent.map(term => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[#888] hover:text-[#f4f1eb] hover:bg-white/[0.04] transition-colors"
                      >
                        <Clock className="w-[14px] h-[14px] text-[#3a3a3a]" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#858585] font-semibold">{t('search.trendingTitle')}</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TRENDING_TERMS.map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/[0.07] text-[13px] text-[#777] hover:text-[#d6b47c] hover:border-[#d6b47c]/25 hover:bg-[#d6b47c]/[0.04] transition-all duration-200"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-5 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                <Package className="w-6 h-6 text-[#333]" />
              </div>
              <p className="text-sm text-[#555]">
                <span className="text-[#888] font-medium">"{query}"</span> {t('search.noResults')}
              </p>
            </div>
          ) : (
            <div className="p-2">
              <p className="px-3 py-1.5 text-[11px] text-[#555] font-medium">{results.length} {t('search.resultsCount')}</p>
              <div ref={listRef} className="space-y-0.5">
                {results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => goProduct(product.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-150 ${selected === i
                      ? 'bg-white/[0.07] ring-1 ring-[#d6b47c]/20'
                      : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 object-cover rounded-lg shrink-0 bg-white/[0.03]"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        {product.badge && (
                          <span className={`shrink-0 text-[8px] px-1.5 py-px rounded uppercase font-bold tracking-wider ${product.badge === 'NEW'
                            ? 'bg-white/[0.08] text-[#ccc]'
                            : 'bg-[#d6b47c] text-[#0a0a0a]'
                          }`}>
                            {product.badge}
                          </span>
                        )}
                        <span className="text-sm text-[#f4f1eb] font-medium truncate">{product.name}</span>
                      </div>
                      <span className="text-[11px] text-[#555]">{product.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-[#f4f1eb] font-semibold">{product.price}</div>
                      <ArrowRight className="w-3 h-3 text-[#444] ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 px-5 py-3 border-t border-white/[0.06]">
          <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#d1c9c9] text-[9px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#d1c9c9] text-[9px] font-mono">↓</kbd>
            <span className='text-[#d1c9c9]'>harakatlanish</span>
            
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#d1c9c9] text-[9px] font-mono">↵</kbd>
            <span className='text-[#d1c9c9]'>tanlash</span>
            
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-[#444]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#d1c9c9] text-[9px] font-mono">esc</kbd>
            <span className='text-[#d1c9c9]'>yopish</span>
            
          </span>
        </div>
      </div>

      <style>{`
        @keyframes searchFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes searchScaleIn { from { opacity: 0; transform: scale(.97) translateY(-6px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>,
    document.body
  );
};

export default SearchModal;
