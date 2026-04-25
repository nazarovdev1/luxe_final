import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNotifications } from '../../contexts/NotificationContext';
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
    Clock,
    Star,
    Heart,
    Bell,
    Shield,
    FileText,
    LayoutDashboard,
    Gem,
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
            return 'bg-[#2f2d26] text-[#e8cb95]';
    }
};

const formatMoney = (value) => {
    if (typeof value === 'string') {
        return (Number((value.match(/\d+/g) || []).join('')) || 0).toLocaleString();
    }
    return (Number(value || 0) || 0).toLocaleString();
};

const MobileProfile = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { favorites, toggleFavorite } = useFavorites();
    const { products } = useProducts();
    const { notificationPermission, enableNotifications, isSupported } = useNotifications();
    const navigate = useNavigate();
    const { getMyOrders } = useProductService();

    const [activeSection, setActiveSection] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const savedProducts = useMemo(
        () => products.filter((product) => favorites.includes(product.id)),
        [products, favorites]
    );

    const fetchOrders = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            const result = await getMyOrders(token);
            if (result.success) {
                setOrders(result.data || []);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated && activeSection === 'orders') {
            fetchOrders();
        }
    }, [activeSection, isAuthenticated]);

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
        { id: 'orders', label: 'Buyurtmalarim', icon: ShoppingBag, subtitle: 'Holat va tarix' },
        { id: 'saved', label: 'Saqlangan', icon: Heart, subtitle: 'Wishlist', count: favorites.length },
        { id: 'notifications', label: 'Xabarnomalar', icon: Bell, subtitle: 'Push status', isNotification: true },
        { id: 'contact', label: "Biz bilan bog'lanish", icon: Phone, subtitle: 'Support markazi' },
        { id: 'faq', label: "Ko'p beriladigan savollar", icon: HelpCircle, subtitle: 'Tez javoblar' },
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
                                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Buyurtma</p>
                                <p className="mt-1 text-sm font-semibold text-white">{orders.length}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Saqlangan</p>
                                <p className="mt-1 text-sm font-semibold text-white">{favorites.length}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/5 p-2.5 text-center">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-gray-500">Status</p>
                                <p className="mt-1 text-sm font-semibold text-white">VIP</p>
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
                                    <p className="text-xs text-gray-400">Boshqaruv markazi</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        </button>
                    )}

                    <div className="mt-4 space-y-2.5">
                        {menuItems.map((item) => (
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
            <div className="min-h-screen overflow-x-hidden bg-black pb-24 px-4 pt-4">
                <BackButton />
                <h2 className="mb-3 text-xl font-semibold text-white">Buyurtmalarim</h2>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/5" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-3xl bg-[#0f0f0f] border border-white/10 p-8 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-600" />
                        <p className="mt-3 text-white">Sizda hali buyurtmalar yo'q</p>
                        <button
                            onClick={() => navigate('/mobile/products')}
                            className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
                        >
                            Xarid qilish
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div key={order._id} className="rounded-2xl bg-[#0f0f0f] border border-white/5 p-4">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">#{order._id.slice(-6).toUpperCase()}</h3>
                                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                                        </span>
                                    </div>
                                    <span className={`rounded-lg px-2 py-1 text-[11px] ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mb-3 flex gap-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="h-11 w-11 overflow-hidden rounded-lg bg-white/5">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-full w-full p-2 text-gray-500" />
                                            )}
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-xs text-gray-400">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-sm">
                                    <span className="text-gray-400">{order.items.length} ta mahsulot</span>
                                    <span className="font-semibold text-white">
                                        {(order.totals?.total || 0).toLocaleString()} so'm
                                    </span>
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
                                        {formatMoney(product.price)} so'm
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
