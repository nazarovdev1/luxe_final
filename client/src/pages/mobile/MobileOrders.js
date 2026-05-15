import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, ChevronRight, Clock, Eye, Gift, MapPin, Package, RotateCcw, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductService from '../../server/server';
import LoginForm from '../../components/LoginForm';
import OrderTimeline from '../../components/OrderTimeline';
import ReturnRequestModal from '../../components/ReturnRequestModal';

const getStatusClass = (status) => {
    switch (status) {
        case 'Yetkazildi':
            return 'bg-[#173526] text-[#7ce0a4]';
        case 'Jarayonda':
            return 'bg-[#1d3144] text-[#8ac7ff]';
        case 'Yetkazilmoqda':
            return 'bg-[#2a3044] text-[#c7ceda]';
        case 'Bekor qilindi':
            return 'bg-[#3a2430] text-[#f4afc7]';
        default:
            return 'bg-[#2f2d26] text-[#e8cb95] border-none';
    }
};

const formatMoney = (value) => {
    if (typeof value === 'string') {
        return (Number((value.match(/\d+/g) || []).join('')) || 0).toLocaleString();
    }
    return (Number(value || 0) || 0).toLocaleString();
};

const getProductId = (item) => {
    if (!item) return null;
    if (typeof item.product === 'string') return item.product;
    return item.product?._id || item.product?.id || item.productId || item.id || null;
};

