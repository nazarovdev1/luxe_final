import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Calendar,
  Gift,
  MapPin,
  Phone,
  Gem,
  Truck,
  User,
  Tag,
  X
} from 'lucide-react';
import useProductService from '../server/server';
import OrderSuccessModal from '../components/OrderSuccessModal';
import { trackEvent } from '../utils/analytics';

const CheckoutMap = React.lazy(() => import('../components/CheckoutMap'));

const THEME = {
  bgBase: '#07090f',
  panelA: '#121722',
  panelB: '#1a202d',
  accentIvory: '#f4f1eb',
  accentGraphite: '#2d3442',
  textMain: '#f4f1eb',
  textMuted: '#9aa3b2',
  textSoft: '#c7ceda',
};

const REGIONS_KEYS = [
  'regions_0', 'regions_1', 'regions_2', 'regions_3',
  'regions_4', 'regions_5', 'regions_6', 'regions_7',
  'regions_8', 'regions_9', 'regions_10', 'regions_11',
];

const parsePrice = (priceValue) => {
  if (typeof priceValue === 'string') {
    return parseFloat(priceValue.replace(/[^0-9.]/g, '')) || 0;
  }
  return parseFloat(priceValue) || 0;
};

const formatMoney = (value) => {
  const number = Number(value) || 0;
  return number.toLocaleString('en-US');
};

const getTashkentDate = (d = new Date()) => {
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const tzOffset = 5; // UTC+5
  return new Date(utc + (3600000 * tzOffset));
};

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isUzbekPhone = (value) => {
  const clean = String(value).replace(/[\s()-]/g, '');
  return /^(?:\+998|998)?\d{9}$/.test(clean);
};

const validateField = (val, isRequired = true) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (isRequired && trimmed.length === 0) return false;
  if (trimmed.length > 0) {
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    if (/[<>{}\[\]\\\/]/.test(trimmed)) return false;
  }
  return true;
};

