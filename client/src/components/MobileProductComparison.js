import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  X,
  Check,
  BarChart3,
  ArrowRight,
  Sparkles,
  Ruler,
  Palette,
  Star,
  PackageCheck,
  Tag,
  Gem,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/* ─── helpers ─────────────────────────────────────────── */
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

/* ─── Component ───────────────────────────────────────── */
const MobileProductComparison = ({ products = [], onClose, productPathPrefix = '' }) => {
  const [compareProducts, setCompareProducts] = useState(products.slice(0, 2));
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  const fmt = (val) => normalizeNumber(val).toLocaleString();

  const removeProduct = (idx) => {
    const next = compareProducts.filter((_, i) => i !== idx);
    setCompareProducts(next);
    if (next.length === 0) onClose();
  };

  /* ── row definitions ── */
  const rows = [
    {
      label: t('productComparison.price'),
      icon: Tag,
      key: 'price',
      render: (p) => (
        <span className="text-[15px] font-black text-[#d6b47c] leading-none">
          {fmt(p.price)}
          <span className="ml-1 text-[10px] font-normal text-[#d6b47c]/60">{t('common.sum')}</span>
        </span>
      ),
      getBest: (ps) => {
        const min = Math.min(...ps.map((p) => normalizeNumber(p.price)));
        return ps.findIndex((p) => normalizeNumber(p.price) === min);
      },
    },
    {
      label: t('productComparison.sizes'),
      icon: Ruler,
      key: 'sizes',
      render: (p) =>
        (p.sizes || []).length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {(p.sizes || []).map((s) => (
              <span
                key={s}
                className="rounded border border-white/10 bg-white/6 px-2 py-0.5 text-[11px] font-semibold text-white/75"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-white/25">—</span>
        ),
    },
    {
      label: t('productComparison.colors'),
      icon: Palette,
      key: 'colors',
      render: (p) =>
        (p.colors || []).length > 0 ? (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {(p.colors || []).map((c, i) => (
              <div
                key={`${c}-${i}`}
                className="h-5 w-5 rounded-full border-2 border-white/20 shadow"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-white/25">—</span>
        ),
    },
    {
      label: t('productComparison.rating'),
      icon: Star,
      key: 'rating',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-[#d6b47c] text-[#d6b47c]" />
          <span className="text-sm font-bold text-white">{p.rating ?? '4.5'}</span>
        </div>
      ),
      getBest: (ps) => {
        const max = Math.max(...ps.map((p) => p.rating ?? 4.5));
        return ps.findIndex((p) => (p.rating ?? 4.5) === max);
      },
    },
    {
      label: t('productComparison.available'),
      icon: PackageCheck,
      key: 'stock',
      render: (p) => {
        const inStock = (p.stock ?? 10) > 0;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              inStock
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/25 bg-red-500/10 text-red-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {inStock ? t('productComparison.available') : t('productComparison.outOfStock')}
          </span>
        );
      },
    },
    {
      label: t('productComparison.material'),
      icon: Sparkles,
      key: 'material',
      render: (p) => (
        <span className="text-[12px] text-white/60 text-center leading-snug">
          {p.material || t('productComparison.naturalFabrics')}
        </span>
      ),
    },
    {
      label: t('productComparison.category'),
      icon: Sparkles,
      key: 'category',
      render: (p) => (
        <span className="text-[12px] text-white/60">{p.category || t('productComparison.premium')}</span>
      ),
    },
    {
      label: t('productComparison.brand'),
      icon: Gem,
      key: 'brand',
      render: (p) => (
        <span className="text-sm font-semibold italic text-[#d6b47c]">{p.brand || 'LUX'}</span>
      ),
    },
  ];

  if (compareProducts.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[2147483000] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/8 bg-[#0d0d0f] p-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/8">
            <BarChart3 className="h-9 w-9 text-[#d6b47c]" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">{t('productComparison.emptyTitle')}</h3>
          <p className="mb-8 text-sm leading-relaxed text-white/40">{t('productComparison.emptyDesc')}</p>
          <button onClick={onClose} className="w-full rounded-2xl bg-[#d6b47c] py-4 text-sm font-bold text-black">
            {t('productComparison.close')}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const modal = (
    <div className="fixed inset-0 z-[2147483000] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="relative z-10 mt-auto flex w-full flex-col overflow-hidden rounded-t-3xl bg-[#0d0d0f]"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* ── STICKY HEADER: always shows both products ── */}
        <div className="shrink-0 border-b border-white/8 bg-[#0d0d0f]">
          {/* Title row */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#d6b47c]/25 bg-[#d6b47c]/10">
                <BarChart3 className="h-3.5 w-3.5 text-[#d6b47c]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">{t('productComparison.title')}</p>
                <p className="text-[9px] uppercase tracking-widest text-white/30">
                  {compareProducts.length} ta mahsulot
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Product cards — BOTH always visible, no swipe */}
          <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
            {compareProducts.map((product, idx) => (
              <div
                key={product._id || product.id || idx}
                className="relative flex flex-col items-center gap-2 rounded-2xl bg-white/[0.03] p-3"
              >
                {/* Remove */}
                <button
                  onClick={() => removeProduct(idx)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/40 active:scale-90"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Image */}
                <div className="h-20 w-14 overflow-hidden rounded-xl border border-white/8 bg-[#1a1a1d] shadow-lg">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                {/* Name */}
                <p className="line-clamp-2 text-center text-[11px] font-medium leading-snug text-white/85 w-full">
                  {product.name}
                </p>

                {/* Price */}
                <p className="text-[13px] font-black text-[#d6b47c] leading-none">
                  {fmt(product.price)}
                  <span className="ml-0.5 text-[9px] font-normal text-[#d6b47c]/60">{t('common.sum')}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCROLLABLE COMPARISON ROWS ──────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {rows.map((row, rowIdx) => {
            const Icon = row.icon;

            return (
              <div
                key={row.key}

              >
                {/* Row label */}
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#d6b47c]/10">
                    <Icon className="h-2.5 w-2.5 text-[#d6b47c]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    {row.label}
                  </span>
                </div>

                {/* Values — both products side by side, always */}
                <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
                  {compareProducts.map((product, idx) => {
                    const bestIdx = row.getBest ? row.getBest(compareProducts) : -1;
                    const isBest = bestIdx === idx;

                    return (
                      <div
                        key={product._id || product.id || idx}
                        className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 ${
                          isBest ? 'bg-[#d6b47c]/[0.05]' : ''
                        }`}
                      >
                        {row.render(product)}
                        {isBest && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#d6b47c]/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#d6b47c]">
                            <Check className="h-2 w-2" /> BEST
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── CTA buttons ── */}
          <div className="px-4 py-5">
            <div className="grid grid-cols-2 gap-3">
              {compareProducts.map((product, idx) => (
                <Link
                  key={product._id || product.id || idx}
                  to={`${productPathPrefix}/product/${product._id || product.id}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#d6b47c]/25 bg-[#d6b47c]/8 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#d6b47c] transition-colors active:bg-[#d6b47c] active:text-black"
                >
                  {t('common.more')} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Safe area */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default MobileProductComparison;
