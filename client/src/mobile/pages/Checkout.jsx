import React, { Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, Gift, MapPin, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import useProductService from '../../server/server';
import { getPolicyCopy } from '../../config/policies';
import OrderSuccessModal from '../../components/OrderSuccessModal';
import useCheckoutTotals, { DELIVERY_TIME_SLOTS, GIFT_WRAP_OPTIONS, getDeliveryDates } from '../../hooks/useCheckoutTotals';
import { trackEvent } from '../../utils/analytics';
import { getImageUrl } from '../../utils/image';
import { Empty, Field, TopBar, money } from '../ui';
import './checkout.css';

const CheckoutMap = React.lazy(() => import('../../components/CheckoutMap'));

const WORDS = {
  uz: {
    title: 'Rasmiylashtirish',
    steps: ['Aloqa', 'Manzil', 'Tasdiqlash'],
    stepOf: (n) => `${n} / 3`,
    contactTitle: 'Siz bilan qanday bog\'lanamiz?',
    firstName: 'Ism',
    lastName: 'Familiya (ixtiyoriy)',
    phone: 'Telefon raqam',
    nameError: 'Ismingizni kiriting',
    phoneError: 'Raqamni +998 90 123 45 67 ko\'rinishida kiriting',
    addressTitle: 'Qayerga yetkazamiz?',
    region: 'Hudud',
    regionError: 'Hududni tanlang',
    street: "Ko'cha va uy",
    streetError: "Ko'cha va uyni yozing",
    landmark: "Mo'ljal (ixtiyoriy)",
    map: 'Xaritada belgilang',
    mapHint: 'Kuryer aniq topishi uchun eshigingizni belgilang.',
    mapError: 'Xaritada joyni belgilang',
    schedule: 'Aniq vaqtga yetkazish',
    scheduleHint: 'Kun va vaqt oralig\'ini tanlang',
    confirmTitle: 'Buyurtmani tekshiring',
    promo: 'Promo-kod yoki sovg\'a kartasi',
    apply: "Qo'llash",
    remove: 'Olib tashlash',
    giftWrap: "Sovg'a qadoqlash",
    giftMessage: 'Tabriknoma matni',
    payment: "To'lov",
    comments: 'Kuryer uchun izoh (ixtiyoriy)',
    subtotal: 'Mahsulotlar',
    lookDiscount: 'Obraz chegirmasi',
    tierDiscount: 'Mijoz darajasi chegirmasi',
    promoDiscount: 'Promo-kod',
    wrap: 'Qadoqlash',
    express: 'Tezkor yetkazish',
    delivery: 'Yetkazish',
    free: 'Bepul',
    total: 'Jami',
    agree: 'Shartlar bilan tanishdim va roziman',
    terms: 'Shartlar',
    next: 'Davom etish',
    place: 'Buyurtma berish',
    sending: 'Yuborilmoqda',
    emptyTitle: "Savat bo'sh",
    emptyText: "Rasmiylashtirish uchun avval savatga mahsulot qo'shing.",
    shop: 'Katalogga',
    qty: (n) => `${n} dona`,
  },
  ru: {
    title: 'Оформление',
    steps: ['Контакты', 'Адрес', 'Проверка'],
    stepOf: (n) => `${n} / 3`,
    contactTitle: 'Как с вами связаться?',
    firstName: 'Имя',
    lastName: 'Фамилия (необязательно)',
    phone: 'Телефон',
    nameError: 'Введите имя',
    phoneError: 'Номер в формате +998 90 123 45 67',
    addressTitle: 'Куда доставить?',
    region: 'Регион',
    regionError: 'Выберите регион',
    street: 'Улица и дом',
    streetError: 'Укажите улицу и дом',
    landmark: 'Ориентир (необязательно)',
    map: 'Отметьте на карте',
    mapHint: 'Отметьте дверь, чтобы курьер нашёл вас сразу.',
    mapError: 'Отметьте место на карте',
    schedule: 'Доставка к точному времени',
    scheduleHint: 'Выберите день и интервал',
    confirmTitle: 'Проверьте заказ',
    promo: 'Промокод или подарочная карта',
    apply: 'Применить',
    remove: 'Убрать',
    giftWrap: 'Подарочная упаковка',
    giftMessage: 'Текст открытки',
    payment: 'Оплата',
    comments: 'Комментарий курьеру (необязательно)',
    subtotal: 'Товары',
    lookDiscount: 'Скидка на образ',
    tierDiscount: 'Скидка уровня клиента',
    promoDiscount: 'Промокод',
    wrap: 'Упаковка',
    express: 'Экспресс-доставка',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: 'Итого',
    agree: 'Я ознакомилась с условиями и согласна',
    terms: 'Условия',
    next: 'Далее',
    place: 'Оформить заказ',
    sending: 'Отправляем',
    emptyTitle: 'Корзина пуста',
    emptyText: 'Чтобы оформить заказ, добавьте товар в корзину.',
    shop: 'В каталог',
    qty: (n) => `${n} шт.`,
  },
  en: {
    title: 'Checkout',
    steps: ['Contact', 'Address', 'Review'],
    stepOf: (n) => `${n} / 3`,
    contactTitle: 'How do we reach you?',
    firstName: 'First name',
    lastName: 'Last name (optional)',
    phone: 'Phone number',
    nameError: 'Enter your name',
    phoneError: 'Use the format +998 90 123 45 67',
    addressTitle: 'Where do we deliver?',
    region: 'Region',
    regionError: 'Choose a region',
    street: 'Street and house',
    streetError: 'Enter the street and house',
    landmark: 'Landmark (optional)',
    map: 'Mark it on the map',
    mapHint: 'Mark your door so the courier finds it straight away.',
    mapError: 'Mark the place on the map',
    schedule: 'Deliver at a set time',
    scheduleHint: 'Choose a day and a time window',
    confirmTitle: 'Review your order',
    promo: 'Promo code or gift card',
    apply: 'Apply',
    remove: 'Remove',
    giftWrap: 'Gift wrapping',
    giftMessage: 'Card message',
    payment: 'Payment',
    comments: 'Note for the courier (optional)',
    subtotal: 'Items',
    lookDiscount: 'Look discount',
    tierDiscount: 'Client tier discount',
    promoDiscount: 'Promo code',
    wrap: 'Wrapping',
    express: 'Express delivery',
    delivery: 'Delivery',
    free: 'Free',
    total: 'Total',
    agree: 'I have read and accept the terms',
    terms: 'Terms',
    next: 'Continue',
    place: 'Place order',
    sending: 'Sending',
    emptyTitle: 'Your bag is empty',
    emptyText: 'Add a piece to your bag to check out.',
    shop: 'To the catalogue',
    qty: (n) => `${n} pcs`,
  },
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
                toast.success(`${t('common.giftCardApplied')}! ${giftCardResult.amount.toLocaleString()} ${t('common.sum')}`);
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
                setShowSuccessModal(true);
                trackEvent('purchase', { ecommerce: { transaction_id: result.orderId, currency: 'UZS', value: result.total || verifiedFinalTotal } });
                clearCart();
                // We'll let the modal handle navigation
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

    const w = WORDS[language] || WORDS.uz;
    const err = (bad, text) => (showErrors && bad ? text : undefined);

    const goNext = () => {
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
            if (scheduledDelivery && (!deliveryDate || !deliveryTimeSlot)) {
                toast.error(t('checkoutPage.toastSelectDeliveryDateTimeMobile'));
                return;
            }
            setShowErrors(false);
            setCurrentStep(3);
        } else {
            handleSubmit();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        if (currentStep > 1) setCurrentStep((step) => step - 1);
        else navigate(-1);
    };

    if (items.length === 0 && (!lookItems || lookItems.length === 0) && !showSuccessModal) {
        return (
            <div className="m-page--bare">
                <TopBar title={w.title} />
                <Empty
                    icon={ShoppingBag}
                    title={w.emptyTitle}
                    text={w.emptyText}
                    action={<Link to="/mobile/products" className="m-btn m-btn--solid">{w.shop}</Link>}
                />
            </div>
        );
    }

    return (
        <div className={`m-page--bare mo ${mounted ? 'is-ready' : ''}`}>
            <TopBar title={w.title} subtitle={`${w.stepOf(currentStep)} · ${w.steps[currentStep - 1]}`} onBack={goBack} />

            <ol className="mo-steps m-pad" aria-label={w.title}>
                {w.steps.map((label, i) => (
                    <li key={label} className={i + 1 < currentStep ? 'is-done' : i + 1 === currentStep ? 'is-on' : ''}>
                        <button type="button" onClick={() => i + 1 < currentStep && setCurrentStep(i + 1)} disabled={i + 1 >= currentStep}>
                            <span className="mo-steps__bar" />
                            <span className="mo-steps__label">{i + 1 < currentStep && <Check className="h-3 w-3" />}{label}</span>
                        </button>
                    </li>
                ))}
            </ol>

            {currentStep === 1 && (
                <section className="mo-step m-pad" key="s1">
                    <h1 className="m-h2">{w.contactTitle}</h1>
                    <div className="mo-fields">
                        <Field label={w.firstName} name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="given-name" error={err(!validateField(formData.firstName), w.nameError)} />
                        <Field label={w.lastName} name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
                        <Field label={w.phone} name="phone" type="tel" inputMode="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" error={err(!isUzbekPhone(formData.phone), w.phoneError)} />
                    </div>
                </section>
            )}

            {currentStep === 2 && (
                <section className="mo-step m-pad" key="s2">
                    <h1 className="m-h2">{w.addressTitle}</h1>

                    <div className="mo-group">
                        <p className="mo-label">{w.region}</p>
                        <div className="mo-regions">
                            {regions.map((region) => (
                                <button
                                    key={region}
                                    type="button"
                                    className={`m-chip ${formData.region === region ? 'is-on' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, region }))}
                                >
                                    {region}
                                </button>
                            ))}
                        </div>
                        {err(!validateField(formData.region), w.regionError) && <span className="m-field__error">{w.regionError}</span>}
                    </div>

                    <div className="mo-fields">
                        <Field label={w.street} name="street" value={formData.street} onChange={handleChange} autoComplete="street-address" error={err(!validateField(formData.street), w.streetError)} />
                        <Field label={w.landmark} name="house" value={formData.house} onChange={handleChange} />
                    </div>

                    <div className="mo-group">
                        <p className="mo-label"><MapPin className="h-3.5 w-3.5" />{w.map}</p>
                        <p className="m-small">{w.mapHint}</p>
                        <div className={`mo-map ${showErrors && !formData.location ? 'is-error' : ''}`}>
                            <Suspense fallback={<div className="m-skel" style={{ height: '100%' }} />}>
                                <CheckoutMap
                                    className="z-0 h-full w-full"
                                    style={{ background: '#3a1620' }}
                                    position={formData.location}
                                    onPositionChange={(pos) => setFormData((prev) => ({ ...prev, location: pos }))}
                                />
                            </Suspense>
                        </div>
                        {showErrors && !formData.location && <span className="m-field__error">{w.mapError}</span>}
                    </div>

                    <div className="mo-group">
                        <label className="mo-toggle">
                            <span>
                                <strong>{w.schedule}</strong>
                                <small>{w.scheduleHint}</small>
                            </span>
                            <input type="checkbox" checked={scheduledDelivery} onChange={(e) => setScheduledDelivery(e.target.checked)} />
                            <i aria-hidden="true" />
                        </label>
                        {scheduledDelivery && (
                            <div className="mo-schedule">
                                <div className="m-chips">
                                    {getDeliveryDates().map((date) => (
                                        <button key={date.value} type="button" className={`m-chip mo-date ${deliveryDate === date.value ? 'is-on' : ''}`} onClick={() => setDeliveryDate(date.value)}>
                                            <small>{date.day}</small>{date.date}
                                        </button>
                                    ))}
                                </div>
                                <div className="mo-slots">
                                    {DELIVERY_TIME_SLOTS.map((slot) => (
                                        <button key={slot.value} type="button" className={`m-chip ${deliveryTimeSlot === slot.value ? 'is-on' : ''}`} onClick={() => setDeliveryTimeSlot(slot.value)}>
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {currentStep === 3 && (
                <section className="mo-step m-pad" key="s3">
                    <h1 className="m-h2">{w.confirmTitle}</h1>

                    <ul className="mo-items">
                        {orderPreviewItems.map((item) => (
                            <li key={item.id}>
                                <img src={getImageUrl(item)} alt="" loading="lazy" />
                                <span>
                                    <strong>{item.name}</strong>
                                    <small>{[item.selectedSize, item.selectedColor && !String(item.selectedColor).startsWith('#') && item.selectedColor, w.qty(item.quantity || 1)].filter(Boolean).join(' · ')}</small>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mo-recap">
                        <p><span>{formData.firstName} {formData.lastName}</span><span>{formData.phone}</span></p>
                        <p>{[formData.region, formData.street, formData.house].filter(Boolean).join(', ')}</p>
                        <button type="button" className="m-link" onClick={() => setCurrentStep(2)}>{w.steps[1]}</button>
                    </div>

                    <div className="mo-group">
                        {appliedPromo ? (
                            <div className="mo-promo-on">
                                <span><Check className="h-4 w-4" />{appliedPromo.code}</span>
                                <button type="button" className="m-link" onClick={handleRemovePromo}>{w.remove}</button>
                            </div>
                        ) : (
                            <div className="mo-promo">
                                <Field label={w.promo} value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} autoCapitalize="characters" />
                                <button type="button" className={`m-btn m-btn--ghost ${isValidatingPromo ? 'is-busy' : ''}`} onClick={handleApplyPromo} disabled={!promoCode.trim() || isValidatingPromo}>
                                    {w.apply}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mo-group">
                        <label className="mo-toggle">
                            <span>
                                <strong><Gift className="h-4 w-4" />{w.giftWrap}</strong>
                            </span>
                            <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
                            <i aria-hidden="true" />
                        </label>
                        {giftWrap && (
                            <div className="mo-wraps">
                                {Object.entries(GIFT_WRAP_OPTIONS).map(([key, option]) => (
                                    <button key={key} type="button" className={`mo-wrap ${giftWrapType === key ? 'is-on' : ''}`} onClick={() => setGiftWrapType(key)}>
                                        <strong>{option.name}</strong>
                                        <small>{option.desc}</small>
                                        <em>+{money(option.price, language)}</em>
                                    </button>
                                ))}
                                <Field label={w.giftMessage} as="textarea" rows={2} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} maxLength={200} />
                            </div>
                        )}
                    </div>

                    <div className="mo-group">
                        <p className="mo-label">{w.payment}</p>
                        <div className="mo-pay"><Check className="h-4 w-4" />{policy.payment}</div>
                        <p className="m-small">{policy.tryOn}. {policy.returns}.</p>
                    </div>

                    <div className="mo-fields">
                        <Field label={w.comments} as="textarea" rows={2} name="comments" value={formData.comments} onChange={handleChange} />
                    </div>

                    <dl className="mo-totals">
                        <div><dt>{w.subtotal}</dt><dd>{money(summaryTotal + (lookDiscountsTotal || 0), language)}</dd></div>
                        {lookDiscountsTotal > 0 && <div><dt>{w.lookDiscount}</dt><dd>−{money(lookDiscountsTotal, language)}</dd></div>}
                        {tierDiscountAmount > 0 && <div><dt>{w.tierDiscount}</dt><dd>−{money(tierDiscountAmount, language)}</dd></div>}
                        {promoDiscountAmount > 0 && <div><dt>{w.promoDiscount}</dt><dd>−{money(promoDiscountAmount, language)}</dd></div>}
                        {giftWrapCost > 0 && <div><dt>{w.wrap}</dt><dd>{money(giftWrapCost, language)}</dd></div>}
                        <div><dt>{expressDeliveryFee > 0 ? w.express : w.delivery}</dt><dd className={expressDeliveryFee > 0 ? '' : 'mo-free'}>{expressDeliveryFee > 0 ? money(expressDeliveryFee, language) : w.free}</dd></div>
                        <div className="mo-total"><dt>{w.total}</dt><dd>{money(finalTotal, language)}</dd></div>
                    </dl>

                    <label className="mo-agree">
                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                        <i aria-hidden="true"><Check className="h-3 w-3" /></i>
                        <span>{w.agree} · <Link to="/mobile/terms">{w.terms}</Link></span>
                    </label>
                </section>
            )}

            <div className="mo-spacer" aria-hidden="true" />
            <div className="m-actionbar">
                <div className="m-actionbar__sum"><small>{w.total}</small><strong>{money(finalTotal, language)}</strong></div>
                <button type="button" className={`m-btn m-btn--solid ${isSubmitting ? 'is-busy' : ''}`} onClick={goNext} disabled={isSubmitting}>
                    {isSubmitting ? w.sending : currentStep === 3 ? w.place : w.next}
                </button>
            </div>

            <OrderSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                orderId={createdOrderId}
                isMobile
            />
        </div>
    );
};

export default MobileCheckout;
