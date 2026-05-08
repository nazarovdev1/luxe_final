import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  RefreshCw,
  Trash2,
  Clock3,
  CheckCircle2,
  Truck,
  Ban,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useProductService from '../server/server';

const STATUS_OPTIONS = ['Kutilmoqda', 'Jarayonda', 'Yetkazilmoqda', 'Yetkazildi', 'Bekor qilindi'];

const formatDateLabel = (dateKey) => {
  if (!dateKey || dateKey === 'unknown') {
    return 'Nomaʼlum sana';
  }

  return new Date(dateKey).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTimeLabel = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusPillClass = (status) => {
  if (status === 'Yetkazildi') {
    return 'admin-pill admin-pill-success';
  }

  if (status === 'Bekor qilindi') {
    return 'admin-pill admin-pill-danger';
  }

  if (status === 'Yetkazilmoqda') {
    return 'admin-pill admin-pill-info';
  }

  if (status === 'Jarayonda') {
    return 'admin-pill admin-pill-warning';
  }

  return 'admin-pill admin-pill-best';
};

const getStatusIcon = (status) => {
  if (status === 'Yetkazildi') {
    return <CheckCircle2 className="w-4 h-4" />;
  }

  if (status === 'Bekor qilindi') {
    return <Ban className="w-4 h-4" />;
  }

  if (status === 'Yetkazilmoqda') {
    return <Truck className="w-4 h-4" />;
  }

  if (status === 'Jarayonda') {
    return <Loader2 className="w-4 h-4" />;
  }

  return <Clock3 className="w-4 h-4" />;
};

const AdminOrders = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const { getAllOrders, updateOrderStatus, deleteOrder } = useProductService();

  const fetchOrders = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const token = localStorage.getItem('token');
    const result = await getAllOrders(token);

    if (result.success) {
      setOrders(result.data || []);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedOrders = useMemo(() => {
    const groupedMap = new Map();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = Number.isNaN(date.getTime()) ? 'unknown' : date.toISOString().slice(0, 10);

      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }

      groupedMap.get(key).push(order);
    });

    return [...groupedMap.entries()].sort((a, b) => {
      if (a[0] === 'unknown') {
        return 1;
      }

      if (b[0] === 'unknown') {
        return -1;
      }

      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);

    const token = localStorage.getItem('token');
    const result = await updateOrderStatus(orderId, newStatus, token);

    if (result.success) {
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
      );
    }

    setStatusUpdatingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) {
      return;
    }

    const token = localStorage.getItem('token');
    const result = await deleteOrder(deleteConfirm, token);

    if (result.success) {
      setOrders((prev) => prev.filter((order) => order._id !== deleteConfirm));
      setDeleteConfirm(null);
    } else {
      alert(`Xatolik: ${result.message || 'Buyurtmani o\'chirib bo\'lmadi'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="admin-loading-ring w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="admin-section-title text-xl">Buyurtmalar boshqaruvi</h2>
          <p className="admin-muted text-sm mt-1">{orders.length} ta buyurtma</p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          className="admin-btn-secondary px-4 py-2.5 w-full md:w-auto"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {deleteConfirm ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm px-4 flex items-center justify-center">
          <div className="admin-card max-w-md w-full p-6">
            <h3 className="admin-section-title text-lg">Buyurtmani o'chirish</h3>
            <p className="admin-muted text-sm mt-2">
              Haqiqatan ham ushbu buyurtmani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="admin-btn-secondary px-4 py-2.5 flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="admin-btn-danger px-4 py-2.5 flex-1"
                onClick={handleDeleteConfirm}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="admin-empty-state py-14 px-6 text-center">
          <Package className="w-14 h-14 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Buyurtmalar topilmadi</h3>
          <p className="admin-muted mt-2">Hozircha hech qanday buyurtma yo'q</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedOrders.map(([dateKey, orderList]) => (
            <section key={dateKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                <h3 className="text-base sm:text-lg font-semibold text-white">{formatDateLabel(dateKey)}</h3>
                <span className="admin-muted text-xs sm:text-sm">({orderList.length} ta)</span>
              </div>

              <div className="space-y-4">
                {orderList.map((order) => {
                  const customer = order.customer || {};
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <article key={order._id} className="admin-card-soft overflow-hidden">
                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="text-base sm:text-lg font-semibold text-white">
                                Buyurtma #{order._id?.slice(-6)?.toUpperCase() || '------'}
                              </h4>

                              <span className={getStatusPillClass(order.status)}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </span>
                            </div>

                            <p className="admin-muted text-xs sm:text-sm inline-flex items-center gap-1">
                              <Clock3 className="w-4 h-4" />
                              {formatTimeLabel(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <select
                              className="admin-select min-w-[170px]"
                              value={order.status}
                              onChange={(event) => handleStatusChange(order._id, event.target.value)}
                              disabled={statusUpdatingId === order._id}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="admin-btn-danger p-2.5"
                              onClick={() => setDeleteConfirm(order._id)}
                              title="Buyurtmani o'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          <div className="admin-card-soft p-3">
                            <p className="admin-muted text-xs mb-1">Xaridor</p>
                            <p className="text-sm text-white font-medium inline-flex items-center gap-2">
                              <User className="w-4 h-4 text-amber-300" />
                              {customer.name || 'Nomaʼlum'}
                            </p>
                          </div>

                          <div className="admin-card-soft p-3">
                            <p className="admin-muted text-xs mb-1">Telefon</p>
                            <p className="text-sm text-white font-medium inline-flex items-center gap-2">
                              <Phone className="w-4 h-4 text-amber-300" />
                              {customer.phone || '-'}
                            </p>
                          </div>

                          <div className="admin-card-soft p-3 md:col-span-2 xl:col-span-1">
                            <p className="admin-muted text-xs mb-1">Manzil</p>
                            <div className="text-sm text-white font-medium inline-flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 text-amber-300" />
                              <span>{customer.address || 'Manzil kiritilmagan'}</span>
                            </div>
                            {(customer.location || customer.address) && (
                              <a
                                href={
                                  customer.location
                                    ? `https://www.google.com/maps/search/?api=1&query=${customer.location.lat},${customer.location.lng}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center mt-2 text-xs text-amber-200 hover:text-amber-100"
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                Xaritada ochish
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="admin-muted text-xs sm:text-sm">Buyurtma tarkibi</p>
                          {items.map((item, index) => (
                            <div
                              key={`${order._id}-${index}`}
                              className="admin-card-soft p-2.5 sm:p-3 flex items-center gap-3"
                            >
                              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-600/60 bg-slate-900/60 flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-medium truncate">{item.name}</p>
                                <p className="admin-muted text-xs mt-1">
                                  {item.quantity} x {Number(item.price || 0).toLocaleString('uz-UZ')} {t('common.sum')}
                                  {item.selectedColor ? ` • ${item.selectedColor}` : ''}
                                  {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                                </p>
                              </div>

                              <p className="text-sm text-amber-200 font-semibold whitespace-nowrap">
                                {Number((item.price || 0) * (item.quantity || 0)).toLocaleString('uz-UZ')} {t('common.sum')}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="admin-muted text-sm">Jami summa</span>
                          <span className="text-lg font-bold text-amber-200">
                            {Number(order.totals?.total || 0).toLocaleString('uz-UZ')} {t('common.sum')}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
