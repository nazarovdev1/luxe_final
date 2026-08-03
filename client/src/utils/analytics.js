const canTrack = () => 
  typeof window !== 'undefined' && 
  Array.isArray(window.dataLayer) && 
  !import.meta.env.DEV;

export const trackEvent = (event, payload = {}) => {
  if (!canTrack()) return;
  window.dataLayer.push({ event, ...payload });
};

export const productAnalyticsPayload = (product, extras = {}) => ({
  ecommerce: {
    currency: 'UZS',
    value: Number(product?.price) || 0,
    items: [{
      item_id: product?._id || product?.id,
      item_name: product?.name,
      item_category: product?.category,
      price: Number(product?.price) || 0,
      ...extras,
    }],
  },
});
