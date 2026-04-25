import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSwipeable } from 'react-swipeable';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ArrowRight, Star, ShoppingCart, Heart, Plus, Minus, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, X, ZoomIn, MessageCircle, Check, Gem } from 'lucide-react';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import SEO from '../../components/SEO';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const MobileProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getProduct, fetchProductDetails, isLoading } = useProducts();
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();
    const product = getProduct(id);
    const isProductFavorite = product ? isFavorite(product.id) : false;

    // Scroll to top on mount and when interactions occur
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        // Fallback for some mobile browsers
        setTimeout(() => window.scrollTo(0, 0), 10);
    }, [id, isLoading]);

    // Fetch full product details on mount to get all images
    useEffect(() => {
        if (id) {
            fetchProductDetails(id);
        }
    }, [id]);

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    // Fetch reviews for this product
    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            setIsLoadingReviews(true);
            try {
                const response = await fetch(`${API_BASE}/reviews/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setIsLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [id]);

    const handleReviewAdded = (newReview) => {
        setReviews(prev => [newReview, ...prev]);
    };

    const handleReviewDeleted = (reviewId) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
    };

    const images = product?.images?.length > 0
        ? product.images
        : product?.image
            ? [product.image]
            : ['/placeholder.png'];

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [showLightbox]);

    // State for advanced swipe tracking
    const [swipeDelta, setSwipeDelta] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const nextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const swipeConfig = {
        onSwiping: (eventData) => {
            setIsSwiping(true);
            // Limit delta to prevent over-swiping
            setSwipeDelta(eventData.deltaX);
        },
        onSwipedLeft: (eventData) => {
            setIsSwiping(false);
            setSwipeDelta(0);
            if (Math.abs(eventData.deltaX) > 50) {
                nextImage();
            }
        },
        onSwipedRight: (eventData) => {
            setIsSwiping(false);
            setSwipeDelta(0);
            if (Math.abs(eventData.deltaX) > 50) {
                prevImage();
            }
        },
        onTap: () => {
            setIsSwiping(false);
            setSwipeDelta(0);
        },
        onTouchEndOrOnMouseUp: () => {
            // Fallback cleanup
            setIsSwiping(false);
            setSwipeDelta(0);
        },
        trackMouse: true,
        trackTouch: true,
        delta: 10,  // minimum distance to start swiping
        preventDefaultTouchmoveEvent: false
    };

    const mainHandlers = useSwipeable(swipeConfig);
    const lightboxHandlers = useSwipeable(swipeConfig);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
                <h2 className="text-xl font-bold text-white mb-4">Mahsulot topilmadi</h2>
                <Link
                    to="/mobile"
                    className="inline-flex items-center text-purple-400"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Bosh sahifaga qaytish
                </Link>
            </div>
        );
    }

    const handleAddToCart = async () => {
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            toast.error('Iltimos, rang tanlang!');
            return;
        }

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Iltimos, o\'lcham tanlang!');
            return;
        }

        setIsAddingToCart(true);

        try {
            await addToCart(product, selectedColor, selectedSize, quantity);
            toast.success(`${product.name} savatga qo'shildi!`);
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
            />
        ));
    };



    return (
        <>
            <SEO
                title={product.name}
                description={product.description || `${product.name} - Luxx.uz premium ayollar kiyimlari.`}
                image={product.image}
                url={`/product/${id}`}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.images && product.images.length > 0 ? product.images : [product.image],
                        "description": product.description,
                        "sku": product._id,
                        "brand": { "@type": "Brand", "name": "Luxx.uz" },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "UZS",
                            "price": product.price,
                            "availability": "https://schema.org/InStock"
                        }
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen bg-[#08090d]">
                {/* 1. Immersive Hero Image (Fixed Background) */}
                <div
                    {...mainHandlers}
                    className="fixed top-0 left-0 w-full h-[85vh] z-0 bg-[#08090d]"
                >
                    <div
                        className={`flex h-full w-full ${isSwiping ? '' : 'transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1)'}`}
                        style={{ transform: `translateX(calc(-${currentImageIndex * 100}% + ${swipeDelta}px))` }}
                    >
                        {images.map((img, index) => (
                            <div key={index} className="flex-shrink-0 w-full h-full relative">

                                <img
                                    src={img}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-top"
                                    onClick={() => setShowLightbox(true)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Image Indicators */}
                    {images.length > 1 && (
                        <div className="absolute top-24 right-4 flex flex-col gap-1.5 z-20">
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-1 transition-all duration-300 rounded-full ${index === currentImageIndex ? 'h-6 bg-white' : 'h-1.5 bg-white/30'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Badge */}
                    {product.badge && (
                        <div className="absolute bottom-32 left-6 z-20">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-white">
                                <Gem className="w-3 h-3 text-amber-300" />
                                {product.badge}
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. Floating Header */}
                <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4">
                    <button
                        onClick={() => {
                            if (location.state?.fromMobileList) {
                                navigate(-1);
                            } else if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/mobile');
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`w-10 h-10 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all active:scale-95 ${isProductFavorite ? 'bg-red-500/80 text-white' : 'bg-black/20 text-white'}`}
                    >
                        <Heart className={`w-5 h-5 ${isProductFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* 3. Scrollable Content (Overlapping) */}
                <div className="relative z-10 mt-[70vh]">
                    {/* Glassmorphism Card */}
                    <div className="bg-[#08090d]/80 backdrop-blur-3xl rounded-t-[2.5rem] border-t border-white/10 p-6 pb-32">

                        {/* Drag Handle */}
                        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />

                        {/* Title & Price */}
                        <div className="mb-8">
                            <span className="block text-xs font-medium text-purple-400 uppercase tracking-widest mb-2">{product.category}</span>
                            <h1 className="font-brilliant text-4xl text-[#f4f1eb] leading-tight mb-4">{product.name}</h1>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-light text-white tracking-tight">
                                    {product.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                    <span className="text-sm text-white/50 ml-1">so'm</span>
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-white/40 line-through mb-1.5">
                                        {product.originalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-8 py-4 border-y border-white/5">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-white font-medium">{(product.rating || 5).toFixed(1)}</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-1 text-white/60">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{reviews.length} sharhlar</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-1 text-green-400">
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Mavjud</span>
                            </div>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-6 mb-8">
                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Rang</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color, index) => {
                                            const isHex = color.startsWith('#');
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`group relative h-12 rounded-2xl transition-all ${isHex
                                                        ? `w-12 ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#08090d] scale-100' : 'hover:scale-105'}`
                                                        : `px-6 bg-white/5 border ${selectedColor === color ? 'border-purple-500 text-white bg-purple-500/10' : 'border-white/10 text-white/60'}`
                                                        }`}
                                                    style={isHex ? { backgroundColor: color } : {}}
                                                >
                                                    {!isHex && <span className="text-sm font-medium">{color}</span>}
                                                    {isHex && selectedColor === color && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Check className="w-5 h-5 text-white/90 drop-shadow-md" />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">O'lcham</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedSize(size)}
                                                className={`h-12 min-w-[3rem] px-4 rounded-2xl border text-sm font-medium transition-all ${selectedSize === size
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent border-white/10 text-white/60 hover:border-white/30'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description & Features */}
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                <h3 className="font-brilliant text-2xl text-[#d6b47c] mb-3">Tafsilotlar</h3>
                                <p className="text-white/70 text-sm leading-relaxed font-light">{product.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1a1b21] p-5 rounded-3xl">
                                    <Truck className="w-6 h-6 text-purple-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">Tezkor yetkazish</h4>
                                    <p className="text-xs text-white/50">Toshkent bo'ylab 3 soat ichida</p>
                                </div>
                                <div className="bg-[#1a1b21] p-5 rounded-3xl">
                                    <RotateCcw className="w-6 h-6 text-purple-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">Qaytarish</h4>
                                    <p className="text-xs text-white/50">14 kun ichida onson qaytarish</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="mt-12 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-brilliant text-3xl text-white">Mijozlar fikri</h3>
                                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-white">
                                    {reviews.length} ta sharh
                                </div>
                            </div>
                            <div className="mt-6">
                                <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Sticky Footer Action */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#08090d] via-[#08090d]/95 to-transparent pt-12">
                    <div className="flex items-center gap-4 max-w-md mx-auto">
                        <div className="flex items-center gap-4 bg-[#1a1b21] h-14 rounded-full px-5 border border-white/10">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-white/50 active:text-white">
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-lg font-medium text-white w-4 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-white/50 active:text-white">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="flex-1 h-14 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isAddingToCart ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                            ) : (
                                <>
                                    <span>Savatga</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Lightbox */}
                {/* Lightbox */}
                {showLightbox && (
                    <div
                        className="fixed inset-0 z-[100] bg-black animate-fade-in"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowLightbox(false);
                            }
                        }}
                    >
                        <div {...lightboxHandlers} className="w-full h-full flex flex-col justify-center relative">
                            {/* Close button */}
                            <button
                                onClick={() => setShowLightbox(false)}
                                className="absolute top-4 right-4 z-[110] p-2 bg-white/10 rounded-full backdrop-blur-md"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 z-[110] p-3 bg-white/10 rounded-full backdrop-blur-md text-white"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 z-[110] p-3 bg-white/10 rounded-full backdrop-blur-md text-white"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            <img
                                src={images[currentImageIndex]}
                                alt=""
                                className="max-w-full max-h-[90vh] object-contain px-2 pointer-events-auto"
                            />

                            {/* Image Counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-8 left-0 right-0 text-center">
                                    <span className="bg-black/50 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur">
                                        {currentImageIndex + 1} / {images.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MobileProductView;
