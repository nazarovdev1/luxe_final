import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Eye, MapPin, Package, ReceiptText, RotateCcw, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import useProductService from '../server/server';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import OrderTimeline from '../components/OrderTimeline';
import ReturnRequestModal from '../components/ReturnRequestModal';

const getStatusClass = (status) => {
    if (status === 'Yetkazildi') return 'bg-green-500/5 text-green-400 border-green-500/20';
    if (status === 'Jarayonda') return 'bg-blue-500/5 text-blue-400 border-blue-500/20';
    if (status === 'Yetkazilmoqda') return 'bg-purple-500/5 text-purple-400 border-purple-500/20';
    if (status === 'Bekor qilindi') return 'bg-red-500/5 text-red-400 border-red-500/20';
    return 'bg-yellow-500/5 text-yellow-400 border-yellow-500/20';
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [returnOrder, setReturnOrder] = useState(null);
    const { getMyOrders } = useProductService();
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();

    const orderStats = useMemo(() => {
        const totalSpent = orders.reduce((sum, order) => sum + (order.totals?.total || order.totalAmount || 0), 0);
        const deliveredCount = orders.filter(order => order.status === 'Yetkazildi').length;
        const activeCount = orders.filter(order => !['Yetkazildi', 'Bekor qilindi'].includes(order.status)).length;
        const lastOrder = orders[0] || null;
        return { totalSpent, deliveredCount, activeCount, lastOrder };
    }, [orders]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const result = await getMyOrders(token);
                if (result.success) setOrders(result.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setSearched(true);
            }
        };

        fetchOrders();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#d6b47c]/5 blur-3xl opacity-40" />
                <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <p className="mb-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#d6b47c]">
                        <ReceiptText className="h-3.5 w-3.5" />
                        {t('orders.title', 'Mening buyurtmalarim')}
                    </p>
                    <h1 className="text-4xl font-light tracking-tight text-white">{t('orders.summary', 'Buyurtmalar tarixi')}</h1>
                    <p className="mt-4 text-lg font-light text-gray-400">Status, mahsulotlar va yetkazib berish ma'lumotlari bir joyda.</p>
                </div>

                <div className="mb-8 rounded-[32px] border border-white/10 bg-[#0f0f0f]/80 p-6 text-left">
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                                <ReceiptText className="h-3.5 w-3.5" />
                                Buyurtma tarixi
                            </p>
                            <h2 className="mt-2 text-2xl font-light text-white">Xaridlaringiz qisqacha holati</h2>
                        </div>
                        {orderStats.lastOrder && (
                            <button
                                onClick={() => setTrackingOrder(orderStats.lastOrder)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d6b47c]/20 bg-[#d6b47c]/10 px-4 py-3 text-sm font-medium text-[#d6b47c] transition-colors hover:bg-[#d6b47c]/20"
                            >
                                Oxirgi buyurtmani kuzatish
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Jami buyurtma</p>
                            <p className="mt-2 text-2xl font-semibold text-white">{orders.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Jarayonda</p>
                            <p className="mt-2 text-2xl font-semibold text-blue-300">{orderStats.activeCount}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Yetkazilgan</p>
                            <p className="mt-2 text-2xl font-semibold text-emerald-300">{orderStats.deliveredCount}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Jami xarid</p>
                            <p className="mt-2 text-2xl font-semibold text-[#d6b47c]">{orderStats.totalSpent.toLocaleString()} <span className="text-xs text-gray-500">so'm</span></p>
                        </div>
                    </div>
                </div>

                {searched && !loading && orders.length === 0 && (
                    <div className="text-center py-20 bg-[#0f0f0f]/50 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">{t('orders.empty', 'Hali buyurtmalar yo\'q')}</h3>
                        <p className="text-gray-500 font-light mb-8">Sizning ilk xaridingiz shu yerda paydo bo'ladi.</p>
                        <Link to="/" className="inline-flex items-center gap-2 text-white border-b border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-colors uppercase text-sm tracking-widest">
                            Xaridni boshlash <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="group bg-[#0f0f0f]/80 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                            <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 pb-8 border-b border-white/5 gap-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="text-xl font-medium text-white tracking-wide">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider border ${getStatusClass(order.status)}`}>
                                            {order.status || 'Kutilmoqda'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm font-light">
                                        <Calendar className="w-4 h-4 mr-2 opacity-70" />
                                        {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{t('checkoutPage.total')}</p>
                                    <p className="text-2xl font-light text-white">
                                        {(order.totals?.total || order.totalAmount || 0).toLocaleString()} <span className="text-sm text-gray-500 font-normal">so'm</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 bg-white/[0.02] p-4 rounded-2xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
                                        <div className="w-20 h-24 bg-[#151515] rounded-xl flex-shrink-0 overflow-hidden border border-white/5">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium text-lg mb-1 truncate">{item.name}</h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-light">
                                                <span className="text-white">{item.quantity} dona</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                <span>{(item.price || 0).toLocaleString()} so'm</span>
                                                {item.selectedSize && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                        <span className="uppercase bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">{item.selectedSize}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 md:flex-row md:items-start">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 w-fit">
                                    <MapPin className="w-5 h-5 text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-300 font-medium mb-1">{t('checkoutPage.step2')}</p>
                                    <p className="text-gray-500 text-sm font-light leading-relaxed max-w-lg">{order.customer?.address || 'Manzil ko\'rsatilmagan'}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {order.status !== 'Bekor qilindi' && (
                                        <button
                                            onClick={() => setReturnOrder(order)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            {t('returnRequest.title')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setTrackingOrder(order)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 hover:border-[#d6b47c]/30 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {t('common.track')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {trackingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        </div>
    );
};

export default Orders;
