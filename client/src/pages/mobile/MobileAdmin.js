import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductService from '../../server/server';
import {
  Package,
  ShoppingBag,
  Users,
  Plus,
  LogOut,
  Edit3,
  Trash2,
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  User as UserIcon,
  Layers,
  Tag,
  ShieldCheck,
  Search,
  X,
  Clock,
  Gift,
  Crown,
  Sparkles,
  TicketPercent,
  LayoutGrid,
  ListFilter,
  Eye,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Home,
  ArrowLeft,
} from 'lucide-react';
import LoginForm from '../../components/LoginForm';
import LookbookManager from '../../components/LookbookManager';
import './mobileAdminTheme.css';

const ORDER_STATUSES = ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'];

const STATUS_CONFIG = {
  'Kutilmoqda': { key: 'mobileAdmin.order_statuses_pending', pill: 'lux-badge-amber', label: 'Kutilmoqda' },
  'Jarayonda': { key: 'mobileAdmin.order_statuses_processing', pill: 'lux-badge-blue', label: 'Jarayonda' },
  'Yetkazilmoqda': { key: 'mobileAdmin.order_statuses_shipping', pill: 'lux-badge-gold', label: 'Yetkazilmoqda' },
  'Yetkazildi': { key: 'mobileAdmin.order_statuses_delivered', pill: 'lux-badge-green', label: 'Yetkazildi' },
  'Bekor qilindi': { key: 'mobileAdmin.order_statuses_cancelled', pill: 'lux-badge-red', label: 'Bekor qilindi' },
};

const TIME_SLOT_KEYS = {
  morning: 'mobileAdmin.time_morning',
  afternoon: 'mobileAdmin.time_afternoon',
  evening: 'mobileAdmin.time_evening',
  late_evening: 'mobileAdmin.time_late_evening',
  express: 'mobileAdmin.time_express',
};

const GIFT_TYPE_KEYS = {
  classic: 'mobileAdmin.gift_classic',
  premium: 'mobileAdmin.gift_premium',
  minimal: 'mobileAdmin.gift_minimal',
};

const getProductImage = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === 'object' ? (first.url || '/placeholder.jpg') : first;
  }
  return product?.image || '/placeholder.jpg';
};

const formatPrice = (price) => {
  const num = Number(price || 0);
  return num.toLocaleString('uz-UZ').replace(/,/g, '.');
};