const MobileOrders = () => {
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const { getMyOrders } = useProductService();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [returnOrder, setReturnOrder] = useState(null);

    const stats = useMemo(() => {
        const totalSpent = orders.reduce((sum, order) => sum + (order.totals?.total || order.totalAmount || 0), 0);
        const activeCount = orders.filter(order => !['Yetkazildi', 'Bekor qilindi'].includes(order.status)).length;
        const deliveredCount = orders.filter(order => order.status === 'Yetkazildi').length;
        return { activeCount, deliveredCount, totalSpent };
    }, [orders]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated) return;

            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const result = await getMyOrders(token);
                if (result.success) setOrders(result.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#07090f] pb-24 px-4 pt-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d6b47c]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <button
                onClick={() => navigate('/mobile/profile')}
                className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Profil
            </button>

            <div className="mt-6 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/5 text-[#d6b47c] mb-4 backdrop-blur-md">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Xaridlar tarixi</span>
                </div>
                <h1 className="text-4xl font-brilliant text-white leading-none">
                    {t('profile.myOrders')}
                </h1>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Jami</p>
                    <p className="mt-1 text-sm font-semibold text-white">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Jarayonda</p>
                    <p className="mt-1 text-sm font-semibold text-blue-300">{stats.activeCount}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Yetkazilgan</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">{stats.deliveredCount}</p>
                </div>
                <div className="rounded-2xl border border-[#d6b47c]/15 bg-[#d6b47c]/5 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#d6b47c]">Jami</p>
                    <p className="mt-1 text-[11px] font-black text-white">{formatMoney(stats.totalSpent)}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-[32px] bg-white/[0.03] animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-24 px-8 mt-10">
                    <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-brilliant text-gray-400 mb-2">{t('orders.empty', 'Hali buyurtmalar yo\'q')}</h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">Sizning ilk xaridingiz bu yerda paydo bo'ladi.</p>
                    <button
                        onClick={() => navigate('/mobile/products')}
                        className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-[#d6b47c]/20 transition-all active:scale-95"
                        style={{ background: '#d6b47c' }}
                    >
                        Xarid boshlash
                    </button>
                </div>
            ) : (
                <div className="space-y-4 pb-10">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            onClick={() => setSelectedOrder(order)}
                            className="group relative rounded-[32px] bg-white/[0.03] border border-white/10 p-5 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-black text-white tracking-widest">ID #{order._id.slice(-6).toUpperCase()}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${getStatusClass(order.status)}`}>
                                    {order.status || 'Kutilmoqda'}
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-3 mb-6">
                                <div className="flex -space-x-3">
                                    {order.items.slice(0, 4).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="w-14 h-14 rounded-2xl border-2 border-[#07090f] bg-[#1a1a1a] overflow-hidden shadow-lg"
                                            onClick={(e) => {
                                                const productId = getProductId(item);
                                                if (!productId) return;
                                                e.stopPropagation();
                                                navigate(`/mobile/product/${productId}`);
                                            }}
                                        >
                                            {item.image ? (
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                    <Package className="h-6 w-6 text-gray-700" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {order.items.length > 4 && (
                                    <div className="w-10 h-10 rounded-full bg-[#d6b47c]/10 flex items-center justify-center border border-[#d6b47c]/20">
                                        <span className="text-[10px] font-black text-[#d6b47c]">+{order.items.length - 4}</span>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">{t('checkoutPage.total')}</p>
                                    <p className="text-lg font-black text-white">
                                        {formatMoney(order.totals?.total || order.totalAmount || 0)} <span className="text-xs text-[#d6b47c]">UZS</span>
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </button>
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">{t('profile.orderDetails')}</p>
                            <p className="text-sm font-bold text-[#d6b47c]">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                            <X className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Status</p>
                                <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider inline-block ${getStatusClass(selectedOrder.status)}`}>
                                    {selectedOrder.status || 'Kutilmoqda'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Sana</p>
                                <p className="text-sm font-bold text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('uz-UZ')}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-[10px] uppercase tracking-widest text-[#d6b47c] font-black mb-4">Mahsulotlar</p>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 bg-white/[0.03] border border-white/10 rounded-3xl p-3">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                <Package className="h-6 w-6 text-gray-700" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-sm font-bold text-white mb-1">{item.name}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.quantity} dona</p>
                                        <p className="text-sm font-black text-white mt-1">{formatMoney(item.price)} UZS</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
                            <div className="flex gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d6b47c]" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Manzil</p>
                                    <p className="mt-1 text-sm leading-5 text-gray-300">{selectedOrder.customer?.address || "Manzil ko'rsatilmagan"}</p>
                                </div>
                            </div>
                            {(selectedOrder.scheduledDelivery || selectedOrder.totals?.giftWrap) && (
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedOrder.scheduledDelivery && (
                                        <div className="flex gap-3 rounded-2xl border border-[#d6b47c]/15 bg-[#d6b47c]/5 p-3">
                                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#d6b47c]" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#d6b47c]">Yetkazib berish</p>
                                                <p className="mt-1 text-sm text-gray-300">
                                                    {selectedOrder.scheduledDelivery.date || 'Sana tanlanmagan'} · {selectedOrder.scheduledDelivery.timeSlot || 'Vaqt tanlanmagan'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.totals?.giftWrap && (
                                        <div className="flex gap-3 rounded-2xl border border-[#d6b47c]/15 bg-[#d6b47c]/5 p-3">
                                            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#d6b47c]" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#d6b47c]">Sovg'a qadoqlash</p>
                                                <p className="mt-1 text-sm text-gray-300">
                                                    {selectedOrder.totals.giftWrap.type} · {formatMoney(selectedOrder.totals.giftWrap.cost)} UZS
                                                </p>
                                                {selectedOrder.totals.giftWrap.message && (
                                                    <p className="mt-1 text-xs italic text-gray-500">"{selectedOrder.totals.giftWrap.message}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mahsulotlar summasi</span>
                                <span className="text-white font-bold">{formatMoney(selectedOrder.totals?.subtotal)} UZS</span>
                            </div>
                            {(selectedOrder.totals?.discountAmount || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Chegirma</span>
                                    <span className="font-bold text-[#d6b47c]">-{formatMoney(selectedOrder.totals?.discountAmount)} UZS</span>
                                </div>
                            )}
                            {(selectedOrder.totals?.lookDiscountAmount || selectedOrder.totalLookDiscount || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Look chegirmasi</span>
                                    <span className="font-bold text-[#d6b47c]">-{formatMoney(selectedOrder.totals?.lookDiscountAmount || selectedOrder.totalLookDiscount)} UZS</span>
                                </div>
                            )}
                            <div className="h-px bg-white/5" />
                            <div className="flex justify-between">
                                <span className="text-sm font-black uppercase tracking-widest text-[#d6b47c]">{t('common.total')}</span>
                                <span className="text-xl font-black text-white">{formatMoney(selectedOrder.totals?.total || selectedOrder.totalAmount || 0)} UZS</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {selectedOrder.status !== 'Bekor qilindi' && (
                                <button
                                    onClick={() => setReturnOrder(selectedOrder)}
                                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-gray-300"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Qaytarish
                                </button>
                            )}
                            <button
                                onClick={() => setTrackingOrder(selectedOrder)}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-[#d6b47c]/20 bg-[#d6b47c]/10 py-3 text-xs font-black uppercase tracking-widest text-[#d6b47c]"
                            >
                                <Eye className="h-4 w-4" />
                                Kuzatish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {trackingOrder && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setTrackingOrder(null)} />
                    <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setTrackingOrder(null)}
                            className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full bg-[#11131e] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <OrderTimeline order={trackingOrder} />
                    </div>
                </div>
            )}

            {returnOrder && (
                <ReturnRequestModal
                    order={returnOrder}
                    onClose={() => setReturnOrder(null)}
                />
            )}
        </div>
    );
};

export default MobileOrders;
