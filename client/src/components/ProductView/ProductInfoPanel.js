import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProductOptions } from '../../utils/productVariants';
import { formatPrice, formatSaleNote, getActiveSale, getDisplayBadge, getReviewSummary } from '../../utils/productDisplay';
import { getPolicyCopy } from '../../config/policies';

export default function ProductInfoPanel({
  product,
  reviewCount = 0,
  onAddToCart,
  onToggleWishlist,
  isFavorite,
  isAddingToCart,
  onReviewClick,
  onOpenSizeGuide,
  onOpenQuickOrder,
}) {
  const { t, language } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openDetail, setOpenDetail] = useState('description');
  const [isCopied, setIsCopied] = useState(false);
  const colors = getProductOptions(product, 'color');
  const sizes = getProductOptions(product, 'size');
  const sale = getActiveSale(product);
  const badge = getDisplayBadge(product);
  const reviewSummary = getReviewSummary({
    rating: product.rating,
    numOfReviews: Math.max(Number(product.numOfReviews) || 0, reviewCount),
  });
  const policy = getPolicyCopy(language);
  const isOriginal = Boolean(product.authenticity?.isOriginal);
  const fitLabels = { small: 'Kichik keladi', 'true-to-size': 'Aynan mos', large: 'Katta keladi' };
  const modelDetails = [
    product.modelInfo?.height && `Bo'yi ${product.modelInfo.height} sm`,
    product.modelInfo?.bust && `Ko'krak ${product.modelInfo.bust} sm`,
    product.modelInfo?.waist && `Bel ${product.modelInfo.waist} sm`,
    product.modelInfo?.hips && `Son ${product.modelInfo.hips} sm`,
    product.modelInfo?.wearingSize && `Kiygan razmer ${product.modelInfo.wearingSize}`,
  ].filter(Boolean).join(' · ');

  const addToBag = () => {
    if (colors.length && !selectedColor) return window.luxeNotify.error('Iltimos, rangni tanlang.');
    if (sizes.length && !selectedSize) return window.luxeNotify.error("Iltimos, o'lchamni tanlang.");
    onAddToCart?.(selectedColor, selectedSize, quantity);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        window.setTimeout(() => setIsCopied(false), 1800);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') console.error(error);
    }
  };

  const composition = [product.fabricComposition, ...(product.materials || [])].filter(Boolean);
  const materialContent = [
    composition.length && `Tarkibi: ${[...new Set(composition)].join(', ')}`,
    product.origin && `Ishlab chiqarilgan: ${product.origin}`,
    product.careInstructions && `Parvarish: ${product.careInstructions}`,
  ].filter(Boolean).join('. ');

  const details = [
    ...(product.description ? [{ id: 'description', label: 'Model haqida', content: product.description }] : []),
    ...(isOriginal ? [{
      id: 'authenticity',
      label: 'Original va kelib chiqishi',
      content: ['Original mahsulot', product.brand, product.authenticity?.note].filter(Boolean).join(' · '),
    }] : []),
    ...(product.fit?.note || modelDetails ? [{
      id: 'fit',
      label: 'Fit va model ma’lumotlari',
      content: [fitLabels[product.fit?.type] || '', product.fit?.note, modelDetails].filter(Boolean).join('. '),
    }] : []),
    ...(materialContent ? [{ id: 'material', label: 'Tarkib va parvarish', content: materialContent }] : []),
    { id: 'delivery', label: 'Yetkazish, kiyib ko‘rish va qaytarish', content: [policy.delivery, policy.tryOn, policy.returns, policy.payment].join('. ') + '.' },
  ];

  return (
    <section className="clean-product-panel">
      <div className="clean-product-topline">
        <span>{product.brand || product.category}</span>
        {isOriginal && <span className="clean-product-original"><ShieldCheck size={13} aria-hidden="true" /> Original</span>}
        {badge && <span className="clean-product-badge">{badge === 'LIMITED' ? 'Cheklangan son' : badge}</span>}
      </div>

      <h1 className="clean-product-title">{product.name}</h1>

      {reviewSummary.show && (
        <div className="clean-product-rating">
          <div className="flex text-[#c9a96e]" aria-label={`${reviewSummary.rating} yulduz`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < Math.round(reviewSummary.rating) ? 'currentColor' : 'none'} />)}
          </div>
          <button onClick={onReviewClick}>{reviewSummary.rating.toFixed(1)} · {reviewSummary.count} sharh</button>
        </div>
      )}

      <div className="clean-product-price">
        <span>{formatPrice(product.price)} <small>{t('common.sum') || "so'm"}</small></span>
        {sale.active && <del>{formatPrice(sale.originalPrice)} so'm</del>}
      </div>
      {sale.active && <p className="clean-product-sale-note">{formatSaleNote(sale.endsAt, language)}</p>}

      {colors.length > 0 && (
        <div className="clean-choice">
          <div><span>Rang</span>{selectedColor && <em>{selectedColor}</em>}</div>
          <div className="clean-colors">
            {colors.map((color) => {
              const hex = color.startsWith?.('#');
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={selectedColor === color ? 'is-selected' : ''}
                  style={hex ? { backgroundColor: color } : undefined}
                  aria-label={color}
                >{hex ? null : color}</button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="clean-choice">
          <div className="clean-size-heading"><span>O‘lcham</span><button onClick={onOpenSizeGuide}><Ruler size={14} /> O‘lcham jadvali</button></div>
          <div className="clean-sizes">
            {sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={selectedSize === size ? 'is-selected' : ''}>{size}</button>)}
          </div>
        </div>
      )}

      <div className="clean-buy-row">
        <div className="clean-quantity" aria-label="Miqdor">
          <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Kamaytirish"><Minus size={15} /></button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((value) => value + 1)} aria-label="Oshirish"><Plus size={15} /></button>
        </div>
        <button className="clean-add-button" onClick={addToBag} disabled={isAddingToCart}>
          <ShoppingBag size={17} /> {isAddingToCart ? "Qo‘shilmoqda" : "Savatga qo‘shish"}
        </button>
        <button className={`clean-icon-button ${isFavorite ? 'is-favorite' : ''}`} onClick={onToggleWishlist} aria-label="Saralanganlar"><Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} /></button>
      </div>

      <button className="clean-quick-order" onClick={() => onOpenQuickOrder?.(selectedColor, selectedSize)}>Bir klikda buyurtma berish</button>

      <div className="clean-delivery-note"><Truck size={17} /><span><b>{policy.delivery}</b><small>{policy.tryOn} · {policy.returns}</small></span></div>

      <div className="clean-details">
        {details.map((detail) => (
          <div key={detail.id} className={openDetail === detail.id ? 'is-open' : ''}>
            <button onClick={() => setOpenDetail(openDetail === detail.id ? '' : detail.id)}>{detail.label}<ChevronDown size={17} /></button>
            {openDetail === detail.id && <p>{detail.content}</p>}
          </div>
        ))}
      </div>

      <button className="clean-share" onClick={share}><Share2 size={14} /> {isCopied ? 'Havola nusxalandi' : 'Mahsulotni ulashish'}</button>
    </section>
  );
}
