import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Share2 } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';

// Components
import MobileBundleHero from './BundleDetailComponents/MobileBundleHero';
import MobileBundleProductCard from './BundleDetailComponents/MobileBundleProductCard';
import MobileBundleSocialProof from './BundleDetailComponents/MobileBundleSocialProof';
import MobileBundleStickyBar from './BundleDetailComponents/MobileBundleStickyBar';
import MobileBundleSavings from './BundleDetailComponents/MobileBundleSavings';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const MobileBundleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { addLookToCart } = useCart();
    const scrollRef = useRef(null);

    const [bundle, setBundle] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});

    useEffect(() => {
        const fetchBundle = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE}/bundles/${id}`);
                if (data.success) {
                    const b = data.data;
                    setBundle(b);
                    
                    // Normalize products
                    const normalized = (b.products || []).map(p => ({
                        ...p,
                        id: p.id || p._id,
                        image: p.image || p.images?.[0] || '/placeholder.jpg',
                        price: Number(p.price) || 0
                    }));
                    setProducts(normalized);

                    // Init variants
                    const init = {};
                    normalized.forEach(p => {
                        init[p.id] = { color: null, size: null };
                    });
                    setSelectedVariants(init);
                }
            } catch (err) {
                console.error(err);
                toast.error("To'plamni yuklashda xatolik");
            } finally {
                setLoading(false);
            }
        };
        fetchBundle();
    }, [id]);

    const handleVariantChange = useCallback((productId, variant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [productId]: { ...prev[productId], ...variant }
        }));
    }, []);

    const selectionIssues = useMemo(() => {
        if (!products.length) return [];

        const issues = [];
        products.forEach((p) => {
            const selected = selectedVariants?.[p.id] || {};

            if (Array.isArray(p.colors) && p.colors.length > 0 && !selected.color) {
                issues.push({ productName: p.name, missing: 'color' });
            }

            if (Array.isArray(p.sizes) && p.sizes.length > 0 && !selected.size) {
                issues.push({ productName: p.name, missing: 'size' });
            }
        });

        return issues;
    }, [products, selectedVariants]);

    const canAddToCart = selectionIssues.length === 0;

    const handleAddToCart = async () => {
        if (!bundle) return;

        if (!canAddToCart) {
            const first = selectionIssues[0];
            const msg = first?.missing === 'color'
                ? `Iltimos, \"${first.productName}\" uchun rang tanlang.`
                : `Iltimos, \"${first.productName}\" uchun o'lcham tanlang.`;
            toast.error(msg);
            return;
        }

        setIsAdding(true);
        try {
            const lookForCart = {
                ...bundle,
                id: bundle._id || bundle.id,
                products
            };
            addLookToCart(lookForCart, selectedVariants);
            toast.success("To'plam savatga qo'shildi");
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsAdding(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: bundle.title,
                    text: bundle.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link nusxalandi");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#d6b47c] animate-spin" />
            </div>
        );
    }

    if (!bundle) return null;

    const originalPrice = bundle.originalPrice || products.reduce((s, p) => s + p.price, 0);
    const discountedPrice = bundle.discountedPrice || originalPrice;
    const savings = originalPrice - discountedPrice;
    const discountPercent = bundle.discountType === 'percentage' 
        ? bundle.discountValue 
        : Math.round((savings / originalPrice) * 100);

    return (
        <div className="min-h-screen bg-[#060a14] text-white pb-32">
            <SEO title={`${bundle.title} | Premium To'plam`} />

            {/* Floating Top Header */}
            <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Hero Section */}
            <MobileBundleHero 
                bundle={bundle} 
                products={products}
                discountPercent={discountPercent} 
                originalPrice={originalPrice}
                discountedPrice={discountedPrice}
            />

            {/* Social Proof */}
            <MobileBundleSocialProof />

            {/* Products List */}
            <div className="px-5 mt-8 space-y-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#f4f1eb]">
                        To'plamdagi <span className="text-[#d6b47c] italic font-serif">kiyimlar</span>
                    </h2>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest">
                        {products.length} ta mahsulot • Rang va o'lcham tanlash
                    </p>
                </div>

                <div className="space-y-6">
                    {products.map((product, index) => (
                        <MobileBundleProductCard 
                            key={product.id}
                            product={product}
                            index={index}
                            selectedVariant={selectedVariants[product.id]}
                            onVariantChange={handleVariantChange}
                        />
                    ))}
                </div>
            </div>

            {/* Savings Section */}
            <MobileBundleSavings 
                originalPrice={originalPrice}
                discountedPrice={discountedPrice}
                savings={savings}
                discountPercent={discountPercent}
            />

            {/* Sticky Bottom Bar */}
            <MobileBundleStickyBar 
                discountedPrice={discountedPrice}
                originalPrice={originalPrice}
                savings={savings}
                isAdding={isAdding}
                onAdd={handleAddToCart}
                canAdd={canAddToCart}
            />
        </div>
    );
};

export default MobileBundleDetail;
