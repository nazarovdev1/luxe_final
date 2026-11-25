import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpringSubmitButton from '../../components/motion/SpringSubmitButton';
import useOrderCelebration from '../../hooks/useOrderCelebration';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
    ArrowLeft, MapPin, Phone, User,
    Truck, CheckCircle, Navigation, ChevronRight,
    Gem, ShieldCheck, X, LockKeyhole, Check,
    Gift, Calendar, Clock, MessageCircle as MessageCircleIconFallback
} from 'lucide-react';
import useProductService from '../../server/server';
import { getPolicyCopy } from '../../config/policies';
import OrderSuccessModal from '../../components/OrderSuccessModal';
import useCheckoutTotals, { DELIVERY_TIME_SLOTS, GIFT_WRAP_OPTIONS, getDeliveryDates } from '../../hooks/useCheckoutTotals';
import { trackEvent } from '../../utils/analytics';
import '../../styles/atelierCheckout.css';

const CheckoutMap = React.lazy(() => import('../../components/CheckoutMap'));

// Underlined field: small-caps label above a serif value
const InputField = ({ label, ...props }) => (
    <label className="atelier-field">
        <span className="atelier-field__label">{label}</span>
        <input {...props} className="atelier-field__input" />
    </label>
);


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


const MobileCheckout = () => {
    const { t, language } = useLanguage();
    const policy = getPolicyCopy(language);
    const navigate = useNavigate();
    const { items, lookItems, clearCart } = useCart();
    const { user, isAuthenticated, loading, token } = useAuth();
    const { createOrder, validatePromo, validateGiftCard, validateCoupon } = useProductService();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Address, 3: Payment
    const [mounted, setMounted] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const { placed: orderPlaced, celebrate: celebrateOrder } = useOrderCelebration({
        clearCart,
        onReveal: () => setShowSuccessModal(true),
    });
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [userTier, setUserTier] = useState(null);

    useEffect(() => {
        setMounted(true);
        if (!loading && !isAuthenticated) {
            toast.error(t('checkoutPage.toastLoginRequired'));
            navigate('/mobile/login');
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        const fetchUserTier = async () => {
            if (!isAuthenticated || !token) return;
            try {
                const res = await axios.get('/api/points', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setUserTier(res.data.points);
            } catch (error) {
                console.error('Error fetching tier:', error);
            }
        };
        fetchUserTier();
    }, [isAuthenticated, token]);

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
        comments: ''
    });

    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [giftWrap, setGiftWrap] = useState(false);
    const [giftWrapType, setGiftWrapType] = useState('classic');
    const [giftMessage, setGiftMessage] = useState('');
    const [scheduledDelivery, setScheduledDelivery] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');

    const {
        cartItems,
        lookDiscountsTotal,
        summaryTotal,
        tierDiscountAmount,
        promoDiscountAmount,
        giftWrapCost,
        expressDeliveryFee,
        finalTotal
    } = useCheckoutTotals({
        items,
        lookItems,
        appliedPromo,
        userTier,
        giftWrap,
        giftWrapType,
        scheduledDelivery,
        deliveryTimeSlot
    });

    useEffect(() => {
        if (cartItems.length || lookItems.length) {
            trackEvent('begin_checkout', { ecommerce: { currency: 'UZS', value: finalTotal, items: cartItems.map((item) => ({ item_id: item.productId || item.id, item_name: item.name, price: item.parsedPrice, quantity: item.quantity })) } });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyPromo = async () => {
        const normalizedCode = promoCode.trim().toUpperCase();
        if (!normalizedCode) return;

        setIsValidatingPromo(true);
        let lastErrorMessage = t('checkoutPage.toastInvalidPromo');

        try {
            // 1. Try generic promo
            const result = await validatePromo(normalizedCode);
            if (result.success) {
                setAppliedPromo({
                    code: result.code,
                    discountPercentage: result.discountPercentage,
                    type: 'percentage',
                    source: 'promo'
                });
                setPromoCode(result.code);
                toast.success(t('checkoutPage.toastDiscountApplied').replace('{percent}', result.discountPercentage));
                setIsValidatingPromo(false);
                return;
            } else if (result.message && !result.message.includes('mavjud emas')) {
                lastErrorMessage = result.message;
            }

            // 2. Try gift card
            const giftCardResult = await validateGiftCard(normalizedCode);

            if (giftCardResult.success) {
                setAppliedPromo({
                    code: giftCardResult.code,
                    discountAmount: giftCardResult.amount,
                    discountPercentage: 0,
                    type: 'giftcard',
                    source: 'giftcard'
                });
                setPromoCode(giftCardResult.code);
                toast.success(`${t('common.giftCardApplied')}! ${giftCardResult.amount.toLocaleString('ru-RU')} ${t('common.sum')}`);
                setIsValidatingPromo(false);
                return;
            } else if (giftCardResult.message && !giftCardResult.message.includes('mavjud emas')) {
                lastErrorMessage = giftCardResult.message;
            }

            // 3. Try authenticated user coupon
            const couponResult = await validateCoupon(normalizedCode, summaryTotal, token);
            if (couponResult.success) {
                setAppliedPromo({
                    code: couponResult.code,
                    discountPercentage: couponResult.type === 'percentage' ? couponResult.value : (couponResult.discount / summaryTotal) * 100,
                    discountAmount: couponResult.discount,
                    type: couponResult.type,
                    source: 'coupon'
                });
                setPromoCode(couponResult.code);
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

    const handleSubmit = async () => {
        if (orderPlaced) return;
        if (items.length === 0 && (!lookItems || lookItems.length === 0)) {
            toast.error(t('checkoutPage.toastCartEmpty'));
            return;
        }

        if (!formData.firstName || !formData.phone || !formData.region || !formData.street) {
            toast.error(t('checkoutPage.toastFillFields'));
            return;
        }
        if (!/^(?:\+998|998)?\d{9}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
            toast.error(t('checkoutPage.phoneFormatError'));
            return;
        }

        if (scheduledDelivery && (!deliveryDate || !deliveryTimeSlot)) {
            toast.error(t('checkoutPage.toastSelectDeliveryDateTimeMobile'));
            return;
        }

        if (!agreeTerms) {
            toast.error(t('checkoutPage.agreeTerms'));
            return;
        }

        setIsSubmitting(true);

        try {
            // Format phone number to match +998XXXXXXXXX
            let cleanPhone = formData.phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('998') && cleanPhone.length === 12) {
                cleanPhone = '+' + cleanPhone;
            } else if (cleanPhone.length === 9) {
                cleanPhone = '+998' + cleanPhone;
            } else if (!cleanPhone.startsWith('+')) {
                // If it's something else, try to just add + if missing or let backend validate
                if (!formData.phone.startsWith('+')) cleanPhone = '+' + cleanPhone;
                else cleanPhone = formData.phone;
            }

            let verifiedPromo = appliedPromo;
            let verifiedDiscountAmount = 0;

            if (appliedPromo?.code) {
                if (appliedPromo.type === 'giftcard') {
                    const giftCardValidation = await validateGiftCard(appliedPromo.code);
                    if (!giftCardValidation.success) {
                        setAppliedPromo(null);
                        toast.error(t('checkoutPage.toastGiftCardInvalid'));
                        setIsSubmitting(false);
                        return;
                    }
                    verifiedDiscountAmount = giftCardValidation.amount;
                } else if (appliedPromo.source === 'coupon') {
                    const couponValidation = await validateCoupon(appliedPromo.code, summaryTotal, token);
                    if (!couponValidation.success) {
                        setAppliedPromo(null);
                        toast.error(t('checkoutPage.toastCouponInvalid'));
                        setIsSubmitting(false);
                        return;
                    }
                    verifiedDiscountAmount = couponValidation.discount;
                } else {
                    const promoValidation = await validatePromo(appliedPromo.code);
                    if (!promoValidation.success) {
                        setAppliedPromo(null);
                        toast.error(t('checkoutPage.toastPromoInvalid'));
                        setIsSubmitting(false);
                        return;
                    }
                    verifiedDiscountAmount = (summaryTotal * promoValidation.discountPercentage) / 100;
                }
                setAppliedPromo(verifiedPromo);
            }

            const verifiedFinalTotal = Math.max(summaryTotal - verifiedDiscountAmount - tierDiscountAmount + giftWrapCost + expressDeliveryFee, 0);

            const lookOrderItems = (lookItems || []).flatMap((look) =>
                (look.products || []).map((p) => ({
                    product: p.productId,
                    name: p.name,
                    image: p.image,
                    quantity: p.quantity,
                    price: typeof p.price === 'string'
                        ? parseFloat(p.price.replace(/[^0-9.]/g, ''))
                        : (parseFloat(p.price) || 0),
                    selectedColor: p.selectedColor || null,
                    selectedSize: p.selectedSize || null,
                    lookId: look.lookId || null,
                    lookTitle: look.title || null,
                    lookDiscount: (look.discountAmount > 0 && (look.products || []).length > 0)
                        ? look.discountAmount / look.products.length
                        : 0
                }))
            );

            const lookDiscounts = (lookItems || []).length > 0
                ? (lookItems || []).map((look) => ({
                    lookId: look.lookId,
                    lookTitle: look.title,
                    originalPrice: look.originalPrice || 0,
                    discountAmount: look.discountAmount || 0
                }))
                : null;

            const totalLookDiscount = (lookItems || []).reduce((sum, look) => sum + (look.discountAmount || 0), 0);

            const orderData = {
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    phone: cleanPhone,
                    address: `${formData.region}, ${formData.street}${formData.house ? ', ' + formData.house : ''}`,
                    location: formData.location,
                    comments: formData.comments
                },
                items: [
                    ...cartItems.map(item => ({
                        product: item.productId || item.id,
                        name: item.name,
                        image: item.image,
                        quantity: item.quantity,
                        price: item.parsedPrice,
                        selectedColor: item.selectedColor || null,
                        selectedSize: item.selectedSize || null
                        ,variantId: item.variantId || null
                        ,sku: item.sku || null
                    })),
                    ...lookOrderItems
                ],
                paymentMethod: formData.paymentMethod,
                totals: {
                    subtotal: summaryTotal,
                    deliveryFee: 0,
                    giftWrap: giftWrap ? { type: giftWrapType, cost: giftWrapCost, message: giftMessage } : null,
                    promoCode: verifiedPromo ? verifiedPromo.code : null,
                    discountAmount: verifiedDiscountAmount + tierDiscountAmount,
                    lookDiscountAmount: lookDiscountsTotal || 0,
                    total: verifiedFinalTotal
                },
                userId: user ? user._id || user.id : null,
                lookDiscounts,
                totalLookDiscount: totalLookDiscount || null,
                scheduledDelivery: scheduledDelivery ? {
                    date: deliveryDate,
                    timeSlot: deliveryTimeSlot,
                    isExpress: deliveryTimeSlot === 'express'
                } : null
            };

            const result = await createOrder(orderData);
            trackEvent('add_payment_info', { payment_type: 'cash_on_delivery', ecommerce: { currency: 'UZS', value: verifiedFinalTotal } });

            if (result && result.success) {
                setCreatedOrderId(result.orderId);
                trackEvent('purchase', { ecommerce: { transaction_id: result.orderId, currency: 'UZS', value: result.total || verifiedFinalTotal } });
                // The button plays its success animation, then the cart is cleared and the modal opens.
                celebrateOrder();
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
                    const errorMsg = result.errors
                        ? result.errors.map(e => e.message).join(', ')
                        : (result.message || t('checkoutPage.toastGenericError'));
                    toast.error(errorMsg);
                }
                console.error('Order creation failed:', result);
            }
        } catch (error) {
            trackEvent('order_failed', { payment_type: 'cash_on_delivery', reason: error.message || 'network_error' });
            console.error('Checkout error:', error);
            toast.error(t('checkoutPage.toastSystemError') + ': ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const regions = [
        t('checkoutPage.regions_0'), t('checkoutPage.regions_1'),
        t('checkoutPage.regions_2'), t('checkoutPage.regions_3'),
        t('checkoutPage.regions_4'), t('checkoutPage.regions_5'),
        t('checkoutPage.regions_6'), t('checkoutPage.regions_7'),
        t('checkoutPage.regions_8'), t('checkoutPage.regions_9'),
        t('checkoutPage.regions_10'), t('checkoutPage.regions_11'),
    ];

    const orderPreviewItems = [
        ...items,
        ...(lookItems || []).flatMap((look) =>
            (look.products || []).map((product) => ({
                ...product,
                id: `${look.cartLookId || look.lookId}-${product.productId}`,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: product.quantity || 1,
                lookTitle: look.title
            }))
        )
    ];

    const stepMeta = [
        { label: t('checkoutPage.stepLabelContact'), title: t('checkoutPage.personalInfoTitle'), icon: User },
        { label: t('checkoutPage.stepLabelDelivery'), title: t('checkoutPage.addressTitle'), icon: MapPin },
        { label: t('checkoutPage.stepLabelPayment'), title: t('checkoutPage.paymentTitle'), icon: LockKeyhole }
    ];

    const activeStep = stepMeta[currentStep - 1];
    const ActiveStepIcon = activeStep.icon;

    if (items.length === 0 && (!lookItems || lookItems.length === 0) && !showSuccessModal) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                    <Gem className="relative w-16 h-16 text-amber-500" />
                </div>
                <h1 className="text-2xl font-light text-white mb-2 tracking-wide">
                    {t('cart.empty')} <span className="font-serif italic text-amber-500">{t('checkoutPage.emptyCartWord')}</span>
                </h1>
                <p className="text-gray-500 mb-8 text-center text-sm font-light">
                    {t('checkoutPage.premiumShopHint')}
                </p>
                <button
                    onClick={() => navigate('/mobile/products')}
                    className="group relative px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {t('checkoutPage.shopNowButton')} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </span>
                    <div className="absolute inset-0 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
            </div>
        );
    }

    return (
        <div className="atelier-checkout min-h-screen pb-36 selection:bg-[#7a2e2e]/20">
            <header className="sticky top-0 z-50 bg-[#f3eee4] px-6 pb-0 pt-3">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} aria-label={t('checkoutPage.back', 'Ortga')} className="-ml-2 flex h-10 w-10 items-center justify-center text-[#1c1915] transition active:scale-95">
                        <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <p className="atelier-brand">Luxx</p>
                    <span className="w-8" />
                </div>
                <nav className="atelier-steps mt-2" aria-label={t('checkoutPage.luxeCheckout')}>
                    {stepMeta.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isDone = stepNumber < currentStep;
                        return (
                            <button
                                key={step.label}
                                type="button"
                                aria-current={isActive ? 'step' : undefined}
                                onClick={() => stepNumber < currentStep && setCurrentStep(stepNumber)}
                                className={`atelier-step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                            >
                                <i>{String(stepNumber).padStart(2, '0')}</i>{step.label}
                            </button>
                        );
                    })}
                </nav>
            </header>

            <main className={`relative z-10 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <section className="px-6 pt-6">
                    <h1 className="atelier-title">{t('checkoutPage.placeOrder')}</h1>
                    <p className="atelier-lead">{t('checkoutPage.premiumFinishDesc')}</p>
                </section>

                {currentStep === 1 && (
                    <section className="px-5 py-6 space-y-5 animate-fade-in-up">
                        <div className="atelier-sec"><i>01</i><h2>{t('checkoutPage.contactInfoTitle')}</h2><span className="atelier-note">{t('checkoutPage.secure')}</span></div>

                        <InputField label={t('checkoutPage.mobileInputFirstName')} name="firstName" value={formData.firstName} onChange={handleChange} placeholder={t('checkoutPage.firstNamePlaceholder')} />
                        {showErrors && !formData.firstName && <p className="text-xs font-medium text-[#a3281f]">{t('checkoutPage.enterFirstName')}</p>}
                        <InputField label={t('checkoutPage.mobileInputLastName')} name="lastName" value={formData.lastName} onChange={handleChange} placeholder={t('checkoutPage.lastNamePlaceholder')} />
                        <InputField label={t('checkoutPage.mobileInputPhone')} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+998 90 123 45 67" />
                        {showErrors && !formData.phone && <p className="text-xs font-medium text-[#a3281f]">{t('checkoutPage.enterPhone')}</p>}
                    </section>
                )}

                {currentStep === 2 && (
                    <section className="px-5 py-6 space-y-5 animate-fade-in-up">
                        <div className="atelier-sec"><i>02</i><h2>{t('checkoutPage.deliveryTitle')}</h2><span className="atelier-note">{t('checkoutPage.freeLabel')}</span></div>

                        <label className="atelier-field relative">
                            <span className="atelier-field__label">{t('checkoutPage.selectRegionPlaceholder')}</span>
                            <select name="region" value={formData.region} onChange={handleChange} className="atelier-field__input pr-7">
                                <option value="">{t('checkoutPage.selectRegionPlaceholder')}</option>
                                {regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronRight className="pointer-events-none absolute bottom-3 right-0 h-4 w-4 rotate-90 text-[#6d665a]" strokeWidth={1.5} />
                        </label>
                        {showErrors && !formData.region && <p className="text-xs font-medium text-[#a3281f]">{t('checkoutPage.enterRegion')}</p>}

                        <InputField label={t('checkoutPage.mobileInputStreet')} name="street" value={formData.street} onChange={handleChange} placeholder={t('checkoutPage.streetPlaceholder')} />
                        {showErrors && !formData.street && <p className="text-xs font-medium text-[#a3281f]">{t('checkoutPage.enterStreet')}</p>}

                        <div className="overflow-hidden rounded-none border border-[#b9b0a0] bg-transparent relative h-[300px]">
                            <div className="absolute right-4 top-4 z-[401] rounded-full border border-[#b9b0a0] bg-[#f3eee4]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a2e2e] backdrop-blur-xl">
                                {t('checkoutPage.markOnMap')}
                            </div>
                            <React.Suspense fallback={<div className="h-full w-full bg-transparent" />}>
                                <CheckoutMap
                                    className="z-0 h-full w-full"
                                    style={{ background: '#0e141f' }}
                                    position={formData.location}
                                    onPositionChange={(pos) => setFormData(prev => ({ ...prev, location: pos }))}
                                />
                            </React.Suspense>
                            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070b12]/70 to-transparent pointer-events-none z-[400]" />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#070b12]/70 to-transparent pointer-events-none z-[400]" />
                        </div>
                        {showErrors && !formData.location && <p className="text-center text-xs font-medium text-[#a3281f]">{t('checkoutPage.selectMapLocation')}</p>}

                        <div className="rounded-none border border-[#b9b0a0] bg-transparent p-4">
                            <button
                                type="button"
                                onClick={() => setScheduledDelivery((value) => !value)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-6 items-center justify-center text-[#7a2e2e]">
                                        <Calendar className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-[#1c1915]">{t('checkoutPage.scheduledDelivery')}</span>
                                        <span className="text-xs text-[#6d665a]">{t('checkoutPage.selectDateAndTime')}</span>
                                    </span>
                                </span>
                                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${scheduledDelivery ? 'bg-[#1c1915]' : 'bg-[#1c1915]/15'}`}>
                                    <span className={`h-5 w-5 rounded-full bg-white transition-transform ${scheduledDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                                </span>
                            </button>

                            {scheduledDelivery && (
                                <div className="mt-4 space-y-4">
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {getDeliveryDates().map((date) => (
                                            <button
                                                key={date.value}
                                                type="button"
                                                onClick={() => setDeliveryDate(date.value)}
                                                className={`min-w-[88px] rounded-none border px-3 py-2 text-left ${deliveryDate === date.value ? 'border-[#1c1915] bg-[#7a2e2e]/[0.07] text-[#7a2e2e]' : 'border-[#b9b0a0] bg-[#1c1915]/[0.04] text-[#6d665a]'}`}
                                            >
                                                <span className="block text-[10px] uppercase tracking-[0.14em]">{date.day}</span>
                                                <span className="mt-1 block text-sm font-semibold">{date.date}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DELIVERY_TIME_SLOTS.map((slot) => (
                                            <button
                                                key={slot.value}
                                                type="button"
                                                onClick={() => setDeliveryTimeSlot(slot.value)}
                                                className={`rounded-none border p-3 text-left ${deliveryTimeSlot === slot.value ? 'border-[#1c1915] bg-[#7a2e2e]/[0.07] text-[#1c1915]' : 'border-[#b9b0a0] bg-[#1c1915]/[0.04] text-[#6d665a]'}`}
                                            >
                                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {slot.label}
                                                </span>
                                                <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[#6d665a]">{slot.hint}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {currentStep === 3 && (
                    <section className="px-5 py-6 space-y-5 animate-fade-in-up">
                        <div className="atelier-sec"><i>03</i><h2>{t('checkoutPage.receiptTitle')}</h2><ShieldCheck className="ml-auto h-4 w-4 text-[#7a2e2e]" strokeWidth={1.5} /></div>

                        <div className="grid gap-3">
                            {[
                                { value: 'cash_on_delivery', label: t('checkoutPage.cashLabel'), icon: Truck, hint: t('checkoutPage.cashHint'), color: 'text-[#7a2e2e]' }
                            ].map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    disabled={method.isComingSoon}
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                                    className={`flex min-h-[72px] items-center gap-4 rounded-none border px-4 text-left transition-all ${method.isComingSoon
                                        ? 'border-[#b9b0a0] bg-[#1c1915]/[0.04] opacity-45'
                                        : formData.paymentMethod === method.value
                                            ? 'border-[#1c1915] bg-[#7a2e2e]/[0.07]'
                                            : 'border-[#b9b0a0] bg-transparent active:scale-[0.99]'
                                        }`}
                                >
                                    <span className={`flex h-11 w-6 shrink-0 items-center justify-center ${method.color}`}>
                                        <method.icon className="w-5 h-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-[#1c1915]">{method.label}</span>
                                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d665a]">{method.hint}</span>
                                    </span>
                                    {formData.paymentMethod === method.value && !method.isComingSoon && <CheckCircle className="h-5 w-5 text-[#7a2e2e]" />}
                                </button>
                            ))}
                        </div>

                        <ul className="space-y-2 border-y border-[#b9b0a0] py-4 text-xs text-[#3a352c]">
                            {[policy.tryOn, policy.delivery, policy.returns].map((line) => (
                                <li key={line} className="flex items-center gap-2.5">
                                    <Check className="h-4 w-4 shrink-0 text-[#7a2e2e]" />
                                    {line}
                                </li>
                            ))}
                        </ul>

                        <InputField label={t('checkoutPage.mobileInputComments')} name="comments" value={formData.comments} onChange={handleChange} placeholder={t('checkoutPage.mobileCommentsPlaceholder')} />

                        <div className="rounded-none border border-[#b9b0a0] bg-transparent p-4">
                            <button
                                type="button"
                                onClick={() => setGiftWrap((value) => !value)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-6 items-center justify-center text-[#7a2e2e]">
                                        <Gift className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-[#1c1915]">{t('checkoutPage.giftWrapShort')}</span>
                                        <span className="text-xs text-[#6d665a]">{t('checkoutPage.giftWrapDesc')}</span>
                                    </span>
                                </span>
                                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${giftWrap ? 'bg-[#1c1915]' : 'bg-[#1c1915]/15'}`}>
                                    <span className={`h-5 w-5 rounded-full bg-white transition-transform ${giftWrap ? 'translate-x-5' : 'translate-x-0'}`} />
                                </span>
                            </button>

                            {giftWrap && (
                                <div className="mt-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(GIFT_WRAP_OPTIONS).map(([key, option]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setGiftWrapType(key)}
                                                className={`rounded-none border p-3 text-left ${giftWrapType === key ? 'border-[#1c1915] bg-[#7a2e2e]/[0.07]' : 'border-[#b9b0a0] bg-[#1c1915]/[0.04]'}`}
                                            >
                                                <span className="block text-[11px] font-semibold text-[#1c1915]">{option.name}</span>
                                                <span className="mt-1 block text-[10px] text-[#6d665a]">{option.price.toLocaleString('ru-RU')} {t('checkoutPage.soM')}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        value={giftMessage}
                                        onChange={(event) => setGiftMessage(event.target.value)}
                                        maxLength={200}
                                        placeholder={t('checkoutPage.giftMessageLabel')}
                                        className="h-12 w-full rounded-none border border-[#b9b0a0] bg-[#f3eee4] px-4 text-sm text-[#1c1915] placeholder:text-[#a49b8a] outline-none focus:border-[#7a2e2e]"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="flex items-start gap-3 rounded-none border border-[#b9b0a0] bg-[#1c1915]/[0.04] p-4">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(event) => setAgreeTerms(event.target.checked)}
                                className="mt-1 h-4 w-4 accent-[#7a2e2e]"
                            />
                            <span className="text-sm leading-6 text-[#3a352c]">{t('checkoutPage.agreeTerms')}</span>
                        </label>

                        <div className="border-t border-[#1c1915] pt-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6d665a]">{t('checkoutPage.orderSummaryTitle')}</p>
                                    <h3 className="mt-1 text-lg font-semibold text-[#1c1915]">{t('checkoutPage.yourOrder')}</h3>
                                </div>
                                <span className="rounded-full bg-[#7a2e2e]/[0.07] px-3 py-1 text-xs font-semibold text-[#7a2e2e]">{orderPreviewItems.length} {t('checkoutPage.itemsCount')}</span>
                            </div>

                            <div className="mb-4 border-b border-[#b9b0a0] pb-4">
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between rounded-none border border-[#1c1915] bg-[#7a2e2e]/[0.07] p-3">
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#7a2e2e]">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {appliedPromo.code}
                                            </p>
                                            <p className="mt-1 text-xs text-[#6d665a]">
                                                {appliedPromo.type === 'giftcard'
                                                    ? `-${appliedPromo.discountAmount.toLocaleString('ru-RU')} ${t('common.sum')}`
                                                    : `-${appliedPromo.discountPercentage}% ${t('common.discount')}`}
                                            </p>
                                        </div>
                                        <button onClick={handleRemovePromo} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9b0a0] text-[#6d665a] active:scale-95">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder={t('checkoutPage.promoCode')}
                                            className="h-[52px] w-full rounded-none border border-[#b9b0a0] bg-[#f3eee4] px-4 pr-24 text-sm uppercase text-[#1c1915] placeholder:text-[#a49b8a] focus:outline-none focus:border-[#7a2e2e]"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={isValidatingPromo || !promoCode.trim()}
                                            className="absolute bottom-1.5 right-1.5 top-1.5 rounded-none bg-[#1c1915] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#f3eee4] transition disabled:opacity-45"
                                        >
                                            {isValidatingPromo ? '...' : t('checkoutPage.applyButton')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-b border-[#b9b0a0] pb-4">
                                {orderPreviewItems.slice(0, 3).map((item, idx) => (
                                    <div key={item.id || item.productId || idx} className="flex items-center gap-3">
                                        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="h-11 w-11 rounded-none object-cover ring-1 ring-[#b9b0a0]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-medium text-[#1c1915]">{item.name}</p>
                                            <p className="mt-0.5 text-xs text-[#6d665a]">
                                                {item.lookTitle ? `${item.lookTitle} · ` : ''}{item.quantity} x {(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0).toLocaleString('ru-RU')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {orderPreviewItems.length > 3 && <p className="text-xs italic text-[#6d665a]">{t('checkoutPage.moreItems').replace('{count}', orderPreviewItems.length - 3)}</p>}
                            </div>

                            <div className="space-y-2 pt-4">
                                <div className="flex items-center justify-between text-sm text-[#6d665a]">
                                    <span>{t('common.price')}</span>
                                    <span>{summaryTotal.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex items-center justify-between text-sm text-[#7a2e2e]">
                                        <span>{t('common.discount')}</span>
                                        <span>-{promoDiscountAmount.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                    </div>
                                )}
                                {tierDiscountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#7a2e2e]">
                                        <span>{t('checkoutPage.memberDiscountShort').replace('{level}', userTier?.level || '')}</span>
                                        <span>-{tierDiscountAmount.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                    </div>
                                )}
                                {giftWrap && giftWrapCost > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#7a2e2e]">
                                        <span>{t('checkoutPage.giftWrapShort')}</span>
                                        <span>{giftWrapCost.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                    </div>
                                )}
                                {expressDeliveryFee > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#7a2e2e]">
                                        <span>{t('checkoutPage.expressDeliveryLabel')}</span>
                                        <span>{expressDeliveryFee.toLocaleString('ru-RU')} {t('common.sum')}</span>
                                    </div>
                                )}
                                <div className="flex items-end justify-between pt-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6d665a]">{t('checkoutPage.total')}</span>
                                    <span className="atelier-serif text-3xl italic text-[#1c1915]">{Math.max(finalTotal, 0).toLocaleString('ru-RU')} <span className="text-sm font-normal text-[#6d665a]">{t('common.sum')}</span></span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <div className="atelier-dock">
                <div className="atelier-dock__in">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            aria-label={t('checkoutPage.back', 'Ortga')}
                            className="atelier-dock__back active:scale-95 transition-transform"
                        >
                            <ArrowLeft className="h-5 w-5" strokeWidth={1.6} />
                        </button>
                    )}

                    <div className="atelier-dock__sum">
                        <small>{t('checkoutPage.total')}</small>
                        <b>{Math.max(finalTotal, 0).toLocaleString('ru-RU')} {t('common.sum')}</b>
                    </div>

                    <SpringSubmitButton
                        onClick={() => {
                            if (currentStep === 1) {
                                if (!validateField(formData.firstName) || !isUzbekPhone(formData.phone)) {
                                    setShowErrors(true);
                                    toast.error(t('checkoutPage.toastPhoneName'));
                                    return;
                                }
                                setShowErrors(false);
                                setCurrentStep(2);
                            } else if (currentStep === 2) {
                                if (!validateField(formData.region) || !validateField(formData.street) || !validateField(formData.house, false) || !formData.location) {
                                    setShowErrors(true);
                                    if (!validateField(formData.region)) toast.error(t('checkoutPage.toastSelectRegion'));
                                    else if (!validateField(formData.street)) toast.error(t('checkoutPage.toastEnterStreet'));
                                    else if (!validateField(formData.house, false)) toast.error(t('checkoutPage.toastEnterLandmark'));
                                    else if (!formData.location) toast.error(t('checkoutPage.toastSelectLocation'));
                                    return;
                                }
                                setShowErrors(false);
                                setCurrentStep(3);
                            } else {
                                if (scheduledDelivery && (!deliveryDate || !deliveryTimeSlot)) {
                                    toast.error(t('checkoutPage.toastSelectDeliveryDateTimeMobile'));
                                    return;
                                }
                                handleSubmit();
                            }
                        }}
                        disabled={orderPlaced}
                        status={orderPlaced ? 'success' : isSubmitting ? 'loading' : 'idle'}
                        loadingLabel={t('checkoutPage.processingButton')}
                        successLabel={t('checkoutPage.orderPlaced', 'Buyurtma qabul qilindi')}
                        height={52}
                        radius={26}
                        wrapperClassName="min-w-0 flex-1"
                        className="atelier-dock__go transition-transform active:scale-[0.98]"
                    >
                        {currentStep === 3 ? t('checkoutPage.placeOrder') : t('checkoutPage.next')}
                    </SpringSubmitButton>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <OrderSuccessModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)} 
                orderId={createdOrderId}
                isMobile={true}
            />
        </div>
    );
};

export default MobileCheckout;
