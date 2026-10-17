import { OPENING_SALE_ENDS_AT } from '../config/policies';

// Trust rules for product display: never show a rating without real reviews,
// never show a crossed-out price without a dated, still-running promotion.

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const getReviewSummary = (product = {}) => {
  const count = Math.max(0, Math.trunc(toNumber(product?.numOfReviews)));
  const rating = toNumber(product?.rating);
  const show = count > 0 && rating > 0;
  return { show, rating: show ? Math.round(rating * 10) / 10 : 0, count };
};

export const getActiveSale = (product = {}, now = new Date()) => {
  const price = toNumber(product?.price);
  const originalPrice = toNumber(product?.originalPrice);
  const endsAt = new Date(product?.saleEndsAt || OPENING_SALE_ENDS_AT);
  const active = originalPrice > price && price > 0
    && !Number.isNaN(endsAt.getTime()) && endsAt.getTime() > new Date(now).getTime();

  return {
    active,
    originalPrice: active ? originalPrice : null,
    endsAt: active ? endsAt : null,
    percent: active ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
  };
};

// Badges that reflect a fact about the product. BESTSELLER is ignored until there is real sales data.
const TRUSTED_BADGES = new Set(['NEW', 'LIMITED']);

export const getDisplayBadge = (product = {}) => {
  const badge = String(product?.badge || '').toUpperCase();
  return TRUSTED_BADGES.has(badge) ? badge : '';
};

const SALE_MONTHS = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

// "Ochilish narxi · 31-dekabrgacha" style note for an active promotion.
export const formatSaleNote = (endsAt, language = 'uz') => {
  if (!endsAt) return '';
  const date = new Date(endsAt);
  if (Number.isNaN(date.getTime())) return '';
  const day = Number(new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'Asia/Tashkent' }).format(date));
  const month = Number(new Intl.DateTimeFormat('en-GB', { month: 'numeric', timeZone: 'Asia/Tashkent' }).format(date)) - 1;
  if (language === 'ru') return `Цена открытия · до ${day} ${SALE_MONTHS.ru[month]}`;
  if (language === 'en') return `Opening price · until ${SALE_MONTHS.en[month]} ${day}`;
  return `Ochilish narxi · ${day}-${SALE_MONTHS.uz[month]}gacha`;
};

export const formatPrice = (value) => {
  const number = Math.round(toNumber(value));
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
