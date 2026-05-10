import React, { useMemo, useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus,
  Package,
  LogOut,
  Edit,
  Trash2,
  ShoppingBag,
  Users,
  Bell,
  Layers,
  Tag,
  Gem,
  Trophy,
  BookOpen,
  PackagePlus,
} from 'lucide-react';
import ProductForm from './ProductForm';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminAnnouncements from './AdminAnnouncements';
import LookbookManager from './LookbookManager';
import BundleManager from './BundleManager';
import AdminPromos from './AdminPromos';
import AdminCoupons from './AdminCoupons';
import AdminChallenges from './AdminChallenges';
import AdminBadges from './AdminBadges';
import AdminReels from './AdminReels';
import BlogManager from './admin/BlogManager';
import axios from 'axios';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './admin/adminTheme.css';

const formatCurrency = (value) => {
  const numericValue = Number(value || 0);
  return `${numericValue.toLocaleString('uz-UZ')} so'm`;
};

const getProductImage = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  return product.image || '';
};

const tabs = [
  {
    id: 'products',
    label: 'Mahsulotlar',
    description: 'Catalog va narxlarni boshqarish',
    icon: Package,
  },
  {
    id: 'orders',
    label: 'Buyurtmalar',
    description: 'Holat va yetkazib berishni nazorat qilish',
    icon: ShoppingBag,
  },
  {
    id: 'users',
    label: 'Mijozlar',
    description: 'Foydalanuvchi bazasi',
    icon: Users,
  },
  {
    id: 'reels',
    label: 'Reels',
    description: 'Videolar boshqaruvi',
    icon: TrendingUp,
  },
  {
    id: 'coupons',
    label: 'Kuponlar',
    description: 'Loyallik tizimi kuponlari',
    icon: Tag,
  },
  {
    id: 'challenges',
    label: 'Musobaqalar',
    description: 'Style challenges boshqaruvi',
    icon: Gem,
  },
  {
    id: 'badges',
    label: 'Nishonlar',
    description: 'Erishiladigan yutuqlar',
    icon: Trophy,
  },
  {
    id: 'lookbook',
    label: 'Lookbook',
    description: "Editorial rasmlar",
    icon: Layers,
  },
  {
    id: 'bundles',
    label: "To'plamlar",
    description: "Mahsulot to'plamlari va chegirmalar",
    icon: PackagePlus,
  },
  {
    id: 'blog',
    label: 'Blog',
    description: 'Maqolalar boshqaruvi',
    icon: BookOpen,
  },
  {
    id: 'announcements',
    label: 'Xabarlar',
    description: 'Banner va eʼlonlar',
    icon: Bell,
  },
];

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { products, removeProduct, isLoading: productsLoading } = useProducts();
  const { logout, token } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const res = await axios.get('/api/admin-mgmt/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setAdminStats(res.data.data);
      } catch (err) {
        toast.error('Statistikani yuklashda xato');
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const stats = useMemo(() => {
    const total = products.length;
    const newCount = products.filter((item) => item.badge === 'NEW').length;
    const bestCount = products.filter((item) => item.badge === 'BESTSELLER').length;
    const lookbookCount = products.filter((item) => item.isLookbook).length;

    return {
      total,
      newCount,
      bestCount,
      lookbookCount,
    };
  }, [products]);

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) {
      removeProduct(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (productsLoading) {
    return (
      <div className="admin-shell min-h-screen pt-16 flex items-center justify-center">
        <div className="admin-loading-ring w-12 h-12" />
      </div>
    );
  }

  const tabsWithOverview = [{ id: 'overview', label: 'Umumiy', description: 'Statistika va hisobotlar', icon: BarChart3 }, ...tabs];

  return (
    <div className="admin-shell min-h-screen pt-16 pb-14">
      <div className="admin-orb admin-orb-orange" />
      <div className="admin-orb admin-orb-cyan" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 space-y-6">
        <header className="admin-card admin-gradient-card p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                <Package className="w-4 h-4" />
                LUXE CONTROL CENTER
              </div>

              <div>
                <h1 className="admin-title text-2xl sm:text-3xl leading-tight">Admin Dashboard</h1>
                <p className="admin-muted mt-2 max-w-2xl text-sm sm:text-base">
                  Platformaning barcha qismlarini boshqarish va tahlil qilish uchun asosiy markaz.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleAddNew}
                className="admin-btn-primary px-4 py-2.5 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Yangi mahsulot</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="admin-btn-secondary px-4 py-2.5 w-full sm:w-auto"
              >
                <LogOut className="w-5 h-5" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        </header>

        <section className="admin-card sticky top-16 z-20 px-3 py-3">
          <div className="flex items-center gap-2 overflow-x-auto admin-scroll">
            {tabsWithOverview.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowForm(false);
                  }}
                  className={`admin-tab whitespace-nowrap ${isActive ? 'admin-tab-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <main className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isStatsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
              ) : adminStats && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="admin-card p-6 border-l-4 border-amber-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Jami daromad</p>
                          <h3 className="text-2xl font-bold text-white">{adminStats.totalRevenue.toLocaleString()} <span className="text-xs font-normal">{t('common.sum')}</span></h3>
                        </div>
                        <div className="p-3 bg-amber-400/10 rounded-2xl text-amber-400">
                          <DollarSign className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                    <div className="admin-card p-6 border-l-4 border-blue-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Buyurtmalar</p>
                          <h3 className="text-2xl font-bold text-white">{adminStats.ordersCount}</h3>
                        </div>
                        <div className="p-3 bg-blue-400/10 rounded-2xl text-blue-400">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                    <div className="admin-card p-6 border-l-4 border-green-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Mijozlar</p>
                          <h3 className="text-2xl font-bold text-white">{adminStats.usersCount}</h3>
                        </div>
                        <div className="p-3 bg-green-400/10 rounded-2xl text-green-400">
                          <Users className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                    <div className="admin-card p-6 border-l-4 border-purple-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Mahsulotlar</p>
                          <h3 className="text-2xl font-bold text-white">{adminStats.productsCount}</h3>
                        </div>
                        <div className="p-3 bg-purple-400/10 rounded-2xl text-purple-400">
                          <Package className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="admin-card p-6">
                      <h3 className="font-bold mb-6 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-amber-300" />
                        Oxirgi buyurtmalar
                      </h3>
                      <div className="space-y-4">
                        {adminStats.recentOrders.map(order => (
                          <div key={order._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div>
                              <p className="font-bold text-sm text-white">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{order.user?.username || 'Noma\'lum'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-amber-200">{order.totals?.total?.toLocaleString() || '0'} {t('common.sum')}</p>
                              <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="admin-card p-6">
                      <h3 className="font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-300" />
                        Oylik savdo
                      </h3>
                      <div className="h-64 flex items-end gap-2 px-4 pb-4">
                        {adminStats.salesByMonth.map((month, i) => (
                          <div key={i} className="flex-1 bg-amber-400/20 hover:bg-amber-400/40 transition-all rounded-t-lg relative group" style={{ height: `${(month.total / Math.max(...adminStats.salesByMonth.map(m => m.total), 1)) * 100}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                              {month.total.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between px-4 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>Yan</span><span>Iyun</span><span>Dek</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'products' ? (
            showForm ? (
              <section className="admin-card p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-amber-300" />
                    <h2 className="admin-section-title">
                      {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleFormClose}
                    className="admin-btn-secondary px-4 py-2"
                  >
                    Bekor qilish
                  </button>
                </div>

                <ProductForm product={editingProduct} onClose={handleFormClose} />
              </section>
            ) : (
              <section className="admin-card overflow-hidden">
                {products.length === 0 ? (
                  <div className="p-6 sm:p-12">
                    <div className="admin-empty-state p-10 text-center">
                      <Package className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white">Mahsulotlar topilmadi</h3>
                      <p className="admin-muted mt-2 mb-6">Hali katalogga mahsulot qo'shilmagan</p>
                      <button
                        type="button"
                        onClick={handleAddNew}
                        className="admin-btn-primary px-5 py-2.5"
                      >
                        <Plus className="w-5 h-5" />
                        Birinchi mahsulotni qo'shish
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden divide-y divide-slate-700/40">
                      {products.map((product) => {
                        const image = getProductImage(product);

                        return (
                          <article key={product.id} className="p-4">
                            <div className="flex gap-3">
                              <img
                                src={image}
                                alt={product.name}
                                className="h-20 w-20 rounded-xl object-cover border border-slate-600/60"
                              />

                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-semibold text-white leading-tight">{product.name}</h3>
                                    <p className="admin-muted text-xs mt-1">{product.category}</p>
                                  </div>

                                  {product.badge === 'NEW' ? (
                                    <span className="admin-pill admin-pill-new">NEW</span>
                                  ) : product.badge === 'BESTSELLER' ? (
                                    <span className="admin-pill admin-pill-best">BESTSELLER</span>
                                  ) : null}
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-amber-200">{formatCurrency(product.price)}</p>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(product)}
                                      className="admin-btn-soft p-2"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(product.id)}
                                      className="admin-btn-danger p-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="hidden md:block overflow-x-auto admin-scroll">
                      <table className="w-full min-w-[760px]">
                        <thead className="admin-table-head text-xs uppercase tracking-[0.15em]">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold">Mahsulot</th>
                            <th className="px-6 py-4 text-left font-semibold">Kategoriya</th>
                            <th className="px-6 py-4 text-left font-semibold">Narx</th>
                            <th className="px-6 py-4 text-left font-semibold">Status</th>
                            <th className="px-6 py-4 text-left font-semibold">Amallar</th>
                          </tr>
                        </thead>

                        <tbody>
                          {products.map((product) => {
                            const image = getProductImage(product);

                            return (
                              <tr key={product.id} className="admin-table-row">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={image}
                                      alt={product.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-slate-600/70"
                                    />
                                    <div>
                                      <p className="font-semibold text-white">{product.name}</p>
                                      <p className="admin-muted text-xs">ID: {product.id}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-200">{product.category}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-amber-200">
                                  {formatCurrency(product.price)}
                                </td>

                                <td className="px-6 py-4">
                                  {product.badge === 'NEW' ? (
                                    <span className="admin-pill admin-pill-new">NEW</span>
                                  ) : product.badge === 'BESTSELLER' ? (
                                    <span className="admin-pill admin-pill-best">BESTSELLER</span>
                                  ) : (
                                    <span className="admin-muted text-xs">-</span>
                                  )}
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(product)}
                                      className="admin-btn-soft p-2"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(product.id)}
                                      className="admin-btn-danger p-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )
          ) : null}

          {activeTab === 'orders' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminOrders />
            </section>
          ) : null}

          {activeTab === 'users' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminUsers />
            </section>
          ) : null}

          {activeTab === 'announcements' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminAnnouncements />
            </section>
          ) : null}

          {activeTab === 'lookbook' ? (
            <section className="admin-card p-5 sm:p-6">
              <LookbookManager />
            </section>
          ) : null}

          {activeTab === 'promos' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminPromos />
            </section>
          ) : null}

          {activeTab === 'coupons' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminCoupons />
            </section>
          ) : null}

          {activeTab === 'challenges' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminChallenges />
            </section>
          ) : null}

          {activeTab === 'badges' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminBadges />
            </section>
          ) : null}

          {activeTab === 'reels' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminReels />
            </section>
          ) : null}

          {activeTab === 'bundles' ? (
            <section className="admin-card p-5 sm:p-6">
              <BundleManager />
            </section>
          ) : null}

          {activeTab === 'blog' ? (
            <section className="admin-card p-5 sm:p-6">
              <BlogManager />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
