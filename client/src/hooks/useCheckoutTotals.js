import { useMemo } from 'react';

export const GIFT_WRAP_OPTIONS = {
  classic: { name: 'Klassik qadoqlash', price: 25000, desc: "Chiroyli qog'oz va lenta bilan" },
  premium: { name: 'Premium qadoqlash', price: 45000, desc: 'Luxury quti, lenta va gullar bilan' },
  minimal: { name: 'Minimal qadoqlash', price: 15000, desc: 'Oddiy lekin zamonaviy qadoqlash' },
};

export const DELIVERY_TIME_SLOTS = [
  { value: 'morning', label: '09:00 - 12:00', hint: 'Ertalab' },
  { value: 'afternoon', label: '12:00 - 15:00', hint: 'Tushdan keyin' },
  { value: 'evening', label: '15:00 - 18:00', hint: 'Kechki' },
  { value: 'late_evening', label: '18:00 - 21:00', hint: 'Kechki slot' },
  { value: 'express', label: '2 soat ichida', hint: '+25 000 so\'m' },
];

export const getDeliveryDates = () => (
  Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      date: date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
    };
  })
);

const parsePrice = (value) => {
  if (typeof value === 'string') return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  return parseFloat(value) || 0;
};

export const useCheckoutTotals = ({
  items = [],
  lookItems = [],
  appliedPromo = null,
  userTier = null,
  giftWrap = false,
  giftWrapType = 'classic',
  scheduledDelivery = false,
  deliveryTimeSlot = '',
} = {}) => {
  const cartItems = useMemo(
    () => items.map((item) => ({ ...item, parsedPrice: parsePrice(item.price) })),
    [items]
  );

  const lookItemsTotal = useMemo(
    () => lookItems.reduce((sum, look) => sum + (look.discountedPrice || 0), 0),
    [lookItems]
  );

  const lookDiscountsTotal = useMemo(
    () => lookItems.reduce((sum, look) => sum + (look.discountAmount || 0), 0),
    [lookItems]
  );

  const summaryTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.parsedPrice * item.quantity, 0) + lookItemsTotal,
    [cartItems, lookItemsTotal]
  );

  const tierDiscountAmount = useMemo(() => {
    const level = userTier?.level;
    if (level === 'Gold') return (summaryTotal * 10) / 100;
    if (level === 'Diamond') return (summaryTotal * 15) / 100;
    return 0;
  }, [summaryTotal, userTier]);

  const promoDiscountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'giftcard') return appliedPromo.discountAmount || 0;
    if (appliedPromo.discountAmount) return appliedPromo.discountAmount;
    return (summaryTotal * (appliedPromo.discountPercentage || 0)) / 100;
  }, [appliedPromo, summaryTotal]);

  const discountAmount = promoDiscountAmount + tierDiscountAmount;
  const giftWrapCost = giftWrap ? (GIFT_WRAP_OPTIONS[giftWrapType]?.price || 0) : 0;
  const expressDeliveryFee = scheduledDelivery && deliveryTimeSlot === 'express' ? 25000 : 0;
  const finalTotal = Math.max(summaryTotal - discountAmount + giftWrapCost + expressDeliveryFee, 0);

  return {
    cartItems,
    lookItemsTotal,
    lookDiscountsTotal,
    summaryTotal,
    tierDiscountAmount,
    promoDiscountAmount,
    discountAmount,
    giftWrapCost,
    expressDeliveryFee,
    finalTotal,
  };
};

export default useCheckoutTotals;
