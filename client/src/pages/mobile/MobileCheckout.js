import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
    ArrowLeft, MapPin, Phone, User, CreditCard,
    Truck, CheckCircle, Navigation, ChevronRight,
    Gem, ShieldCheck, Wallet, X, LockKeyhole, Sparkles,
    Gift, Calendar, Clock, MessageCircle as MessageCircleIconFallback
} from 'lucide-react';
import useProductService from '../../server/server';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import OrderSuccessModal from '../../components/OrderSuccessModal';
import useCheckoutTotals, { DELIVERY_TIME_SLOTS, GIFT_WRAP_OPTIONS, getDeliveryDates } from '../../hooks/useCheckoutTotals';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Map click handler
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationerror(e) {
            toast.error("Joylashuvni aniqlab bo'lmadi");
        },
    });

    return position === null ? null : <Marker position={position} />;
}

// Locate user button
function LocationButton() {
    const map = useMap();

    const handleLocate = (e) => {
        e.preventDefault();
        map.locate({ setView: true, maxZoom: 16 });
    };

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar !border-0 !shadow-none">
                <button
                    onClick={handleLocate}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d6b47c]/30 bg-[#0c1018]/90 text-[#d6b47c] shadow-[0_10px_28px_rgba(0,0,0,0.35)] active:scale-95 transition-transform"
                    title="Mening manzilim"
                >
                    <Navigation className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Premium Input Component
const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="group relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777f8d] transition-colors group-focus-within:text-[#d6b47c]">
            <Icon className="h-[18px] w-[18px]" />
        </div>
        <input
            {...props}
            className="h-14 w-full rounded-2xl border border-white/10 bg-[#0e141f]/90 py-3.5 pl-12 pr-4 text-[16px] text-[#f6f1e8] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-[#5f6877] focus:outline-none focus:border-[#d6b47c]/60 focus:ring-2 focus:ring-[#d6b47c]/10 transition-all font-sans"
        />
        <label className="absolute -top-2 left-3 bg-[#070b12] px-2 text-[10px] uppercase font-bold tracking-[0.16em] text-[#7d8591] group-focus-within:text-[#d6b47c] transition-colors">
            {label}
        </label>
    </div>
);


