import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, BarChart3, ArrowRight, Sparkles, Ruler, Palette, Star, PackageCheck, Tag, Gem } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const getProductImage = (product) => {
  if (!product) return '/placeholder.jpg';
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first?.url) return first.url;
    if (first?.src) return first.src;
  }
  return '/placeholder.jpg';
};

const normalizeNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
  return 0;
};

const ProductComparison = ({ products = [], onClose, productPathPrefix = '' }) => {
  const [compareProducts, setCompareProducts] = useState(products.slice(0, 3));
  const { t } = useLanguage();

  const formatPrice = (val) => normalizeNumber(val).toLocaleString();

  const removeProduct = (idx) => {
    setCompareProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  if (compareProducts.length === 0) {
    return (
      <div className="fixed inset-0 z-[2147483000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/5 bg-[#0a0a0b] p-10 text-center shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <BarChart3 className="w-10 h-10 text-[#d6b47c]" />
          </div>
          <h3 className="text-2xl font-bold text-[#f5f5f3] mb-3">{t('productComparison.emptyTitle')}</h3>
          <p className="text-sm text-[#8a8a8d] mb-8 leading-relaxed">{t('productComparison.emptyDesc')}</p>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#d6b47c] text-black font-bold text-sm hover:bg-[#c9a46d] transition-all active:scale-[0.98]"
          >
            {t('productComparison.close')}
          </button>
        </div>
      </div>
    );
  }

  const comparisonRows = [
    {
      label: t('productComparison.price'),
      icon: Tag,
      key: 'price',
      render: (p) => <span className="text-sm font-bold text-[#d6b47c]">{formatPrice(p.price)} {t('common.sum')}</span>,
      getBest: (prods) => {
        const min = Math.min(...prods.map((p) => normalizeNumber(p.price)));
        return prods.findIndex((p) => normalizeNumber(p.price) === min);
      },
    },
    {
      label: t('productComparison.sizes'),
      icon: Ruler,
      key: 'sizes',
      render: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {(p.sizes || []).length > 0
            ? (p.sizes || []).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] border border-white/[0.08] text-[#e0e0e0] font-semibold">
                  {s}
                </span>
              ))
            : <span className="text-[11px] text-[#555]">—</span>}
        </div>
      ),
    },
    {
      label: t('productComparison.colors'),
      icon: Palette,
      key: 'colors',
      render: (p) => (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {(p.colors || []).length > 0
            ? (p.colors || []).map((c, i) => (
                <div key={`${c}-${i}`} className="w-5 h-5 rounded-full border-2 border-white/20 shadow-md" style={{ backgroundColor: c }} title={c} />
              ))
            : <span className="text-[11px] text-[#555]">—</span>}
        </div>
      ),
    },
    {
      label: t('productComparison.rating'),
      icon: Star,
      key: 'rating',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-[#d6b47c] text-[#d6b47c]" />
          <span className="text-sm font-bold text-[#f5f5f3]">{p.rating || '4.5'}</span>
        </div>
      ),
      getBest: (prods) => {
        const max = Math.max(...prods.map((p) => p.rating || 4.5));
        return prods.findIndex((p) => (p.rating || 4.5) === max);
      },
    },
    {
      label: t('productComparison.available'),
      icon: PackageCheck,
      key: 'stock',
      render: (p) => (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          (p.stock || 10) > 0
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${(p.stock || 10) > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {(p.stock || 10) > 0 ? t('productComparison.available') : t('productComparison.outOfStock')}
        </div>
      ),
    },
    {
      label: t('productComparison.material'),
      icon: Sparkles,
      key: 'material',
      render: (p) => <span className="text-[11px] text-[#c8c8c8]">{p.material || t('productComparison.naturalFabrics')}</span>,
    },
    {
      label: t('productComparison.category'),
      icon: Sparkles,
      key: 'category',
      render: (p) => <span className="text-[11px] text-[#c8c8c8]">{p.category || t('productComparison.premium')}</span>,
    },
    {
      label: t('productComparison.brand'),
      icon: Gem,
      key: 'brand',
      render: (p) => <span className="text-[11px] font-semibold italic text-[#d6b47c]">{p.brand || 'LUX'}</span>,
    },
  ];

  const colCount = compareProducts.length;

  const modal = (
    <div className="fixed inset-0 z-[2147483000] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" onClick={onClose} />

      <div
        className="relative z-10 w-full flex flex-col overflow-hidden bg-[#0d0d0f] border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.95)]"
        style={{ maxWidth: 820, borderRadius: 18, height: 'min(78dvh, 640px)' }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-[#d6b47c]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#f5f5f3] leading-tight">{t('productComparison.title')}</p>
              <p className="text-[10px] text-[#666] uppercase tracking-widest mt-0.5">{colCount} {t('productComparison.comparing')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.04] text-[#888] flex items-center justify-center hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left label column */}
          <div className="shrink-0 w-[104px] flex flex-col border-r border-white/[0.06] sm:w-[122px]">
            {/* Top image area spacer */}
            <div className="shrink-0 border-b border-white/[0.06] bg-white/[0.01]" style={{ height: 150 }}>
              <div className="h-full flex items-end px-4 pb-3">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#3a3a3a]">{t('productComparison.feature')}</span>
              </div>
            </div>

            {/* Row labels */}
            <div className="flex-1 flex flex-col">
              {comparisonRows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.key}
                    className={`flex-1 flex items-center gap-2 px-3 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.012]' : ''}`}
                  >
                    <div className="w-6 h-6 shrink-0 rounded-md bg-white/[0.04] flex items-center justify-center text-[#d6b47c]">
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#777] sm:text-[9.5px]">{row.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Action label */}
            <div className="shrink-0 border-t border-white/[0.06] px-4 py-3 bg-white/[0.01]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#3a3a3a]">{t('productComparison.action')}</span>
            </div>
          </div>

          {/* Right: product columns */}
          <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
            {compareProducts.map((product, idx) => {
              return (
                <div
                  key={product._id || product.id || idx}
                  className="min-w-[180px] flex-1 flex flex-col border-r border-white/[0.06] last:border-r-0 group"
                >
                  {/* Product card header */}
                  <div
                    className="shrink-0 relative border-b border-white/[0.06] bg-[#111113]"
                    style={{ height: 150 }}
                  >
                    <button
                      onClick={() => removeProduct(idx)}
                      className="absolute right-3 top-3 z-10 w-6 h-6 rounded-full bg-black/50 border border-white/10 text-[#666] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <div className="h-full flex flex-col items-center justify-end pb-2.5 px-3 gap-2">
                      {/* Image */}
                      <div className="w-16 h-24 rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#1a1a1d] shrink-0">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      {/* Name + price */}
                      <div className="text-center min-w-0 w-full">
                        <p className="text-[11px] font-semibold text-[#e0e0e0] line-clamp-2 leading-snug mb-1">
                          {product.name}
                        </p>
                        <p className="text-sm font-black text-[#d6b47c] leading-none">
                          {formatPrice(product.price)} <span className="font-normal text-[10px]">{t('common.sum')}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comparison values */}
                  <div className="flex-1 flex flex-col">
                    {comparisonRows.map((row, rowIdx) => {
                      const bestIdx = row.getBest ? row.getBest(compareProducts) : -1;
                      const isBest = bestIdx === idx;

                      return (
                        <div
                          key={row.key}
                          className={`flex-1 flex items-center justify-center px-4 border-b border-white/[0.04] transition-colors ${
                            rowIdx % 2 === 0 ? 'bg-white/[0.012]' : ''
                          } ${isBest ? 'bg-[#d6b47c]/[0.04]' : ''}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {row.render(product)}
                            {isBest && (
                              <div className="flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-[#d6b47c]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#d6b47c]">BEST</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action button */}
                  <div className="shrink-0 border-t border-white/[0.06] p-3">
                    <a
                      href={`${productPathPrefix}/product/${product._id || product.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/[0.08] bg-white/[0.04] text-[#c8c8c8] hover:bg-[#d6b47c] hover:text-black hover:border-[#d6b47c] transition-all"
                    >
                      {t('common.more')} <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ProductComparison;
