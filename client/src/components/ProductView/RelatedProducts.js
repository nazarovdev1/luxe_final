import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Gem, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (item) => {
  if (!item) return '';
  if (Array.isArray(item.images) && item.images.length > 0) {
    const img = item.images[0];
    return typeof img === 'object' ? img.url : img;
  }
  return item.image || '';
};

/**
 * RelatedProducts — Luxury related products grid + AI visual similarity section
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
      {/* ── Related Products Section ────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-white/10 pt-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-[#c9a96e]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9a96e] font-bold">
                  {t('product.recommend') || "Tavsiyalar"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
                {t('product.youMayLike') || "Sizga yoqishi mumkin"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onFetchVisualSimilar}
                disabled={visualLoading}
                className="inline-flex items-center gap-2 rounded-full bg-[#1c1c1f] border border-[#c9a96e]/30 px-5 py-2.5 text-xs font-bold text-white hover:bg-[#c9a96e]/10 hover:border-[#c9a96e] transition-all disabled:opacity-50 active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              >
                {visualLoading ? (
                  <Loader2 size={14} className="animate-spin text-[#c9a96e]" />
                ) : (
                  <Sparkles size={14} className="text-[#c9a96e] animate-pulse" />
                )}
                <span>AI O'xshashlar</span>
              </button>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-[#c9a96e] transition-all active:scale-95 shadow-md"
              >
                <span>Barchasi</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((item, idx) => {
              const image = getProductImage(item);
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const discountPercent = hasDiscount
                ? Math.round((1 - item.price / item.originalPrice) * 100)
                : 0;

              return (
                <Link
                  key={item.id || item._id}
                  to={`/product/${item.id || item._id}`}
                  className="group block"
                  style={{ animation: `fluid-fade-in 0.5s ease-out ${idx * 80}ms both` }}
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#141416] relative border border-white/10 shadow-lg transition-all duration-500 group-hover:border-[#c9a96e]/40 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
                    {image && (
                      <img
                        src={image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                        <Eye size={13} className="text-[#c9a96e]" />
                        Ko'rish
                      </span>
                    </div>

                    {hasDiscount && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                        -{discountPercent}%
                      </span>
                    )}

                    {item.badge && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#c9a96e]/90 text-black text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-3.5 space-y-1">
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a96e] font-bold">
                        {item.category}
                      </p>
                    )}
                    <h3 className="text-sm font-medium text-white group-hover:text-[#c9a96e] transition-colors duration-300 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="text-sm font-bold text-white">
                        {formatPrice(item.price)} {t('common.sum')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#6b6b6e] line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── AI Visual Similar Results ───────────────────── */}
      {visualResults.length > 0 && (
        <section className="border-t border-white/10 pt-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Sparkles className="text-purple-400 animate-pulse" size={22} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
                AI Tanlovlari
              </h2>
              <p className="text-xs sm:text-sm text-purple-300/60 font-medium tracking-wide mt-0.5">
                Sun'iy intellekt vizual o'xshashlik bo'yicha saralangan to'plam
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {visualResults.map((item, idx) => (
              <Link
                key={item._id || item.id}
                to={`/product/${item._id || item.id}`}
                className="group block"
                style={{ animation: `fluid-fade-in 0.4s ease-out ${idx * 60}ms both` }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#141416] relative border border-purple-500/20 group-hover:border-purple-400 transition-all duration-300 shadow-md">
                  <img
                    src={item.images?.[0]?.url || item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {item.similarity && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm">
                      {Math.round(item.similarity * 100)}% mos
                    </div>
                  )}
                </div>
                <div className="mt-2.5">
                  <p className="text-xs text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-purple-300/80 font-bold mt-0.5">
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
