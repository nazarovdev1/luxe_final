import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, RotateCcw, ShoppingBag, Truck, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPolicyCopy } from '../../config/policies';
import { getImageUrl } from '../../utils/image';
import { Empty, TopBar, money } from '../ui';
import './cart.css';

const WORDS = {
  uz: {
    title: 'Savat',
    count: (n) => `${n} ta buyum`,
    emptyTitle: "Savat bo'sh",
    emptyText: "Yoqqan modelni savatga qo'shing — uyda kiyib ko'rib, keyin to'laysiz.",
    shop: "Kolleksiyani ko'rish",
    size: "O'lcham",
    color: 'Rang',
    look: 'Obraz',
    pieces: (n) => `${n} ta buyum`,
    saving: 'Tejash',
    subtotal: 'Mahsulotlar',
    delivery: 'Yetkazish',
    free: 'Bepul',
    total: 'Jami',
    checkout: 'Rasmiylashtirish',
    remove: "O'chirish",
  },
  ru: {
    title: 'Корзина',
    count: (n) => `${n} шт.`,
    emptyTitle: 'Корзина пуста',
    emptyText: 'Добавьте понравившуюся модель — примерите дома и оплатите потом.',
    shop: 'Смотреть коллекцию',
    size: 'Размер',
    color: 'Цвет',
    look: 'Образ',
    pieces: (n) => `${n} вещей`,
    saving: 'Экономия',
    subtotal: 'Товары',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: 'Итого',
    checkout: 'Оформить',
    remove: 'Удалить',
  },
  en: {
    title: 'Bag',
    count: (n) => `${n} items`,
    emptyTitle: 'Your bag is empty',
    emptyText: 'Add a piece you love — try it on at home and pay afterwards.',
    shop: 'Browse the collection',
    size: 'Size',
    color: 'Colour',
    look: 'Look',
    pieces: (n) => `${n} pieces`,
    saving: 'You save',
    subtotal: 'Items',
    delivery: 'Delivery',
    free: 'Free',
    total: 'Total',
    checkout: 'Checkout',
    remove: 'Remove',
  },
};

const toNumber = (value) => (typeof value === 'number' ? value : Number(String(value || '').replace(/[^\d.]/g, '')) || 0);

export default function Cart() {
  const { language } = useLanguage();
  const w = WORDS[language] || WORDS.uz;
  const policy = getPolicyCopy(language);
  const { items = [], lookItems = [], removeFromCart, removeLookFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) + lookItems.length;
  const total = getCartTotal();

  if (!items.length && !lookItems.length) {
    return (
      <div className="m-page">
        <TopBar title={w.title} back={false} />
        <Empty
          icon={ShoppingBag}
          title={w.emptyTitle}
          text={w.emptyText}
          action={<Link to="/mobile/products" className="m-btn m-btn--solid">{w.shop}</Link>}
        />
      </div>
    );
  }

  const checkout = () => navigate(isAuthenticated ? '/mobile/checkout' : '/mobile/login', { state: { from: '/mobile/checkout' } });

  return (
    <div className="m-page mk">
      <TopBar title={w.title} subtitle={w.count(count)} back={false} />

      <ul className="mk-list m-pad">
        {lookItems.map((look) => (
          <li key={look.cartLookId} className="mk-item mk-item--look">
            <div className="mk-look__thumbs">
              {look.products.slice(0, 3).map((product) => (
                <img key={product._id || product.id} src={getImageUrl(product)} alt="" loading="lazy" />
              ))}
            </div>
            <div className="mk-item__body">
              <span className="m-kicker">{w.look}</span>
              <span className="mk-item__name">{look.title}</span>
              <span className="mk-item__meta">{w.pieces(look.products.length)}</span>
              <span className="mk-item__foot">
                <span className="m-price">
                  {money(look.discountedPrice, language)}
                  {look.discountAmount > 0 && <s>{money(look.originalPrice, language)}</s>}
                </span>
              </span>
            </div>
            <button type="button" className="mk-remove" onClick={() => removeLookFromCart(look.cartLookId)} aria-label={w.remove}>
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}

        {items.map((item) => (
          <li key={item.id} className="mk-item">
            <Link to={`/mobile/product/${item.productId || item.id}`} className="mk-item__img">
              <img src={getImageUrl(item)} alt={item.name} loading="lazy" decoding="async" />
            </Link>
            <div className="mk-item__body">
              <Link to={`/mobile/product/${item.productId || item.id}`} className="mk-item__name">{item.name}</Link>
              <span className="mk-item__meta">
                {[item.selectedSize && `${w.size} ${item.selectedSize}`, item.selectedColor && !String(item.selectedColor).startsWith('#') && `${w.color} ${item.selectedColor}`]
                  .filter(Boolean).join(' · ')}
                {item.selectedColor && String(item.selectedColor).startsWith('#') && (
                  <i className="mk-dot" style={{ background: item.selectedColor }} aria-label={item.selectedColor} />
                )}
              </span>
              <span className="mk-item__foot">
                <span className="mk-qty" role="group" aria-label="Soni">
                  <button type="button" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1} aria-label="Kamaytirish">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Ko'paytirish">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </span>
                <span className="mk-item__sum">{money(toNumber(item.price) * item.quantity, language)}</span>
              </span>
            </div>
            <button type="button" className="mk-remove" onClick={() => removeFromCart(item.id)} aria-label={w.remove}>
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <section className="mk-summary m-pad">
        <dl>
          <div><dt>{w.subtotal}</dt><dd>{money(total, language)}</dd></div>
          <div><dt>{w.delivery}</dt><dd className="mk-free">{w.free}</dd></div>
          <div className="mk-total"><dt>{w.total}</dt><dd>{money(total, language)}</dd></div>
        </dl>
        <ul className="mk-notes">
          <li><Truck className="h-4 w-4" strokeWidth={1.5} />{policy.delivery}</li>
          <li><RotateCcw className="h-4 w-4" strokeWidth={1.5} />{policy.tryOn}. {policy.returns}.</li>
        </ul>
      </section>

      <div className="mk-spacer" aria-hidden="true" />
      <div className="m-actionbar m-actionbar--over-nav">
        <div className="m-actionbar__sum"><small>{w.total}</small><strong>{money(total, language)}</strong></div>
        <button type="button" className="m-btn m-btn--solid" onClick={checkout}>{w.checkout}</button>
      </div>
    </div>
  );
}
