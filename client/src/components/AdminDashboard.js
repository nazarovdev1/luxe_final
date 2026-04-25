import React, { useMemo, useState } from 'react';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
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
} from 'lucide-react';
import ProductForm from './ProductForm';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminAnnouncements from './AdminAnnouncements';
import LookbookManager from './LookbookManager';
import AdminPromos from './AdminPromos';
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
    id: 'announcements',
    label: 'Xabarlar',
    description: 'Banner va eʼlonlar',
    icon: Bell,
  },
  {
    id: 'lookbook',
    label: 'Lookbook',
    description: 'Editorial bo‘lim',
    icon: Layers,
  },
  {
    id: 'promos',
    label: 'Promokodlar',
    description: 'Aksiya kodlari',
    icon: Tag,
  },
];

const AdminDashboard = () => {
  const { products, removeProduct, isLoading } = useProducts();
  const { logout } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

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

  if (isLoading) {
    return (
      <div className="admin-shell min-h-screen pt-16 flex items-center justify-center">
        <div className="admin-loading-ring w-12 h-12" />
      </div>
    );
  }

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
                <h1 className="admin-title text-2xl sm:text-3xl leading-tight">Admin Panel</h1>
                <p className="admin-muted mt-2 max-w-2xl text-sm sm:text-base">
                  Barcha operatsiyalar bitta panelda: mahsulotlar, buyurtmalar, lookbook va promokodlar.
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
            <div className="admin-card-soft p-4">
              <p className="admin-muted text-xs uppercase tracking-[0.16em]">Jami mahsulot</p>
              <p className="admin-stat-value mt-2">{stats.total}</p>
            </div>

            <div className="admin-card-soft p-4">
              <p className="admin-muted text-xs uppercase tracking-[0.16em]">Yangi</p>
              <p className="admin-stat-value mt-2">{stats.newCount}</p>
            </div>

            <div className="admin-card-soft p-4">
              <p className="admin-muted text-xs uppercase tracking-[0.16em]">Bestseller</p>
              <p className="admin-stat-value mt-2">{stats.bestCount}</p>
            </div>

            <div className="admin-card-soft p-4">
              <p className="admin-muted text-xs uppercase tracking-[0.16em]">Lookbook</p>
              <p className="admin-stat-value mt-2">{stats.lookbookCount}</p>
            </div>
          </div>
        </header>

        <section className="admin-card sticky top-16 z-20 px-3 py-3">
          <div className="flex items-center gap-2 overflow-x-auto admin-scroll">
            {tabs.map((tab) => {
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

          <p className="admin-muted text-xs sm:text-sm mt-3 px-2">
            {activeTabConfig?.description}
          </p>
        </section>

        <main className="space-y-6">
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
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
