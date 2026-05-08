import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileProductCard = ({ product, index = 0 }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();
    const { t } = useLanguage();

    // Helper to parse price if it comes as a string with symbols
    const parsePrice = (value) => {
        if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
        return Number(value || 0);
    };

    const formatPrice = (value) => `${parsePrice(value).toLocaleString()} ${t('common.sum')}`;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const handleFavoriteToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    const ProductBadge = ({ badge }) => {
        if (!badge) return null;
        const isNew = badge === 'NEW';
        return (
            <span className={`absolute left-2.5 top-2.5 z-10 px-2 py-1 text-[9px] font-bold tracking-wider uppercase ${isNew ? 'bg-white text-black' : 'bg-black/60 text-white backdrop-blur-sm'
                }`}>
                {badge}
            </span>
        );
    };

    return (
        <Link
            to={`/mobile/product/${product.id}`}
            className="group block relative mb-6"
            style={{
                animation: 'fade-in 0.5s ease-out forwards',
                animationDelay: `${index * 50}ms`,
                opacity: 0,
            }}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#0A0A0A] mb-3">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
                    loading="lazy"
                />

                {/* Gradient overlay for better text visibility if needed, or just aesthetic */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />

                <ProductBadge badge={product.badge} />

                <button
                    onClick={handleFavoriteToggle}
                    className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-transform active:scale-95"
                >
                    <Heart
                        className={`h-4 w-4 transition-colors ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'
                            }`}
                    />
                </button>
            </div>

            <div className="px-1">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-gray-500 truncate pr-2">
                        {product.category || 'Collection'}
                    </p>
                </div>

                <h3 className="text-sm font-normal text-white leading-normal line-clamp-3 mb-1.5 min-h-[3em]">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        {product.originalPrice && (
                            <p className="text-[10px] text-gray-500 line-through mb-0.5">
                                {formatPrice(product.originalPrice)}
                            </p>
                        )}
                        <p className="text-sm font-medium text-white">
                            {formatPrice(product.price)}
                        </p>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-white/10 p-2 rounded-full active:bg-white/20 transition-colors"
                    >
                        <ShoppingBag className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default MobileProductCard;
