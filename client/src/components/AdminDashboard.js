import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Vote,
  Menu,
  X,
  ChevronRight,
  Circle,
  ArrowUpRight,
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
import AdminStylePolls from './AdminStylePolls';
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
    id: 'community',
    label: 'Community',
    description: "Style Feed so'rovnomalari",
    icon: Vote,
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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { products, removeProduct, isLoading: productsLoading } = useProducts();
  const { logout, token } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

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

  const handleAddNew = () => {
    setActiveTab('products');
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

  const selectTab = (id) => {
    setActiveTab(id);
    setShowForm(false);
    setNavOpen(false);
  };

  return (
    <div className="admin-shell min-h-screen pb-10">
      <div className="admin-orb admin-orb-orange" />
      <div className="admin-orb admin-orb-cyan" />

      <div className="relative z-10 mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-8">
        {/* Mobile Backdrop Overlay */}
        {navOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setNavOpen(false)}
          />
        )}

        <aside className={`admin-commandbar fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full overflow-y-auto bg-[#121214] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-auto lg:h-[calc(100vh-40px)] lg:border-r-0 lg:bg-transparent lg:shadow-none lg:sticky lg:top-5 lg:m-5 ${navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="border-b border-white/10 px-5 py-5">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => navigate('/')} className="text-left group cursor-pointer" title="Asosiy sahifaga o'tish">
                <span className="text-[9px] font-bold tracking-[.22em] text-[#e0ba72] group-hover:underline">LUXX</span>
                <strong className="block font-['Playfair_Display'] text-[26px] leading-none tracking-[-.08em] text-[#f3eee5]">Atelier</strong>
              </button>
              <button type="button" onClick={() => navigate('/')} className="admin-btn-soft p-2 cursor-pointer hover:bg-white/10" aria-label="Asosiy sahifaga o'tish" title="Asosiy sahifaga qaytish"><X size={16} /></button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[9px] font-medium tracking-[.12em] text-[#999890]"><Circle size={7} className="fill-[#89d3ad] text-[#89d3ad]" /> SYSTEM ONLINE</p>
          </div>

          <nav className="p-3" aria-label="Admin bo'limlari">
            <p className="px-3 pb-2 pt-1 text-[9px] font-bold tracking-[.17em] text-[#77756f]">ATELIER INDEX</p>
            {tabsWithOverview.map((tab) => {
              const Icon = tab.icon;
              return <button key={tab.id} type="button" onClick={() => selectTab(tab.id)} className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : ''}`}><Icon size={16} /><span className="flex-1">{tab.label}</span>{activeTab === tab.id && <ChevronRight size={14} />}</button>;
            })}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            <button type="button" onClick={logout} className="admin-tab w-full"><LogOut size={16} /><span>Atelierdan chiqish</span></button>
          </div>
        </aside>

        <div className="min-w-0 px-4 pb-10 pt-4 sm:px-6 lg:px-0 lg:py-5">
          <header className="admin-card admin-gradient-card overflow-hidden p-5 sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setNavOpen(true)} className="admin-btn-soft p-2.5 lg:hidden" aria-label="Menuni ochish"><Menu size={18} /></button>
                  <span className="inline-flex items-center gap-2 border border-[#e0ba72]/35 bg-[#e0ba72]/10 px-3 py-1 text-[9px] font-bold tracking-[.15em] text-[#edce8c]"><Gem size={13} /> LUXX CONTROL ROOM</span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-[.16em] text-[#999890]">{activeTab === 'overview' ? 'THE DAILY EDIT' : (activeTabConfig?.description || 'ATELIER MANAGEMENT').toUpperCase()}</p>
                  <h1 className="admin-title mt-2 text-[38px] leading-[.86] sm:text-[54px]">{activeTab === 'overview' ? <>Atelier <em className="font-normal text-[#e0ba72]">Console</em></> : activeTabConfig?.label}</h1>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleAddNew} className="admin-btn-primary px-4 py-3"><Plus size={17} /> Yangi mahsulot</button>
                <button type="button" onClick={logout} className="admin-btn-secondary px-4 py-3"><LogOut size={17} /> Chiqish</button>
              </div>
            </div>
          </header>

          <main className="mt-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isStatsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
              ) : adminStats && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Jami daromad', value: adminStats.totalRevenue.toLocaleString(), suffix: t('common.sum'), icon: DollarSign, note: 'ATELIER REVENUE', tone: '#e0ba72' },
                      { label: 'Buyurtmalar', value: adminStats.ordersCount, icon: ShoppingCart, note: 'ORDER FLOW', tone: '#a8c6db' },
                      { label: 'Mijozlar', value: adminStats.usersCount, icon: Users, note: 'PRIVATE CLIENTS', tone: '#89d3ad' },
                      { label: 'Mahsulotlar', value: adminStats.productsCount, icon: Package, note: 'CURATED PIECES', tone: '#d9a8be' },
                    ].map(({ label, value, suffix, icon: Icon, note, tone }) => (
                      <article key={label} className="admin-card group overflow-hidden p-5" style={{ '--stat-tone': tone }}>
                        <div className="mb-8 flex items-start justify-between"><p className="text-[9px] font-bold tracking-[.15em] text-[#999890]">{note}</p><span className="grid h-9 w-9 place-items-center border border-white/10 bg-white/[.025]" style={{ color: tone }}><Icon size={17} /></span></div>
                        <p className="text-[11px] font-semibold text-[#c6c1b7]">{label}</p><p className="admin-stat-value mt-2">{value} {suffix && <span className="text-[11px] tracking-normal text-[#999890]">{suffix}</span>}</p>
                        <div className="mt-5 h-px w-full bg-white/10"><i className="block h-px w-1/3 bg-[var(--stat-tone)] transition-all duration-500 group-hover:w-full" /></div>
                      </article>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="admin-card p-5 sm:p-6">
                      <div className="mb-6 flex items-end justify-between"><div><p className="text-[9px] font-bold tracking-[.16em] text-[#e0ba72]">LIVE ORDERS</p><h3 className="admin-section-title mt-2">So‘nggi buyurtmalar</h3></div><button type="button" onClick={() => selectTab('orders')} className="admin-btn-soft p-2"><ArrowUpRight size={16} /></button></div>
                      <div className="space-y-4">
                        {adminStats.recentOrders.map(order => (
                          <div key={order._id} className="flex items-center justify-between border-b border-white/10 py-4 last:border-0">
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

                    <div className="admin-card p-5 sm:p-6">
                      <div className="mb-6"><p className="text-[9px] font-bold tracking-[.16em] text-[#e0ba72]">SALES RHYTHM</p><h3 className="admin-section-title mt-2">Oylik savdo</h3></div>
                      <div className="flex h-64 items-end gap-2 border-b border-white/10 px-4 pb-4">
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

          {activeTab === 'community' ? (
            <section className="admin-card p-5 sm:p-6">
              <AdminStylePolls />
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
    </div>
  );
};

export default AdminDashboard;
