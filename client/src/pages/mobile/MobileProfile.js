import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductService from '../../server/server';
import toast from 'react-hot-toast';
import {
    ShoppingBag,
    Phone,
    HelpCircle,
    Info,
    LogOut,
    ChevronRight,
    Package,
    Calendar,
    ArrowLeft,
    MessageCircle,
    Mail,
    Gift,
    MessageSquare,
    Globe,
    Star,
    Heart,
    Bell,
    Shield,
    FileText,
    LayoutDashboard,
    Gem,
    Crown,
    Leaf,
    Radio,
    Camera,
    Swords,
} from 'lucide-react';
import LoginForm from '../../components/LoginForm';

const sectionShell = 'min-h-screen overflow-x-hidden bg-[#07090f] pb-24 px-4 pt-4';

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

const MobileProfile = () => {
    const { t } = useLanguage();
    const { isAuthenticated, user, logout } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const { products } = useProducts();
    const { notificationPermission, enableNotifications, isSupported } = useNotifications();
    const navigate = useNavigate();
    const { getMyOrders } = useProductService();

    const [activeSection, setActiveSection] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const savedProducts = useMemo(
        () => products.filter((product) => favorites.includes(product.id)),
        [products, favorites]
    );

    const [points, setPoints] = useState(null);

    const fetchOrdersAndPoints = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [ordersRes, pointsRes] = await Promise.all([
                    getMyOrders(token),
                    axios.get('/api/points', config)
                ]);
                
                if (ordersRes.success) setOrders(ordersRes.data || []);
                if (pointsRes.data.success) setPoints(pointsRes.data.points);
            } catch (err) {
                console.error(err);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrdersAndPoints();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/mobile');
    };

    const handleMenuSelect = (item) => {
        if (item.isLink) {
            navigate(item.linkTo);
            return;
        }

        if (item.isNotification) {
            if (!isSupported) {
                toast.error('Brauzeringizda xabarnoma qo\'llab-quvvatlanmaydi');
                return;
            }

            if (notificationPermission === 'granted') {
                toast.success('Xabarnomalar allaqachon yoqilgan');
            } else {
                enableNotifications();
            }
            return;
        }

        setActiveSection(item.id);
    };

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    const menuItems = [
        { id: 'orders', label: t('profile.myOrders'), icon: ShoppingBag, subtitle: t('profile.orderHistory') },
        { id: 'saved', label: t('profile.saved'), icon: Heart, subtitle: 'Wishlist', count: favorites.length },
        { id: 'vip', label: 'VIP Club', icon: Crown, subtitle: 'Ball va imtiyozlar', isLink: true, linkTo: '/mobile/vip-club', color: '#d6b47c' },
        { id: 'eco', label: 'Eco Impact', icon: Leaf, subtitle: 'Tabiatga hissam', isLink: true, linkTo: '/mobile/eco-impact', color: '#4ade80' },
        { id: 'live', label: 'Jonli Efirlar', icon: Radio, subtitle: 'Live Commerce', isLink: true, linkTo: '/mobile/live', color: '#ef4444' },
        { id: 'style-feed', label: 'Style Feed', icon: Camera, subtitle: 'Obraz galereyasi', isLink: true, linkTo: '/mobile/style-feed', color: '#d6b47c' },
        { id: 'challenges', label: 'Challenges', icon: Swords, subtitle: 'Musobaqalar', isLink: true, linkTo: '/mobile/challenges', color: '#c9b8ff' },
        { id: 'notifications', label: 'Xabarnomalar', icon: Bell, subtitle: 'Push status', isNotification: true },
        { id: 'contact', label: "Biz bilan bog'lanish", icon: Phone, subtitle: 'Support markazi' },
        { id: 'faq', label: "Ko'p beriladigan savollar", icon: HelpCircle, subtitle: 'Tez javoblar' },
        { id: 'gift-cards', label: "Sovg'a kartalari", icon: Gift, subtitle: 'Mening kartalarim', color: '#fb923c' },
        { id: 'blog', label: 'Fashion Blog', icon: MessageSquare, subtitle: 'Trendlar va stil', isLink: true, linkTo: '/mobile/blog', color: '#f472b6' },
        { id: 'about', label: 'Biz haqimizda', icon: Info, subtitle: 'Brand hikoyasi' },
        { id: 'privacy', label: 'Maxfiylik siyosati', icon: Shield, subtitle: 'Shaxsiy ma\'lumotlar', isLink: true, linkTo: '/mobile/privacy-policy' },
        { id: 'terms', label: 'Foydalanish shartlari', icon: FileText, subtitle: 'Qoidalar', isLink: true, linkTo: '/mobile/terms' },
    ];

    const faqItems = [
        { q: 'Yetkazib berish qancha vaqt oladi?', a: 'Toshkent bo\'ylab 2-3 Soat, viloyatlarga hozircha mavjud emas' },
        { q: 'To\'lov qanday amalga oshiriladi?', a: 'Naqd pul, plastik karta yoki Click/Payme orqali to\'lov tez orada mavjud bo\'ladi' },
        { q: 'Mahsulotni qaytarish mumkinmi?', a: 'Ha, sifat muammosi bo\'lsa 14 kun ichida qaytarish mumkin.' },
        { q: 'Chegirmalar bo\'ladimi?', a: 'Maxsus drop va aksiyalar doimiy ravishda yangilanib boriladi.' },
    ];

    const BackButton = () => (
        <button
            onClick={() => setActiveSection(null)}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-2 text-sm text-gray-400 hover:bg-white/10 transition-colors"
        >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
        </button>
    );

    if (!activeSection) {
        return (
            <div className="relative min-h-screen overflow-x-hidden bg-black pb-24">
                <div className="pointer-events-none fixed inset-0 z-0">
                    {/* Background blobs removed for neutral look */}
                </div>

                <div className="relative z-10 px-4 pt-5">
                    <section className="rounded-[26px] bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Atelier Account</p>
                                <h1 className="text-xl font-semibold text-white">{user?.username || 'Foydalanuvchi'}</h1>
                                <p className="text-sm text-gray-400">{user?.phone || 'Telefon raqam yo\'q'}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">{t('profile.orders')}</p>
                                <p className="mt-1 text-sm font-semibold text-white">{orders.length}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Balans</p>
                                <p className="mt-1 text-sm font-semibold text-amber-300">{points?.balance?.toLocaleString() || 0}</p>
                            </div>
                            <div className="rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 p-2.5 text-center">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-[#d6b47c]">Daraja</p>
                                <p className="mt-1 text-[11px] font-black text-white uppercase">{points?.level || 'Bronze'}</p>
                            </div>
                        </div>
                    </section>

                    {user?.isAdmin && (
                        <button
                            onClick={() => navigate('/mobile/admin')}
                            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#0f0f0f] border border-white/10 p-4 shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                    <LayoutDashboard className="h-5 w-5 text-white" />
                                </span>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">Admin Panel</p>
                                    <p className="text-xs text-gray-400">{t('profile.adminCenter')}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        </button>
                    )}

                    <div className="mt-4 space-y-2.5">
                        {/* Platform Features Section */}
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black px-1 pb-1">Platform</p>
                        {menuItems.filter(i => i.color).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleMenuSelect(item)}
                                className="flex w-full items-center justify-between rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-md border border-white/5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${item.color}15` }}>
                                        <item.icon className="h-4 w-4" style={{ color: item.color }} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            </button>
                        ))}

                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-black px-1 pb-1 pt-2">Hisobim</p>
                        {menuItems.filter(i => !i.color).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleMenuSelect(item)}
                                className="flex w-full items-center justify-between rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-md border border-white/5 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                                        <item.icon className="h-4 w-4 text-white" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.count > 0 && (
                                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white">
                                            {item.count}
                                        </span>
                                    )}
                                    {item.isNotification && notificationPermission === 'granted' && (
                                        <span className="rounded-full bg-[#1f3b2d] px-2 py-0.5 text-[10px] text-[#7ce0a4]">
                                            On
                                        </span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#0f0f0f] border border-white/5 px-4 py-3.5"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                                <LogOut className="h-4 w-4 text-red-400" />
                            </span>
                            <span className="text-sm font-medium text-red-400">Chiqish</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-red-400/50" />
                    </button>
                </div>
            </div>
        );
    }

    if (activeSection === 'orders') {
        return (
            <div className={sectionShell}>
                {/* Order Detail Modal */}
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
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Status</p>
                                    <div className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider inline-block ${getStatusClass(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">Sana</p>
                                    <p className="text-sm font-bold text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('uz-UZ')}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <p className="text-[10px] uppercase tracking-widest text-[#d6b47c] font-black mb-4">Mahsulotlar</p>
                                {selectedOrder.items.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => { setSelectedOrder(null); navigate(`/mobile/product/${item.product}`); }}
                                        className="flex gap-4 bg-white/[0.03] border border-white/10 rounded-3xl p-3 active:scale-[0.98] transition-all"
                                    >
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="text-sm font-bold text-white mb-1">{item.name}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.quantity} dona</p>
                                                {item.size && <p className="text-[10px] text-[#d6b47c] font-black uppercase tracking-widest">Size: {item.size}</p>}
                                            </div>
                                            <p className="text-sm font-black text-white mt-1">{formatMoney(item.price)} UZS</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Mahsulotlar summasi</span>
                                    <span className="text-white font-bold">{formatMoney(selectedOrder.totals?.subtotal)} UZS</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('checkoutPage.delivery')}</span>
                                    <span className="text-[#4ade80] font-bold">{t('checkoutPage.free')}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between">
                                    <span className="text-sm font-black uppercase tracking-widest text-[#d6b47c]">{t('common.total')}</span>
                                    <span className="text-xl font-black text-white">{formatMoney(selectedOrder.totals?.total)} UZS</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">{t('checkoutPage.step2')}</p>
                                    <p className="text-sm text-gray-300 italic leading-relaxed">"{selectedOrder.shippingAddress || 'Manzil ko\'rsatilmagan'}"</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">{t('checkoutPage.phone')}</p>
                                    <p className="text-sm text-gray-300">{selectedOrder.phoneNumber || user?.phone || 'Mavjud emas'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d6b47c]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <BackButton />
                
                <div className="mt-6 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/5 text-[#d6b47c] mb-4 backdrop-blur-md">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Xaridlar Tarixi</span>
                    </div>
                    <h1 className="text-4xl font-brilliant text-white leading-none">
                        {t('profile.myOrders')}
                    </h1>
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
                        <h3 className="text-xl font-brilliant text-gray-400 mb-2">Hali buyurtmalar yo'q</h3>
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
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="relative z-10 flex items-start justify-between mb-6">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-sm font-black text-white tracking-widest">ID #{order._id.slice(-6).toUpperCase()}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center gap-3 mb-6">
                                    <div className="flex -space-x-3">
                                        {order.items.slice(0, 4).map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="w-14 h-14 rounded-2xl border-2 border-[#07090f] bg-[#1a1a1a] overflow-hidden shadow-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/mobile/product/${item.product}`);
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
                                            {formatMoney(order.totals?.total || 0)} <span className="text-xs text-[#d6b47c]">UZS</span>
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
            </div>
        );
    }

    if (activeSection === 'saved') {
        return (
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-3 text-xl font-semibold text-white">Saqlangan mahsulotlar</h2>

                {savedProducts.length === 0 ? (
                    <div className="rounded-3xl bg-[#0f0f0f] border border-white/10 p-8 text-center">
                        <Heart className="mx-auto h-12 w-12 text-gray-600" />
                        <p className="mt-3 text-white">Saqlangan mahsulotlar yo'q</p>
                        <button
                            onClick={() => navigate('/mobile/products')}
                            className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
                        >
                            Mahsulotlarni ko'rish
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {savedProducts.map((product) => (
                            <Link
                                key={product.id}
                                to={`/mobile/product/${product.id}`}
                                className="overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/5 p-2"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(product.id);
                                        }}
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                                    >
                                        <Heart className="h-4 w-4 fill-current" />
                                    </button>
                                </div>
                                <div className="p-2.5">
                                    <h3 className="line-clamp-1 text-sm font-medium text-white">{product.name}</h3>
                                    <p className="mt-1 text-sm font-semibold text-white">
                                        {formatMoney(product.price)} {t('common.sum')}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (activeSection === 'contact') {
        return (
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-3 text-xl font-semibold text-white">Biz bilan bog'lanish</h2>

                <div className="space-y-3">
                    <a href="tel:+998901234567" className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f3b2d]">
                            <Phone className="h-5 w-5 text-[#7ce0a4]" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white">Telefon</p>
                            <p className="text-xs text-gray-400">+998 90 123 45 67</p>
                        </div>
                    </a>

                    <a href="https://t.me/luxe_store" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d3144]">
                            <MessageCircle className="h-5 w-5 text-[#8ac7ff]" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white">Telegram</p>
                            <p className="text-xs text-gray-400">@luxe_store</p>
                        </div>
                    </a>

                    <a href="mailto:info@luxe.uz" className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2a3044]">
                            <Mail className="h-5 w-5 text-[#c7ceda]" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white">Email</p>
                            <p className="text-xs text-gray-400">info@luxe.uz</p>
                        </div>
                    </a>

                    <div className="flex items-center gap-3 rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f2d26]">
                            <Clock className="h-5 w-5 text-[#e8cb95]" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white">Ish vaqti</p>
                            <p className="text-xs text-gray-400">Dushanba - Shanba: 9:00 - 18:00</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeSection === 'gift-cards') {
        return (
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-4 text-xl font-semibold text-white">Mening sovg'a kartalarim</h2>
                <MyGiftCards />
            </div>
        );
    }

    if (activeSection === 'faq') {
        return (
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-3 text-xl font-semibold text-white">Ko'p beriladigan savollar</h2>
                <div className="space-y-3">
                    {faqItems.map((item, idx) => (
                        <div key={idx} className="rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                            <h3 className="text-sm font-semibold text-white">{item.q}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activeSection === 'about') {
        return (
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-3 text-xl font-semibold text-white">Biz haqimizda</h2>
                <div className="rounded-[26px] bg-[#0f0f0f] border border-white/5 p-6 shadow-lg">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                            <Star className="h-7 w-7 text-white" />
                        </span>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Luxe Store</h3>
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Premium Fashion</p>
                        </div>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-300">
                        Luxe Store O'zbekiston ayollari uchun zamonaviy, sifatli va premium ruhdagi kolleksiyalarni taqdim etadi.
                        Biz mahsulot tanlashdan tortib yetkazib berishgacha bo'lgan jarayonni editoral tajribaga aylantiramiz.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                            <p className="text-lg font-semibold text-white">100+</p>
                            <p className="text-[11px] text-gray-400">Mijozlar</p>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                            <p className="text-lg font-semibold text-white">1000+</p>
                            <p className="text-[11px] text-gray-400">Mahsulot</p>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                            <p className="text-lg font-semibold text-white">4.9</p>
                            <p className="text-[11px] text-gray-400">Reyting</p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white/5 border border-white/5 p-4">
                        <p className="text-sm text-white">"Sifat, uslub va servis bir xil darajada premium bo'lishi kerak."</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400">
                            <Gem className="h-3.5 w-3.5" />
                            Luxe Atelier Manifest
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default MobileProfile;
