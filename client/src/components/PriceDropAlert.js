import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  TrendingDown,
  X,
  CheckCircle2,
  Smartphone,
  Send,
  ArrowRight,
  ShieldCheck,
  Phone,
  Loader2,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';

const STORAGE_KEY = 'luxx_price_alerts';
const PHONE_KEY = 'luxx_user_phone';

export const formatUzPhone = (raw) => {
  if (!raw) return '+998 ';
  const digits = String(raw).replace(/\D/g, '');
  let num = digits;
  if (num.startsWith('998')) {
    num = num.substring(3);
  }
  num = num.substring(0, 9); // Max 9 local digits
  let res = '+998';
  if (num.length > 0) res += ' ' + num.substring(0, 2);
  if (num.length > 2) res += ' ' + num.substring(2, 5);
  if (num.length > 5) res += ' ' + num.substring(5, 7);
  if (num.length > 7) res += ' ' + num.substring(7, 9);
  return res;
};

const getStoredAlerts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredAlert = (productId, alertData) => {
  try {
    const alerts = getStoredAlerts();
    if (alertData) {
      alerts[productId] = alertData;
    } else {
      delete alerts[productId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // ignore
  }
};

const PriceDropAlert = ({ product }) => {
  let authContext = {};
  try {
    authContext = useAuth();
  } catch {
    authContext = {};
  }
  const { user, isAuthenticated } = authContext;

  // Check if logged in user has Telegram linked
  const isTelegramUser = Boolean(
    isAuthenticated && (user?.telegramId || (user?.role && user?.telegramUsername))
  );

  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(() => {
    try {
      const saved = user?.phone || localStorage.getItem(PHONE_KEY) || '';
      return saved ? formatUzPhone(saved) : '+998 ';
    } catch {
      return '+998 ';
    }
  });

  const [targetPrice, setTargetPrice] = useState('');
  const [notifyMethod, setNotifyMethod] = useState('telegram'); // 'telegram' | 'sms' | 'push'
  const [submitted, setSubmitted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const prodId = product?._id || product?.id;
  const currentPrice = Number(product?.price || product?.salePrice || 0);
  const suggestedTarget = Math.round((currentPrice * 0.85) / 1000) * 1000;

  // Sync user phone if user changes
  useEffect(() => {
    if (user?.phone) {
      setPhone(formatUzPhone(user.phone));
    }
  }, [user]);

  // Initialize subscription state from localStorage and server
  useEffect(() => {
    if (!prodId) return;

    const stored = getStoredAlerts()[prodId];
    if (stored) {
      setIsSubscribed(true);
      if (stored.targetPrice) setTargetPrice(stored.targetPrice.toString());
      if (stored.phone) setPhone(formatUzPhone(stored.phone));
      if (stored.notifyMethod) setNotifyMethod(stored.notifyMethod);
    }

    // Background check with server
    const checkPhone = phone.replace(/\D/g, '').length >= 9 ? phone : (stored ? stored.phone : '');
    if (checkPhone || (isAuthenticated && user?._id)) {
      apiFetch('/api/price-alerts/check', {
        params: { productId: prodId, phone: checkPhone || undefined },
      })
        .then((res) => {
          if (res?.success && res.isSubscribed) {
            setIsSubscribed(true);
            if (res.data?.targetPrice) {
              setTargetPrice(res.data.targetPrice.toString());
            }
          }
        })
        .catch(() => {});
    }
  }, [prodId, isAuthenticated, user]);

  // Complete iOS Safari + Android scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const originalStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      touchAction: document.body.style.touchAction,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';

    const handleTouchMove = (e) => {
      if (!e.target.closest('[data-modal-scroll]')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.width = originalStyles.width;
      document.body.style.touchAction = originalStyles.touchAction;
      document.removeEventListener('touchmove', handleTouchMove);
      if (typeof window.scrollTo === 'function') {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);

  const getProductImage = () => {
    if (product?.image) return product.image;
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const first = product.images[0];
      return typeof first === 'object' ? first.url : first;
    }
    return '/placeholder.jpg';
  };

  const formatSum = (val) => `${Number(val || 0).toLocaleString()} ${t('common.sum', "so'm")}`;

  const handlePhoneChange = (e) => {
    const formatted = formatUzPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiresPhone = notifyMethod === 'sms' || (notifyMethod === 'telegram' && !isTelegramUser);
    const cleanedDigits = phone.replace(/\D/g, '');

    if (requiresPhone && cleanedDigits.length < 9) {
      toast.error(t('priceDropAlert.phoneNumber', 'Iltimos, to‘liq telefon raqamingizni kiriting'));
      return;
    }

    const desiredPrice = Number(targetPrice || suggestedTarget);
    if (!desiredPrice || desiredPrice <= 0) {
      toast.error(t('priceDropAlert.targetPrice', 'Kutilayotgan narxni kiriting'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        productId: prodId,
        currentPrice,
        targetPrice: desiredPrice,
        notifyMethod,
        phone: requiresPhone ? phone.trim() : (user?.phone || null),
        telegramChatId: isTelegramUser ? (user?.telegramId || null) : null,
      };

      const res = await apiFetch('/api/price-alerts', {
        method: 'POST',
        body: payload,
      });

      if (res?.success) {
        setSubmitted(true);
        setIsSubscribed(true);

        try {
          if (requiresPhone && phone.trim()) {
            localStorage.setItem(PHONE_KEY, phone.trim());
          }
          saveStoredAlert(prodId, {
            targetPrice: desiredPrice,
            phone: phone.trim(),
            notifyMethod,
            subscribedAt: new Date().toISOString(),
          });
        } catch {
          // ignore
        }

        toast.success(t('priceDropAlert.activated', 'Narx kuzatuvi yoqildi!'));
      } else {
        toast.error(res?.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      toast.error(err?.message || 'Server bilan bog\'lanishda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiFetch('/api/price-alerts/unsubscribe', {
        method: 'POST',
        body: { productId: prodId, phone: phone.trim() },
      });
    } catch {
      // ignore
    }

    saveStoredAlert(prodId, null);
    setIsSubscribed(false);
    setSubmitted(false);
    toast(t('priceDropAlert.cancel', 'Narx kuzatuvi bekor qilindi'), { icon: '🔕' });
  };

  const discountPercentages = [
    { pct: 0.10, label: '-10%' },
    { pct: 0.15, label: '-15%' },
    { pct: 0.20, label: '-20%' },
    { pct: 0.30, label: '-30%' },
  ];

  const methodLabel = notifyMethod === 'telegram' ? 'Telegram' : notifyMethod === 'sms' ? 'SMS' : 'Push';
  const targetFormatted = formatSum(targetPrice || suggestedTarget);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pda-modal-title"
    >
      {/* Dark Luxury Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Centered Luxury Card */}
      <div
        className="relative z-10 w-full max-w-[420px] max-h-[90svh] flex flex-col rounded-none border border-[#d5ae68]/30 bg-[#0d0c0a] text-[#f7f2ea] shadow-[0_25px_70px_rgba(0,0,0,0.92)] overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 90% 0%, rgba(213,174,104,0.12), transparent 38%), radial-gradient(circle at 10% 100%, rgba(130,90,45,0.08), transparent 45%)',
        }}
      >
        {/* Top Gold Accent Line */}
        <div className="h-[2px] w-full flex-none bg-gradient-to-r from-transparent via-[#d5ae68] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-white/10 flex-none">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-3.5 h-[1px] bg-[#d5ae68]" />
              <span className="text-[8px] font-black uppercase tracking-[0.24em] text-[#d5ae68]">
                LUXX ATELIER / CONCIERGE
              </span>
            </div>
            <h2
              id="pda-modal-title"
              className="text-xl sm:text-2xl font-serif text-[#f7f2ea] tracking-tight leading-tight"
            >
              Narx tushganda <em className="italic text-[#d5ae68] font-serif">xabar oling</em>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Yopish"
            className="flex h-8 w-8 items-center justify-center flex-shrink-0 border border-white/15 text-white/70 hover:border-[#d5ae68] hover:text-[#d5ae68] transition-colors ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          data-modal-scroll="true"
          className="overflow-y-auto overscroll-contain flex-1 p-5 scrollbar-none"
        >
          {submitted ? (
            /* Success Screen */
            <div className="text-center py-2">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#d5ae68]/40 bg-[#d5ae68]/10 text-[#d5ae68]">
                <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                <span className="absolute inset-0 rounded-full animate-ping bg-[#d5ae68]/15 pointer-events-none" />
              </div>

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5ae68]">
                {t('priceDropAlert.activated', 'Kuzatuv faollashtirildi')}
              </span>
              <h3 className="mt-1.5 text-lg sm:text-xl font-serif text-[#f7f2ea]">
                {product?.name || 'Mahsulot'}
              </h3>
              <p className="mt-2 text-xs text-[#b8b3a8] leading-relaxed max-w-xs mx-auto">
                {t('priceDropAlert.alertDesc', {
                  price: targetFormatted,
                  method: methodLabel,
                  defaultValue: `Mahsulot narxi ${targetFormatted} ga tushganda sizga ${methodLabel} orqali xabar yuboramiz.`,
                })}
              </p>

              {/* Summary Box */}
              <div className="mt-5 border border-white/10 bg-white/[0.02] p-4 text-left">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                  <span className="text-white/50">{t('priceDropAlert.currentPrice', 'Hozirgi narx')}:</span>
                  <span className="font-semibold text-white/80">{formatSum(currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-[#d5ae68] font-bold">{t('priceDropAlert.targetPrice', 'Kutilayotgan narx')}:</span>
                  <span className="font-serif text-base font-semibold text-[#d5ae68]">
                    {targetFormatted}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full py-3.5 border border-[#d5ae68] bg-[#d5ae68] text-[#0d0c0a] text-xs font-black uppercase tracking-[0.18em] hover:bg-[#e4be77] transition-colors"
              >
                {t('priceDropAlert.understand', 'Tushundim')}
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Summary Row */}
              <div className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3">
                <img
                  src={getProductImage()}
                  alt={product?.name || ''}
                  className="w-12 h-14 object-cover border border-white/10 flex-none"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif text-[#f7f2ea] truncate">{product?.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/50">
                      {t('priceDropAlert.currentPrice', 'Hozirgi narx')}:
                    </span>
                    <span className="text-xs font-semibold text-[#d5ae68]">
                      {formatSum(currentPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Price Section */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d5ae68]">
                    {t('priceDropAlert.targetPrice', 'Qaysi narxga tushsa xabar bersin?')}
                  </label>
                </div>

                {/* Discount Percentage Chips */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {discountPercentages.map(({ pct, label }) => {
                    const calculated = Math.round((currentPrice * (1 - pct)) / 1000) * 1000;
                    const isSelected = targetPrice === calculated.toString();
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTargetPrice(calculated.toString())}
                        className={`py-2 px-1 text-center border transition-all ${
                          isSelected
                            ? 'border-[#d5ae68] bg-[#d5ae68]/15 text-[#d5ae68] font-bold shadow-[0_0_12px_rgba(213,174,104,0.2)]'
                            : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-bold">{label}</span>
                        <span className="block text-[8px] text-white/40 mt-0.5 tracking-tight truncate">
                          {(calculated / 1000).toLocaleString()}k
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value.replace(/\D/g, ''))}
                    placeholder={suggestedTarget.toString()}
                    className="w-full bg-[#141311] border border-white/15 pl-3.5 pr-16 py-2.5 text-sm text-[#f7f2ea] placeholder-white/25 focus:border-[#d5ae68] focus:outline-none transition-colors font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 pointer-events-none">
                    {t('common.sum', "so'm")}
                  </span>
                </div>
              </div>

              {/* Notification Channel Cards */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#d5ae68] mb-1.5">
                  {t('priceDropAlert.notifyMethod', 'Xabar olish usuli')}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'telegram', label: 'Telegram', icon: Send },
                    { id: 'sms', label: 'SMS', icon: Smartphone },
                    { id: 'push', label: 'Push', icon: Bell },
                  ].map(({ id, label, icon: Icon }) => {
                    const isSelected = notifyMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setNotifyMethod(id)}
                        className={`flex flex-col items-center justify-center p-2.5 border transition-all ${
                          isSelected
                            ? 'border-[#d5ae68] bg-[#d5ae68]/15 text-[#d5ae68]'
                            : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] font-bold tracking-wider">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* If Telegram method AND user logged in via Telegram: Show connected account badge instead of phone input */}
              {notifyMethod === 'telegram' && isTelegramUser ? (
                <div className="flex items-center justify-between border border-[#d5ae68]/30 bg-[#d5ae68]/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d5ae68]/20 text-[#d5ae68]">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#f7f2ea]">Telegram hisobingiz ulangan</p>
                      <p className="text-[10px] text-[#d5ae68]">
                        @{user?.telegramUsername || user?.username || 'Telegram'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5">
                    <UserCheck className="w-3 h-3" />
                    <span>Tayyor</span>
                  </div>
                </div>
              ) : (notifyMethod === 'sms' || notifyMethod === 'telegram') ? (
                /* If normal login / register or SMS: Show phone input with +998 prefilled */
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                      {notifyMethod === 'telegram'
                        ? 'Telegram telefon raqamingiz'
                        : t('priceDropAlert.phoneNumber', 'Telefon raqamingiz')}
                    </label>
                    {isAuthenticated && user?.phone && (
                      <span className="text-[9px] text-[#d5ae68]">Akkaunt raqami</span>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5ae68]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+998 90 123 45 67"
                      required
                      className="w-full bg-[#141311] border border-white/15 pl-10 pr-3.5 py-2.5 text-sm text-[#f7f2ea] placeholder-white/25 focus:border-[#d5ae68] focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {/* Atelier Tip / Guarantee Note */}
              <div className="flex items-start gap-2.5 border border-[#d5ae68]/20 bg-[#d5ae68]/5 p-2.5 text-left">
                <ShieldCheck className="w-4 h-4 text-[#d5ae68] flex-none mt-0.5" />
                <p className="text-[10px] text-[#cfc8bc] leading-relaxed">
                  {t(
                    'priceDropAlert.tip',
                    'Narx belgilangan darajaga tushganda sizga darhol xabar yuboriladi. Obunani istalgan vaqtda bekor qilishingiz mumkin.'
                  )}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 border border-[#d5ae68] bg-gradient-to-r from-[#b88a43] via-[#efd08b] to-[#b88a43] text-[#0f0d09] text-xs font-black uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(213,174,104,0.2)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>{t('priceDropAlert.enable', 'Kuzatishni yoqish')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  ) : null;

  // Active / Subscribed Button State
  if (isSubscribed && !isOpen) {
    return (
      <>
        <div className="w-full flex items-center justify-between px-4 py-3.5 border border-emerald-500/35 bg-[#0e1713] text-emerald-300">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium tracking-wide">
              {t('priceDropAlert.tracking', 'Narx kuzatilmoqda')}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            {t('priceDropAlert.cancel', 'Bekor qilish')}
          </button>
        </div>
        {createPortal(modalContent, document.body)}
      </>
    );
  }

  // Default Trigger Button
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group w-full flex items-center justify-between px-4 py-3.5 border border-[#d5ae68]/30 bg-[#12100e] hover:border-[#d5ae68]/60 hover:bg-[#181512] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center border border-[#d5ae68]/30 bg-[#d5ae68]/10 text-[#d5ae68] group-hover:border-[#d5ae68] transition-colors">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-medium text-[#f7f2ea] group-hover:text-[#d5ae68] transition-colors">
              {t('priceDropAlert.subtitle', 'Narx tushganda darhol xabar olamiz')}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#d5ae68] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          <span>Ochish</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </button>

      {createPortal(modalContent, document.body)}
    </>
  );
};

export default PriceDropAlert;
