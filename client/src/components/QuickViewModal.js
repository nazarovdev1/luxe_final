import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingCart, Plus, Minus, Heart, Ruler, Check, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (item) => {
  if (!item) return '';
  if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
  return item.image || '';
};

const QuickViewModal = ({ isOpen, onClose, product, onSizeGuideOpen }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product?.images && product.images.length > 0
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const sizeOptions = React.useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.sizes)) {
      return [...new Set(
        product.sizes
          .flatMap((s) => (typeof s === 'string' && s.includes(' ') ? s.split(' ') : [s]))
          .map((s) => String(s).trim())
          .filter(Boolean)
      )];
    }
    return [];
  }, [product]);

  // Reset state when product changes
  useEffect(() => {
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setCurrentImageIndex(0);
  }, [product?.id]);

  // Hide navbar when modal is open
  useEffect(() => {
    const navbar = document.querySelector('nav.fixed');
    if (navbar && isOpen) {
      navbar.style.opacity = '0';
      navbar.style.pointerEvents = 'none';
      navbar.style.transition = 'opacity 0.3s ease';
    } else if (navbar) {
      navbar.style.opacity = '';
      navbar.style.pointerEvents = '';
      navbar.style.transition = '';
    }
    return () => {
      if (navbar) {
        navbar.style.opacity = '';
        navbar.style.pointerEvents = '';
        navbar.style.transition = '';
      }
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Iltimos, rang tanlang!');
      return;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Iltimos, o'lcham tanlang!");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      toast.success(`${product.name} savatga qo'shildi!`);
      onClose();
    } catch (error) {
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsAdding(false);
    }
  };

  const subtotal = (Number(product.price) || 0) * quantity;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-[#9aa3b2] hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[500px] overflow-hidden rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b27] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#151b27]" />

                {/* Image dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentImageIndex
                            ? 'w-6 bg-[#d6b47c]'
                            : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-[#0d1423] text-[#9aa3b2]">
                Rasm mavjud emas
              </div>
            )}

            {product.badge && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details Section */}
          <div className="p-5 sm:p-6 flex flex-col">
            {/* Category */}
            <span className="inline-block self-start px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d6b47c] bg-[#d6b47c]/10 rounded-md mb-3">
              {product.category || 'Premium'}
            </span>

            {/* Name */}
            <Link to={`/product/${product.id}`} className="group">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#f4f1eb] group-hover:text-[#d6b47c] transition-colors leading-tight">
                {product.name}
              </h2>
            </Link>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'fill-current text-[#f2c66c]' : 'text-[#3f4658]'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#9aa3b2]">{(product.rating || 0).toFixed(1)}</span>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-bold text-[#f4f1eb]">{formatPrice(product.price)} {t('common.sum')}</span>
              {product.originalPrice && (
                <span className="text-sm text-[#9aa3b2] line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-sm text-[#9aa3b2] line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9aa3b2] mb-2">
                  {t('common.color')} <span className="text-[#d6b47c]">*</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => {
                    const isHex = typeof color === 'string' && color.startsWith('#');
                    return isHex ? (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                          selectedColor === color
                            ? 'ring-2 ring-[#d6b47c] ring-offset-2 ring-offset-[#151b27]'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {selectedColor === color && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                      </button>
                    ) : (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedColor === color
                            ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                            : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizeOptions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9aa3b2]">
                    {t('common.size')} <span className="text-[#d6b47c]">*</span>
                  </h4>
                  {onSizeGuideOpen && (
                    <button
                      onClick={() => {
                        onClose();
                        onSizeGuideOpen?.();
                      }}
                      className="flex items-center gap-1 text-[10px] text-[#d6b47c] hover:text-[#e0c08e] transition-colors"
                    >
                      <Ruler className="h-3 w-3" />
                      {t('sizeGuide.title')}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 min-w-[40px] rounded-lg px-2.5 text-xs font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-[#d6b47c]/15 text-[#f4f1eb] border border-[#d6b47c]/30'
                          : 'bg-white/5 text-[#9aa3b2] border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9aa3b2] mb-2">Soni</h4>
              <div className="inline-flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg p-2 text-[#9aa3b2] hover:text-white hover:bg-white/10 transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2.5rem] text-center text-sm font-semibold text-[#f4f1eb]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg p-2 text-[#9aa3b2] hover:text-white hover:bg-white/10 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div className="mt-4 rounded-xl bg-gradient-to-r from-[#19140f] to-[#131a2a] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9aa3b2]">{t('common.total')}</p>
              <p className="text-lg font-bold text-[#f4f1eb]">{formatPrice(subtotal)} {t('common.sum')}</p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#f4f1eb] px-4 py-3 text-sm font-semibold text-[#0f1014] transition-all hover:bg-white active:scale-[0.98] disabled:opacity-60"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                {isAdding ? t('common.loading') : t('common.addToCart')}
              </button>
              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#f4f1eb] hover:bg-white/10 transition-all"
              >
                {t('common.more')}
              </Link>
            </div>

            {/* Features */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                <p className="text-[10px] text-[#9aa3b2]">Yetkazish</p>
                <p className="text-[11px] font-semibold text-[#f4f1eb]">3-6 soat</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                <p className="text-[10px] text-[#9aa3b2]">Kafolat</p>
                <p className="text-[11px] font-semibold text-[#f4f1eb]">30 kun</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-2 text-center">
                <p className="text-[10px] text-[#9aa3b2]">Qaytarish</p>
                <p className="text-[11px] font-semibold text-[#f4f1eb]">7 kun</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
