import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BarChart3, Heart, Eye, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice, formatSaleNote, getActiveSale, getDisplayBadge, getReviewSummary } from '../utils/productDisplay';
// The card is reused outside the catalogue (home page), so it brings its own styles.
import '../pages/allProductsEditorial.css';

const getImageUrl = (product) => {
  if (!product) return '/placeholder.jpg';
  if (product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    return typeof first === 'object' ? (first.url || '/placeholder.jpg') : first;
  }
  return '/placeholder.jpg';
};

const PremiumProductCard = ({ product, onQuickView, onCompare, isCompareSelected, priority = false, index = 0 }) => {
  const { t, language } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageUrl = getImageUrl(product);
  const badge = getDisplayBadge(product);
  const sale = getActiveSale(product);
  const hasDiscount = sale.active;
  const discountPercent = sale.percent;
  const reviews = getReviewSummary(product);

  return (
    <article className="catalogue-card">
      <Link to={`/product/${product.id}`} className="catalogue-card__media" aria-label={product.name}>
        <img
          src={imageUrl}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={imgLoaded ? 'is-loaded' : ''}
        />
        {!imgLoaded && <span className="catalogue-card__skeleton" />}
        <span className="catalogue-card__number">{String(index + 1).padStart(2, '0')}</span>
        {(badge || hasDiscount) && <div className="catalogue-card__badges">{badge && <span>{badge}</span>}{hasDiscount && <span>−{discountPercent}%</span>}</div>}
        <div className="catalogue-card__actions" onClick={(event) => event.preventDefault()}>
          <button type="button" className={isCompareSelected ? 'is-active' : ''} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onCompare?.(product); }} title={t('premiumProductCard.compare', 'Taqqoslash')}><BarChart3 aria-hidden="true" /></button>
          <button type="button" className={isLiked ? 'is-active is-liked' : ''} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsLiked((liked) => !liked); }} title={t('premiumProductCard.favorite', 'Tanlanganlar')}><Heart aria-hidden="true" /></button>
        </div>
        {onQuickView && <button type="button" className="catalogue-card__quick" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onQuickView(product); }}><Eye aria-hidden="true" />{t('product.quickView', "Tezkor ko‘rish")}</button>}
      </Link>

      <div className="catalogue-card__info">
        <div className="catalogue-card__meta"><span>{product.brand || product.category}</span>{reviews.show && <span><Star aria-hidden="true" />{reviews.rating.toFixed(1)}</span>}</div>
        <Link to={`/product/${product.id}`} className="catalogue-card__title"><h3>{product.name}</h3><ArrowUpRight aria-hidden="true" /></Link>
        <div className="catalogue-card__price"><strong>{formatPrice(product.price)} {t('common.sum', "so‘m")}</strong>{hasDiscount && <span>{formatPrice(sale.originalPrice)} {t('common.sum', "so‘m")}</span>}</div>
        {hasDiscount && <p className="catalogue-card__sale-note">{formatSaleNote(sale.endsAt, language)}</p>}
      </div>
    </article>
  );
};

export default PremiumProductCard;