const MobileCheckout = () => {
    const { t } = useLanguage();
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
            toast.error("Iltimos, ro'yxatdan o'ting");
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
        paymentMethod: 'cash',
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyPromo = async () => {
        const normalizedCode = promoCode.trim().toUpperCase();
        if (!normalizedCode) return;

        setIsValidatingPromo(true);
        let lastErrorMessage = "Promokod yoki kupon yaroqsiz";

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
                toast.success(`Promokod qo'llanildi: -${result.discountPercentage}% chegirma!`);
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
                toast.success("Kupon qo'llanildi!");
            } else {
                setAppliedPromo(null);
                toast.error(couponResult.message || lastErrorMessage);
            }
        } catch (error) {
            toast.error('Tekshirishda xatolik yuz berdi');
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
            toast.error("Savatingiz bo'sh!");
            return;
        }

        if (!formData.firstName || !formData.phone || !formData.region || !formData.street) {
            toast.error("Iltimos, barcha maydonlarni to'ldiring");
            return;
        }

        if (scheduledDelivery && (!deliveryDate || !deliveryTimeSlot)) {
            toast.error("Iltimos, yetkazib berish sanasi va vaqtini tanlang");
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
                        toast.error("Sovg'a kartasi hozir yaroqsiz");
                        setIsSubmitting(false);
                        return;
                    }
                    verifiedDiscountAmount = giftCardValidation.amount;
                } else if (appliedPromo.source === 'coupon') {
                    const couponValidation = await validateCoupon(appliedPromo.code, summaryTotal, token);
                    if (!couponValidation.success) {
                        setAppliedPromo(null);
                        toast.error("Kupon hozir yaroqsiz");
                        setIsSubmitting(false);
                        return;
                    }
                    verifiedDiscountAmount = couponValidation.discount;
                } else {
                    const promoValidation = await validatePromo(appliedPromo.code);
                    if (!promoValidation.success) {
                        setAppliedPromo(null);
                        toast.error("Promokod hozir yaroqsiz");
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

            if (result && result.success) {
                setCreatedOrderId(result.orderId);
                setShowSuccessModal(true);
                clearCart();
                // We'll let the modal handle navigation
            } else {
                const errorMsg = result.errors 
                    ? result.errors.map(e => e.message).join(', ')
                    : (result.message || 'Xatolik yuz berdi');
                toast.error(errorMsg);
                console.error('Order creation failed:', result);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Tizimda xatolik: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const regions = [
        'Bektemir', 'Chilanzar', 'Yashnobod', 'Mirobod',
        "Mirzo Ulug'bek", 'Sergeli', 'Shayxontohur', 'Olmazor',
        'Uchtepa', 'Yakkasaray', 'Yunusabad', 'Yangihayot'
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
        { label: 'Contact', title: "Shaxsiy ma'lumotlar", icon: User },
        { label: 'Delivery', title: 'Manzil va lokatsiya', icon: MapPin },
        { label: 'Payment', title: "To'lov va tasdiqlash", icon: LockKeyhole }
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
                    Savatingiz <span className="font-serif italic text-amber-500">bo'sh</span>
                </h1>
                <p className="text-gray-500 mb-8 text-center text-sm font-light">
                    Premium kolleksiyamizdan o'zingizga mos libosni tanlang
                </p>
                <button
                    onClick={() => navigate('/mobile/products')}
                    className="group relative px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Xarid qilish <ArrowLeft className="w-4 h-4 rotate-180" />
                    </span>
                    <div className="absolute inset-0 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070b12] text-[#f6f1e8] pb-36 font-sans selection:bg-[#d6b47c]/30">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(214,180,124,0.10),transparent_34%),linear-gradient(180deg,#070b12_0%,#0b1018_42%,#05070b_100%)]" />
            <div className="fixed inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b12]/90 px-5 pb-4 pt-3 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#c9d0dc] active:scale-95 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#d6b47c]">Luxe Checkout</p>
                        <p className="text-sm font-semibold text-[#f6f1e8]">{activeStep.title}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/10 text-[#d6b47c]">
                        <ActiveStepIcon className="h-[18px] w-[18px]" />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    {stepMeta.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isDone = stepNumber < currentStep;
                        return (
                            <button
                                key={step.label}
                                type="button"
                                onClick={() => stepNumber < currentStep && setCurrentStep(stepNumber)}
                                className={`h-9 rounded-xl border text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${isActive
                                    ? 'border-[#d6b47c]/50 bg-[#d6b47c]/15 text-[#f6f1e8]'
                                    : isDone
                                        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                                        : 'border-white/10 bg-white/[0.03] text-[#6f7784]'
                                    }`}
                            >
                                {step.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className={`relative z-10 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <section className="px-5 pt-6">
                    <div className="border-b border-white/10 pb-5">
                        <div className="flex items-center gap-2 text-[#d6b47c]">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Concierge Order</span>
                        </div>
                        <h1 className="mt-2 text-3xl font-light leading-tight text-[#f6f1e8]">
                            Premium xaridni yakunlash
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-[#8e98a8]">
                            Ma'lumotlaringiz tekshiriladi, lokatsiya aniqlanadi va buyurtma xavfsiz yuboriladi.
                        </p>
                    </div>
                </section>

                {currentStep === 1 && (
                    <section className="px-5 py-6 space-y-5 animate-fade-in-up">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d8591]">Step 01</p>
                                <h2 className="mt-1 text-xl font-semibold text-[#f6f1e8]">Aloqa ma'lumotlari</h2>
                            </div>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#9ba4b4]">Secure</span>
                        </div>

                        <InputField label="ISM" icon={User} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Ismingiz" />
                        {showErrors && !formData.firstName && <p className="text-xs font-medium text-red-300">Iltimos, ismingizni kiriting</p>}
                        <InputField label="FAMILIYA" icon={User} name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Familiyangiz" />
                        <InputField label="TELEFON" icon={Phone} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+998 90 123 45 67" />
                        {showErrors && !formData.phone && <p className="text-xs font-medium text-red-300">Iltimos, telefon raqamingizni kiriting</p>}
                    </section>
                )}

                {currentStep === 2 && (
                    <section className="px-5 py-6 space-y-5 animate-fade-in-up">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d8591]">Step 02</p>
                                <h2 className="mt-1 text-xl font-semibold text-[#f6f1e8]">Yetkazib berish</h2>
                            </div>
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-300">Free</span>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#d6b47c]">
                                <MapPin className="h-[18px] w-[18px]" />
                            </div>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-[#0e141f]/90 py-3.5 pl-12 pr-10 text-[16px] text-[#f6f1e8] focus:outline-none focus:border-[#d6b47c]/60 focus:ring-2 focus:ring-[#d6b47c]/10 transition-all font-sans"
                            >
                                <option value="">Tuman tanlang</option>
                                {regions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-5 w-4 h-4 rotate-90 text-[#777f8d]" />
                        </div>
                        {showErrors && !formData.region && <p className="text-xs font-medium text-red-300">Iltimos, tumanni tanlang</p>}

                        <InputField label="KO'CHA VA UY" icon={Navigation} name="street" value={formData.street} onChange={handleChange} placeholder="Ko'cha, uy raqami" />
                        {showErrors && !formData.street && <p className="text-xs font-medium text-red-300">Iltimos, ko'cha va uy raqamini kiriting</p>}

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e141f] shadow-[0_18px_44px_rgba(0,0,0,0.32)] relative h-[300px]">
                            <div className="absolute left-4 top-4 z-[401] rounded-full border border-white/10 bg-[#070b12]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d6b47c] backdrop-blur-xl">
                                Xaritadan belgilang
                            </div>
                            <MapContainer
                                center={[41.2995, 69.2401]}
                                zoom={12}
                                style={{ height: '100%', width: '100%', background: '#0e141f' }}
                                className="z-0"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker position={formData.location} setPosition={(pos) => setFormData(prev => ({ ...prev, location: pos }))} />
                                <LocationButton />
                            </MapContainer>
                            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070b12]/70 to-transparent pointer-events-none z-[400]" />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#070b12]/70 to-transparent pointer-events-none z-[400]" />
                        </div>
                        {showErrors && !formData.location && <p className="text-center text-xs font-medium text-red-300">Iltimos, xaritadan joylashuvni belgilang</p>}

                        <div className="rounded-2xl border border-white/10 bg-[#0e141f]/90 p-4">
                            <button
                                type="button"
                                onClick={() => setScheduledDelivery((value) => !value)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6b47c]/10 text-[#d6b47c]">
                                        <Calendar className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-[#f6f1e8]">Rejali yetkazib berish</span>
                                        <span className="text-xs text-[#8e98a8]">Sana va vaqt oralig'ini tanlang</span>
                                    </span>
                                </span>
                                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${scheduledDelivery ? 'bg-[#d6b47c]' : 'bg-white/10'}`}>
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
                                                className={`min-w-[88px] rounded-2xl border px-3 py-2 text-left ${deliveryDate === date.value ? 'border-[#d6b47c]/50 bg-[#d6b47c]/12 text-[#d6b47c]' : 'border-white/10 bg-white/[0.03] text-[#9ba4b4]'}`}
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
                                                className={`rounded-2xl border p-3 text-left ${deliveryTimeSlot === slot.value ? 'border-[#d6b47c]/50 bg-[#d6b47c]/12 text-[#f6f1e8]' : 'border-white/10 bg-white/[0.03] text-[#9ba4b4]'}`}
                                            >
                                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {slot.label}
                                                </span>
                                                <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[#7d8591]">{slot.hint}</span>
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
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7d8591]">Step 03</p>
                                <h2 className="mt-1 text-xl font-semibold text-[#f6f1e8]">To'lov va receipt</h2>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-[#d6b47c]" />
                        </div>

                        <div className="grid gap-3">
                            {[
                                { value: 'cash', label: 'Naqd pul orqali', icon: Truck, hint: 'Yetkazilganda', color: 'text-[#d6b47c]' },
                                { value: 'click', label: 'Click Evolution', icon: Wallet, hint: 'Tez orada', color: 'text-sky-300', isComingSoon: true },
                                { value: 'payme', label: 'Payme', icon: CreditCard, hint: 'Tez orada', color: 'text-teal-300', isComingSoon: true }
                            ].map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    disabled={method.isComingSoon}
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                                    className={`flex min-h-[72px] items-center gap-4 rounded-2xl border px-4 text-left transition-all ${method.isComingSoon
                                        ? 'border-white/5 bg-white/[0.025] opacity-45'
                                        : formData.paymentMethod === method.value
                                            ? 'border-[#d6b47c]/50 bg-[#d6b47c]/12 shadow-[0_14px_36px_rgba(214,180,124,0.10)]'
                                            : 'border-white/10 bg-[#0e141f]/90 active:scale-[0.99]'
                                        }`}
                                >
                                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] ${method.color}`}>
                                        <method.icon className="w-5 h-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-[#f6f1e8]">{method.label}</span>
                                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#7d8591]">{method.hint}</span>
                                    </span>
                                    {formData.paymentMethod === method.value && !method.isComingSoon && <CheckCircle className="h-5 w-5 text-[#d6b47c]" />}
                                </button>
                            ))}
                        </div>

                        <InputField label="IZOH" icon={MessageCircleIconFallback} name="comments" value={formData.comments} onChange={handleChange} placeholder="Buyurtma bo'yicha izoh" />

                        <div className="rounded-2xl border border-white/10 bg-[#0e141f]/95 p-4">
                            <button
                                type="button"
                                onClick={() => setGiftWrap((value) => !value)}
                                className="flex w-full items-center justify-between text-left"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6b47c]/10 text-[#d6b47c]">
                                        <Gift className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-[#f6f1e8]">Sovg'a qadoqlash</span>
                                        <span className="text-xs text-[#8e98a8]">Premium quti, lenta va tabrik xati</span>
                                    </span>
                                </span>
                                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${giftWrap ? 'bg-[#d6b47c]' : 'bg-white/10'}`}>
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
                                                className={`rounded-2xl border p-3 text-left ${giftWrapType === key ? 'border-[#d6b47c]/50 bg-[#d6b47c]/12' : 'border-white/10 bg-white/[0.03]'}`}
                                            >
                                                <span className="block text-[11px] font-semibold text-[#f6f1e8]">{option.name}</span>
                                                <span className="mt-1 block text-[10px] text-[#8e98a8]">{option.price.toLocaleString()} so'm</span>
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        value={giftMessage}
                                        onChange={(event) => setGiftMessage(event.target.value)}
                                        maxLength={200}
                                        placeholder="Tabrik xati (ixtiyoriy)"
                                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#070b12] px-4 text-sm text-[#f6f1e8] placeholder:text-[#606979] outline-none focus:border-[#d6b47c]/60"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(event) => setAgreeTerms(event.target.checked)}
                                className="mt-1 h-4 w-4 accent-[#d6b47c]"
                            />
                            <span className="text-sm leading-6 text-[#c8d0dc]">{t('checkoutPage.agreeTerms')}</span>
                        </label>

                        <div className="rounded-2xl border border-white/10 bg-[#0e141f]/95 p-5 shadow-[0_20px_52px_rgba(0,0,0,0.34)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d8591]">Order Summary</p>
                                    <h3 className="mt-1 text-lg font-semibold text-[#f6f1e8]">Sizning buyurtmangiz</h3>
                                </div>
                                <span className="rounded-full bg-[#d6b47c]/12 px-3 py-1 text-xs font-semibold text-[#d6b47c]">{orderPreviewItems.length} item</span>
                            </div>

                            <div className="mb-4 border-b border-white/10 pb-4">
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between rounded-2xl border border-[#d6b47c]/25 bg-[#d6b47c]/10 p-3">
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#d6b47c]">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {appliedPromo.code}
                                            </p>
                                            <p className="mt-1 text-xs text-[#9ba4b4]">
                                                {appliedPromo.type === 'giftcard'
                                                    ? `-${appliedPromo.discountAmount.toLocaleString()} ${t('common.sum')}`
                                                    : `-${appliedPromo.discountPercentage}% ${t('common.discount')}`}
                                            </p>
                                        </div>
                                        <button onClick={handleRemovePromo} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9ba4b4] active:scale-95">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Promokod"
                                            className="h-[52px] w-full rounded-2xl border border-white/10 bg-[#070b12] px-4 pr-24 text-sm uppercase text-[#f6f1e8] placeholder:text-[#606979] focus:outline-none focus:border-[#d6b47c]/60"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={isValidatingPromo || !promoCode.trim()}
                                            className="absolute bottom-1.5 right-1.5 top-1.5 rounded-xl bg-[#d6b47c] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#070b12] transition disabled:opacity-45"
                                        >
                                            {isValidatingPromo ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-b border-white/10 pb-4">
                                {orderPreviewItems.slice(0, 3).map((item, idx) => (
                                    <div key={item.id || item.productId || idx} className="flex items-center gap-3">
                                        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" />
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-medium text-[#e5ded1]">{item.name}</p>
                                            <p className="mt-0.5 text-xs text-[#758092]">
                                                {item.lookTitle ? `${item.lookTitle} · ` : ''}{item.quantity} x {(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {orderPreviewItems.length > 3 && <p className="text-xs italic text-[#758092]">+ yana {orderPreviewItems.length - 3} ta mahsulot</p>}
                            </div>

                            <div className="space-y-2 pt-4">
                                <div className="flex items-center justify-between text-sm text-[#9ba4b4]">
                                    <span>{t('common.price')}</span>
                                    <span>{summaryTotal.toLocaleString()} {t('common.sum')}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                                        <span>{t('common.discount')}</span>
                                        <span>-{promoDiscountAmount.toLocaleString()} {t('common.sum')}</span>
                                    </div>
                                )}
                                {tierDiscountAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                                        <span>{userTier?.level} Member</span>
                                        <span>-{tierDiscountAmount.toLocaleString()} {t('common.sum')}</span>
                                    </div>
                                )}
                                {giftWrap && giftWrapCost > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                                        <span>Sovg'a qadoqlash</span>
                                        <span>{giftWrapCost.toLocaleString()} {t('common.sum')}</span>
                                    </div>
                                )}
                                {expressDeliveryFee > 0 && (
                                    <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                                        <span>Tezkor yetkazib berish</span>
                                        <span>{expressDeliveryFee.toLocaleString()} {t('common.sum')}</span>
                                    </div>
                                )}
                                <div className="flex items-end justify-between pt-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7d8591]">{t('checkoutPage.total')}</span>
                                    <span className="text-2xl font-semibold text-[#f6f1e8]">{Math.max(finalTotal, 0).toLocaleString()} <span className="text-sm font-normal text-[#9ba4b4]">{t('common.sum')}</span></span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[#070b12]/92 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 backdrop-blur-2xl">
                <div className="flex gap-3">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#f6f1e8] active:scale-95 transition-transform"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (currentStep === 1) {
                                if (!formData.firstName || !formData.phone) {
                                    setShowErrors(true);
                                    toast.error("Iltimos, ma'lumotlarni to'ldiring");
                                    return;
                                }
                                setShowErrors(false);
                                setCurrentStep(2);
                            } else if (currentStep === 2) {
                                if (!formData.region || !formData.street || !formData.location) {
                                    setShowErrors(true);
                                    if (!formData.region) toast.error("Iltimos, tumanni tanlang");
                                    else if (!formData.street) toast.error("Iltimos, ko'cha va uy raqamini kiriting");
                                    else if (!formData.location) toast.error("Iltimos, lokatsiyangizni belgilang");
                                    return;
                                }
                                setShowErrors(false);
                                setCurrentStep(3);
                            } else {
                                handleSubmit();
                            }
                        }}
                        disabled={isSubmitting}
                        className={`flex h-14 flex-1 items-center justify-center gap-3 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-[0_18px_42px_rgba(0,0,0,0.35)] active:scale-[0.98] transition-all ${isSubmitting ? 'bg-[#1a2130] text-[#768092] cursor-wait' : 'bg-[#f6f1e8] text-[#070b12]'}`}
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Bajarilmoqda...</span>
                        ) : (
                            <>
                                {currentStep === 3 ? t('checkoutPage.placeOrder') : t('checkoutPage.next')}
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </>
                        )}
                    </button>
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
