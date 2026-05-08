import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (item) => {
  if (!item) return '';
  if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
  return item.image || '';
};

/**
 * RelatedProducts — Premium related products + AI visual similar section
 */
export default function RelatedProducts({
  relatedProducts = [],
  visualResults = [],
  visualLoading = false,
  onFetchVisualSimilar,
}) {
  const { t } = useLanguage();
  if (relatedProducts.length === 0 && visualResults.length === 0) return null;

  return (
    <div className="space-y-20">
      {/* ── Related Products ────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-white/5 pt-16">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#c9a96e]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a96e] font-bold">
                  {t('product.recommend')}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-brilliant text-[#f5f5f3]">
                {t('product.youMayLike')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onFetchVisualSimilar}
                disabled={visualLoading}
                className="inline-flex items-center gap-2 rounded-full bg-[#141416] border border-white/5 px-5 py-2.5 text-[11px] font-bold text-[#f5f5f3] hover:bg-[#1c1c1f] hover:border-white/10 transition-all disabled:opacity-50"
              >
                {visualLoading ? (
                  <Loader2 size={13} className="animate-spin text-[#c9a96e]" />
                ) : (
                  <Sparkles size={13} className="text-[#c9a96e]" />
                )}
                AI O'xshashlar
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f3] px-5 py-2.5 text-[11px] font-bold text-[#0a0a0b] hover:bg-white transition-all"
              >
                Barchasi
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {relatedProducts.map((item, idx) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#141416] relative">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] font-bold mb-1.5">
                    {item.category}
                  </p>
                  <h3 className="text-sm font-medium text-[#f5f5f3] group-hover:text-[#c9a96e] transition-colors duration-300 truncate">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-base font-bold text-[#f5f5f3]">
                    {formatPrice(item.price)} {t('common.sum')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── AI Visual Similar Results ───────────────────── */}
      {visualResults.length > 0 && (
        <section className="border-t border-white/5 pt-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-brilliant text-[#f5f5f3]">AI Tanlovlari</h2>
              <p className="text-sm text-purple-300/50 font-medium tracking-wide mt-1">
                Sun'iy intellekt tomonidan topilgan o'xshash uslublar
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {visualResults.map((item, idx) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#141416] relative border border-white/5">
                  <img
                    src={item.images?.[0]?.url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {item.similarity && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-purple-600/80 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-purple-400/20">
                      {Math.round(item.similarity * 100)}% mos
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-xs text-[#f5f5f3] font-medium truncate group-hover:text-purple-400 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-purple-300/80 font-bold mt-1">
                    {Number(item.price).toLocaleString()} {t('common.sum')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
