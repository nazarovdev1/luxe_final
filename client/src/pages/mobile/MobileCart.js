import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const toNumber = (value) => {
    if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
    return Number(value || 0);
};

const formatPrice = (value) => toNumber(value).toLocaleString();

const MobileCart = () => {
    const { t } = useLanguage();
    const { items: cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/mobile/login');
            return;
        }
        navigate('/mobile/checkout');
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#07090f] px-6 pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#d6b47c15,transparent_70%)]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50%] bg-[radial-gradient(circle_at_50%_120%,#d6b47c10,transparent_70%)]" />

                <div className="relative z-10 w-full animate-in fade-in zoom-in duration-700">
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
                        <ShoppingBag className="h-10 w-10 text-[#d6b47c]" />
                    </div>
                    <h2 className="text-3xl font-brilliant text-white mb-3">Savatingiz bo'sh</h2>
                    <p className="text-gray-500 mb-10 font-medium max-w-[240px] mx-auto leading-relaxed">
                        Eng so'nggi va eksklyuziv kolleksiyalarimiz hali sizni kutmoqda
                    </p>
                    <button
                        onClick={() => navigate('/mobile/products')}
                        className="group relative inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-xs font-black tracking-[0.2em] text-black transition-all active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.2)]"
                    >
                        SHOP COLLECTION
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        );
    }

    const totalPrice = getCartTotal();

    return (
        <div className="min-h-screen bg-[#07090f] pb-64 relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-[#d6b47c]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#07090f]/60 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6b47c] mb-0.5">Sizning tanlovingiz</p>
                        <h1 className="text-2xl font-brilliant text-white tracking-tight">
                            Savat <span className="text-gray-600 font-sans font-medium text-sm ml-2">({cartItems.length})</span>
                        </h1>
                    </div>
                    <button
                        onClick={clearCart}
                        className="h-10 px-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest active:scale-90 transition-transform"
                    >
                        Tozalash
                    </button>
                </div>
            </div>

            {/* Cart Items */}
            <div className="px-6 py-8 space-y-6 relative z-10">
                {cartItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative flex gap-5 bg-white/[0.02] border border-white/5 rounded-[32px] p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Item Glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <div 
                            onClick={() => navigate(`/mobile/product/${item.productId || item.id}`)}
                            className="shrink-0 relative w-28 h-36 rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-active:scale-110"
                            />
                        </div>

                        <div className="flex flex-1 flex-col justify-between py-1">
                            <div className="relative">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="line-clamp-2 text-sm font-bold text-white leading-tight pr-6">{item.name}</h3>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromCart(item.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/60 active:scale-75 transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {item.selectedSize && (
                                        <div className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[9px] font-black text-[#d6b47c] uppercase tracking-wider">
                                            Size: {item.selectedSize}
                                        </div>
                                    )}
                                    {item.selectedColor && (
                                        <div className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                            Color: {item.selectedColor}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-black text-white">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white">
                                        {formatPrice(toNumber(item.price) * item.quantity)}
                                        <span className="text-[10px] text-[#d6b47c] font-black ml-1 uppercase">uzs</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-20 left-0 right-0 z-40 px-6 animate-in slide-in-from-bottom-8 duration-700">
                <div className="bg-[#0f1117]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mahsulotlar summasi</span>
                            <span className="text-xs font-bold text-white">{formatPrice(totalPrice)} UZS</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('checkoutPage.delivery')}</span>
                            <span className="text-xs font-bold text-[#4ade80]">{t('checkoutPage.free')}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d6b47c]">{t('common.total')}</span>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white tracking-tight">{formatPrice(totalPrice)}</span>
                                <span className="text-xs font-black text-[#d6b47c] ml-1 uppercase tracking-widest">uzs</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="group relative w-full h-16 rounded-2xl bg-white overflow-hidden active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-3 text-xs font-black tracking-[0.3em] text-black">
                            RASMIYLASHTIRISH
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileCart;
