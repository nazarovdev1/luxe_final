import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
    ArrowUpRight,
    Check,
    Heart,
    ShoppingBag,
    SlidersHorizontal,
    Search,
    X,
    Filter
} from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';

// Modern Luxury Color Palette
const COLORS = {
    bg: '#000000', // Pure black background for depth
    cardBg: '#0a0a0a', // Very subtle off-black for cards
    cardHover: '#111111',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#d4b483', // Muted Gold
    accentRose: '#e1adac', // Dusky Rose
    border: '#27272a',
    badge: '#ffffff',
    badgeText: '#000000',
};

const SORT_OPTIONS = [
    { id: 'newest', label: 'Yangilari' },
    { id: 'bestseller', label: 'Ommabop' },
    { id: 'price-low', label: 'Arzonrog\'i' },
    { id: 'price-high', label: 'Qimmatrog\'i' },
];

const parsePrice = (value) => {
    if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
    return Number(value || 0);
};

const formatPrice = (value) => `${parsePrice(value).toLocaleString()} so'm`;

const MobileProducts = () => {
    const { products, isLoading, categories } = useProducts();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'Barchasi');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const allCategories = useMemo(
        () => ['Barchasi', ...(categories || [])],
        [categories]
    );

    useEffect(() => {
        if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
    }, [categoryFromUrl]);

    // Scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save scroll position on unmount (navigation)
    useEffect(() => {
        return () => {
            // Only save if we've scrolled a bit, to avoid overwriting with 0 on accidental immediate back
            if (window.scrollY > 0) {
                sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString());
            }
        };
    }, []);

    // Restore scroll position AFTER data is loaded
    useLayoutEffect(() => {
        if (!isLoading && products.length > 0) {
            const savedScroll = sessionStorage.getItem('mobileProductsScroll');
            if (savedScroll) {
                const scrollPosition = parseInt(savedScroll, 10);
                // increasing the timeout slightly to ensure DOM is fully painted
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'instant' // Instant jump, no animation
                    });
                }, 0);
            }
        }
    }, [isLoading, products.length]);

    useEffect(() => {
        const overflow = showFilters ? 'hidden' : '';
        document.body.style.overflow = overflow;
        document.documentElement.style.overflow = overflow;

        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [showFilters]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (selectedCategory === 'Barchasi') return true;
            return product.category === selectedCategory;
        });
    }, [products, selectedCategory]);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parsePrice(a.price) - parsePrice(b.price);
                case 'price-high':
                    return parsePrice(b.price) - parsePrice(a.price);
                case 'bestseller':
                    if (a.badge === 'BESTSELLER' && b.badge !== 'BESTSELLER') return -1;
                    if (b.badge === 'BESTSELLER' && a.badge !== 'BESTSELLER') return 1;
                    return 0;
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });
    }, [filteredProducts, sortBy]);

    // Layout Logic
    const lead = sortedProducts[0] || null;
    const feedProducts = sortedProducts.slice(1);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === 'Barchasi') setSearchParams({});
        else setSearchParams({ category });
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const handleFavoriteToggle = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
    };

    // Components
    const ProductBadge = ({ badge }) => {
        if (!badge) return null;
        const isNew = badge === 'NEW';
        return (
            <span className={`absolute left-3 top-3 z-10 px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${isNew ? 'bg-white text-black' : 'bg-black/60 text-white backdrop-blur-sm'
                }`}>
                {badge}
            </span>
        );
    };

    const FavoriteButton = ({ productId }) => (
        <button
            onClick={(e) => handleFavoriteToggle(e, productId)}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-all active:scale-95"
        >
            <Heart
                className={`h-4 w-4 transition-colors ${isFavorite(productId) ? 'fill-white text-white' : 'text-white'
                    }`}
            />
        </button>
    );

    /* Navigation Helper */
    const navigate = React.useCallback((path) => {
        sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString());
        // We can't use useNavigate hook inside the callback if it's not defined in the component top level
        // But we can use <Link> with onClick or just use window.location (bad for SPA).
        // Better: use useNavigate() from react-router-dom at top level.
    }, []);

    // We need useNavigate at top level
    const routerNavigate = import('react-router-dom').useNavigate ? import('react-router-dom').useNavigate() : null;
    // Wait, we are inside component, let's just use it.
    // The previous code didn't import useNavigate. Let's start by adding it to imports.

    // Instead of replacing the hole component logic which is risky with limits,
    // let's just replace the Tile components to use onClick for saving scroll, 
    // AND passing state to the Link.

    const LeadTile = ({ product }) => {
        if (!product) return null;

        return (
            <Link
                to={`/mobile/product/${product.id}`}
                state={{ fromMobileList: true }}
                onClick={() => sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString())}
                className="group relative block w-full overflow-hidden rounded-none mb-6"
            >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-active:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                    <ProductBadge badge={product.badge} />
                    <FavoriteButton productId={product.id} />

                    <div className="absolute bottom-0 left-0 w-full p-5">
                        <p className="mb-1 text-[10px] font-medium tracking-[0.2em] uppercase text-white/70">
                            {product.category}
                        </p>
                        <h2 className="mb-2 text-2xl font-light text-white leading-tight font-serif tracking-tight">
                            {product.name}
                        </h2>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-white">
                                {formatPrice(product.price)}
                            </p>
                            <button className="flex h-10 w-10 items-center justify-center bg-white text-black active:scale-95 transition-transform">
                                <ArrowUpRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    const GridTile = ({ product }) => {
        return (
            <Link
                to={`/mobile/product/${product.id}`}
                state={{ fromMobileList: true }}
                onClick={() => sessionStorage.setItem('mobileProductsScroll', window.scrollY.toString())}
                className="group block relative mb-6"
            >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0A0A0A] mb-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-opacity duration-300"
                    />
                    <FavoriteButton productId={product.id} />
                    {product.badge && <ProductBadge badge={product.badge} />}
                </div>

                <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-medium tracking-widest uppercase text-gray-500 truncate pr-2">
                            {product.category}
                        </p>
                    </div>
                    <h3 className="text-sm font-normal text-white leading-normal line-clamp-3 mb-1.5 min-h-[3em]">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                            {formatPrice(product.price)}
                        </p>
                        <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="bg-white/10 p-1.5 active:bg-white/20 transition-colors"
                        >
                            <ShoppingBag className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>
            </Link>
        );
    };

    const FilterSheet = () => {
        if (!showFilters) return null;

        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setShowFilters(false)}
                />

                <div className="relative w-full rounded-t-3xl bg-[#0a0a0a] border-t border-white/10 p-6 pb-8 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-light text-white tracking-wide">Filter</h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="p-2 text-white/50 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">Saralash</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {SORT_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id)}
                                        className={`px-4 py-3 text-sm text-left transition-colors border ${sortBy === option.id
                                            ? 'border-white text-white bg-white/5'
                                            : 'border-white/10 text-white/60 hover:border-white/30'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">Kategoriya</h3>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`px-4 py-2 text-xs uppercase tracking-wide border transition-all ${selectedCategory === cat
                                            ? 'border-white bg-white text-black'
                                            : 'border-white/10 text-white/60 hover:border-white/30'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                        <button
                            onClick={() => {
                                setSortBy('newest');
                                handleCategoryChange('Barchasi');
                            }}
                            className="flex-1 py-4 text-xs font-medium uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            Tozalash
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="flex-1 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                        >
                            Natijalarni ko'rish
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <header className={`sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b transition-colors duration-300 ${isScrolled ? 'border-white/10' : 'border-transparent'
                }`}>
                <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-light tracking-widest uppercase">
                            Shop <span className="font-serif italic text-white/70 text-lg lowercase">collection</span>
                        </h1>
                        <p className="text-[10px] text-white/40 tracking-[0.2em] mt-0.5 uppercase">
                            {sortedProducts.length} Items
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="h-10 w-10 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Horizontal Category Scroll */}
                <div className="px-5 pb-4 overflow-x-auto scrollbar-hide flex gap-6">
                    {allCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`whitespace-nowrap text-xs tracking-widest uppercase transition-colors pb-1 border-b ${selectedCategory === cat
                                ? 'text-white border-white'
                                : 'text-white/40 border-transparent hover:text-white/70'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="pt-2">
                {isLoading ? (
                    <div className="px-4 py-8 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        <p className="mt-4 text-xs text-white/40 uppercase tracking-widest">Loading Collection...</p>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="px-8 py-20 text-center">
                        <p className="text-2xl font-serif text-white/20 italic mb-4">No results found</p>
                        <button
                            onClick={() => {
                                setSortBy('newest');
                                handleCategoryChange('Barchasi');
                            }}
                            className="text-xs uppercase tracking-widest border-b border-white pb-0.5"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="px-0">
                            <LeadTile product={lead} />
                        </div>

                        <div className="px-4 grid grid-cols-2 gap-x-4 gap-y-2">
                            {feedProducts.map(product => (
                                <GridTile key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <FilterSheet />
        </div>
    );
};

export default MobileProducts;
