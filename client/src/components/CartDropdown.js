import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

const CartDropdown = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      toast.error("Iltimos, buyurtma berish uchun ro'yxatdan o'ting");
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const total = getCartTotal();
  const money = (value) => `${Number(value || 0).toLocaleString('en-US').replace(/,/g, ',')} ${t('common.sum')}`;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={handleOverlayClick}
      />

      <div
        className={`fixed top-0 right-0 z-[10000] h-screen w-full sm:w-[500px] bg-[#0c0c0c] transform transition-transform duration-300 ease-in-out flex flex-col items-stretch border-l border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between px-8 py-10 border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-normal text-[#d6b47c] tracking-wide">{t('cartDropdown.title')}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Savatni yopish"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="text-[#d6b47c] opacity-50"><X strokeWidth={1} size={32} /></span>
              </div>
              <div>
                <h3 className="text-lg text-white mb-2">{t('cartDropdown.empty')}</h3>
                <p className="text-[#a1a1aa] text-sm">{t('cartDropdown.emptyDesc')}</p>
              </div>
              <button
                onClick={() => { onClose(); navigate('/products'); }}
                className="px-8 py-3 bg-white/5 text-white text-xs tracking-widest uppercase hover:bg-white/10 transition-colors border border-white/10"
              >
                {t('cartDropdown.goToCatalog')}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {items.map((item) => {
                const price = typeof item.price === 'string'
                  ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                  : parseFloat(item.price);

                return (
                  <div key={item.id} className="flex gap-6">
                    <div className="shrink-0">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="h-[120px] w-[90px] object-cover bg-black"
                      />
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-[14px] text-white/90">
                            {item.name}
                          </h3>
                          {item.selectedColor && (
                            <p className="text-[12px] text-white/50">{t('common.color')}: {item.selectedColor}</p>
                          )}
                          {item.selectedSize && (
                            <p className="text-[12px] text-white/50">{t('common.size')}: {item.selectedSize}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-[#d6b47c] text-[13px] tracking-wide">
                          {money(price)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center gap-4">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="flex h-[30px] w-[30px] items-center justify-center text-white/70 hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-[30px] text-center text-[13px] text-white border-l border-r border-white/20 flex items-center justify-center h-[30px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex h-[30px] w-[30px] items-center justify-center text-white/70 hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex h-[30px] w-[30px] items-center justify-center text-[#d6b47c]/70 hover:text-[#d6b47c] hover:bg-[#d6b47c]/10 border border-[#d6b47c]/30 transition-colors ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-auto px-8 py-8 shrink-0 border-t border-white/10 bg-[#1a1b1e]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white text-sm">{t('cartDropdown.total')}</span>
              <span className="text-[#d6b47c] tracking-wide">
                {money(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#d6b47c] hover:bg-[#c6a366] text-black py-4 text-xs font-bold tracking-[0.15em] uppercase transition-colors"
            >
              {t('cartDropdown.checkout')}
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default CartDropdown;
