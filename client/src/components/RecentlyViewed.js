import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, X, Star, Trash2 } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const RecentlyViewed = ({ items, onClear }) => {
  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 8);

  return (
    <section className="py-16 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20">
              <Clock className="h-5 w-5 text-[#d6b47c]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#f4f1eb]">So'nggi ko'rilganlar</h2>
              <p className="text-xs text-[#9aa3b2] mt-0.5">Yaqinda ko'rgan mahsulotlaringiz</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#9aa3b2] hover:bg-white/10 hover:text-white transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Tozalash
          </button>
        </div>

        {/* Products Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="group flex-shrink-0 w-[200px] sm:w-auto overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a] transition-all duration-500 hover:border-[#d6b47c]/30 hover:shadow-[0_0_30px_rgba(214,180,124,0.1)]"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80" />

                {item.badge && (
                  <span className="absolute top-2 left-2 inline-flex items-center rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                {item.category && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d6b47c] bg-[#d6b47c]/10 rounded mb-1.5">
                    {item.category}
                  </span>
                )}
                <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-[#d6b47c] transition-colors">
                  {item.name}
                </h3>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#f4f1eb]">
                    {formatPrice(item.price)} so'm
                  </span>
                  {item.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-300">
                      <Star className="w-3 h-3 fill-current" />
                      {item.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
