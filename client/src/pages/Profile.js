import React, { useState, useEffect } from 'react';
import { Phone, Package, Calendar, MapPin, ChevronRight, Search, Medal, Crown, Gem, RefreshCw, Eye, X, RotateCcw } from 'lucide-react';
import axios from 'axios';
import useProductService from '../server/server';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import OrderTimeline from '../components/OrderTimeline';
import ReturnRequestModal from '../components/ReturnRequestModal';
import ReferralProgram from '../components/ReferralProgram';

const Profile = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [badges, setBadges] = useState([]);
    const [points, setPoints] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [returnOrder, setReturnOrder] = useState(null);
    const { getMyOrders } = useProductService();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated) {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                try {
                    const [ordersRes, badgesRes, pointsRes] = await Promise.all([
                        getMyOrders(token),
                        axios.get('/api/badges/my-badges', config),
                        axios.get('/api/points', config)
                    ]);

                    if (ordersRes.success) setOrders(ordersRes.data);
                    if (badgesRes.data.success) setBadges(badgesRes.data.data);
                    if (pointsRes.data.success) setPoints(pointsRes.data.points);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                    setSearched(true);
                }
            }
        };

        fetchData();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }





    return (
        <div className="min-h-screen bg-black pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl opacity-20" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-light text-white mb-4 tracking-tight">
                        {isAuthenticated ? `Xush kelibsiz` : 'Mening Buyurtmalarim'}
                    </h1>
                    <p className="text-gray-400 font-light text-lg">
                        {isAuthenticated
                            ? 'Sizning barcha premium xaridlaringiz tarixi'
                            : 'Telefon raqamingiz orqali buyurtmalaringizni kuzating'}
                    </p>

                    {!isAuthenticated && (
                        <div className="mt-8 flex justify-center items-center space-x-6 text-sm tracking-wide uppercase">
                            <Link to="/login" className="text-white hover:text-gray-300 transition-colors border-b border-white/20 pb-1">
                                Kirish
                            </Link>
                            <span className="text-gray-700">|</span>
                            <Link to="/register" className="text-white hover:text-gray-300 transition-colors border-b border-white/20 pb-1">
                                Ro'yxatdan o'tish
                            </Link>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className="mt-12 space-y-8 max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* VIP Status Card */}
                                <Link to="/vip-club" className="relative overflow-hidden flex flex-col bg-[#111] border border-[#d6b47c]/20 p-8 rounded-[32px] hover:border-[#d6b47c]/40 transition-all group text-left">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                        <Crown className="w-24 h-24 text-[#d6b47c]" />
                                    </div>
                                    
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-[#d6b47c]/10 flex items-center justify-center text-[#d6b47c]">
                                            <Crown className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#d6b47c] font-black uppercase tracking-widest mb-1">VIP Darajangiz</p>
                                            <h3 className="text-3xl font-serif text-white">{points?.level || 'Bronze'}</h3>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {points && points.level !== 'Diamond' && (
                                        <div className="mt-auto pt-4 border-t border-white/5">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray-400">Keyingi darajagacha</span>
                                                <span className="text-white font-medium">
                                                    {points.level === 'Bronze' ? 300 - points.totalEarned : 
                                                     points.level === 'Silver' ? 650 - points.totalEarned : 
                                                     1000 - points.totalEarned} ball
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-[#d6b47c] to-[#f0d0a4] transition-all duration-1000"
                                                    style={{ 
                                                        width: `${Math.min(100, (points.totalEarned / (
                                                            points.level === 'Bronze' ? 300 : 
                                                            points.level === 'Silver' ? 650 : 1000
                                                        )) * 100)}%` 
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 italic text-center">
                                                {points.level === 'Bronze' ? 'Silver' : points.level === 'Silver' ? 'Gold' : 'Diamond'} darajasiga yaqinlashmoqdasiz
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-gray-400">Jami to'plangan: <span className="text-white font-semibold">{points?.totalEarned?.toLocaleString()} pts</span></p>
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-xs text-white">
                                            <Gem className="w-3.5 h-3.5 text-amber-300" />
                                            {points?.balance?.toLocaleString()} balans
                                        </div>
                                    </div>
                                </Link>

                                {/* Points Transaction History */}
                                <div className="bg-[#111] border border-white/5 p-8 rounded-[32px] text-left flex flex-col h-full">
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5" /> Ballar tarixi
                                    </p>
                                    <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                        {points?.transactions?.length > 0 ? (
                                            points.transactions.map((tx, idx) => (
                                                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-white truncate">{tx.description}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </span>
                                                </div>
                                            )).reverse()
                                        ) : (
                                            <p className="text-xs text-gray-600 italic py-4">Hali ballar tarixi yo'q</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Badges Preview */}
                            <div className="bg-[#111] border border-white/5 p-6 rounded-[32px] text-left">
                                <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Medal className="w-3.5 h-3.5" /> Erishilgan nishonlar
                                </p>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {badges.map(b => (
                                        <div key={b._id} className="group relative flex flex-col items-center gap-2 shrink-0">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-white/10 group-hover:border-white/20 transition-all cursor-help">
                                                {b.badge.icon}
                                            </div>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{b.badge.name}</span>
                                        </div>
                                    ))}
                                    {badges.length === 0 && <p className="text-xs text-gray-600 italic px-2">Hali nishonlar yo'q</p>}
                                </div>
                            </div>

                            {/* Referral Program */}
                            <ReferralProgram user={user} />
                        </div>
                    )}
                </div>

                {/* Search Form - Only show if not authenticated */}
                {!isAuthenticated && (
                    <div className="bg-[#0f0f0f]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-12 max-w-2xl mx-auto shadow-2xl">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+998 90 123 45 67"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all font-light"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-white hover:bg-gray-200 text-black px-10 py-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 uppercase tracking-wider text-sm"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        <span>Qidirish</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Results - Empty State */}
                {searched && !loading && orders.length === 0 && (
                    <div className="text-center py-20 bg-[#0f0f0f]/50 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Buyurtmalar mavjud emas</h3>
                        <p className="text-gray-500 font-light mb-8">Hozircha sizda hech qanday buyurtma yo'q</p>
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
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider border ${order.status === 'Yetkazildi' ? 'bg-green-500/5 text-green-400 border-green-500/20' :
                                                order.status === 'Jarayonda' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                                                    order.status === 'Yetkazilmoqda' ? 'bg-purple-500/5 text-purple-400 border-purple-500/20' :
                                                        order.status === 'Bekor qilindi' ? 'bg-red-500/5 text-red-400 border-red-500/20' :
                                                            'bg-yellow-500/5 text-yellow-400 border-yellow-500/20'
                                            }`}>
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
                                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Umumiy qiymat</p>
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
                                                {item.selectedColor && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: item.selectedColor }}></span>
                                                            <span className="capitalize">{item.selectedColor}</span>
                                                        </div>
                                                    </>
                                                )}
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

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                                    <MapPin className="w-5 h-5 text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-300 font-medium mb-1">Yetkazib berish manzili</p>
                                    <p className="text-gray-500 text-sm font-light leading-relaxed max-w-lg">{order.customer.address}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {order.status !== 'Bekor qilindi' && (
                                        <button
                                            onClick={() => setReturnOrder(order)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Qaytarish
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setTrackingOrder(order)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 hover:border-[#d6b47c]/30 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Kuzatish
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Tracking Modal */}
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

                {/* Return Request Modal */}
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

export default Profile;
