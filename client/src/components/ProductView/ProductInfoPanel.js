import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProductOptions } from '../../utils/productVariants';

const formatPrice = (value) => Number(value || 0).toLocaleString('uz-UZ').replace(/,/g, ' ');

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
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openDetail, setOpenDetail] = useState('description');
  const [isCopied, setIsCopied] = useState(false);
  const colors = getProductOptions(product, 'color');
  const sizes = getProductOptions(product, 'size');
  const hasDiscount = Number(product.originalPrice) > Number(product.price);

  const addToBag = () => {
    if (colors.length && !selectedColor) return window.alert('Iltimos, rangni tanlang.');
    if (sizes.length && !selectedSize) return window.alert("Iltimos, o'lchamni tanlang.");
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

  const details = [
    { id: 'description', label: 'Model haqida', content: product.description || "Kundalik va maxsus lahzalar uchun yaratilgan nafis, qulay model." },
    { id: 'material', label: 'Material va parvarish', content: product.materials?.join(', ') || "Sifatli mato. Shaklini saqlashi uchun ehtiyotkor parvarish tavsiya qilinadi." },
    { id: 'delivery', label: 'Yetkazib berish', content: "Toshkent bo'ylab tezkor yetkazib berish mavjud. Buyurtma tafsilotlari checkout paytida tasdiqlanadi." },
  ];

  return (
    <section className="clean-product-panel">
      <div className="clean-product-topline">
        <span>{product.category || 'YANGI KOLLEKSIYA'}</span>
        {product.badge && <span className="clean-product-badge">{product.badge}</span>}
      </div>

      <h1 className="clean-product-title">{product.name}</h1>

      <div className="clean-product-rating">
        <div className="flex text-[#c9a96e]" aria-label={`${product.rating || 5} yulduz`}>
          {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill="currentColor" />)}
        </div>
        <button onClick={onReviewClick}>{(product.rating || 5).toFixed(1)} · {reviewCount || 'Yangi'} sharhlar</button>
      </div>

      <div className="clean-product-price">
        <span>{formatPrice(product.price)} <small>{t('common.sum') || "so'm"}</small></span>
        {hasDiscount && <del>{formatPrice(product.originalPrice)} so'm</del>}
      </div>

      <p className="clean-product-lead">Siluetni nafis ko‘rsatadigan, kun davomida o‘zingizni erkin his qilishingiz uchun tanlangan model.</p>

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

      <div className="clean-delivery-note"><Truck size={17} /><span><b>Bugun yuboriladi</b><small>Toshkent bo‘ylab tezkor yetkazib berish</small></span></div>

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
