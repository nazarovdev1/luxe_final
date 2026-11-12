import { getAllImageUrls, resolveImageUrl } from '../../utils/image';

export const localizeBundleField = (value, language) => {
  if (typeof value === 'string') return value;
  return value?.[language] || value?.uz || value?.ru || value?.en || '';
};

const asOptions = (value, splitSizes = false) => {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return [...new Set(values.flatMap((item) => String(item).trim().split(splitSizes ? /[\s,]+/ : /\s*,\s*/)).filter(Boolean))];
};

export const normalizeEditorialProduct = (product) => {
  const images = getAllImageUrls(product).filter((url) => !url.includes('/placeholder'));
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return {
    ...product,
    id: product.id || product._id,
    images,
    image: images[0] || '',
    price: Math.max(0, Number(product.price) || 0),
    colors: [...new Set([...asOptions(product.colors), ...variants.map((variant) => variant.color).filter(Boolean)])],
    sizes: [...new Set([...asOptions(product.sizes, true), ...variants.map((variant) => variant.size).filter(Boolean)])],
    variants,
  };
};

export const isBundleOptionAvailable = (product, color, size) => {
  if (!product.variants.length) return product.stock === undefined || Number(product.stock) > 0;
  return product.variants.some((variant) => variant.isActive !== false &&
    (variant.stock === undefined || Number(variant.stock) > 0) &&
    (!color || !variant.color || variant.color === color) &&
    (!size || !variant.size || variant.size === size));
};

export const getEditorialPrices = (bundle, products) => {
  const productTotal = products.reduce((sum, product) => sum + product.price, 0);
  const original = Number.isFinite(Number(bundle.originalPrice)) && Number(bundle.originalPrice) > 0
    ? Number(bundle.originalPrice) : productTotal;
  const discount = Math.max(0, Number(bundle.discountValue) || 0);
  const calculated = Math.max(0, original - (bundle.discountType === 'fixed' ? discount : original * Math.min(discount, 100) / 100));
  const discounted = bundle.discountedPrice !== undefined && bundle.discountedPrice !== null && Number.isFinite(Number(bundle.discountedPrice))
    ? Math.min(original, Math.max(0, Number(bundle.discountedPrice))) : calculated;
  return { original, discounted, savings: Math.max(0, original - discounted) };
};

export const getBundleGallery = (bundle, products) => {
  const photos = [
    { url: resolveImageUrl(bundle.heroImage), label: bundle.title },
    ...products.map((product) => ({ url: product.image, label: product.name })),
    ...products.flatMap((product) => product.images.map((url) => ({ url, label: product.name }))),
  ].filter((photo) => photo.url);
  return [...new Map(photos.map((photo) => [photo.url, photo])).values()];
};
