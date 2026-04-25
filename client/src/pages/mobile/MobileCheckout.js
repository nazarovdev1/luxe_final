import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    ArrowLeft, MapPin, Phone, User, CreditCard,
    Truck, CheckCircle, Navigation, ChevronRight,
    Gem, ShieldCheck, Wallet, X
} from 'lucide-react';
import useProductService from '../../server/server';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
                    className="flex items-center justify-center w-12 h-12 bg-[#1a1a1a] text-amber-500 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 active:scale-95 transition-transform"
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
        <div className="absolute left-4 top-3.5 text-gray-500 transition-colors group-focus-within:text-amber-500">
            <Icon className="w-5 h-5" />
        </div>
        <input
            {...props}
            className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[16px] text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
        />
        <label className="absolute -top-2 left-3 bg-[#0a0a0f] px-1 text-[10px] uppercase font-bold tracking-wider text-gray-500 group-focus-within:text-amber-500 transition-colors">
            {label}
        </label>
    </div>
);


const MobileCheckout = () => {
    const navigate = useNavigate();
    const { items, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated, loading } = useAuth();
    const { createOrder, validatePromo } = useProductService();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Address, 3: Payment
    const [mounted, setMounted] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!loading && !isAuthenticated) {
            toast.error("Iltimos, ro'yxatdan o'ting");
            navigate('/mobile/login');
        }
    }, [isAuthenticated, loading, navigate]);

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

    const total = getCartTotal();

    const discountAmount = useMemo(() => {
        if (appliedPromo) {
            return (total * appliedPromo.discountPercentage) / 100;
        }
        return 0;
    }, [total, appliedPromo]);

    const finalTotal = total - discountAmount;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyPromo = async () => {
        const normalizedCode = promoCode.trim().toUpperCase();
        if (!normalizedCode) return;

        setIsValidatingPromo(true);
        try {
            const result = await validatePromo(normalizedCode);
            if (result.success) {
                setAppliedPromo({
                    code: result.code,
                    discountPercentage: result.discountPercentage
                });
                setPromoCode(result.code);
                toast.success(`Promokod qo'llanildi: -${result.discountPercentage}% chegirma!`);
            } else {
                setAppliedPromo(null);
                toast.error(result.message || "Promokod yaroqsiz");
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
        if (items.length === 0) {
            toast.error("Savatingiz bo'sh!");
            return;
        }

        if (!formData.firstName || !formData.phone || !formData.region || !formData.street) {
            toast.error("Iltimos, barcha maydonlarni to'ldiring");
            return;
        }

        setIsSubmitting(true);

        try {
            let verifiedPromo = appliedPromo;
            if (appliedPromo?.code) {
                const promoValidation = await validatePromo(appliedPromo.code);
                if (!promoValidation.success) {
                    setAppliedPromo(null);
                    toast.error("Promokod hozir yaroqsiz. Qayta tekshirib ko'ring");
                    return;
                }

                verifiedPromo = {
                    code: promoValidation.code,
                    discountPercentage: promoValidation.discountPercentage
                };
                setAppliedPromo(verifiedPromo);
            }

            const verifiedDiscountAmount = verifiedPromo
                ? (total * verifiedPromo.discountPercentage) / 100
                : 0;
            const verifiedFinalTotal = Math.max(total - verifiedDiscountAmount, 0);

            const orderData = {
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone.replace(/\s+/g, ''),
                    address: `${formData.region}, ${formData.district}, ${formData.street}, ${formData.house}`,
                    location: formData.location,
                    comments: formData.comments
                },
                items: items.map(item => ({
                    product: item.productId,
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                        : parseFloat(item.price),
                    selectedColor: item.selectedColor,
                    selectedSize: item.selectedSize
                })),
                paymentMethod: formData.paymentMethod,
                totals: {
                    subtotal: total,
                    deliveryFee: 0,
                    promoCode: verifiedPromo ? verifiedPromo.code : null,
                    discountAmount: verifiedDiscountAmount,
                    total: verifiedFinalTotal
                },
                userId: user ? user._id || user.id : null
            };

            const result = await createOrder(orderData);

            if (result && result.success) {
                toast.success('Buyurtmangiz qabul qilindi!');
                clearCart();
                navigate('/mobile/profile');
            } else {
                toast.error('Xatolik yuz berdi');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Tizimda xatolik');
        } finally {
            setIsSubmitting(false);
        }
    };

    const regions = [
        'Bektemir', 'Chilanzar', 'Yashnobod', 'Mirobod',
        "Mirzo Ulug'bek", 'Sergeli', 'Shayxontohur', 'Olmazor',
        'Uchtepa', 'Yakkasaray', 'Yunusabad', 'Yangihayot'
    ];



    if (items.length === 0) {
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
        <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-amber-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-[20%] right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-900/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-5 py-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">Checkout</span>
                        <div className="flex gap-1.5 mt-1">
                            {[1, 2, 3].map(step => (
                                <div
                                    key={step}
                                    className={`w-8 h-1 rounded-full transition-all duration-500 ${step === currentStep ? 'bg-white shadow-[0_0_10px_white]' :
                                        step < currentStep ? 'bg-amber-500' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-9" /> {/* Spacer */}
                </div>
            </div>

            <div className={`transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

                {/* Step 1: Identity */}
                {currentStep === 1 && (
                    <div className="px-5 py-8 space-y-8 animate-fade-in-up">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-light tracking-tight">
                                <span className="font-serif italic text-amber-500 mr-2">Shaxsiy</span>
                                ma'lumotlar
                            </h2>
                            <p className="text-gray-500 text-sm">Buyurtma uchun aloqa ma'lumotlaringizni kiriting</p>
                        </div>

                        <div className="space-y-5">
                            <InputField
                                label="ISM"
                                icon={User}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Ismingiz"
                            />
                            <InputField
                                label="FAMILIYA"
                                icon={User}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Familiyangiz"
                            />
                            <InputField
                                label="TELEFON"
                                icon={Phone}
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+998 90 123 45 67"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Delivery */}
                {currentStep === 2 && (
                    <div className="px-5 py-8 space-y-6 animate-fade-in-up">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-light tracking-tight">
                                <span className="font-serif italic text-amber-500 mr-2">Yetkazib</span>
                                berish
                            </h2>
                            <p className="text-gray-500 text-sm">Manzilingizni xaritadan aniq belgilang</p>
                        </div>

                        <div className="space-y-5">
                            <div className="relative">
                                <div className="absolute left-4 top-3.5 text-amber-500 z-10">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-[16px] text-white appearance-none focus:outline-none focus:border-amber-500/50 transition-all font-sans"
                                >
                                    <option value="">Tuman tanlang</option>
                                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-4 w-4 h-4 text-gray-500 rotate-90" />
                            </div>
                            {showErrors && !formData.region && (
                                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Iltimos, tumanni tanlang</p>
                            )}

                            <InputField
                                label="KO'CHA VA UY"
                                icon={Navigation}
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="Ko'cha, uy raqami"
                            />

                            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative h-[280px]">
                                <MapContainer
                                    center={[41.2995, 69.2401]}
                                    zoom={12}
                                    style={{ height: '100%', width: '100%', background: '#121212' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker
                                        position={formData.location}
                                        setPosition={(pos) => setFormData(prev => ({ ...prev, location: pos }))}
                                    />
                                    <LocationButton />
                                </MapContainer>
                                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-[400]" />
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-[400]" />
                            </div>
                            {showErrors && !formData.location && (
                                <p className="text-red-500 text-xs mt-2 text-center font-medium animate-pulse">Iltimos, xaritadan joylashuvni belgilang</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Payment & Confirm */}
                {currentStep === 3 && (
                    <div className="px-5 py-8 space-y-6 animate-fade-in-up">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-light tracking-tight">
                                <span className="font-serif italic text-amber-500 mr-2">To'lov</span>
                                usuli
                            </h2>
                            <p className="text-gray-500 text-sm">Xavfsiz va qulay to'lov turini tanlang</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { value: 'cash', label: 'Naqd pul orqali', icon: Truck, color: 'text-amber-500' },
                                { value: 'click', label: 'Click Evolution', icon: Wallet, color: 'text-blue-500', isComingSoon: true },
                                { value: 'payme', label: 'Payme', icon: CreditCard, color: 'text-teal-500', isComingSoon: true }
                            ].map((method) => (
                                <button
                                    key={method.value}
                                    disabled={method.isComingSoon}
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                                    className={`relative group overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${method.isComingSoon
                                        ? 'bg-[#121212] border-white/5 opacity-40 cursor-not-allowed'
                                        : formData.paymentMethod === method.value
                                            ? 'bg-[#1a1a1a] border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                                            : 'bg-[#121212] border-white/5 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-white/5 ${method.color}`}>
                                            <method.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">{method.label}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                {method.isComingSoon ? 'Tez orada' : (method.value === 'cash' ? 'Yetkazilganda' : 'Online')}
                                            </p>
                                        </div>
                                        {formData.paymentMethod === method.value && !method.isComingSoon && (
                                            <div className="ml-auto text-amber-500">
                                                <CheckCircle className="w-6 h-6 fill-amber-500/20" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Order Capsule */}
                        <div className="mt-8 rounded-3xl bg-[#121212] border border-white/5 p-6 space-y-4">

                            {/* Promo section */}
                            <div className="mb-4 pb-4 border-b border-white/5">
                                {appliedPromo ? (
                                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                        <div>
                                            <p className="font-bold text-amber-500 uppercase tracking-widest text-xs flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {appliedPromo.code}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">-{appliedPromo.discountPercentage}% chegirma faol</p>
                                        </div>
                                        <button
                                            onClick={handleRemovePromo}
                                            className="text-gray-500 hover:text-white p-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 relative">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Promokodni kiriting"
                                            className="w-full bg-black border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 uppercase"
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={isValidatingPromo || !promoCode.trim()}
                                            className="absolute right-1 top-1 bottom-1 px-4 bg-white/5 hover:bg-white/10 text-amber-500 font-semibold text-xs rounded-xl tracking-wider uppercase transition-colors disabled:opacity-50"
                                        >
                                            {isValidatingPromo ? '...' : 'Tasdiq'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <div className="space-y-1 w-full relative">
                                    <p className="text-gray-500 text-xs uppercase tracking-wider">Jami summa</p>

                                    {appliedPromo && (
                                        <div className="flex items-center justify-between text-sm py-1">
                                            <span className="text-gray-400">Mahsulot</span>
                                            <span className="text-gray-400 line-through">{total.toLocaleString()} so'm</span>
                                        </div>
                                    )}

                                    {appliedPromo && (
                                        <div className="flex items-center justify-between text-sm py-1">
                                            <span className="text-amber-500">Chegirma</span>
                                            <span className="text-amber-500">-{discountAmount.toLocaleString()} so'm</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-1">
                                        <p className="text-2xl font-light text-white">{finalTotal.toLocaleString()} <span className="text-sm text-gray-400">so'm</span></p>
                                        <ShieldCheck className="w-5 h-5 text-gray-700 absolute right-0 bottom-2" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover opacity-80" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300 line-clamp-2 break-words leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-600 mt-1">{item.quantity} x {(parseFloat(String(item.price).replace(/[^0-9.]/g, ''))).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {items.length > 2 && <p className="text-xs text-gray-600 italic">+ yana {items.length - 2} ta mahsulot</p>}
                            </div>
                        </div>

                        <div className="h-5"></div>
                    </div>
                )}
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-6 left-5 right-5 z-[100]">
                <div className="flex gap-3">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 text-white active:scale-95 transition-transform"
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
                        className={`flex-1 h-14 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-800 cursor-wait' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Bajarilmoqda...</span>
                        ) : (
                            <>
                                {currentStep === 3 ? "To'lov qilish" : "Davom etish"}
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
        </div>
    );
};

export default MobileCheckout;
