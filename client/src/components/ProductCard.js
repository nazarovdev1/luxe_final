import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, ShoppingBag, Gem } from 'lucide-react';

const ProductCard = ({ product }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating)
          ? 'text-yellow-400 fill-current'
          : 'text-gray-600'
          }`}
      />
    ));
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-[#12121a] border border-white/[0.06] transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`} className="block aspect-[3/4]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80 pointer-events-none"></div>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${product.badge === 'NEW'
              ? 'bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 text-white'
              : 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-black'
              }`}>
              <Gem className="w-3 h-3" />
              {product.badge}
            </span>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button className="p-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-500/40 hover:border-purple-500/40 translate-x-3 group-hover:translate-x-0">
            <Heart className="w-4 h-4 text-white" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-500/40 hover:border-purple-500/40 translate-x-3 group-hover:translate-x-0 delay-75"
          >
            <Eye className="w-4 h-4 text-white" />
          </Link>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <Link
            to={`/product/${product.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:bg-purple-600/60 hover:border-purple-500/50"
          >
            <ShoppingBag className="w-4 h-4" />
            Ko'rish
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        {/* Category */}
        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 rounded-md mb-2">
          {product.category}
        </span>

        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-white font-bold text-base mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {renderStars(product.rating || 0)}
          </div>
          <span className="text-[13px] text-gray-400">
            ({product.rating || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#E879F9]">
            {product.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} so'm
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
