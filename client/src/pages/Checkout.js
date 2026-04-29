import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  CreditCard,
  MapPin,
  Navigation,
  Phone,
  Gem,
  Truck,
  User,
  Tag,
  X
} from 'lucide-react';
import useProductService from '../server/server';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import OrderSuccessModal from '../components/OrderSuccessModal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

const REGIONS = [
  'Bektemir',
  'Chilanzar',
  'Yashnobod',
  'Mirobod',
  "Mirzo Ulug'bek",
  'Sergeli',
  'Shayxontohur',
  'Olmazor',
  'Uchtepa',
  'Yakkasaray',
  'Yunusabad',
  'Yangihayot',
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

const DotLoader = ({ colorClass = 'bg-[#111319]' }) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass}`} />
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass} [animation-delay:120ms]`} />
      <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${colorClass} [animation-delay:240ms]`} />
    </span>
  );
};

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(event) {
      setPosition(event.latlng);
      map.flyTo(event.latlng, map.getZoom());
    },
    locationfound(event) {
      setPosition(event.latlng);
      map.flyTo(event.latlng, map.getZoom());
    },
    locationerror() {
      toast.error("Joylashuvni aniqlab bo'lmadi. Xaritadan belgilang.");
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function LocationButton() {
  const map = useMap();

  const handleLocate = (event) => {
    event.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar !border-0 !bg-transparent !shadow-none">
        <button
          onClick={handleLocate}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2130] text-[#f4f1eb] shadow-[0_8px_20px_rgba(8,10,18,0.45)] transition-colors hover:bg-[#232b3e]"
          title="Mening manzilim"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading, token } = useAuth();
  const { createOrder } = useProductService();

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
    paymentMethod: 'cash',
    comments: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [userTier, setUserTier] = useState(null);

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
      toast.error("Iltimos, buyurtma berish uchun ro'yxatdan o'ting");
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

  const summaryTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.parsedPrice * item.quantity, 0);
  }, [cartItems]);

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
      if (appliedPromo.discountAmount) {
        promoDiscount = appliedPromo.discountAmount;
      } else {
        promoDiscount = (summaryTotal * appliedPromo.discountPercentage) / 100;
      }
    }
    return promoDiscount + tierDiscountAmount;
  }, [summaryTotal, appliedPromo, tierDiscountAmount]);

  const deliveryFee = 0; // Free delivery for all
  const finalTotal = summaryTotal - discountAmount + deliveryFee;

  const isStep1Valid = formData.firstName.trim() && formData.phone.trim();
  const isStep2Valid = formData.region.trim() && formData.street.trim();
  const canSubmit = isStep1Valid && isStep2Valid && agreeTerms && !isSubmitting;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextFromStep1 = () => {
    if (!isStep1Valid) {
      toast.error("Iltimos, ism va telefon raqamni to'ldiring");
      return;
    }
    setCurrentStep(2);
  };

  const nextFromStep2 = () => {
    if (!isStep2Valid) {
      toast.error("Iltimos, tuman va manzilni to'ldiring");
      return;
    }
    setCurrentStep(3);
  };

  const { validatePromo, validateCoupon } = useProductService();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      // First try generic promo
      const promoResult = await validatePromo(promoCode.trim());
      if (promoResult.success) {
        setAppliedPromo({
          code: promoResult.code,
          discountPercentage: promoResult.discountPercentage,
          type: 'percentage'
        });
        toast.success(`${promoResult.discountPercentage}% chegirma qo'llanildi!`);
        setIsValidatingPromo(false);
        return;
      }

      // If promo fails, try user-specific coupon
      const couponResult = await validateCoupon(promoCode.trim(), summaryTotal, token);
      if (couponResult.success) {
        setAppliedPromo({
          code: couponResult.code,
          discountPercentage: couponResult.type === 'percentage' ? couponResult.value : (couponResult.discount / summaryTotal) * 100,
          discountAmount: couponResult.discount,
          type: couponResult.type
        });
        toast.success(`Kupon qo'llanildi!`);
      } else {
        setAppliedPromo(null);
        toast.error(couponResult.message || "Kupon yoki promokod noto'g'ri");
      }
    } catch (error) {
      toast.error('Promokodni tekshirishda xatolik yuz berdi');
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

    if (items.length === 0) {
      toast.error("Savatingiz bo'sh");
      return;
    }

    if (!isStep1Valid || !isStep2Valid) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (!agreeTerms) {
      toast.error('Buyurtmani tasdiqlash uchun shartlarga rozilik belgilang');
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
        items: cartItems.map((item) => ({
          product: item.productId || item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.parsedPrice,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
        })),
        paymentMethod: formData.paymentMethod || 'cash',
        totals: {
          subtotal: summaryTotal,
          deliveryFee: 0,
          promoCode: appliedPromo ? appliedPromo.code : null,
          discountAmount: discountAmount || 0,
          total: finalTotal,
        },
        userId: user ? user._id || user.id : null,
      };

      const result = await createOrder(orderData);

      if (result && result.success) {
        setCreatedOrderId(result.orderId);
        setShowSuccessModal(true);
        clearCart();
        // Modal handles navigation
      } else {
        toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Tizimda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen px-4" style={{ backgroundColor: THEME.bgBase }}>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] bg-gradient-to-b from-[#171d2a] to-[#111722] px-8 py-10 text-center shadow-[0_28px_56px_rgba(4,8,18,0.58)]">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1f2532]">
              <Truck className="h-8 w-8 text-[#c7ceda]" />
            </div>
            <h1 className="text-3xl font-semibold text-[#f4f1eb]">Savatingiz bo'sh</h1>
            <p className="mt-2 text-[#9aa3b2]">Buyurtma berishdan oldin mahsulot tanlang va savatga qo'shing.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f4f1eb] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#111319] transition-transform active:scale-[0.985]"
            >
              Xaridni boshlash
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
              Orqaga
            </button>

            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2]">Checkout</p>
              <h1 className="text-lg font-semibold text-[#f4f1eb]">Cinematic Concierge</h1>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1f2532] px-3 py-1 text-xs font-semibold text-[#c7ceda]">

              {currentStep}/3
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] p-6 shadow-[0_28px_56px_rgba(4,8,18,0.6)] sm:p-7">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[#9aa3b2]">Order flow</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-[#f4f1eb]">Buyurtmani rasmiylashtirish</h2>
              <p className="mt-2 text-sm text-[#9aa3b2]">Ma'lumotlarni 3 qadamda to'ldiring va buyurtmani tasdiqlang.</p>

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
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">Shaxsiy ma'lumotlar</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm text-[#c7ceda]">Ism *</span>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                        placeholder="Ismingiz"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm text-[#c7ceda]">Familiya</span>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                        placeholder="Familiyangiz"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Telefon raqam *</span>
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
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">Yetkazib berish manzili</h3>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Tuman tanlang *</span>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                    >
                      <option value="">Tanlang</option>
                      {REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Ko'cha va uy *</span>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder="Ko'cha nomi, uy raqami"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Mo'ljal (ixtiyoriy)</span>
                    <input
                      type="text"
                      name="house"
                      value={formData.house}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder="Masalan: Maktab yonida"
                    />
                  </label>

                  <div>
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Xaritadan belgilash</span>
                    <div className="h-[230px] w-full overflow-hidden rounded-xl bg-[#0e131d] shadow-[0_14px_30px_rgba(3,6,14,0.45)]">
                      <MapContainer center={[41.2995, 69.2401]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                          position={formData.location}
                          setPosition={(position) => setFormData((prev) => ({ ...prev, location: position }))}
                        />
                        <LocationButton />
                      </MapContainer>
                    </div>
                    <p className="mt-2 text-xs text-[#9aa3b2]">Aniq nuqtani belgilasangiz yetkazish tezlashadi.</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 rounded-[1.4rem] bg-[#121722]/70 p-5 shadow-[inset_0_0_24px_rgba(26,32,45,0.45)]">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d3442]/70 text-[#f4f1eb]">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#f4f1eb]">To'lov va yakuniy tekshiruv</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`rounded-xl p-4 text-center transition-all ${formData.paymentMethod === 'cash'
                          ? 'bg-[#f4f1eb] text-[#111319] shadow-[0_10px_22px_rgba(244,241,235,0.24)]'
                          : 'bg-[#1a202d] text-[#c7ceda]'
                          }`}
                      >
                        <Truck className="mx-auto mb-2 h-6 w-6" />
                        <p className="text-sm font-semibold">Naqd pul</p>
                      </div>
                    </label>

                    <div className="relative rounded-xl bg-[#1a202d]/65 p-4 text-center text-[#9aa3b2] opacity-70">
                      <span className="absolute right-2 top-2 rounded-full bg-[#2d3442] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#c7ceda]">
                        Tez orada
                      </span>
                      <p className="mb-2 text-base font-semibold">CLICK</p>
                      <p className="text-sm">Click orqali</p>
                    </div>

                    <div className="relative rounded-xl bg-[#1a202d]/65 p-4 text-center text-[#9aa3b2] opacity-70">
                      <span className="absolute right-2 top-2 rounded-full bg-[#2d3442] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#c7ceda]">
                        Tez orada
                      </span>
                      <p className="mb-2 text-base font-semibold">Payme</p>
                      <p className="text-sm">Payme orqali</p>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm text-[#c7ceda]">Izoh (ixtiyoriy)</span>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-3 text-[16px] lg:text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-2 focus:ring-[#f4f1eb]/20"
                      placeholder="Buyurtma bo'yicha qo'shimcha izoh..."
                    />
                  </label>

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
                      Buyurtmani tasdiqlash orqali foydalanish shartlariga rozilik bildiraman.
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
                    Orqaga
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
                    Davom etish
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <p className="text-sm text-[#9aa3b2]">Yakuniy tasdiq uchun o'ng paneldagi tugmadan foydalaning.</p>
                )}
              </div>
            </form>
          </section>

          <aside className="xl:sticky xl:top-20 xl:h-fit">
            <div className="rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] p-6 shadow-[0_28px_56px_rgba(4,8,18,0.6)]">
              <h3 className="text-xl font-semibold text-[#f4f1eb]">Order Capsule</h3>
              <p className="mt-1 text-sm text-[#9aa3b2]">Tanlangan mahsulotlar va yakuniy to'lov.</p>

              <div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl bg-[#1a202d]/70 p-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#f4f1eb]">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#9aa3b2]">
                        {item.quantity} dona
                        {item.selectedSize ? ` • ${item.selectedSize}` : ''}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#c7ceda]">{formatMoney(item.parsedPrice * item.quantity)} so'm</p>
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
                          <p className="text-xs text-emerald-500/80">-{appliedPromo.discountPercentage}% chegirma</p>
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
                        placeholder="Promokod (agar bo'lsa)"
                        className="w-full flex-1 rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-2 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none transition focus:border-[#f4f1eb] focus:ring-1 focus:ring-[#f4f1eb]/20 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isValidatingPromo || !promoCode.trim()}
                        className="rounded-xl border border-[#2d3442] bg-[#1a202d] px-4 py-2 text-sm font-semibold text-[#f4f1eb] hover:bg-[#2d3442] transition-colors disabled:opacity-50"
                      >
                        {isValidatingPromo ? '...' : 'Qo\'llash'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-[#9aa3b2]">
                  <span>Mahsulot</span>
                  <span>{formatMoney(summaryTotal)} so'm</span>
                </div>

                {userTier && tierDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-[#d6b47c]">
                    <div className="flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5" />
                      <span>{userTier.level} Member chegirmasi</span>
                    </div>
                    <span>-{formatMoney(tierDiscountAmount)} so'm</span>
                  </div>
                )}

                {appliedPromo && (
                  <div className="flex items-center justify-between text-sm text-emerald-400">
                    <span>Promokod ({appliedPromo.code})</span>
                    <span>-{formatMoney(discountAmount - tierDiscountAmount)} so'm</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-[#9aa3b2]">
                  <span>Yetkazib berish</span>
                  <span className="text-emerald-400 font-medium">Bepul</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#2d3442] pt-3">
                  <span className="text-base font-semibold text-[#f4f1eb]">Jami</span>
                  <span className="text-2xl font-semibold text-[#f4f1eb]">{formatMoney(finalTotal)} so'm</span>
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
                    <span>Rasmiylashtirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Buyurtmani tasdiqlash</span>
                  </>
                )}
              </button>

              {currentStep !== 3 && <p className="mt-3 text-center text-xs text-[#9aa3b2]">Final tasdiq uchun 3-qadamga o'ting.</p>}
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
