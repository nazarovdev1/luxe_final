import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, ChevronRight, FileText, Gift, Globe, Heart, HelpCircle, LayoutDashboard, LogOut, Mail, Package, Phone, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CONTACT, getPolicyCopy } from '../../config/policies';
import useProductService from '../../server/server';
import MyGiftCards from '../../components/MyGiftCards';
import Auth from './Auth';
import { LanguageSwitch, ProductGrid, Sheet, TopBar } from '../ui';
import './profile.css';

const WORDS = {
  uz: {
    title: 'Profil',
    account: 'Shaxsiy kabinet',
    orders: 'Buyurtmalar',
    points: 'Ballar',
    level: 'Daraja',
    admin: 'Admin panel',
    myOrders: 'Buyurtmalarim',
    saved: 'Sevimlilar',
    giftCards: "Sovg'a kartalarim",
    notifications: 'Bildirishnomalar',
    notifOn: 'Yoqilgan',
    notifOff: "O'chiq",
    notifUnsupported: "Bu qurilmada bildirishnomalar qo'llab-quvvatlanmaydi",
    faq: 'Savollar',
    language: 'Til',
    privacy: 'Maxfiylik siyosati',
    terms: 'Foydalanish shartlari',
    logout: 'Chiqish',
    contact: 'Aloqa',
    savedEmpty: "Hali sevimli model yo'q. Yoqqanini yurakcha bilan belgilang.",
    faqItems: (p) => [
      ['Yetkazish qancha vaqt oladi?', `${p.delivery}.`],
      ["Kiyib ko'rsam bo'ladimi?", `${p.tryOn}.`],
      ['Qaytarish mumkinmi?', `${p.returns}.`],
      ["Qanday to'layman?", `${p.payment}.`],
    ],
  },
  ru: {
    title: 'Профиль',
    account: 'Личный кабинет',
    orders: 'Заказы',
    points: 'Баллы',
    level: 'Уровень',
    admin: 'Админ-панель',
    myOrders: 'Мои заказы',
    saved: 'Избранное',
    giftCards: 'Подарочные карты',
    notifications: 'Уведомления',
    notifOn: 'Включены',
    notifOff: 'Выключены',
    notifUnsupported: 'На этом устройстве уведомления не поддерживаются',
    faq: 'Вопросы',
    language: 'Язык',
    privacy: 'Конфиденциальность',
    terms: 'Условия',
    logout: 'Выйти',
    contact: 'Связь',
    savedEmpty: 'В избранном пока пусто. Отмечайте модели сердечком.',
    faqItems: (p) => [
      ['Сколько идёт доставка?', `${p.delivery}.`],
      ['Можно примерить?', `${p.tryOn}.`],
      ['Можно вернуть?', `${p.returns}.`],
      ['Как оплатить?', `${p.payment}.`],
    ],
  },
  en: {
    title: 'Profile',
    account: 'Your account',
    orders: 'Orders',
    points: 'Points',
    level: 'Tier',
    admin: 'Admin panel',
    myOrders: 'My orders',
    saved: 'Saved',
    giftCards: 'My gift cards',
    notifications: 'Notifications',
    notifOn: 'On',
    notifOff: 'Off',
    notifUnsupported: 'Notifications are not supported on this device',
    faq: 'Questions',
    language: 'Language',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    logout: 'Sign out',
    contact: 'Contact',
    savedEmpty: 'Nothing saved yet. Tap the heart on a piece you love.',
    faqItems: (p) => [
      ['How long is delivery?', `${p.delivery}.`],
      ['Can I try it on?', `${p.tryOn}.`],
      ['Can I return it?', `${p.returns}.`],
      ['How do I pay?', `${p.payment}.`],
    ],
  },
};

