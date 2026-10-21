import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, Camera, Eye, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import { Empty, SoftImage, TopBar, money } from '../ui';
import { lookImageOf } from './Lookbooks';
import './lookbooks.css';

const WORDS = {
  uz: {
    look: 'Obraz',
    looks: 'Obrazlar',
    bag: 'Savat',
    zoom: 'Rasmni kattalashtirish',
    zoomHint: "To'liq ko'rish",
    close: 'Yopish',
    contents: 'Obraz tarkibi',
    pieces: (n) => `${n} ta buyum`,
    open: 'Ochish',
    color: 'Rang',
    size: "O'lcham",
    pickColor: 'Rangni tanlang',
    pickSize: "O'lchamni tanlang",
    pickBoth: "Rang va o'lchamni tanlang",
    pickToast: "Har bir buyum uchun rang va o'lchamni tanlang",
    added: (n) => `Obraz savatga qo'shildi (${n} ta buyum)`,
    total: 'Obraz narxi',
    addAll: "Savatga qo'shish",
    adding: "Qo'shilmoqda",
    noPieces: "Bu obraz buyumlari hozir sotuvda yo'q.",
    notFound: 'Obraz topilmadi',
    notFoundText: "Bu obraz olib tashlangan yoki havola noto'g'ri.",
    back: 'Barcha obrazlar',
  },
  ru: {
    look: 'Образ',
    looks: 'Образы',
    bag: 'Корзина',
    zoom: 'Увеличить фото',
    zoomHint: 'Смотреть целиком',
    close: 'Закрыть',
    contents: 'Состав образа',
    pieces: (n) => `${n} шт.`,
    open: 'Открыть',
    color: 'Цвет',
    size: 'Размер',
    pickColor: 'Выберите цвет',
    pickSize: 'Выберите размер',
    pickBoth: 'Выберите цвет и размер',
    pickToast: 'Выберите цвет и размер для каждой вещи',
    added: (n) => `Образ в корзине (${n} шт.)`,
    total: 'Цена образа',
    addAll: 'В корзину',
    adding: 'Добавляем',
    noPieces: 'Вещей из этого образа сейчас нет в продаже.',
    notFound: 'Образ не найден',
    notFoundText: 'Этот образ убран или ссылка неверна.',
    back: 'Все образы',
  },
  en: {
    look: 'Look',
    looks: 'Looks',
    bag: 'Bag',
    zoom: 'Enlarge photo',
    zoomHint: 'View full',
    close: 'Close',
    contents: 'In this look',
    pieces: (n) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
    open: 'Open',
    color: 'Colour',
    size: 'Size',
    pickColor: 'Choose a colour',
    pickSize: 'Choose a size',
    pickBoth: 'Choose a colour and size',
    pickToast: 'Choose a colour and size for every piece',
    added: (n) => `Look added to your bag (${n} ${n === 1 ? 'piece' : 'pieces'})`,
    total: 'Look total',
    addAll: 'Add to bag',
    adding: 'Adding',
    noPieces: 'The pieces in this look are not on sale right now.',
    notFound: 'Look not found',
    notFoundText: 'This look was removed or the link is wrong.',
    back: 'All looks',
  },
};

const getSizes = (product) => (Array.isArray(product.sizes)
  ? product.sizes
    .flatMap((size) => (typeof size === 'string' && size.includes(' ') ? size.split(' ') : [size]))
    .map(String)
    .filter(Boolean)
  : []);

