import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    X, ShoppingBag, ArrowRight, Check, ChevronLeft, ChevronRight,
    AlertCircle, ZoomIn, Maximize2, ArrowUpRight
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────── */
const formatPrice = (price) => {
    if (typeof price !== 'number') return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getSizes = (product) =>
    Array.isArray(product.sizes)
        ? product.sizes
            .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
            .map(String)
            .filter(Boolean)
        : [];

/* ─── Product Item Card ───────────────────────────────────────── */
function ProductItem({ product, selection, error, onSelect }) {
    const sizeOptions = getSizes(product);
    const hasVariants = (product.colors?.length > 0) || sizeOptions.length > 0;

    return (
        <div
            className={`
                group relative rounded-2xl overflow-hidden transition-all duration-300
                ${error
                    ? 'ring-1 ring-red-500/40 bg-[#1a1025]/60'
                    : 'bg-[#111827]/70 hover:bg-[#111827] ring-1 ring-white/[0.05] hover:ring-white/10'
                }
            `}
        >
            <div className="flex gap-4 p-4">
                {/* Product image */}
                <div className="relative shrink-0 w-20 h-24 rounded-xl overflow-hidden bg-[#0d1019]">
                    <img
                        src={product.image || product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-[#56c4bb] mb-0.5 font-medium">
                                {product.category}
                            </p>
                            <h4 className="text-sm font-medium text-[#f4efe7] line-clamp-1">
                                {product.name}
                            </h4>
                        </div>
                        <p className="text-sm font-semibold text-[#d6b47c] whitespace-nowrap shrink-0">
                            {formatPrice(product.price)} {t('common.sum')}
                        </p>
                    </div>

                    {/* Variants */}
                    {hasVariants && (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {/* Color */}
                            {product.colors?.length > 0 && (
                                <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">Rang</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.colors.map((color, idx) => {
                                            const isHex = color.startsWith('#');
                                            const isSelected = selection?.color === color;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => onSelect(product.id, 'color', color)}
                                                    title={color}
                                                    className={`
                                                        relative w-6 h-6 rounded-full flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? 'ring-2 ring-[#d6b47c] ring-offset-2 ring-offset-[#111827] scale-110'
                                                            : 'opacity-75 hover:opacity-100 hover:scale-105'
                                                        }
                                                    `}
                                                    style={{ backgroundColor: isHex ? color : '#333' }}
                                                >
                                                    {!isHex && (
                                                        <span className="text-[8px] text-white leading-none px-1 truncate">
                                                            {color}
                                                        </span>
                                                    )}
                                                    {isSelected && isHex && (
                                                        <Check className="w-3 h-3 text-white drop-shadow" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size */}
                            {sizeOptions.length > 0 && (
                                <div className="space-y-1.5 flex-1 min-w-[100px]">
                                    <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">O'lcham</span>
                                    <div className="flex flex-wrap gap-1">
                                        {sizeOptions.map((size, idx) => {
                                            const isSelected = selection?.size === size;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => onSelect(product.id, 'size', size)}
                                                    className={`
                                                        px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
                                                        ${isSelected
                                                            ? 'bg-[#d6b47c] text-[#060810]'
                                                            : 'bg-white/[0.06] text-neutral-400 hover:bg-white/10 hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-2 flex items-center gap-1.5 text-red-400 text-[11px]">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Modal ──────────────────────────────────────────────── */
const LookDetailModal = ({ lookId, onClose }) => {
    const { t } = useLanguage();
    const { products } = useProducts();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [look, setLook] = useState(null);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
    const [selections, setSelections] = useState({});
    const [errors, setErrors] = useState({});
    const [imgLoaded, setImgLoaded] = useState(false);

    // Lock scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Fetch look
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/looks');
                const result = await res.json();
                if (result.success) {
                    const found = result.data.find((l) => l._id === lookId || l.id === lookId);
                    setLook(found);
                }
            } catch (err) {
                console.error('Failed to fetch look', err);
            }
        })();
    }, [lookId]);

    // Resolve products
    const lookProducts = useMemo(() => {
        if (!look) return [];
        if (look.products?.length > 0) {
            const first = look.products[0];
            if (typeof first === 'object' && (first.id || first._id)) {
                return look.products.map((p) => {
                    const found = products.find((cp) => cp.id === (p.id || p._id));
                    return found || { ...p, id: p.id || p._id, image: p.image || p.images?.[0] || '/placeholder.jpg' };
                });
            }
            return products.filter((p) => look.products.includes(p.id || p._id));
        }
        if (!products.length) return [];
        const resolved = [];
        (look.items || []).forEach((item) => {
            const cats = products
                .filter((p) => p.category === item.category)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, item.count);
            resolved.push(...cats);
        });
        return [...new Set(resolved)];
    }, [look, products]);

    // Auto-select single options
    useEffect(() => {
        if (!lookProducts.length) return;
        const next = { ...selections };
        lookProducts.forEach((p) => {
            const s = next[p.id] || {};
            if (p.colors?.length === 1 && !s.color) s.color = p.colors[0];
            const sizes = getSizes(p);
            if (sizes.length === 1 && !s.size) s.size = sizes[0];
            next[p.id] = s;
        });
        setSelections(next);
    }, [lookProducts]);

    if (!look) return null;

    const handleSelect = (productId, field, value) => {
        setSelections((prev) => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
        if (errors[productId]) {
            setErrors((prev) => { const n = { ...prev }; delete n[productId]; return n; });
        }
    };

    const handleAddAll = async () => {
        const newErrors = {};
        let hasError = false;
        lookProducts.forEach((p) => {
            const sel = selections[p.id] || {};
            if (p.colors?.length > 0 && !sel.color) { newErrors[p.id] = 'Rang tanlang'; hasError = true; }
            const sizes = getSizes(p);
            if (sizes.length > 0 && !sel.size) {
                newErrors[p.id] = newErrors[p.id] ? 'Rang va o\'lcham tanlang' : 'O\'lcham tanlang';
                hasError = true;
            }
        });
        if (hasError) { setErrors(newErrors); toast.error('Barcha variantlarni tanlang'); return; }

        let ok = 0;
        for (const p of lookProducts) {
            const sel = selections[p.id];
            try { await addToCart(p, sel?.color, sel?.size, 1); ok++; } catch (e) { console.error(e); }
        }
        if (ok > 0) { toast.success(`Look savatga qo'shildi (${ok} mahsulot)`); onClose(); }
    };

    const totalPrice = lookProducts.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* ── Fullscreen image overlay ── */}
            {isImageFullscreen && (
                <div
                    className="fixed inset-0 z-[10001] bg-black flex items-center justify-center p-4"
                    onClick={() => setIsImageFullscreen(false)}
                >
                    <button
                        onClick={() => setIsImageFullscreen(false)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <img
                        src={look.heroImage}
                        alt={look.title}
                        className="max-w-full max-h-full object-contain rounded-xl"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
            )}

            {/* ── Main modal ── */}
            <div className="
                relative z-10 w-full
                max-w-6xl
                h-[95dvh] md:h-[88vh]
                rounded-t-3xl md:rounded-3xl
                overflow-hidden
                flex flex-col md:flex-row
                bg-[#0c101c]
                shadow-[0_30px_80px_rgba(0,0,0,0.7)]
                animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300
                md:mx-4
            ">

                {/* ── Left: Hero image panel ── */}
                <div
                    className="relative md:w-5/12 shrink-0 h-[42vh] md:h-full bg-[#090c18] overflow-hidden group cursor-zoom-in"
                    onClick={() => setIsImageFullscreen(true)}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {/* Shimmer while loading */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c101a] via-[#131826] to-[#0c101a] animate-pulse" />
                    )}

                    <img
                        src={look.heroImage}
                        alt={look.title}
                        onLoad={() => setImgLoaded(true)}
                        onError={(e) => { e.target.src = '/hero.jpg'; setImgLoaded(true); }}
                        className={`
                            w-full h-full object-cover transition-all duration-700
                            group-hover:scale-[1.04]
                            ${imgLoaded ? 'opacity-100' : 'opacity-0'}
                        `}
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-transparent to-transparent md:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c101c]/30 hidden md:block" />

                    {/* Zoom hint */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/60 backdrop-blur-sm text-white/80 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] border border-white/10">
                            <ZoomIn className="w-3 h-3" />
                            Zoom
                        </div>
                    </div>

                    {/* Look info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                        <div className="inline-flex items-center gap-2 mb-2 bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-[#d6b47c]/80">Look {look.id}</span>
                        </div>
                        <h2 className="font-brilliant text-2xl md:text-3xl text-[#f5f0e8] leading-tight mb-1">
                            {look.title}
                        </h2>
                        {look.description && (
                            <p className="text-xs text-neutral-400 line-clamp-2 max-w-sm">
                                {look.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Right: Products panel ── */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0c101c]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.05] shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-[#d6b47c]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#f4efe7]">Look tarkibi</h3>
                                <p className="text-[10px] text-neutral-500">{lookProducts.length} mahsulot</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scrollable product list */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
                        {lookProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-neutral-600" />
                                </div>
                                <p className="text-sm text-neutral-500 text-center">
                                    Ushbu look uchun mahsulotlar topilmadi
                                </p>
                            </div>
                        ) : (
                            lookProducts.map((product) => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    selection={selections[product.id]}
                                    error={errors[product.id]}
                                    onSelect={handleSelect}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="shrink-0 border-t border-white/[0.05] bg-[#090c18]/90 backdrop-blur-xl px-6 py-4">

                        {/* Total price */}
                        {totalPrice > 0 && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-neutral-500 uppercase tracking-wider">{t('common.total')}</span>
                                <span className="text-sm font-semibold text-[#d6b47c]">{formatPrice(totalPrice)} {t('common.sum')}</span>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {/* Secondary: other looks */}
                            <button
                                onClick={() => navigate('/lookbooks')}
                                className="
                                    flex-shrink-0 px-4 py-3.5 rounded-2xl border border-white/10
                                    text-xs text-neutral-400 hover:text-white hover:border-white/20
                                    transition-all duration-200 hover:bg-white/[0.04]
                                    flex items-center gap-1.5
                                "
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Looklar
                            </button>

                            {/* Primary: add all to cart */}
                            <button
                                onClick={handleAddAll}
                                disabled={lookProducts.length === 0}
                                className="
                                    flex-1 bg-gradient-to-r from-[#d6b47c] to-[#c9a868]
                                    hover:from-[#e8c98a] hover:to-[#d6b47c]
                                    text-[#060810] font-semibold text-sm py-3.5 px-5 rounded-2xl
                                    flex items-center justify-center gap-2
                                    transition-all duration-200
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    hover:shadow-lg hover:shadow-[#d6b47c]/20
                                    active:scale-[0.99]
                                "
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Barchasini savatga
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LookDetailModal;
