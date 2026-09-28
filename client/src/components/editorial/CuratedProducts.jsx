import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getImageUrl, getAllImageUrls } from '../../utils/image';

const formatPrice = (price) => {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) return 'Narxini aniqlashtiring';
  return new Intl.NumberFormat('ru-RU').format(num) + " so'm";
};

export default function CuratedProducts({ onQuickView }) {
  const { products, isLoading } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('');

  // Extract real unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  // Filter products for curated composition
  const curatedSelection = useMemo(() => {
    const list = products.filter((p) => p.id && (!activeCategory || p.category === activeCategory));
    return list.slice(0, 4);
  }, [products, activeCategory]);

  const dominantProduct = curatedSelection[0];
  const secondaryProducts = curatedSelection.slice(1, 3);
  const detailProduct = curatedSelection[3] || dominantProduct;

  const handleFavorite = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleFavorite(productId);
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    toast.success(`${product.name} savatga qo'shildi!`);
  };

  const text = {
    uz: {
      kicker: '02 / SARALANGAN GARDEBOR',
      title: 'ARXITEKTURAL SILUETLAR',
      all: 'BARCHASI',
      viewAll: 'TO‘LIQ KATALOGNI KO‘RISH',
      view: 'KO‘RISH',
      bag: 'SAVATGA',
      empty: 'Tanlangan toifada hozircha mahsulotlar yangilanmoqda.',
      detailCaption: 'FIG. 04 — TAKTIL SIFAT',
      detailLead: 'Har bir chok va qirra to‘g‘ri tushishi uchun sinchkovlik bilan tekshiriladi.',
    },
    ru: {
      kicker: '02 / КУРИРОВАННЫЙ ГАРДЕРОБ',
      title: 'АРХИТЕКТУРНЫЕ СИЛУЭТЫ',
      all: 'ВСЕ',
      viewAll: 'СМОТРЕТЬ ВЕСЬ КАТАЛОГ',
      view: 'СМОТРЕТЬ',
      bag: 'В КОРЗИНУ',
      empty: 'В выбранной категории коллекция обновляется.',
      detailCaption: 'FIG. 04 — ТАКТИЛЬНОЕ КАЧЕСТВО',
      detailLead: 'Каждая строчка и срез проверяются вручную для безупречной посадки.',
    },
    en: {
      kicker: '02 / CURATED WARDROBE',
      title: 'ARCHITECTURAL PIECES',
      all: 'ALL',
      viewAll: 'EXPLORE FULL CATALOGUE',
      view: 'VIEW',
      bag: 'ADD TO BAG',
      empty: 'Collection is being updated for this selection.',
      detailCaption: 'FIG. 04 — TACTILE EXCELLENCE',
      detailLead: 'Every seam and structural fold is carefully balanced for enduring posture.',
    },
  }[language] || {
    kicker: '02 / SARALANGAN GARDEBOR',
    title: 'ARXITEKTURAL SILUETLAR',
    all: 'BARCHASI',
    viewAll: 'TO‘LIQ KATALOGNI KO‘RISH',
    view: 'KO‘RISH',
    bag: 'SAVATGA',
    empty: 'Tanlangan toifada hozircha mahsulotlar yangilanmoqda.',
    detailCaption: 'FIG. 04 — TAKTIL SIFAT',
    detailLead: 'Har bir chok va qirra to‘g‘ri tushishi uchun sinchkovlik bilan tekshiriladi.',
  };

  return (
    <section className="e-products-section" id="products" aria-label="Curated Collection">
      <div className="luxx-editorial-shell">
        {/* Topline: Section headline and view all catalogue link */}
        <div className="e-products-topline">
          <div className="e-products-title-group">
            <span className="e-label">{text.kicker}</span>
            <h2 className="e-serif-heading e-products-section-title">{text.title}</h2>
          </div>

          <Link to="/products" className="e-action-link">
            <span>{text.viewAll}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Real Category Filter Bar */}
        <div className="e-products-filters">
          <button
            type="button"
            className={`e-filter-btn ${activeCategory === '' ? 'is-active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            {text.all} ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`e-filter-btn ${activeCategory === cat ? 'is-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat} ({products.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Asymmetric Product Composition */}
        {dominantProduct ? (
          <div className="e-products-composition" aria-busy={isLoading}>
            {/* 1. Dominant Tall Product Card */}
            <article className="e-product-card-dominant">
              <div className="e-card-media-shell dominant">
                <Link to={`/product/${dominantProduct.id}`} aria-label={dominantProduct.name}>
                  <img
                    className="e-card-img-primary"
                    src={getImageUrl(dominantProduct)}
                    alt={dominantProduct.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                  />
                  {getAllImageUrls(dominantProduct)[1] && (
                    <img
                      className="e-card-img-secondary"
                      src={getAllImageUrls(dominantProduct)[1]}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </Link>

                <button
                  type="button"
                  className={`e-card-fav-btn ${isFavorite(dominantProduct.id) ? 'is-active' : ''}`}
                  onClick={(e) => handleFavorite(e, dominantProduct.id)}
                  aria-label="Sevimlilarga qo'shish"
                >
                  <Heart size={16} fill={isFavorite(dominantProduct.id) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>

                <div className="e-card-quick-overlay">
                  <button
                    type="button"
                    className="e-card-btn-view"
                    onClick={() => onQuickView?.(dominantProduct)}
                  >
                    <Eye size={13} />
                    <span>{text.view}</span>
                  </button>
                  <button
                    type="button"
                    className="e-card-btn-bag"
                    onClick={(e) => handleQuickAdd(e, dominantProduct)}
                    aria-label={text.bag}
                  >
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>

              <div className="e-product-info">
                <span className="e-product-cat">{dominantProduct.category || 'Atelier'}</span>
                <Link to={`/product/${dominantProduct.id}`} className="e-product-name">
                  {dominantProduct.name}
                </Link>
                <div className="e-product-price">{formatPrice(dominantProduct.price)}</div>
              </div>
            </article>

            {/* 2. Secondary Staggered Products Column */}
            <div className="e-products-col-secondary">
              {secondaryProducts.map((item) => {
                const isFav = isFavorite(item.id);
                const images = getAllImageUrls(item);
                return (
                  <article key={item.id} className="e-product-card-secondary">
                    <div className="e-card-media-shell">
                      <Link to={`/product/${item.id}`} aria-label={item.name}>
                        <img
                          className="e-card-img-primary"
                          src={getImageUrl(item)}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                        />
                        {images[1] && (
                          <img
                            className="e-card-img-secondary"
                            src={images[1]}
                            alt=""
                            loading="lazy"
                          />
                        )}
                      </Link>

                      <button
                        type="button"
                        className={`e-card-fav-btn ${isFav ? 'is-active' : ''}`}
                        onClick={(e) => handleFavorite(e, item.id)}
                        aria-label="Sevimlilarga qo'shish"
                      >
                        <Heart size={15} fill={isFav ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>

                      <div className="e-card-quick-overlay">
                        <button
                          type="button"
                          className="e-card-btn-view"
                          onClick={() => onQuickView?.(item)}
                        >
                          <Eye size={12} />
                          <span>{text.view}</span>
                        </button>
                        <button
                          type="button"
                          className="e-card-btn-bag"
                          onClick={(e) => handleQuickAdd(e, item)}
                          aria-label={text.bag}
                        >
                          <ShoppingBag size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="e-product-info">
                      <span className="e-product-cat">{item.category || 'Atelier'}</span>
                      <Link to={`/product/${item.id}`} className="e-product-name">
                        {item.name}
                      </Link>
                      <div className="e-product-price">{formatPrice(item.price)}</div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* 3. Offset Detail & Editorial Negative Space Column */}
            <div className="e-products-col-detail">
              <div className="e-detail-frame">
                <img
                  src={detailProduct ? getImageUrl(detailProduct) : '/about_photo.jpg'}
                  alt="Detail"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/about_photo.jpg'; }}
                />
                <div className="e-detail-caption">{text.detailCaption}</div>
              </div>

              <div className="e-detail-copy">
                <p>{text.detailLead}</p>
                <Link to="/products" className="e-action-link">
                  <span>{text.view}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--e-text-muted)' }}>
            <p>{text.empty}</p>
          </div>
        )}
      </div>
    </section>
  );
}
