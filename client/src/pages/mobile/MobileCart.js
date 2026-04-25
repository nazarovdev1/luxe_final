import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const toNumber = (value) => {
    if (typeof value === 'string') return Number((value.match(/\d+/g) || []).join('')) || 0;
    return Number(value || 0);
};

const formatPrice = (value) => toNumber(value).toLocaleString();

const MobileCart = () => {
    const { items: cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
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
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-black px-6 pb-24 text-center">
                <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#24324c]/30 blur-3xl" />

                <div className="relative z-10 w-full animate-fade-in-up">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1a1a1a] border border-white/5">
                        <ShoppingBag className="h-10 w-10 text-white/40" />
                    </div>
                    <h2 className="text-2xl font-normal text-white mb-3">Savatingiz bo'sh</h2>
                    <p className="text-gray-400 mb-8 font-light">
                        Yangi kolleksiyamizdan o'zingizga mos premium liboslarni tanlang
                    </p>
                    <Link
                        to="/mobile/products"
                        className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium tracking-wide text-black transition-transform active:scale-95"
                    >
                        KOLLEKSIYANI KO'RISH
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const totalPrice = getCartTotal();

    return (
        <div className="min-h-screen bg-black pb-48">
            <div className="sticky top-0 z-30 border-b border-white/5 bg-black/80 px-4 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-medium tracking-wide text-white">Savat <span className="text-gray-500 text-sm font-normal">({cartItems.length})</span></h1>
                    <button
                        onClick={clearCart}
                        className="text-xs font-medium text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
                    >
                        Tozalash
                    </button>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                {cartItems.map((item, index) => {
                    const price = toNumber(item.price);

                    return (
                        <div
                            key={item.id}
                            className="flex gap-4 animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Link to={`/mobile/product/${item.productId || item.id}`} className="shrink-0 relative group">
                                <div className="h-32 w-24 overflow-hidden rounded-lg bg-[#111]">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-active:scale-110"
                                    />
                                </div>
                            </Link>

                            <div className="flex flex-1 flex-col justify-between py-1">
                                <div>
                                    <Link to={`/mobile/product/${item.productId || item.id}`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="line-clamp-2 text-sm font-normal text-white leading-snug">{item.name}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-500 hover:text-red-400 -mt-1 -mr-1 p-2 active:scale-90 transition-transform"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </Link>

                                    <div className="mt-2 space-y-1">
                                        {item.selectedColor && (
                                            <p className="text-xs text-gray-500">Rang: <span className="text-gray-300">{item.selectedColor}</span></p>
                                        )}
                                        {item.selectedSize && (
                                            <p className="text-xs text-gray-500">O'lcham: <span className="text-gray-300">{item.selectedSize}</span></p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-white">
                                        {formatPrice(price * item.quantity)} <span className="text-xs text-gray-500 font-normal">so'm</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-[4.5rem] left-0 right-0 z-20 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl">
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Jami qiymat</span>
                        <span className="font-medium text-white">{formatPrice(totalPrice)} so'm</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Yetkazib berish</span>
                        <span className="text-green-400">Bepul</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 mb-4">
                    <span className="text-base font-medium text-white">Umumiy</span>
                    <span className="text-xl font-semibold text-white tracking-tight">{formatPrice(totalPrice)} <span className="text-xs font-normal text-gray-500">so'm</span></span>
                </div>

                <button
                    onClick={handleCheckout}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white py-4 text-sm font-semibold tracking-wide text-black transition-all active:scale-[0.98]"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        RASMIYLASHTIRISH
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default MobileCart;
