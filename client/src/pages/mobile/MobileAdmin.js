import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import useProductService from '../../server/server';
import {
  Package,
  ShoppingBag,
  Users,
  Plus,
  LogOut,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  User as UserIcon,
  Layers,
  Tag,
  ShieldCheck,
  TicketPercent,
  BadgePercent,
} from 'lucide-react';
import LoginForm from '../../components/LoginForm';
import LookbookManager from '../../components/LookbookManager';
import './mobileAdminTheme.css';

const ORDER_STATUSES = ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'];

const getStatusClass = (status) => {
  if (status === 'Yetkazildi') {
    return 'mobile-admin-pill mobile-admin-pill-success';
  }

  if (status === 'Bekor qilindi') {
    return 'mobile-admin-pill mobile-admin-pill-danger';
  }

  if (status === 'Jarayonda' || status === 'Yetkazilmoqda') {
    return 'mobile-admin-pill mobile-admin-pill-info';
  }

  return 'mobile-admin-pill mobile-admin-pill-warning';
};

const getProductImage = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  return product.image || '';
};

const MobileAdmin = () => {
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
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState(null);

  const [newPromo, setNewPromo] = useState({ code: '', discountPercentage: '' });
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  const adminToken = token || localStorage.getItem('token');

  const promoStats = useMemo(() => {
    const active = promos.filter((promo) => promo.isActive).length;
    return {
      total: promos.length,
      active,
      inactive: promos.length - active,
    };
  }, [promos]);

  const tabs = useMemo(
    () => [
      { id: 'products', label: 'Mahsulotlar', icon: Package, count: products.length },
      { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag, count: orders.length },
      { id: 'users', label: 'Mijozlar', icon: Users, count: users.length },
      { id: 'promos', label: 'Promokod', icon: Tag, count: promos.length },
      { id: 'lookbook', label: 'Lookbook', icon: Layers, count: '' },
    ],
    [products.length, orders.length, users.length, promos.length]
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
    if (!window.confirm("Buyurtmani rostdan ham o'chirmoqchimisiz?")) {
      return;
    }

    const result = await deleteOrder(orderId, adminToken);
    if (result.success) {
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Mahsulotni rostdan ham o'chirmoqchimisiz?")) {
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
    if (!window.confirm("Promokodni rostdan ham o'chirmoqchimisiz?")) {
      return;
    }

    const result = await deletePromo(promoId, adminToken);
    if (result.success) {
      setPromos((prev) => prev.filter((promo) => promo._id !== promoId));
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="mobile-admin-shell flex items-center justify-center px-4">
        <div className="mobile-admin-card w-full max-w-sm p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-red-300" />
          </div>
          <h1 className="text-xl font-semibold">Ruxsat yo'q</h1>
          <p className="mobile-admin-muted text-sm">Bu bo'lim faqat admin foydalanuvchilar uchun.</p>
          <button
            type="button"
            onClick={() => navigate('/mobile')}
            className="mobile-admin-btn-primary w-full py-3"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-admin-shell pb-36">
      <header className="mobile-admin-header px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="mobile-admin-title text-sm">Luxe Mobile Admin</h1>
              <p className="mobile-admin-muted text-[11px] truncate">Real-time boshqaruv paneli</p>
            </div>
          </div>

          <button type="button" onClick={logout} className="mobile-admin-icon-btn" title="Chiqish">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4 relative z-10">
        <section className="mobile-admin-card p-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="mobile-admin-card-soft p-3">
              <p className="mobile-admin-muted text-[10px] uppercase tracking-[0.12em]">Catalog</p>
              <p className="text-xl font-bold text-amber-200 mt-1">{products.length}</p>
            </div>
            <div className="mobile-admin-card-soft p-3">
              <p className="mobile-admin-muted text-[10px] uppercase tracking-[0.12em]">Orders</p>
              <p className="text-xl font-bold text-amber-200 mt-1">{orders.length}</p>
            </div>
            <div className="mobile-admin-card-soft p-3">
              <p className="mobile-admin-muted text-[10px] uppercase tracking-[0.12em]">Promos</p>
              <p className="text-xl font-bold text-amber-200 mt-1">{promos.length}</p>
            </div>
          </div>
        </section>

        <section className="mobile-admin-card p-2.5">
          <div className="mobile-admin-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`mobile-admin-tab ${isActive ? 'mobile-admin-tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== '' && tab.count !== undefined ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === 'products' ? (
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/mobile/admin/new')}
              className="mobile-admin-btn-primary w-full py-3"
            >
              <Plus className="w-4.5 h-4.5" />
              Yangi mahsulot qo'shish
            </button>

            {productsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="mobile-admin-loading w-9 h-9" />
              </div>
            ) : products.length === 0 ? (
              <div className="mobile-admin-empty p-10 text-center">
                <Package className="w-11 h-11 mx-auto mb-3 text-slate-500" />
                <p className="mobile-admin-muted text-sm">Mahsulotlar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <article key={product.id} className="mobile-admin-card p-3.5">
                    <div className="flex items-start gap-3">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-600/60"
                      />

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3 className="text-sm font-semibold text-slate-100 truncate">{product.name}</h3>
                        <p className="mobile-admin-muted text-xs truncate">{product.category}</p>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-sm text-amber-200 font-semibold">
                            {Number(product.price || 0).toLocaleString('uz-UZ')} so'm
                          </p>

                          {product.badge === 'NEW' ? (
                            <span className="mobile-admin-pill mobile-admin-pill-success">NEW</span>
                          ) : product.badge === 'BESTSELLER' ? (
                            <span className="mobile-admin-pill mobile-admin-pill-warning">BEST</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/mobile/admin/edit/${product.id}`)}
                          className="mobile-admin-icon-btn"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="mobile-admin-icon-btn"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4 text-red-300" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'orders' ? (
          <section className="space-y-3">
            <button
              type="button"
              onClick={fetchOrders}
              className="mobile-admin-btn-secondary w-full py-2.5"
            >
              <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            {loadingOrders ? (
              <div className="py-12 flex justify-center">
                <div className="mobile-admin-loading w-9 h-9" />
              </div>
            ) : orders.length === 0 ? (
              <div className="mobile-admin-empty p-10 text-center">
                <ShoppingBag className="w-11 h-11 mx-auto mb-3 text-slate-500" />
                <p className="mobile-admin-muted text-sm">Buyurtmalar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article key={order._id} className="mobile-admin-card p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="mobile-admin-muted text-xs inline-flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                      <span className={getStatusClass(order.status)}>{order.status}</span>
                    </div>

                    <div className="space-y-1.5">
                      <p className="mobile-admin-muted text-xs inline-flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-amber-200" />
                        <span className="text-slate-100">{order.customer?.name || 'Nomaʼlum'}</span>
                      </p>
                      <p className="mobile-admin-muted text-xs inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-200" />
                        <span className="text-slate-100">{order.customer?.phone || '-'}</span>
                      </p>
                      <p className="mobile-admin-muted text-xs inline-flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-amber-200" />
                        <span className="text-slate-100 line-clamp-2">{order.customer?.address || 'Manzil yo\'q'}</span>
                      </p>
                    </div>

                    <div className="mobile-admin-card-soft p-2.5 flex items-center justify-between">
                      <span className="mobile-admin-muted text-xs">Jami summa</span>
                      <span className="text-amber-200 text-sm font-semibold">
                        {Number(order.totals?.total || 0).toLocaleString('uz-UZ')} so'm
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <select
                        value={order.status}
                        onChange={(event) => handleStatusChange(order._id, event.target.value)}
                        disabled={statusUpdatingOrderId === order._id}
                        className="mobile-admin-select"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order._id)}
                        className="mobile-admin-btn-danger px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'users' ? (
          <section className="space-y-3">
            <button
              type="button"
              onClick={fetchUsers}
              className="mobile-admin-btn-secondary w-full py-2.5"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            {loadingUsers ? (
              <div className="py-12 flex justify-center">
                <div className="mobile-admin-loading w-9 h-9" />
              </div>
            ) : users.length === 0 ? (
              <div className="mobile-admin-empty p-10 text-center">
                <Users className="w-11 h-11 mx-auto mb-3 text-slate-500" />
                <p className="mobile-admin-muted text-sm">Foydalanuvchilar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((item) => (
                  <article key={item._id} className="mobile-admin-card p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 font-bold flex items-center justify-center">
                        {item.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">{item.username}</h3>
                          {item.isAdmin ? (
                            <span className="mobile-admin-pill mobile-admin-pill-info">Admin</span>
                          ) : null}
                        </div>
                        <p className="mobile-admin-muted text-xs mt-1">{item.phone || '-'}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'promos' ? (
          <section className="space-y-3">
            <div className="mobile-admin-card p-3.5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="mobile-admin-card-soft p-2.5 text-center">
                  <p className="mobile-admin-muted text-[10px] uppercase">Jami</p>
                  <p className="text-base text-amber-200 font-semibold mt-1">{promoStats.total}</p>
                </div>
                <div className="mobile-admin-card-soft p-2.5 text-center">
                  <p className="mobile-admin-muted text-[10px] uppercase">Faol</p>
                  <p className="text-base text-emerald-200 font-semibold mt-1">{promoStats.active}</p>
                </div>
                <div className="mobile-admin-card-soft p-2.5 text-center">
                  <p className="mobile-admin-muted text-[10px] uppercase">Noaktiv</p>
                  <p className="text-base text-red-200 font-semibold mt-1">{promoStats.inactive}</p>
                </div>
              </div>

              <form onSubmit={handleCreatePromo} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] mobile-admin-muted mb-1">Promokod</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(event) =>
                      setNewPromo((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
                    }
                    placeholder="YANGI20"
                    className="mobile-admin-input uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] mobile-admin-muted mb-1">Chegirma foizi</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromo.discountPercentage}
                    onChange={(event) =>
                      setNewPromo((prev) => ({ ...prev, discountPercentage: event.target.value }))
                    }
                    placeholder="20"
                    className="mobile-admin-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingPromo}
                  className="mobile-admin-btn-primary w-full py-2.5 disabled:opacity-60"
                >
                  <TicketPercent className="w-4 h-4" />
                  {isCreatingPromo ? 'Saqlanmoqda...' : "Promokod qo'shish"}
                </button>
              </form>
            </div>

            <button
              type="button"
              onClick={fetchPromos}
              className="mobile-admin-btn-secondary w-full py-2.5"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPromos ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            {loadingPromos ? (
              <div className="py-12 flex justify-center">
                <div className="mobile-admin-loading w-9 h-9" />
              </div>
            ) : promos.length === 0 ? (
              <div className="mobile-admin-empty p-10 text-center">
                <BadgePercent className="w-11 h-11 mx-auto mb-3 text-slate-500" />
                <p className="mobile-admin-muted text-sm">Hozircha promokodlar yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((promo) => (
                  <article key={promo._id} className="mobile-admin-card p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold tracking-wider text-white">{promo.code}</p>
                        <p className="text-xs text-amber-200 mt-1">-{promo.discountPercentage}% chegirma</p>
                      </div>
                      <span
                        className={promo.isActive ? 'mobile-admin-pill mobile-admin-pill-success' : 'mobile-admin-pill mobile-admin-pill-danger'}
                      >
                        {promo.isActive ? 'Faol' : 'Noaktiv'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePromo(promo._id, promo.isActive)}
                        className={promo.isActive ? 'mobile-admin-btn-secondary py-2 text-sm' : 'mobile-admin-btn-primary py-2 text-sm'}
                      >
                        {promo.isActive ? 'Noaktiv qilish' : 'Faollashtirish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromo(promo._id)}
                        className="mobile-admin-btn-danger py-2 text-sm"
                      >
                        O'chirish
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'lookbook' ? (
          <section className="mobile-admin-card p-3.5">
            <LookbookManager />
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default MobileAdmin;