export default function Profile() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const policy = getPolicyCopy(language);
  const { isAuthenticated, user, logout } = useAuth();
  const { favorites = [] } = useFavorites();
  const { products } = useProducts();
  const { notificationPermission, enableNotifications, isSupported } = useNotifications();
  const { getMyOrders } = useProductService();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [points, setPoints] = useState(null);
  const [sheet, setSheet] = useState(null);

  const saved = useMemo(() => (products || []).filter((product) => product && favorites.includes(product.id)), [products, favorites]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    Promise.allSettled([
      getMyOrders(token),
      axios.get('/api/points', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([ordersRes, pointsRes]) => {
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) setOrders(ordersRes.value.data || []);
      if (pointsRes.status === 'fulfilled' && pointsRes.value?.data?.success) setPoints(pointsRes.value.data.points);
    });
    // getMyOrders is recreated by the service hook; load once per sign-in.
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Auth mode="login" />;

  const notify = () => {
    if (!isSupported) { toast.error(w.notifUnsupported); return; }
    if (notificationPermission !== 'granted') enableNotifications();
  };

  const signOut = () => {
    logout();
    navigate('/mobile');
  };

  return (
    <div className="m-page mpf">
      <TopBar title={w.title} back={false} />

      <section className="mpf-id m-pad">
        <span className="mpf-initial" aria-hidden="true">{(user?.username || 'L').charAt(0).toUpperCase()}</span>
        <div>
          <p className="m-kicker">{w.account}</p>
          <h1 className="m-h2">{user?.username}</h1>
          {user?.phone && <p className="m-small">{user.phone}</p>}
        </div>
      </section>

      <dl className="mpf-stats m-pad">
        <div><dt>{w.orders}</dt><dd>{orders.length}</dd></div>
        <div><dt>{w.points}</dt><dd>{(points?.balance || 0).toLocaleString('ru-RU')}</dd></div>
        <div><dt>{w.level}</dt><dd>{points?.level || 'Bronze'}</dd></div>
      </dl>

      <nav className="m-rows m-pad mpf-menu">
        {user?.isAdmin && (
          <Link to="/mobile/admin" className="m-row"><LayoutDashboard className="h-5 w-5" strokeWidth={1.4} />{w.admin}<span className="m-row__end"><ChevronRight className="h-4 w-4" /></span></Link>
        )}
        <Link to="/mobile/orders" className="m-row"><Package className="h-5 w-5" strokeWidth={1.4} />{w.myOrders}<span className="m-row__end">{orders.length || ''}<ChevronRight className="h-4 w-4" /></span></Link>
        <a href="#saved" className="m-row"><Heart className="h-5 w-5" strokeWidth={1.4} />{w.saved}<span className="m-row__end">{favorites.length || ''}<ChevronRight className="h-4 w-4" /></span></a>
        <button type="button" className="m-row" onClick={() => setSheet('gift')}><Gift className="h-5 w-5" strokeWidth={1.4} />{w.giftCards}<span className="m-row__end"><ChevronRight className="h-4 w-4" /></span></button>
        <button type="button" className="m-row" onClick={notify}><Bell className="h-5 w-5" strokeWidth={1.4} />{w.notifications}<span className="m-row__end">{notificationPermission === 'granted' ? w.notifOn : w.notifOff}</span></button>
        <button type="button" className="m-row" onClick={() => setSheet('faq')}><HelpCircle className="h-5 w-5" strokeWidth={1.4} />{w.faq}<span className="m-row__end"><ChevronRight className="h-4 w-4" /></span></button>
        <div className="m-row"><Globe className="h-5 w-5" strokeWidth={1.4} />{w.language}<span className="m-row__end"><LanguageSwitch /></span></div>
      </nav>

      <section className="m-section m-pad">
        <p className="m-kicker" style={{ marginBottom: 14 }}>{w.contact}</p>
        <div className="m-rows">
          <a href={CONTACT.phoneHref} className="m-row"><Phone className="h-5 w-5" strokeWidth={1.4} />{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`} className="m-row"><Mail className="h-5 w-5" strokeWidth={1.4} />{CONTACT.email}</a>
          <Link to="/mobile/privacy-policy" className="m-row"><Shield className="h-5 w-5" strokeWidth={1.4} />{w.privacy}</Link>
          <Link to="/mobile/terms" className="m-row"><FileText className="h-5 w-5" strokeWidth={1.4} />{w.terms}</Link>
        </div>
      </section>

      <section id="saved" className="m-section m-pad">
        <p className="m-kicker" style={{ marginBottom: 18 }}>{w.saved}</p>
        {saved.length ? <ProductGrid products={saved} /> : <p className="m-body">{w.savedEmpty}</p>}
      </section>

      <div className="m-pad mpf-out">
        <button type="button" className="m-btn m-btn--ghost m-btn--block" onClick={signOut}><LogOut className="h-4 w-4" />{w.logout}</button>
      </div>

      <Sheet open={sheet === 'faq'} onClose={() => setSheet(null)} title={w.faq}>
        {w.faqItems(policy).map(([q, a]) => (
          <details key={q} className="m-acc">
            <summary>{q}<ChevronRight className="h-4 w-4" /></summary>
            <div className="m-acc__body">{a}</div>
          </details>
        ))}
      </Sheet>
      <Sheet open={sheet === 'gift'} onClose={() => setSheet(null)} title={w.giftCards}>
        <MyGiftCards />
      </Sheet>
    </div>
  );
}