const DotLoader = ({ colorClass = 'bg-[#111319]' }) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass}`} />
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass} [animation-delay:120ms]`} />
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass} [animation-delay:240ms]`} />
    </span>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, lookItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading, token } = useAuth();
  const { createOrder } = useProductService();
  const { t } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    region: '',
    district: '',
    street: '',
    house: '',
    location: null,
    paymentMethod: 'cash_on_delivery',
    comments: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [userTier, setUserTier] = useState(null);

  // Gift wrapping state
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftWrapType, setGiftWrapType] = useState('classic');
  const [giftMessage, setGiftMessage] = useState('');

  // Scheduled delivery state
  const [scheduledDelivery, setScheduledDelivery] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');

  const GIFT_WRAP_OPTIONS = {
    classic: { name: t('checkoutPage.gwp_classic_name'), price: 25000, desc: t('checkoutPage.gwp_classic_desc') },
    premium: { name: t('checkoutPage.gwp_premium_name'), price: 45000, desc: t('checkoutPage.gwp_premium_desc') },
    minimal: { name: t('checkoutPage.gwp_minimal_name'), price: 15000, desc: t('checkoutPage.gwp_minimal_desc') },
  };

  const giftWrapCost = giftWrap ? (GIFT_WRAP_OPTIONS[giftWrapType]?.price || 0) : 0;

  useEffect(() => {
    const fetchUserTier = async () => {
      if (isAuthenticated && token) {
        try {
          const res = await axios.get('/api/points', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUserTier(res.data.points);
          }
        } catch (err) {
          console.error('Error fetching tier:', err);
        }
      }
    };
    fetchUserTier();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error(t('checkoutPage.toastLoginRequired'));
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const total = getCartTotal();
  const cartItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        parsedPrice: parsePrice(item.price),
      })),
    [items]
  );

  const lookItemsTotal = useMemo(() => {
    return lookItems.reduce((sum, look) => sum + (look.discountedPrice || 0), 0);
  }, [lookItems]);

  const lookDiscountsTotal = useMemo(() => {
    return lookItems.reduce((sum, look) => sum + (look.discountAmount || 0), 0);
  }, [lookItems]);

  const summaryTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.parsedPrice * item.quantity, 0) + lookItemsTotal;
  }, [cartItems, lookItemsTotal]);

  const tierDiscountAmount = useMemo(() => {
    if (!userTier) return 0;
    const level = userTier.level;
    if (level === 'Gold') return (summaryTotal * 10) / 100;
    if (level === 'Diamond') return (summaryTotal * 15) / 100;
    return 0;
  }, [summaryTotal, userTier]);

  const discountAmount = useMemo(() => {
    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'giftcard') {
        // Gift card: use the fixed amount
        promoDiscount = appliedPromo.discountAmount || 0;
      } else if (appliedPromo.discountAmount) {
        // Fixed amount coupon
        promoDiscount = appliedPromo.discountAmount;
      } else {
        // Percentage-based discount
        promoDiscount = (summaryTotal * appliedPromo.discountPercentage) / 100;
      }
    }
    return promoDiscount + tierDiscountAmount;
  }, [summaryTotal, appliedPromo, tierDiscountAmount]);

  const expressDeliveryFee = (scheduledDelivery && deliveryTimeSlot === 'express') ? 25000 : 0;
  const deliveryFee = 0; // Free delivery for all
  const finalTotal = summaryTotal - discountAmount + deliveryFee + giftWrapCost + expressDeliveryFee;

  const isStep1Valid = validateField(formData.firstName) && isUzbekPhone(formData.phone);
  const isStep2Valid = validateField(formData.region) && validateField(formData.street) && validateField(formData.house, false);
  const canSubmit = isStep1Valid && isStep2Valid && agreeTerms && !isSubmitting;

  useEffect(() => {
    if (cartItems.length || lookItems.length) {
      trackEvent('begin_checkout', { ecommerce: { currency: 'UZS', value: finalTotal, items: cartItems.map((item) => ({ item_id: item.productId || item.id, item_name: item.name, price: item.parsedPrice, quantity: item.quantity })) } });
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextFromStep1 = () => {
    if (!isStep1Valid) {
      toast.error(t('checkoutPage.toastEnterNamePhone'));
      return;
    }
    setCurrentStep(2);
  };

  const nextFromStep2 = () => {
    if (!isStep2Valid) {
      toast.error(t('checkoutPage.toastEnterRegionAddress'));
      return;
    }
    setCurrentStep(3);
  };

  const { validatePromo, validateGiftCard, validateCoupon } = useProductService();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    let lastErrorMessage = t('checkoutPage.toastInvalidPromo');

    try {
      // First try generic promo
      const promoResult = await validatePromo(promoCode.trim());
      if (promoResult.success) {
        setAppliedPromo({
          code: promoResult.code,
          discountPercentage: promoResult.discountPercentage,
          type: 'percentage'
        });
        toast.success(t('checkoutPage.toastDiscountApplied').replace('{percent}', promoResult.discountPercentage));
        setIsValidatingPromo(false);
        return;
      } else if (promoResult.message && !promoResult.message.includes('mavjud emas')) {
        // If it exists but is inactive/expired, show that specific error
        lastErrorMessage = promoResult.message;
      }

      // If promo fails, try gift card
      const giftCardResult = await validateGiftCard(promoCode.trim());

      if (giftCardResult.success) {
        const discountAmount = giftCardResult.amount;
        setAppliedPromo({
          code: giftCardResult.code,
          discountAmount: discountAmount,
          discountPercentage: 0,
          type: 'giftcard'
        });
        toast.success(`${t('common.giftCardApplied')}! ${formatMoney(discountAmount)} ${t('common.sum')}`);
        setIsValidatingPromo(false);
        return;
      } else if (giftCardResult.message && !giftCardResult.message.includes('mavjud emas')) {
        lastErrorMessage = giftCardResult.message;
      }

      // If gift card fails, try user-specific coupon
      const couponResult = await validateCoupon(promoCode.trim(), summaryTotal, token);
      if (couponResult.success) {
        setAppliedPromo({
          code: couponResult.code,
          discountPercentage: couponResult.type === 'percentage' ? couponResult.value : (couponResult.discount / summaryTotal) * 100,
          discountAmount: couponResult.discount,
          type: couponResult.type
        });
        toast.success(t('checkoutPage.toastPromoApplied'));
      } else {
        setAppliedPromo(null);
        toast.error(couponResult.message || lastErrorMessage);
      }
    } catch (error) {
      toast.error(t('checkoutPage.toastPromoCheckFailed'));
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    if (items.length === 0 && lookItems.length === 0) {
      toast.error(t('checkoutPage.toastCartEmpty'));
      return;
    }

    if (!isStep1Valid || !isStep2Valid || !isUzbekPhone(formData.phone)) {
      toast.error(t('checkoutPage.toastFillRequired'));
      return;
    }

    if (!agreeTerms) {
      toast.error(t('checkoutPage.agreeTerms'));
      return;
    }
    if (scheduledDelivery && (!deliveryDate || !deliveryTimeSlot)) {
      toast.error(t('checkoutPage.toastSelectDeliveryDateTime'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Robust phone formatting
      let cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('998') && cleanPhone.length === 12) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.length === 9) {
        cleanPhone = '+998' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        // If it's already 12 digits but no +, add it
        if (cleanPhone.length === 12) cleanPhone = '+' + cleanPhone;
      }

      const orderData = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: cleanPhone,
          address: `${formData.region}, ${formData.district}, ${formData.street}, ${formData.house}`.replace(
            /,\s*,/g,
            ','
          ).trim(),
          location: formData.location,
          comments: formData.comments || '',
        },
        items: [
          ...cartItems.map((item) => ({
            product: item.productId || item.id,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.parsedPrice,
            selectedColor: item.selectedColor || null,
            selectedSize: item.selectedSize || null,
            variantId: item.variantId || null,
            sku: item.sku || null,
          })),
          ...lookItems.flatMap((look) =>
            look.products.map((p) => ({
              product: p.productId,
              name: p.name,
              image: p.image,
              quantity: p.quantity,
              price: parseFloat(p.price) || 0,
              selectedColor: p.selectedColor || null,
              selectedSize: p.selectedSize || null,
              lookId: look.lookId,
              lookTitle: look.title,
              lookDiscount: look.discountAmount > 0 ? look.discountAmount / look.products.length : 0,
            }))
          ),
        ],
        lookDiscounts: lookItems.map((look) => ({
          lookId: look.lookId,
          lookTitle: look.title,
          originalPrice: look.originalPrice,
          discountAmount: look.discountAmount,
        })),
        totalLookDiscount: lookDiscountsTotal,
        paymentMethod: 'cash_on_delivery',
        totals: {
          subtotal: summaryTotal,
          deliveryFee: 0,
          giftWrap: giftWrap ? { type: giftWrapType, cost: giftWrapCost, message: giftMessage } : null,
          promoCode: appliedPromo ? appliedPromo.code : null,
          discountAmount: discountAmount || 0,
          lookDiscountAmount: lookDiscountsTotal || 0,
          total: finalTotal,
        },
        userId: user ? user._id || user.id : null,
        scheduledDelivery: scheduledDelivery ? {
          date: deliveryDate,
          timeSlot: deliveryTimeSlot,
          isExpress: deliveryTimeSlot === 'express',
        } : null,
      };

      const result = await createOrder(orderData);
      trackEvent('add_payment_info', { payment_type: 'cash_on_delivery', ecommerce: { currency: 'UZS', value: finalTotal } });

      if (result && result.success) {
        setCreatedOrderId(result.orderId);
        setShowSuccessModal(true);
        trackEvent('purchase', { ecommerce: { transaction_id: result.orderId, currency: 'UZS', value: result.total || finalTotal } });
        clearCart();
        // Modal handles navigation
      } else {
        trackEvent('order_failed', { payment_type: 'cash_on_delivery', reason: result?.message || 'order_create_failed' });
        if (result?.details) {
          const det = result.details;
          const colorText = det.color ? ` (${det.color} rang)` : '';
          const sizeText = det.size ? ` (${det.size} o'lcham)` : '';
          toast.error(t('checkoutPage.toastInsufficientStock')
            .replace('{name}', det.name)
            .replace('{size}', sizeText)
            .replace('{color}', colorText)
            .replace('{stock}', det.availableStock));
        } else {
          toast.error(result?.message || t('checkoutPage.toastGenericError'));
        }
      }
    } catch (error) {
      trackEvent('order_failed', { payment_type: 'cash_on_delivery', reason: error.message || 'network_error' });
      console.error('Checkout error:', error);
      toast.error(t('checkoutPage.toastSystemError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && lookItems.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen px-4" style={{ backgroundColor: THEME.bgBase }}>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] bg-gradient-to-b from-[#171d2a] to-[#111722] px-8 py-10 text-center shadow-[0_28px_56px_rgba(4,8,18,0.58)]">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1f2532]">
              <Truck className="h-8 w-8 text-[#c7ceda]" />
            </div>
            <h1 className="text-3xl font-semibold text-[#f4f1eb]">{t('cart.empty')}</h1>
            <p className="mt-2 text-[#9aa3b2]">{t('cart.emptyDesc')}</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f4f1eb] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#111319] transition-transform active:scale-[0.985]"
            >
              {t('checkoutPage.startShopping')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 animate-page-fade-in sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bgBase }}>
      <div className="mx-auto w-full max-w-7xl">
        <header className="sticky top-4 z-30 mb-6 rounded-[1.5rem] bg-[#111722]/85 px-4 py-3 backdrop-blur-xl shadow-[0_18px_36px_rgba(2,6,16,0.52)]">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#2d3442]/70 px-3 py-2 text-sm font-medium text-[#f4f1eb] transition-colors hover:bg-[#364053]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('checkoutPage.back')}
            </button>

            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2]">{t('checkoutPage.headerCheckout')}</p>
              <h1 className="text-lg font-semibold text-[#f4f1eb]">{t('checkoutPage.conciergeActive')}</h1>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1f2532] px-3 py-1 text-xs font-semibold text-[#c7ceda]">

              {currentStep}/3
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] p-6 shadow-[0_28px_56px_rgba(4,8,18,0.6)] sm:p-7">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2]">{t('checkoutPage.orderFlowTag')}</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-[#f4f1eb]">{t('checkoutPage.placeOrder')}</h2>
              <p className="mt-2 text-sm text-[#9aa3b2]">{t('checkoutPage.step1')}</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-colors ${step <= currentStep ? 'bg-[#f4f1eb]' : 'bg-[#2d3442]'
                      }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4 rounded-[1.4rem] bg-[#121722]/70 p-5 shadow-[inset_0_0_24px_rgba(26,32,45,0.45)]">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d3442]/70 text-[#f4f1eb]">
                      <User className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('checkoutPage.personalInfoTitle')}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.firstName')} *</span>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                        placeholder={t('checkoutPage.firstNamePlaceholder')}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.lastName')}</span>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                        placeholder={t('checkoutPage.lastNamePlaceholder')}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.phone')} *</span>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3b2]" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] py-3 pl-10 pr-4 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </label>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 rounded-[1.4rem] bg-[#121722]/70 p-5 shadow-[inset_0_0_24px_rgba(26,32,45,0.45)]">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d3442]/70 text-[#f4f1eb]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('checkoutPage.step2')}</h3>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.regionLabel')} *</span>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                    >
                      <option value="">{t('checkoutPage.regionSelectPrompt')}</option>
                      {REGIONS_KEYS.map((key) => (
                        <option key={key} value={t(`checkoutPage.${key}`)}>
                          {t(`checkoutPage.${key}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.streetLabel')} *</span>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder={t('checkoutPage.streetPlaceholder')}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.landmarkLabel')}</span>
                    <input
                      type="text"
                      name="house"
                      value={formData.house}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder={t('checkoutPage.landmarkPlaceholder')}
                    />
                  </label>

                  <div>
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.selectOnMap')}</span>
                    <React.Suspense fallback={<div className="h-[230px] w-full rounded-xl bg-[#0e131d]" />}>
                      <CheckoutMap
                        className="h-[230px] w-full overflow-hidden rounded-xl bg-[#0e131d] shadow-[0_14px_30px_rgba(3,6,14,0.45)]"
                        position={formData.location}
                        onPositionChange={(position) => setFormData((prev) => ({ ...prev, location: position }))}
                      />
                    </React.Suspense>
                    <p className="mt-2 text-xs text-[#9aa3b2]">{t('checkoutPage.mapHint')}</p>
                  </div>

                  {/* Scheduled Delivery */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#d6b47c]" />
                        <span className="text-sm text-[#c7ceda] font-medium">{t('checkoutPage.selectDeliveryTime')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setScheduledDelivery(!scheduledDelivery);
                          if (scheduledDelivery) {
                            setDeliveryDate('');
                            setDeliveryTimeSlot('');
                          }
                        }}
                        className={`relative w-11 h-6 rounded-full transition-colors ${scheduledDelivery ? 'bg-[#d6b47c]' : 'bg-[#2d3442]'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${scheduledDelivery ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>

                    {scheduledDelivery && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        {/* Date Selection */}
                        <div>
                          <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('checkoutPage.selectDate')}</span>
                          <div className="grid grid-cols-4 gap-2">
                            {[...Array(4)].map((_, i) => {
                              const date = getTashkentDate();
                              date.setDate(date.getDate() + i + 1);
                              const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'short' });
                              const dayNum = date.getDate();
                              const monthName = date.toLocaleDateString('uz-UZ', { month: 'short' });
                              const dateValue = toLocalDateValue(date);
                              const isToday = i === 0;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setDeliveryDate(dateValue)}
                                  className={`p-2.5 rounded-xl border text-center transition-all ${
                                    deliveryDate === dateValue
                                      ? 'bg-[#d6b47c]/10 border-[#d6b47c]/30'
                                      : 'bg-[#0e131d] border-[#2d3442] hover:border-[#3f4a5c]'
                                  }`}
                                >
                                  <p className={`text-[10px] uppercase ${deliveryDate === dateValue ? 'text-[#d6b47c]' : 'text-[#6f7c90]'}`}>
                                    {isToday ? t('checkoutPage.tomorrow') : dayName}
                                  </p>
                                  <p className={`text-lg font-bold ${deliveryDate === dateValue ? 'text-[#d6b47c]' : 'text-[#f4f1eb]'}`}>
                                    {dayNum}
                                  </p>
                                  <p className={`text-[10px] ${deliveryDate === dateValue ? 'text-[#d6b47c]/70' : 'text-[#6f7c90]'}`}>
                                    {monthName}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time Slot Selection */}
                        {deliveryDate && (
                          <div>
                            <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('checkoutPage.selectTime')}</span>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { value: 'morning', label: t('checkoutPage.morningTime'), icon: '🌅', name: t('checkoutPage.timeslot_morning') },
                                { value: 'afternoon', label: t('checkoutPage.afternoonTime'), icon: '☀️', name: t('checkoutPage.timeslot_day') },
                                { value: 'evening', label: t('checkoutPage.eveningTime'), icon: '🌤️', name: t('checkoutPage.timeslot_evening') },
                                { value: 'late_evening', label: t('checkoutPage.lateEveningTime'), icon: '🌙', name: t('checkoutPage.timeslot_night') },
                                { value: 'express', label: t('checkoutPage.expressTime'), icon: '⚡', name: t('checkoutPage.timeslot_express') },
                                { value: 'any', label: t('checkoutPage.anytimeTime'), icon: '🕐', name: t('checkoutPage.timeslot_anytime') },
                              ].map((slot) => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setDeliveryTimeSlot(slot.value)}
                                  className={`p-2.5 rounded-xl border text-center transition-all ${
                                    deliveryTimeSlot === slot.value
                                      ? 'bg-[#d6b47c]/10 border-[#d6b47c]/30'
                                      : 'bg-[#0e131d] border-[#2d3442] hover:border-[#3f4a5c]'
                                  }`}
                                >
                                  <span className="text-base">{slot.icon}</span>
                                  <p className={`text-[10px] font-medium mt-1 ${deliveryTimeSlot === slot.value ? 'text-[#d6b47c]' : 'text-[#9aa3b2]'}`}>
                                    {slot.name}
                                  </p>
                                  <p className={`text-[9px] mt-0.5 ${deliveryTimeSlot === slot.value ? 'text-[#d6b47c]/70' : 'text-[#6f7c90]'}`}>
                                    {slot.label}
                                  </p>
                                </button>
                              ))}
                            </div>
                            {deliveryTimeSlot === 'express' && (
                              <p className="mt-2 text-[11px] text-[#d6b47c] bg-[#d6b47c]/5 border border-[#d6b47c]/10 rounded-lg px-3 py-1.5">
                                {t('checkoutPage.expressFeeNote')}
                              </p>
                            )}
                          </div>
                        )}

                        {deliveryDate && deliveryTimeSlot && (
                          <div className="rounded-xl bg-[#d6b47c]/5 border border-[#d6b47c]/20 p-3 flex items-center gap-3">
                            <Clock className="w-4 h-4 text-[#d6b47c] flex-shrink-0" />
                            <p className="text-xs text-[#c7ceda]">
                              {t('checkoutPage.deliveryScheduleLine')} <span className="text-[#d6b47c] font-semibold">
                                {new Date(deliveryDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                                {' '}{deliveryTimeSlot === 'express' ? t('checkoutPage.expressTime') :
                                  deliveryTimeSlot === 'morning' ? t('checkoutPage.morningTime') :
                                  deliveryTimeSlot === 'afternoon' ? t('checkoutPage.afternoonTime') :
                                  deliveryTimeSlot === 'evening' ? t('checkoutPage.eveningTime') :
                                  deliveryTimeSlot === 'late_evening' ? t('checkoutPage.lateEveningTime') : t('checkoutPage.anytimeTime')}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 rounded-[1.4rem] bg-[#121722]/70 p-5 shadow-[inset_0_0_24px_rgba(26,32,45,0.45)]">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d3442]/70 text-[#f4f1eb]">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('checkoutPage.step3')}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`rounded-xl p-4 text-center transition-all ${formData.paymentMethod === 'cash_on_delivery'
                          ? 'bg-[#f4f1eb] text-[#111319] shadow-[0_10px_22px_rgba(244,241,235,0.24)]'
                          : 'bg-[#1a202d] text-[#c7ceda]'
                          }`}
                      >
                        <Truck className="mx-auto mb-2 h-6 w-6" />
                        <p className="text-sm font-semibold">{t('checkoutPage.cash')}</p>
                      </div>
                    </label>

                    <div className="relative rounded-xl bg-[#1a202d]/65 p-4 text-center text-[#9aa3b2] opacity-70">
                      <span className="absolute right-2 top-2 rounded-full bg-[#2d3442] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#c7ceda]">
                        {t('checkoutPage.paymentComingSoon')}
                      </span>
                      <p className="mb-2 text-base font-semibold">CLICK</p>
                      <p className="text-sm">{t('checkoutPage.clickPay')}</p>
                    </div>

                    <div className="relative rounded-xl bg-[#1a202d]/65 p-4 text-center text-[#9aa3b2] opacity-70">
                      <span className="absolute right-2 top-2 rounded-full bg-[#2d3442] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#c7ceda]">
                        {t('checkoutPage.paymentComingSoon')}
                      </span>
                      <p className="mb-2 text-base font-semibold">Payme</p>
                      <p className="text-sm">{t('checkoutPage.paymePay')}</p>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">{t('checkoutPage.commentsLabel')}</span>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder={t('checkoutPage.commentsPlaceholder')}
                    />
                  </label>

                  {/* Gift Wrapping */}
                  <div className="rounded-xl bg-[#121722]/70 p-4 space-y-3 shadow-[inset_0_0_24px_rgba(26,32,45,0.45)]">
                    <label className="flex cursor-pointer items-center gap-3">
                      <div
                        onClick={() => setGiftWrap(!giftWrap)}
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-all cursor-pointer ${giftWrap ? 'bg-[#d6b47c]' : 'bg-[#2d3442]'}`}
                      >
                        <div className={`h-4 w-4 rounded-full bg-white transition-all ${giftWrap ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-[#d6b47c]" />
                        <span className="text-sm font-medium text-[#f4f1eb]">{t('checkoutPage.giftWrapTitle')}</span>
                      </div>
                    </label>

                    {giftWrap && (
                      <div className="space-y-3 pl-1 animate-fade-in">
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(GIFT_WRAP_OPTIONS).map(([key, opt]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setGiftWrapType(key)}
                              className={`rounded-xl p-3 text-left transition-all ${
                                giftWrapType === key
                                  ? 'bg-[#d6b47c]/15 border border-[#d6b47c]/30'
                                  : 'bg-[#0e131d] border border-[#2d3442] hover:border-[#3d4a5c]'
                              }`}
                            >
                              <p className={`text-xs font-semibold ${giftWrapType === key ? 'text-[#d6b47c]' : 'text-[#f4f1eb]'}`}>
                                {opt.name}
                              </p>
                              <p className="text-[10px] text-[#9aa3b2] mt-0.5">{opt.desc}</p>
                              <p className={`text-xs font-bold mt-1.5 ${giftWrapType === key ? 'text-[#d6b47c]' : 'text-[#c7ceda]'}`}>
                                {opt.price.toLocaleString()} {t('checkoutPage.soM')}
                              </p>
                            </button>
                          ))}
                        </div>
                        <label className="block">
                          <span className="mb-1.5 block text-xs text-[#9aa3b2]">{t('checkoutPage.giftMessageLabel')}</span>
                          <input
                            type="text"
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            maxLength={200}
                            className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#d6b47c] focus:ring-1 focus:ring-[#d6b47c]/20"
                            placeholder={t('checkoutPage.giftMessagePlaceholder')}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="checkout-terms"
                    className="group flex cursor-pointer items-start gap-3 rounded-xl bg-gradient-to-r from-[#1a202d]/75 to-[#151c29]/75 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(94,108,134,0.26)] transition-all hover:shadow-[inset_0_0_0_1px_rgba(170,183,205,0.34)]"
                  >
                    <input
                      id="checkout-terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(event) => setAgreeTerms(event.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="relative mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-[#5f6c85] bg-[#0f1521] text-[#111319] transition-all after:content-['✓'] after:text-[12px] after:font-bold after:leading-none after:opacity-0 after:transition-opacity peer-checked:border-[#f4f1eb] peer-checked:bg-[#f4f1eb] peer-checked:after:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-[#f4f1eb]/35 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#151c29]" />
                    <span className="text-sm leading-relaxed text-[#c7ceda]">
                      {t('checkoutPage.agreeTerms')}
                    </span>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    className="rounded-full bg-[#2d3442]/70 px-5 py-2.5 text-sm font-semibold text-[#f4f1eb] transition-transform active:scale-[0.985]"
                  >
                    {t('checkoutPage.back')}
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={currentStep === 1 ? nextFromStep1 : nextFromStep2}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f4f1eb] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.07em] text-[#111319] transition-transform active:scale-[0.985]"
                  >
                    {t('checkoutPage.next')}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <p className="text-sm text-[#9aa3b2]">{t('checkoutPage.finalConfirmHint')}</p>
                )}
              </div>
            </form>
          </section>

          <aside className="xl:sticky xl:top-20 xl:h-fit">
            <div className="rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] p-6 shadow-[0_28px_56px_rgba(4,8,18,0.6)]">
              <h3 className="text-xl font-semibold text-[#f4f1eb]">{t('checkoutPage.orderCapsule')}</h3>
              <p className="mt-1 text-sm text-[#9aa3b2]">{t('checkoutPage.selectedProductsDesc')}</p>

              <div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto pr-1">
                {lookItems.map((look) => (
                  <div key={look.cartLookId} className="rounded-xl bg-[#d6b47c]/5 border border-[#d6b47c]/15 p-3">
                    <div className="flex gap-3">
                      {look.heroImage && (
                        <img src={look.heroImage} alt={look.title} className="h-14 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#d6b47c]">{look.title}</p>
                        <p className="mt-0.5 text-xs text-[#9aa3b2]">{look.products.length} {t('checkoutPage.productCount')}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {look.discountAmount > 0 && (
                            <span className="text-[10px] text-[#9aa3b2] line-through">
                              {formatMoney(look.originalPrice)} {t('checkoutPage.soM')}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[#c7ceda]">{formatMoney(look.discountedPrice)} {t('checkoutPage.soM')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl bg-[#1a202d]/70 p-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#f4f1eb]">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#9aa3b2]">
                        {item.quantity} {t('checkoutPage.piece')}
                        {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#c7ceda]">{formatMoney(item.parsedPrice * item.quantity)} {t('checkoutPage.soM')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#2d3442] pt-4">

                {/* Promo Code Input Field */}
                <div className="mb-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-400">{appliedPromo.code}</p>
                          <p className="text-xs text-emerald-500/80">
                            {appliedPromo.type === 'giftcard' 
                              ? `-${formatMoney(appliedPromo.discountAmount)} ${t('checkoutPage.soM')}`
                              : `-${appliedPromo.discountPercentage}%`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={t('checkoutPage.promoPlaceholder')}
                        className="w-full flex-1 rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-2 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-1 focus:ring-[#f4f1eb]/20 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        className="rounded-xl border border-[#2d3442] bg-[#1a202d] px-4 py-2 text-sm font-semibold text-[#f4f1eb] hover:bg-[#2d3442] transition-colors disabled:opacity-50"
                      >
                        {isValidatingPromo ? '...' : t('checkoutPage.applyButton')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-[#9aa3b2]">
                  <span>{t('checkoutPage.productCount')}</span>
                  <span>{formatMoney(summaryTotal)} {t('checkoutPage.soM')}</span>
                </div>

                {userTier && tierDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                    <div className="flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5" />
                      <span>{t('checkoutPage.memberDiscount').replace('{level}', userTier.level)}</span>
                    </div>
                    <span>-{formatMoney(tierDiscountAmount)} {t('checkoutPage.soM')}</span>
                  </div>
                )}

                {appliedPromo && (
                  <div className="flex items-center justify-between text-sm text-emerald-400">
                    <span>{t('checkoutPage.promoCodeSummary').replace('{code}', appliedPromo.code)}</span>
                    <span>-{formatMoney(discountAmount - tierDiscountAmount)} {t('checkoutPage.soM')}</span>
                  </div>
                )}

                {lookDiscountsTotal > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                    <span>{t('checkoutPage.lookDiscount').replace('{count}', lookItems.length)}</span>
                    <span>-{formatMoney(lookDiscountsTotal)} {t('checkoutPage.soM')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-[#9aa3b2]">
                  <span>{t('checkoutPage.delivery')}</span>
                  <span className="text-emerald-400 font-medium">{t('checkoutPage.free')}</span>
                </div>

                {giftWrap && giftWrapCost > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      <span>{t('checkoutPage.giftWrapSummary').replace('{type}', GIFT_WRAP_OPTIONS[giftWrapType]?.name)}</span>
                    </div>
                    <span>{formatMoney(giftWrapCost)} {t('checkoutPage.soM')}</span>
                  </div>
                )}

                {expressDeliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t('checkoutPage.expressDeliveryLabel')}</span>
                    </div>
                    <span>{formatMoney(expressDeliveryFee)} {t('checkoutPage.soM')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#2d3442] pt-3">
                  <span className="text-base font-semibold text-[#f4f1eb]">{t('checkoutPage.total')}</span>
                  <span className="text-2xl font-semibold text-[#f4f1eb]">{formatMoney(finalTotal)} {t('common.sum')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={currentStep !== 3 || !canSubmit}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4f1eb] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#111319] transition-all active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <DotLoader />
                    <span>{t('checkoutPage.processing')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{t('checkoutPage.placeOrder')}</span>
                  </>
                )}
              </button>

              {currentStep !== 3 && <p className="mt-3 text-center text-xs text-[#9aa3b2]">{t('checkoutPage.finalConfirmStepHint')}</p>}
            </div>
          </aside>
        </div>
      </div>
      <OrderSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        orderId={createdOrderId}
        isMobile={false}
      />
    </div>
  );
};

export default Checkout;
