import React, { useState } from 'react';
import { X, Plus, Minus, Check, BarChart3, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProductComparison = ({ products = [], onClose }) => {
  const [compareProducts, setCompareProducts] = useState(products.slice(0, 3));
  const { t } = useLanguage();

  const formatPrice = (val) => Number(val || 0).toLocaleString();

  const removeProduct = (idx) => {
    setCompareProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  if (compareProducts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] p-8 text-center">
          <BarChart3 className="w-12 h-12 text-[#3f4658] mx-auto mb-4" />
          <h3 className="text-xl text-[#f4f1eb] mb-2">{t('productComparison.emptyTitle')}</h3>
          <p className="text-sm text-[#9aa3b2] mb-6">{t('productComparison.emptyDesc')}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#d6b47c] text-black font-semibold text-sm hover:bg-[#c9a46d] transition-colors"
          >
            {t('productComparison.close')}
          </button>
        </div>
      </div>
    );
  }

  // Comparison attributes
  const comparisonRows = [
    {
      label: t('productComparison.price'),
      key: 'price',
      render: (p) => (
        <span className="text-lg font-bold text-[#d6b47c]">{formatPrice(p.price)} {t('common.sum')}</span>
      ),
      getBest: (prods) => {
        const min = Math.min(...prods.map((p) => p.price));
        return prods.findIndex((p) => p.price === min);
      },
    },
    {
      label: t('productComparison.sizes'),
      key: 'sizes',
      render: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {(p.sizes || []).map((s) => (
            <span key={s} className="px-2 py-0.5 rounded text-xs bg-white/5 border border-white/5 text-[#9aa3b2]">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: t('productComparison.colors'),
      key: 'colors',
      render: (p) => (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {(p.colors || []).map((c, i) => (
            <span
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white/10"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      ),
    },
    {
      label: t('productComparison.rating'),
      key: 'rating',
      render: (p) => (
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-[#d6b47c] text-sm">★</span>
          <span className="text-sm font-medium text-[#f4f1eb]">{p.rating || '4.5'}</span>
        </div>
      ),
      getBest: (prods) => {
        const max = Math.max(...prods.map((p) => p.rating || 4.5));
        return prods.findIndex((p) => (p.rating || 4.5) === max);
      },
    },
    {
      label: t('productComparison.available'),
      key: 'stock',
      render: (p) => (
        <span className={`text-sm font-medium ${(p.stock || 10) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {(p.stock || 10) > 0 ? `✓ ${t('productComparison.available')} (${p.stock || 10})` : `✗ ${t('productComparison.outOfStock')}`}
        </span>
      ),
    },
    {
      label: t('productComparison.category'),
      key: 'category',
      render: (p) => (
        <span className="text-sm text-[#f4f1eb]">{p.category || t('productComparison.premium')}</span>
      ),
    },
    {
      label: t('productComparison.brand'),
      key: 'brand',
      render: (p) => (
        <span className="text-sm text-[#f4f1eb]">{p.brand || t('productComparison.luxx')}</span>
      ),
    },
    {
      label: t('productComparison.material'),
      key: 'material',
      render: (p) => (
        <span className="text-sm text-[#f4f1eb]">{p.material || t('productComparison.naturalFabrics')}</span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#d6b47c]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#f4f1eb]">{t('productComparison.title')}</h2>
              <p className="text-[11px] text-[#9aa3b2]">{compareProducts.length} {t('productComparison.comparing')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] overflow-hidden">
          {/* Product Headers */}
          <div className="grid border-b border-white/5" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, 1fr)` }}>
            <div className="p-4 flex items-center">
              <span className="text-xs text-[#9aa3b2] uppercase tracking-wider">{t('productComparison.feature')}</span>
            </div>
            {compareProducts.map((product, idx) => (
              <div key={product._id || idx} className="p-4 border-l border-white/5 relative group">
                <button
                  onClick={() => removeProduct(idx)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#9aa3b2] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border border-white/5 mb-3 bg-[#0d1423]">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#3f4658]">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#f4f1eb] line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-sm font-bold text-[#d6b47c]">{formatPrice(product.price)} {t('common.sum')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          {comparisonRows.map((row, rowIdx) => {
            const bestIdx = row.getBest ? row.getBest(compareProducts) : -1;

            return (
              <div
                key={row.key}
                className={`grid ${rowIdx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, 1fr)` }}
              >
                <div className="p-3 flex items-center border-r border-white/5">
                  <span className="text-xs text-[#9aa3b2] font-medium">{row.label}</span>
                </div>
                {compareProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className={`p-3 flex items-center justify-center border-l border-white/5 ${
                      bestIdx === idx ? 'bg-[#d6b47c]/[0.03]' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {row.render(product)}
                      {bestIdx === idx && (
                        <span className="text-[9px] text-[#d6b47c] font-semibold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> {t('productComparison.best')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Add to Cart Row */}
          <div
            className="grid border-t border-white/5"
            style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, 1fr)` }}
          >
            <div className="p-3 flex items-center border-r border-white/5">
              <span className="text-xs text-[#9aa3b2] font-medium">{t('productComparison.action')}</span>
            </div>
            {compareProducts.map((product, idx) => (
              <div key={idx} className="p-3 flex items-center justify-center border-l border-white/5">
                <a
                  href={`/product/${product._id || product.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-xs font-medium hover:bg-[#d6b47c]/20 transition-colors"
                >
                  {t('common.more')} <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
