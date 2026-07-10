/**
 * Shared image normalization helpers.
 *
 * Product/bundle images come from the API in several shapes:
 *   - a plain string URL                  "https://.../x.jpg"
 *   - { image: "..." } string field
 *   - { images: ["url", ...] }            array of strings
 *   - { images: [{ url: "..." }, ...] }   array of objects
 *   - { image: { url: "..." } }           object with url
 *   - { image: { 0: "h", 1: "t", ... } }  char-indexed object (legacy)
 *   - bundle.heroImage may be a string or char-indexed object
 *
 * These helpers collapse every variant into a single string URL.
 */

const FALLBACK_IMAGE = '/placeholder.jpg';

// Reconstruct a URL from a legacy char-indexed object like { 0: 'h', 1: 't', ... }
const fromCharObject = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  const keys = Object.keys(obj).filter((k) => !Number.isNaN(Number(k)));
  if (keys.length < 4) return '';
  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => obj[k])
    .join('');
};

// Resolve a field that could be a string URL, an { url } object, or a char-indexed object.
export const resolveImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    if (typeof value.url === 'string' && value.url) return value.url.trim();
    const reconstructed = fromCharObject(value);
    if (reconstructed && /^https?:\/\//i.test(reconstructed)) return reconstructed;
  }
  return '';
};

// Pick the first usable URL out of an images array (mixed strings/objects allowed).
const firstFromArray = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return '';
  for (const item of images) {
    const url = typeof item === 'string' ? item.trim() : resolveImageUrl(item);
    if (url) return url;
  }
  return '';
};

/**
 * Get a single string image URL from any product-like source.
 * @param {object|string|null|undefined} source
 * @param {string} [fallback='/placeholder.jpg']
 * @returns {string}
 */
export const getImageUrl = (source, fallback = FALLBACK_IMAGE) => {
  if (!source) return fallback;
  if (typeof source === 'string') return source.trim() || fallback;

  // heroImage / direct string fields
  const direct = resolveImageUrl(source.image);
  if (direct) return direct;

  // images array
  const fromImages = firstFromArray(source.images);
  if (fromImages) return fromImages;

  return fallback;
};

/**
 * Collect ALL image URLs from a product (used for galleries).
 * @param {object} source
 * @returns {string[]}
 */
export const getAllImageUrls = (source) => {
  const out = [];
  if (!source) return out;

  if (typeof source === 'string') {
    if (source.trim()) out.push(source.trim());
    return out;
  }

  const direct = resolveImageUrl(source.image);
  if (direct) out.push(direct);

  if (Array.isArray(source.images)) {
    source.images.forEach((item) => {
      const url = typeof item === 'string' ? item.trim() : resolveImageUrl(item);
      if (url && !out.includes(url)) out.push(url);
    });
  }

  return out;
};

/**
 * Normalize a bundle product (from populated API response or context)
 * into a clean shape used by all bundle UI components.
 */
export const normalizeBundleProduct = (product) => {
  if (!product) return null;
  const id = product.id || product._id;
  return {
    ...product,
    id,
    image: getImageUrl(product),
    images: getAllImageUrls(product),
    price: Number(product.price) || 0,
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
  };
};

export const FALLBACK = FALLBACK_IMAGE;
export default getImageUrl;