const MobileAdmin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { isAuthenticated, user, token, logout } = useAuth();
  const { products, removeProduct, isLoading: productsLoading } = useProducts();
  const {
    getAllOrders,
    getAllUsers,
    updateOrderStatus,
    deleteOrder,
    getPromos,
    createPromo,
    updatePromoStatus,
    deletePromo,
  } = useProductService();

  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [promos, setPromos] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState(null);

  // View state & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('ALL');

  const [newPromo, setNewPromo] = useState({ code: '', discountPercentage: '' });
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);

  const adminToken = token || localStorage.getItem('token');

  // Stats calculation
  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === 'Kutilmoqda').length;
    const activePromos = promos.filter((p) => p.isActive).length;
    const totalOrderSum = orders.reduce((sum, o) => sum + (Number(o.totals?.total) || 0), 0);
    return {
      productsCount: products.length,
      ordersCount: orders.length,
      pendingOrders,
      promosCount: activePromos,
      usersCount: users.length,
      totalOrderSum,
    };
  }, [products.length, orders, promos, users.length]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const tabs = useMemo(
    () => [
      { id: 'products', label: t('mobileAdmin.tab_products', 'Katalog'), icon: Package, count: products.length },
      { id: 'orders', label: t('mobileAdmin.tab_orders', 'Buyurtmalar'), icon: ShoppingBag, count: orders.length, badge: stats.pendingOrders > 0 ? stats.pendingOrders : null },
      { id: 'promos', label: t('mobileAdmin.tab_promos', 'Promolar'), icon: Tag, count: promos.length },
      { id: 'users', label: t('mobileAdmin.tab_users', 'Mijozlar'), icon: Users, count: users.length },
      { id: 'lookbook', label: t('mobileAdmin.tab_lookbook', 'Lookbook'), icon: Layers },
    ],
    [products.length, orders.length, users.length, promos.length, stats.pendingOrders, t]
  );

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const result = await getAllOrders(adminToken);
    if (result.success) {
      setOrders(result.data || []);
    }
    setLoadingOrders(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const result = await getAllUsers(adminToken);
    if (result.success) {
      setUsers(result.data || []);
    }
    setLoadingUsers(false);
  };

  const fetchPromos = async () => {
    setLoadingPromos(true);
    const result = await getPromos(adminToken);
    if (result.success) {
      setPromos(result.data || []);
    }
    setLoadingPromos(false);
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([fetchOrders(), fetchUsers(), fetchPromos()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      return;
    }

    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    }

    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    }

    if (activeTab === 'promos' && promos.length === 0) {
      fetchPromos();
    }
  }, [activeTab, isAuthenticated, user?.isAdmin]);

  const handleStatusChange = async (orderId, status) => {
    setStatusUpdatingOrderId(orderId);
    const result = await updateOrderStatus(orderId, status, adminToken);

    if (result.success) {
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status } : order))
      );
    }

    setStatusUpdatingOrderId(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t('mobileAdmin.confirm_delete_order', 'Ushbu buyurtmani o‘chirmoqchimisiz?'))) {
      return;
    }

    const result = await deleteOrder(orderId, adminToken);
    if (result.success) {
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t('mobileAdmin.confirm_delete_product', 'Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?'))) {
      return;
    }

    await removeProduct(productId);
  };

  const handleCreatePromo = async (event) => {
    event.preventDefault();

    if (!newPromo.code.trim() || !newPromo.discountPercentage) {
      return;
    }

    const discount = Number(newPromo.discountPercentage);
    if (Number.isNaN(discount) || discount < 1 || discount > 100) {
      return;
    }

    setIsCreatingPromo(true);

    const result = await createPromo(
      {
        code: newPromo.code.trim().toUpperCase(),
        discountPercentage: discount,
      },
      adminToken
    );

    if (result.success) {
      setNewPromo({ code: '', discountPercentage: '' });
      setShowPromoForm(false);
      fetchPromos();
    }

    setIsCreatingPromo(false);
  };

  const handleTogglePromo = async (promoId, isActive) => {
    const result = await updatePromoStatus(promoId, !isActive, adminToken);
    if (result.success) {
      setPromos((prev) =>
        prev.map((promo) =>
          promo._id === promoId ? { ...promo, isActive: !isActive } : promo
        )
      );
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm(t('mobileAdmin.confirm_delete_promo', 'Ushbu promokodni o‘chirmoqchimisiz?'))) {
      return;
    }

    const result = await deletePromo(promoId, adminToken);
    if (result.success) {
      setPromos((prev) => prev.filter((promo) => promo._id !== promoId));
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = !searchQuery.trim() ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !searchQuery.trim() ||
        (order._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer?.phone || '').includes(searchQuery);
      const matchesStatus = selectedOrderStatus === 'ALL' || order.status === selectedOrderStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedOrderStatus]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!searchQuery.trim()) return true;
      return (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone || '').includes(searchQuery);
    });
  }, [users, searchQuery]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="lux-admin-shell flex items-center justify-center px-4 min-h-[90vh]">
        <div className="lux-card w-full max-w-sm p-7 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{t('mobileAdmin.access_denied_title', 'Kirish taqiqlandi')}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">{t('mobileAdmin.access_denied_desc', 'Bu bo‘lim faqat Luxx ma‘murlari uchun mo‘ljallangan.')}</p>
          <button
            type="button"
            onClick={() => navigate('/mobile')}
            className="lux-btn-gold"
          >
            {t('mobileAdmin.back_home', 'Bosh sahifaga qaytish')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-admin-shell pb-36">
      {/* ─── Luxury Editorial Studio Header ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#050608]/85 border-b border-white/5 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/mobile')}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-400/10 flex-shrink-0 active:scale-95 transition-transform"
              title="Bosh sahifaga o‘tish"
            >
              <Crown className="w-5 h-5 fill-current" />
            </button>
            <div
              className="min-w-0 cursor-pointer"
              onClick={() => navigate('/mobile')}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">LUXX ATELIER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                {t('mobileAdmin.header_title', 'Boshqaruv Studiyasi')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/mobile')}
              className="lux-action-pill-btn bg-white/5 text-amber-300 border-white/10 hover:bg-white/10"
              title="Bosh menyu / Do‘konga qaytish"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRefreshAll}
              className="lux-action-pill-btn"
              title={t('mobileAdmin.refresh', 'Yangilash')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : 'text-neutral-300'}`} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/mobile/admin/new')}
              className="lux-action-pill-btn bg-amber-400/20 text-amber-300 border-amber-400/40"
              title={t('mobileAdmin.add_product', 'Yangi mahsulot')}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={logout}
              className="lux-action-pill-btn lux-action-pill-btn-danger"
              title={t('mobileAdmin.logout_title', 'Chiqish')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4 relative z-10">
        {/* ─── Executive Bento Showcase ─── */}
        <section className="space-y-2.5">
          {/* Main Hero Card */}
          <div className="lux-bento-hero">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  ATELIER OVERVIEW
                </span>
              </div>
              {stats.pendingOrders > 0 && (
                <span className="lux-badge lux-badge-gold">
                  {stats.pendingOrders} yangi buyurtma
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight font-serif">
                  {formatPrice(stats.totalOrderSum)} <span className="text-xs font-sans text-amber-300 font-bold uppercase">UZS</span>
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">Jami aylanma hajmi</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
              >
                <span>Ko‘rish</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sub Bento Dual Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`lux-bento-sub text-left ${activeTab === 'products' ? 'border-amber-400/60 ring-1 ring-amber-400/40' : ''}`}
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Katalog</span>
                <Package className="w-4 h-4 text-amber-300" />
              </div>
              <div className="pt-2">
                <p className="text-2xl font-bold text-white tracking-tight">{stats.productsCount}</p>
                <p className="text-[11px] text-neutral-400 truncate">Atelier modellari</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promos')}
              className={`lux-bento-sub text-left ${activeTab === 'promos' ? 'border-amber-400/60 ring-1 ring-amber-400/40' : ''}`}
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Promokodlar</span>
                <Tag className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="pt-2">
                <p className="text-2xl font-bold text-white tracking-tight">{stats.promosCount}</p>
                <p className="text-[11px] text-neutral-400 truncate">Faol chegirmalar</p>
              </div>
            </button>
          </div>
        </section>

        {/* ─── Apple Segmented Bar ─── */}
        <section className="lux-segmented-container">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`lux-tab-btn ${isActive ? 'is-active' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count !== '' && (
                  <span className="lux-tab-counter">{tab.count}</span>
                )}
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </section>

        {/* ─── TAB 1: PRODUCTS (KATALOG) ─── */}
        {activeTab === 'products' && (
          <section className="space-y-3.5">
            {/* Action & View Switcher Bar */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate('/mobile/admin/new')}
                className="lux-btn-gold py-3 flex-1 text-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t('mobileAdmin.add_product', 'Yangi mahsulot qo‘shish')}</span>
              </button>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-amber-300 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="2-qatorli Grid ko‘rinishi"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-amber-300 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Ro‘yxat ko‘rinishi"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="lux-search-bar">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('mobileAdmin.search_placeholder', 'Model nomi yoki kategoriya...')}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-neutral-400 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  Hammasi ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-300 text-black shadow-md'
                        : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Products Gallery Display */}
            {productsLoading ? (
              <div className="py-16 flex justify-center">
                <div className="lux-spinner" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="lux-empty-state space-y-2">
                <Package className="w-10 h-10 text-neutral-500 mb-1" />
                <p className="text-sm font-semibold text-neutral-300">{t('mobileAdmin.empty_products', 'Mahsulotlar topilmadi')}</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                    className="text-xs text-amber-400 font-bold"
                  >
                    Filtrlarni bekor qilish
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* ─── 2-Column Fashion Runway Grid ─── */
              <div className="lux-product-grid">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="lux-product-card group">
                    <div className="lux-product-cover-wrap">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        loading="lazy"
                        className="lux-product-cover"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.badge === 'NEW' && (
                          <span className="lux-badge lux-badge-green">NEW</span>
                        )}
                        {product.badge === 'BESTSELLER' && (
                          <span className="lux-badge lux-badge-gold">TOP</span>
                        )}
                        {product.isLookbook && (
                          <span className="lux-badge lux-badge-purple">LOOKBOOK</span>
                        )}
                      </div>

                      {/* Floating Action Overlay */}
                      <div className="lux-product-actions-overlay">
                        <button
                          type="button"
                          onClick={() => navigate(`/mobile/admin/edit/${product.id}`)}
                          className="lux-action-pill-btn"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="lux-action-pill-btn lux-action-pill-btn-danger"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium truncate">
                          {product.category || 'Atelier'}
                        </p>
                        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="pt-1 border-t border-white/5 flex items-baseline justify-between">
                        <p className="text-xs font-extrabold text-amber-300 font-serif">
                          {formatPrice(product.price)} <span className="text-[9px] font-sans text-neutral-400 font-semibold">so‘m</span>
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* ─── 1-Column Editorial Row List ─── */
              <div className="space-y-2.5">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="lux-row-card">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      className="lux-row-thumb"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
                          {product.category || 'Atelier'}
                        </span>
                        {product.badge === 'NEW' && (
                          <span className="lux-badge lux-badge-green">NEW</span>
                        )}
                        {product.badge === 'BESTSELLER' && (
                          <span className="lux-badge lux-badge-gold">TOP</span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-white truncate">
                        {product.name}
                      </h3>

                      <p className="text-sm font-extrabold text-amber-300 font-serif pt-1">
                        {formatPrice(product.price)} <span className="text-[10px] font-sans text-neutral-400 font-semibold">so‘m</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/mobile/admin/edit/${product.id}`)}
                        className="lux-action-pill-btn"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="lux-action-pill-btn lux-action-pill-btn-danger"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB 2: ORDERS (CONCIERGE DESK) ─── */}
        {activeTab === 'orders' && (
          <section className="space-y-3.5">
            {/* Search Bar */}
            <div className="lux-search-bar">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mijoz ismi, telefon yoki buyurtma ID..."
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-neutral-400 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedOrderStatus('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedOrderStatus === 'ALL'
                    ? 'bg-white text-black shadow'
                    : 'bg-white/5 border border-white/10 text-neutral-300'
                }`}
              >
                Barchasi ({orders.length})
              </button>
              {ORDER_STATUSES.map((status) => {
                const conf = STATUS_CONFIG[status];
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedOrderStatus(status)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedOrderStatus === status
                        ? 'bg-amber-300 text-black shadow'
                        : 'bg-white/5 border border-white/10 text-neutral-300'
                    }`}
                  >
                    {t(conf?.key || status, status)} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            {loadingOrders ? (
              <div className="py-16 flex justify-center">
                <div className="lux-spinner" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="lux-empty-state space-y-2">
                <ShoppingBag className="w-10 h-10 text-neutral-500 mb-1" />
                <p className="text-sm font-semibold text-neutral-300">{t('mobileAdmin.empty_orders', 'Buyurtmalar mavjud emas')}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG['Kutilmoqda'];
                  return (
                    <article key={order._id} className="lux-order-pass">
                      {/* Pass Top Bar */}
                      <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <p className="text-xs font-mono font-bold text-amber-200 tracking-wider">
                            #LUX-{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`lux-badge ${statusConf.pill}`}>
                          {t(statusConf.key, order.status)}
                        </span>
                      </div>

                      {/* Customer Info Box */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserIcon className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                            <span className="font-bold text-white truncate">
                              {order.customer?.name || t('mobileAdmin.customer_unknown', 'Noma‘lum mijoz')}
                            </span>
                          </div>

                          {order.customer?.phone && (
                            <a
                              href={`tel:${order.customer.phone}`}
                              className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Qo‘ng‘iroq</span>
                            </a>
                          )}
                        </div>

                        {order.customer?.address && (
                          <div className="flex items-start gap-2 pt-1 border-t border-white/5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span className="text-neutral-300 line-clamp-2 leading-relaxed">
                              {order.customer.address}
                            </span>
                          </div>
                        )}

                        {order.scheduledDelivery && (
                          <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[11px] text-amber-200/90">
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>
                              {new Date(order.scheduledDelivery.date).toLocaleDateString('uz-UZ')} &bull; {
                                t(TIME_SLOT_KEYS[order.scheduledDelivery.timeSlot] || order.scheduledDelivery.timeSlot, order.scheduledDelivery.timeSlot)
                              }
                            </span>
                          </div>
                        )}

                        {order.totals?.giftWrap && (
                          <div className="flex items-center gap-2 text-[11px] text-amber-300/90 pt-1 border-t border-white/5">
                            <Gift className="w-3 h-3 text-amber-300" />
                            <span>{t(GIFT_TYPE_KEYS[order.totals.giftWrap.type] || order.totals.giftWrap.type, 'Sovg‘a qutisi')}</span>
                          </div>
                        )}
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-neutral-400 font-medium">{t('mobileAdmin.total_sum', 'Jami summa')}:</span>
                        <span className="text-base font-extrabold text-amber-300 font-serif">
                          {formatPrice(order.totals?.total)} {t('common.sum', 'so‘m')}
                        </span>
                      </div>

                      {/* Status Selector & Delete Action */}
                      <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={statusUpdatingOrderId === order._id}
                          className="lux-select text-xs font-bold py-2.5"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {t(STATUS_CONFIG[st]?.key || st, st)}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order._id)}
                          className="lux-action-pill-btn lux-action-pill-btn-danger w-10 h-10 rounded-xl"
                          title={t('mobileAdmin.delete', 'O‘chirish')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB 3: PROMOS (APPLE WALLET PASSBOOK) ─── */}
        {activeTab === 'promos' && (
          <section className="space-y-3.5">
            {/* Create Promo Button */}
            <button
              type="button"
              onClick={() => setShowPromoForm((prev) => !prev)}
              className="lux-btn-gold text-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{showPromoForm ? 'Formani yopish' : t('mobileAdmin.create_promo', 'Yangi promokod yaratish')}</span>
            </button>

            {/* Promo Create Form */}
            {showPromoForm && (
              <form onSubmit={handleCreatePromo} className="lux-card p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <TicketPercent className="w-4 h-4" />
                  <span>Yangi Promokod Parametrlari</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">Promokod kodi *</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder={t('mobileAdmin.promo_placeholder', 'Masalan: LUXE2026')}
                    className="lux-input uppercase font-mono font-bold tracking-widest"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">Chegirma foizi (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromo.discountPercentage}
                    onChange={(e) => setNewPromo((p) => ({ ...p, discountPercentage: e.target.value }))}
                    placeholder="15"
                    className="lux-input font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingPromo}
                  className="lux-btn-gold py-3 text-xs mt-2"
                >
                  {isCreatingPromo ? t('mobileAdmin.creating', 'Yaratilmoqda...') : 'Promokodni saqlash'}
                </button>
              </form>
            )}

            {/* Promos List */}
            {loadingPromos ? (
              <div className="py-16 flex justify-center">
                <div className="lux-spinner" />
              </div>
            ) : promos.length === 0 ? (
              <div className="lux-empty-state space-y-2">
                <Tag className="w-10 h-10 text-neutral-500 mb-1" />
                <p className="text-sm font-semibold text-neutral-300">{t('mobileAdmin.empty_promos', 'Promokodlar mavjud emas')}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {promos.map((promo) => (
                  <article key={promo._id} className="lux-ticket-pass">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-black tracking-widest text-white font-mono">
                          {promo.code}
                        </p>
                        <p className="text-xs text-amber-300 font-bold mt-0.5">
                          -{promo.discountPercentage}% {t('mobileAdmin.promo_discount_label', 'chegirma')}
                        </p>
                      </div>

                      <span className={`lux-badge ${promo.isActive ? 'lux-badge-green' : 'lux-badge-red'}`}>
                        {promo.isActive ? t('mobileAdmin.promo_active', 'Faol') : t('mobileAdmin.promo_inactive', 'Nofaol')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleTogglePromo(promo._id, promo.isActive)}
                        className={`text-xs font-bold py-2 rounded-xl transition-all ${
                          promo.isActive
                            ? 'bg-white/5 text-neutral-300 hover:bg-white/10'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {promo.isActive ? t('mobileAdmin.deactivate', 'Nofaol qilish') : t('mobileAdmin.activate', 'Faollashtirish')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePromo(promo._id)}
                        className="text-xs font-bold py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/20"
                      >
                        {t('mobileAdmin.delete', 'O‘chirish')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB 4: USERS (VIP ROLODEX) ─── */}
        {activeTab === 'users' && (
          <section className="space-y-3.5">
            <div className="lux-search-bar">
              <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Foydalanuvchi ismi yoki telefon raqami..."
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-neutral-400 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {loadingUsers ? (
              <div className="py-16 flex justify-center">
                <div className="lux-spinner" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="lux-empty-state space-y-2">
                <Users className="w-10 h-10 text-neutral-500 mb-1" />
                <p className="text-sm font-semibold text-neutral-300">{t('mobileAdmin.empty_users', 'Foydalanuvchilar topilmadi')}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredUsers.map((item) => (
                  <article key={item._id} className="lux-user-card">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-black font-extrabold text-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      {item.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{item.username}</h3>
                        {item.isAdmin && (
                          <span className="lux-badge lux-badge-gold">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {item.phone || item.email || 'Aloqa maʼlumoti yo‘q'}
                      </p>
                    </div>

                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="lux-action-pill-btn bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        title="Qo‘ng‘iroq qilish"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB 5: LOOKBOOK ─── */}
        {activeTab === 'lookbook' && (
          <section className="lux-card p-4">
            <LookbookManager />
          </section>
        )}
      </div>
    </div>
  );
};

export default MobileAdmin;

