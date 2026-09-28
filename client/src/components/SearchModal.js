import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Package, 
  ArrowRight, 
  ShoppingBag, 
  Gem, 
  Crown,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';

const RECENT_KEY = 'luxx_recent_searches';
const MAX_RECENT = 6;

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

  const TRENDING_TERMS = [
    { label: t('search.trending1', 'Kostyum'), icon: Crown },
    { label: t('search.trending2', "Ko'ylak"), icon: Gem },
    { label: t('search.trending3', 'Poyabzal'), icon: ShoppingBag },
    { label: t('search.trending4', 'Sumka'), icon: ShoppingBag },
    { label: t('search.trending5', 'Kurtka'), icon: Package }
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecent = useCallback((term) => {
    if (!term || !term.trim()) return;
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const updated = [term.trim(), ...saved.filter(t => t.toLowerCase() !== term.trim().toLowerCase())].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  }, []);

  const removeRecent = (termToRemove, e) => {
    e.stopPropagation();
    try {
      const updated = recent.filter(t => t !== termToRemove);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  };

  const clearAllRecent = () => {
    try {
      localStorage.removeItem(RECENT_KEY);
      setRecent([]);
    } catch {}
  };

  useEffect(() => {
    if (!query.trim()) { 
      setResults([]); 
      return; 
    }
    const q = query.toLowerCase().trim();
    const matched = (products || []).filter(p => {
      const nameMatch = p.name && p.name.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().includes(q);
      return nameMatch || catMatch;
    });
    setResults(matched);
    setSelected(-1);
  }, [query, products]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { 
        onClose(); 
        return; 
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(i => results.length ? (i + 1) % results.length : -1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(i => results.length ? (i - 1 + results.length) % results.length : -1);
      } else if (e.key === 'Enter' && selected >= 0 && results[selected]) {
        e.preventDefault();
        goProduct(results[selected].id || results[selected]._id);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, results, selected]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelected(-1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (selected >= 0 && listRef.current) {
      const el = listRef.current.children[selected];
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const goProduct = (id) => {
    if (query.trim()) {
      saveRecent(query);
    }
    navigate(`/product/${id}`);
    onClose();
    setQuery('');
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price.toLocaleString('uz-UZ')} so'm`;
    }
    return price || '';
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[7vh] sm:pt-[12vh] px-4 bg-black/80 backdrop-blur-2xl transition-all duration-300 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ animation: 'searchFadeIn .2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Mahsulot qidirish"
    >
      {/* Ambient gold glow behind modal */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#d6b47c]/15 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-[#0c0d12]/95 border border-[#d6b47c]/25 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_60px_rgba(214,180,124,0.1)] overflow-hidden backdrop-blur-3xl transition-all mb-12"
        style={{ animation: 'searchScaleIn .25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Top gold accent line with subtle shimmer */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#d6b47c] to-transparent pointer-events-none" />

        {/* Search Header Bar */}
        <div className="flex items-center gap-3.5 px-6 h-[72px] border-b border-white/[0.08] bg-white/[0.01]">
          <div className="w-10 h-10 rounded-2xl bg-[#d6b47c]/10 border border-[#d6b47c]/25 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(214,180,124,0.15)]">
            <Search className="w-5 h-5 text-[#d6b47c]" />
          </div>
          
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.placeholder', 'Mahsulot qidirish...')}
            className="flex-1 bg-transparent text-[#f4f1eb] text-base sm:text-lg font-medium placeholder:text-[#555] focus:outline-none"
            autoFocus
          />

          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all active:scale-90"
              aria-label="Tozalash"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] text-[#ad9b91] font-mono tracking-wider shadow-inner">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl bg-white/[0.04] text-gray-400 active:scale-90"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain luxury-scrollbar">
          {!query.trim() ? (
            <div className="p-6 sm:p-7 space-y-7">
              {/* Recent searches */}
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#d6b47c] font-bold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#d6b47c]" />
                      {t('search.recentTitle', "So'nggi qidiruvlar")}
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[10px] uppercase tracking-[0.18em] text-[#888] hover:text-[#d6b47c] transition-colors"
                    >
                      {t('search.recentClear', 'Barchasini tozalash')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map(term => (
                      <div
                        key={term}
                        onClick={() => setQuery(term)}
                        className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#d6b47c]/40 hover:bg-[#d6b47c]/10 transition-all cursor-pointer shadow-sm"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#d6b47c] transition-colors" />
                        <span>{term}</span>
                        <button
                          onClick={(e) => removeRecent(term, e)}
                          className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches & categories */}
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#d6b47c] font-bold flex items-center gap-2 mb-3.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#d6b47c]" />
                  {t('search.trendingTitle', 'Mashhur qidiruvlar')}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {TRENDING_TERMS.map(({ label, icon: IconComponent }) => (
                    <button
                      key={label}
                      onClick={() => setQuery(label)}
                      className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-gray-300 hover:text-[#d6b47c] hover:border-[#d6b47c]/40 hover:bg-[#d6b47c]/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm"
                    >
                      <IconComponent className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#d6b47c] transition-colors" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editorial discovery note */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center text-[#d6b47c]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#f4f1eb]">Yangi Kolleksiya 2026</p>
                    <p className="text-[11px] text-[#888]">Eng sara premium ayollar kiyimlari</p>
                  </div>
                </div>
                <button
                  onClick={() => { navigate('/products'); onClose(); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#d6b47c] hover:text-white transition-colors"
                >
                  <span>Katalog</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-[#d6b47c]/10 border border-[#d6b47c]/25 flex items-center justify-center shadow-[0_0_30px_rgba(214,180,124,0.15)]">
                <Package className="w-7 h-7 text-[#d6b47c]" />
              </div>
              <h3 className="font-serif text-xl text-[#f4f1eb] font-normal mb-2">Mahsulot topilmadi</h3>
              <p className="text-sm text-[#888] max-w-sm mx-auto mb-6">
                <span className="text-[#f4f1eb] font-semibold">"{query}"</span> {t('search.noResults', "uchun hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring.")}
              </p>
              <button
                onClick={() => { navigate('/products'); onClose(); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d6b47c] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
              >
                <span>Barcha mahsulotlar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between px-3 pb-3 mb-2 border-b border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d6b47c]">
                  {results.length} {t('search.resultsCount', 'ta natija')}
                </span>
                <span className="text-[11px] text-[#888] font-medium">Tanlash uchun ustiga bosing</span>
              </div>

              <div ref={listRef} className="space-y-1.5">
                {results.map((product, i) => {
                  const productId = product.id || product._id;
                  const imageUrl = product.image || product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg';
                  const isSelected = selected === i;

                  return (
                    <button
                      key={productId || i}
                      onClick={() => goProduct(productId)}
                      className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-200 group text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#d6b47c]/20 via-white/[0.05] to-transparent border-l-4 border-[#d6b47c] shadow-lg translate-x-1'
                          : 'hover:bg-white/[0.04] border-l-4 border-transparent'
                      }`}
                    >
                      <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-[#161618] border border-white/10 shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {product.badge && (
                            <span className="shrink-0 text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-[#d6b47c]/20 text-[#d6b47c] border border-[#d6b47c]/30">
                              {product.badge}
                            </span>
                          )}
                          <span className="text-sm sm:text-base text-[#f4f1eb] font-medium truncate group-hover:text-[#d6b47c] transition-colors">
                            {product.name}
                          </span>
                        </div>
                        <p className="text-xs text-[#888] mb-1.5">{product.category || 'Luxe Collection'}</p>
                        <div className="text-sm sm:text-base font-bold text-[#d6b47c]">
                          {formatPrice(product.price)}
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <div className="w-9 h-9 rounded-full bg-white/[0.04] group-hover:bg-[#d6b47c] text-gray-400 group-hover:text-black flex items-center justify-center transition-all duration-300 shadow-md">
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.06] bg-black/40">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-white/80 font-mono text-[9px] shadow-sm">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-white/80 font-mono text-[9px] shadow-sm">↓</kbd>
              <span className="text-gray-300">{t('searchModal.navigate', 'harakatlanish')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-white/80 font-mono text-[9px] shadow-sm flex items-center gap-0.5">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span className="text-gray-300">{t('searchModal.select', 'tanlash')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10 text-white/80 font-mono text-[9px] shadow-sm">esc</kbd>
              <span className="text-gray-300">{t('searchModal.close', 'yopish')}</span>
            </span>
          </div>

          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] font-bold text-[#d6b47c]/60">
            LUXX COUTURE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes searchScaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-14px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .luxury-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .luxury-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(214, 180, 124, 0.25);
          border-radius: 9999px;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(214, 180, 124, 0.45);
        }
      `}</style>
    </div>,
    document.body
  );
};

export default SearchModal;
