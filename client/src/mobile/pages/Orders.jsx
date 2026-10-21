import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductService from '../../server/server';
import OrderTimeline from '../../components/OrderTimeline';
import ReturnRequestModal from '../../components/ReturnRequestModal';
import { getImageUrl } from '../../utils/image';
import Auth from './Auth';
import { CardSkeleton, Empty, Sheet, TopBar, money } from '../ui';
import './orders.css';

const STATUS_KEYS = {
  Yetkazildi: 'mobileOrders.status_delivered',
  Jarayonda: 'mobileOrders.status_processing',
  Yetkazilmoqda: 'mobileOrders.status_shipping',
  'Bekor qilindi': 'mobileOrders.status_cancelled',
};
const STATUS_TONE = { Yetkazildi: 'is-done', 'Bekor qilindi': 'is-off' };

const WORDS = {
  uz: {
    title: 'Buyurtmalarim',
    emptyTitle: "Hali buyurtma yo'q",
    emptyText: "Birinchi buyurtmangiz shu yerda ko'rinadi va har bosqichini kuzatasiz.",
    shop: "Kolleksiyani ko'rish",
    pieces: (n) => `${n} ta buyum`,
    details: 'Buyurtma',
    address: 'Manzil',
    schedule: 'Yetkazish vaqti',
    subtotal: 'Mahsulotlar',
    discount: 'Chegirma',
    total: 'Jami',
    track: 'Holati',
    returnIt: "Qaytarishni so'rash",
    noAddress: "Manzil ko'rsatilmagan",
  },
  ru: {
    title: 'Мои заказы',
    emptyTitle: 'Заказов пока нет',
    emptyText: 'Здесь появится ваш первый заказ, и вы увидите каждый его этап.',
    shop: 'Смотреть коллекцию',
    pieces: (n) => `${n} вещей`,
    details: 'Заказ',
    address: 'Адрес',
    schedule: 'Время доставки',
    subtotal: 'Товары',
    discount: 'Скидка',
    total: 'Итого',
    track: 'Статус',
    returnIt: 'Запросить возврат',
    noAddress: 'Адрес не указан',
  },
  en: {
    title: 'My orders',
    emptyTitle: 'No orders yet',
    emptyText: 'Your first order will appear here, with every step tracked.',
    shop: 'Browse the collection',
    pieces: (n) => `${n} pieces`,
    details: 'Order',
    address: 'Address',
    schedule: 'Delivery time',
    subtotal: 'Items',
    discount: 'Discount',
    total: 'Total',
    track: 'Status',
    returnIt: 'Request a return',
    noAddress: 'No address given',
  },
};

const orderTotal = (order) => order.totals?.total || order.totalAmount || 0;
const shortId = (order) => `#${String(order._id || '').slice(-6).toUpperCase()}`;
const dateOf = (value, language) => new Date(value).toLocaleDateString(language === 'en' ? 'en-GB' : language === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Orders() {
  const { t, language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const { isAuthenticated } = useAuth();
  const { getMyOrders } = useProductService();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [returning, setReturning] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    getMyOrders(token)
      .then((result) => { if (result?.success) setOrders(result.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
    // getMyOrders is recreated by the service hook; load once per sign-in.
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Auth mode="login" />;

  const status = (order) => t(STATUS_KEYS[order.status] || 'mobileOrders.default_status');

  return (
    <div className="m-page mor">
      <TopBar title={w.title} subtitle={orders.length ? String(orders.length) : ''} />

      {loading ? (
        <div className="m-pad mor-list" aria-hidden="true">{[0, 1].map((i) => <CardSkeleton key={i} />)}</div>
      ) : !orders.length ? (
        <Empty icon={Package} title={w.emptyTitle} text={w.emptyText} action={<Link to="/mobile/products" className="m-btn m-btn--solid">{w.shop}</Link>} />
      ) : (
        <ul className="mor-list m-pad">
          {orders.map((order) => (
            <li key={order._id}>
              <button type="button" className="mor-card" onClick={() => setOpen(order)}>
                <span className="mor-card__head">
                  <strong>{shortId(order)}</strong>
                  <span className={`mor-status ${STATUS_TONE[order.status] || ''}`}>{status(order)}</span>
                </span>
                <span className="mor-card__date">{dateOf(order.createdAt, language)}</span>
                <span className="mor-thumbs">
                  {(order.items || []).slice(0, 4).map((item, i) => (
                    <img key={i} src={getImageUrl(item)} alt="" loading="lazy" />
                  ))}
                  {(order.items || []).length > 4 && <span>+{order.items.length - 4}</span>}
                </span>
                <span className="mor-card__foot">
                  <span>{w.pieces((order.items || []).reduce((sum, item) => sum + Number(item.quantity || 1), 0))}</span>
                  <strong>{money(orderTotal(order), language)}</strong>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpen(null)} title={open ? `${w.details} ${shortId(open)}` : ''}>
        {open && (
          <div className="mor-detail">
            <p className="mor-detail__meta">
              <span className={`mor-status ${STATUS_TONE[open.status] || ''}`}>{status(open)}</span>
              <span>{dateOf(open.createdAt, language)}</span>
            </p>

            <ul className="mor-items">
              {(open.items || []).map((item, i) => (
                <li key={i}>
                  <img src={getImageUrl(item)} alt="" loading="lazy" />
                  <span>
                    <strong>{item.name}</strong>
                    <small>{[item.selectedSize, item.selectedColor && !String(item.selectedColor).startsWith('#') && item.selectedColor, `× ${item.quantity || 1}`].filter(Boolean).join(' · ')}</small>
                  </span>
                  <em>{money(Number(item.price || 0) * Number(item.quantity || 1), language)}</em>
                </li>
              ))}
            </ul>

            <dl className="mor-facts">
              <div><dt>{w.address}</dt><dd>{open.customer?.address || w.noAddress}</dd></div>
              {open.scheduledDelivery?.date && <div><dt>{w.schedule}</dt><dd>{open.scheduledDelivery.date} · {open.scheduledDelivery.timeSlot}</dd></div>}
              {open.totals?.subtotal > 0 && <div><dt>{w.subtotal}</dt><dd>{money(open.totals.subtotal, language)}</dd></div>}
              {(open.totals?.discountAmount || 0) > 0 && <div><dt>{w.discount}</dt><dd>−{money(open.totals.discountAmount, language)}</dd></div>}
              <div className="mor-total"><dt>{w.total}</dt><dd>{money(orderTotal(open), language)}</dd></div>
            </dl>

            <p className="m-kicker" style={{ margin: '26px 0 14px' }}>{w.track}</p>
            <div className="mor-timeline"><OrderTimeline order={open} /></div>

            {open.status !== 'Bekor qilindi' && (
              <button type="button" className="m-btn m-btn--ghost m-btn--block" style={{ marginTop: 24 }} onClick={() => { setReturning(open); setOpen(null); }}>
                <RotateCcw className="h-4 w-4" />{w.returnIt}
              </button>
            )}
          </div>
        )}
      </Sheet>

      {returning && <ReturnRequestModal order={returning} onClose={() => setReturning(null)} />}
    </div>
  );
}
