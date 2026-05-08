import React from 'react';
import { Package, Clock, Truck, CheckCircle, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const OrderTimeline = ({ order }) => {
  const { t } = useLanguage();

  const ORDER_STATUSES = [
    { key: 'Kutilmoqda', label: t('orderTimeline.order'), icon: Clock, color: '#f59e0b' },
    { key: 'Jarayonda', label: t('common.processing'), icon: Package, color: '#3b82f6' },
    { key: 'Yetkazilmoqda', label: t('common.onTheWay'), icon: Truck, color: '#8b5cf6' },
    { key: 'Yetkazildi', label: t('common.delivered'), icon: CheckCircle, color: '#22c55e' },
  ];

  const currentStatusIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'Bekor qilindi';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString();
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e]/95 to-[#0d0f18]/95 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2]">{t('orderTimeline.order')}</p>
          <p className="text-lg font-semibold text-[#f4f1eb] mt-0.5">#{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#9aa3b2]">{formatDate(order.createdAt)}</p>
          <p className="text-sm font-bold text-[#f4f1eb] mt-0.5">{formatPrice(order.totals?.total)} {t('common.sum')}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-5">
        {isCancelled ? (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 text-center">
            <p className="text-sm font-semibold text-red-400">{t('orderTimeline.cancelled')}</p>
            <p className="text-xs text-[#9aa3b2] mt-1">{t('orderTimeline.cancelledNote')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-white/5">
              <div
                className="w-full bg-gradient-to-b from-[#d6b47c] to-[#d6b47c]/50 transition-all duration-1000"
                style={{ height: `${Math.max(0, (currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100)}%` }}
              />
            </div>

            {/* Status Steps */}
            <div className="space-y-6">
              {ORDER_STATUSES.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = status.icon;

                return (
                  <div key={status.key} className="flex items-start gap-4 relative">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#d6b47c]/15 border-[#d6b47c]/30'
                        : 'bg-[#0d1423] border-white/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-[#d6b47c]' : 'text-[#3f4658]'}`} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-[#f4f1eb]' : 'text-[#3f4658]'}`}>
                        {status.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[11px] text-[#d6b47c] mt-0.5">{t('orderTimeline.currentStatus')}</p>
                      )}
                      {isActive && index < currentStatusIndex && (
                        <p className="text-[11px] text-[#9aa3b2] mt-0.5">{t('orderTimeline.completed')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#9aa3b2]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{order.customer?.address || 'Manzil ko\'rsatilmagan'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#9aa3b2]">
            <Phone className="w-3.5 h-3.5" />
            <span>{order.customer?.phone || ''}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9aa3b2] mb-2">{t('orderTimeline.products')}</p>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-2.5">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#f4f1eb] truncate">{item.name}</p>
                  <p className="text-[10px] text-[#9aa3b2]">
                    {item.quantity} dona
                    {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                    {item.selectedColor ? ` • ${item.selectedColor}` : ''}
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#f4f1eb]">{formatPrice(item.price)} {t('common.sum')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ETA */}
        {order.status === 'Yetkazilmoqda' && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-[#d6b47c]/10 to-transparent border border-[#d6b47c]/20 p-3">
            <p className="text-xs text-[#d6b47c]">
              🚚 Yetkazib berish 3-6 soat ichida bo'lib o'tadi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTimeline;