const LookItem = ({ product, selection, error, onSelect, w }) => {
  const sizes = getSizes(product);
  const colors = product.colors || [];
  return (
    <li className={`mld-item ${error ? 'is-error' : ''}`}>
      <div className="mld-item__top">
        <Link to={`/mobile/product/${product.id}`} className="mld-item__img">
          <SoftImage src={product.image || getImageUrl(product)} alt={product.name} />
        </Link>
        <div className="mld-item__body">
          {product.category && <span className="mld-item__cat">{product.category}</span>}
          <span className="mld-item__name">{product.name}</span>
          <div className="mld-item__row">
            <span className="m-price">{money(product.price, w.lang)}</span>
            <Link to={`/mobile/product/${product.id}`} className="mld-item__open">{w.open}<ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </div>

      {colors.length > 0 && (
        <div className="mld-opt">
          <span className="mld-opt__label">{w.color}</span>
          <div className="m-chips">
            {colors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                className={`m-chip ${String(color).startsWith('#') ? 'mld-chip--swatch' : ''} ${selection?.color === color ? 'is-on' : ''}`}
                aria-pressed={selection?.color === color}
                aria-label={color}
                title={color}
                onClick={() => onSelect(product.id, 'color', color)}
              >
                {String(color).startsWith('#')
                  ? <span className="mld-swatch"><i style={{ background: color }} /></span>
                  : color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mld-opt">
          <span className="mld-opt__label">{w.size}</span>
          <div className="m-chips">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`m-chip ${selection?.size === size ? 'is-on' : ''}`}
                aria-pressed={selection?.size === size}
                onClick={() => onSelect(product.id, 'size', size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mld-item__error" role="alert"><AlertCircle className="h-4 w-4" />{error}</p>}
    </li>
  );
};

const DetailSkeleton = () => (
  <div aria-hidden="true">
    <div className="m-skel" style={{ aspectRatio: '4 / 5', maxHeight: '72svh' }} />
    <div className="m-pad">
      <div className="m-skel m-skel--line" style={{ width: '25%', marginTop: 26 }} />
      <div className="m-skel m-skel--line" style={{ width: '75%', height: 30 }} />
      <div className="m-skel m-skel--line" style={{ width: '90%' }} />
    </div>
  </div>
);

export default function LookDetail() {
  const { language } = useLanguage();
  const w = { ...(WORDS[language] || WORDS.uz), lang: language };
  const { id } = useParams();
  const navigate = useNavigate();
  const { products = [] } = useProducts();
  const { addToCart } = useCart();

  const [look, setLook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [viewer, setViewer] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiFetch('/api/looks')
      .then((result) => {
        if (!alive) return;
        const found = result.success ? (result.data || []).find((item) => item._id === id || item.id === id) : null;
        setLook(found || null);
      })
      .catch((error) => {
        console.error('Failed to fetch look:', error);
        if (alive) setLook(null);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!viewer) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => { if (event.key === 'Escape') setViewer(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [viewer]);

  // A look lists its products directly (ids or snapshots); older looks only name categories.
  const lookProducts = useMemo(() => {
    if (!look) return [];
    if (Array.isArray(look.products) && look.products.length > 0) {
      if (typeof look.products[0] === 'object') {
        return look.products.map((item) => {
          const productId = item.id || item._id;
          return products.find((product) => product.id === productId) || {
            id: productId,
            name: item.name,
            price: item.price,
            category: item.category,
            colors: item.colors || [],
            sizes: item.sizes || [],
            images: item.images || [],
            image: item.image || item.images?.[0] || '/placeholder.jpg',
          };
        });
      }
      return products.filter((product) => look.products.includes(product.id));
    }
    const resolved = [];
    (look.items || []).forEach((item) => {
      resolved.push(...products
        .filter((product) => product.category === item.category)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, item.count || 1));
    });
    return [...new Set(resolved)];
  }, [look, products]);

  // Pre-select a colour or size when a piece has only one.
  useEffect(() => {
    if (!lookProducts.length) return;
    const next = {};
    lookProducts.forEach((product) => {
      const choice = {};
      if ((product.colors || []).length === 1) choice.color = product.colors[0];
      const sizes = getSizes(product);
      if (sizes.length === 1) choice.size = sizes[0];
      next[product.id] = choice;
    });
    setSelections(next);
  }, [lookProducts]);

  const total = lookProducts.reduce((sum, product) => sum + (typeof product.price === 'number' ? product.price : 0), 0);

  const select = (productId, field, value) => {
    setSelections((prev) => ({ ...prev, [productId]: { ...(prev[productId] || {}), [field]: value } }));
    if (errors[productId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const addAll = async () => {
    if (!lookProducts.length) return;
    const nextErrors = {};
    lookProducts.forEach((product) => {
      const chosen = selections[product.id] || {};
      const needColor = (product.colors || []).length > 0 && !chosen.color;
      const needSize = getSizes(product).length > 0 && !chosen.size;
      if (needColor && needSize) nextErrors[product.id] = w.pickBoth;
      else if (needColor) nextErrors[product.id] = w.pickColor;
      else if (needSize) nextErrors[product.id] = w.pickSize;
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error(w.pickToast);
      return;
    }

    setAdding(true);
    let added = 0;
    for (const product of lookProducts) {
      const chosen = selections[product.id] || {};
      try {
        // One at a time so the cart updates in order.
        await addToCart(product, chosen.color, chosen.size, 1);
        added += 1;
      } catch (error) {
        console.error('Failed to add look product:', error);
      }
    }
    setAdding(false);
    if (added > 0) toast.success(w.added(added));
  };

  const bagLink = (
    <Link to="/mobile/cart" className="m-icon-btn" aria-label={w.bag}>
      <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.5} />
    </Link>
  );

  if (loading) {
    return (
      <div className="m-page--bare mld">
        <TopBar title={w.look} onBack={() => navigate('/mobile/lookbooks')} right={bagLink} />
        <DetailSkeleton />
      </div>
    );
  }

  if (!look) {
    return (
      <div className="m-page--bare">
        <TopBar title={w.look} onBack={() => navigate('/mobile/lookbooks')} />
        <Empty
          icon={Camera}
          title={w.notFound}
          text={w.notFoundText}
          action={<Link to="/mobile/lookbooks" className="m-btn m-btn--ghost">{w.back}</Link>}
        />
      </div>
    );
  }

  const hero = lookImageOf(look);
  // Only a short editorial number is worth showing, never a database id.
  const lookNo = look.id && String(look.id).length <= 3 ? ` ${String(look.id).padStart(2, '0')}` : '';

  return (
    <div className="m-page--bare mld">
      <SEO title={look.title} description={look.description} image={hero} />
      <TopBar title={look.title} subtitle={w.look} onBack={() => navigate('/mobile/lookbooks')} right={bagLink} />

      <button type="button" className="mld-hero" onClick={() => setViewer(true)} aria-label={w.zoom}>
        <SoftImage src={hero} alt={look.title} eager onError={(event) => { event.currentTarget.src = '/mobile.jpg'; }} />
        <span className="mld-hero__hint"><Eye className="h-4 w-4" strokeWidth={1.5} />{w.zoomHint}</span>
      </button>

      <header className="mld-intro m-pad">
        <p className="m-kicker">{w.look}{lookNo}</p>
        <h1 className="m-h1">{look.title}</h1>
        {look.description && <p className="m-body">{look.description}</p>}
      </header>

      <section className="m-pad">
        <div className="mld-sum">
          <span>{w.contents}</span>
          <strong>{w.pieces(lookProducts.length)}</strong>
        </div>
        {lookProducts.length ? (
          <ul className="mld-items">
            {lookProducts.map((product) => (
              <LookItem
                key={product.id}
                product={product}
                selection={selections[product.id]}
                error={errors[product.id]}
                onSelect={select}
                w={w}
              />
            ))}
          </ul>
        ) : (
          <p className="m-body" style={{ paddingTop: 20 }}>{w.noPieces}</p>
        )}
      </section>

      <div className="m-actionbar">
        <div className="m-actionbar__sum">
          <small>{w.total}</small>
          <strong>{money(total, language)}</strong>
        </div>
        <button
          type="button"
          className={`m-btn m-btn--solid ${adding ? 'is-busy' : ''}`}
          onClick={addAll}
          disabled={adding || !lookProducts.length}
        >
          <ShoppingBag className="h-4 w-4" />{adding ? w.adding : w.addAll}
        </button>
      </div>

      {viewer && (
        <div className="mld-viewer" role="dialog" aria-modal="true" aria-label={look.title} onClick={() => setViewer(false)}>
          <img src={hero} alt={look.title} onClick={(event) => event.stopPropagation()} />
          <button type="button" className="m-icon-btn" onClick={() => setViewer(false)} aria-label={w.close}>
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
