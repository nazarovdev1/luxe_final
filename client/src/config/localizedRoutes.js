// Russian pages live under /ru. Only pages whose copy exists in Russian are listed:
// these get a /ru address, hreflang pairs and a place in the sitemap.
// Product and blog pages stay single-language because their content is entered once.

export const RU_PREFIX = '/ru';

export const RU_STATIC_ROUTES = ['/', '/products', '/about', '/contact', '/faq', '/bundles', '/lookbooks'];

export const hasRussianVersion = (path = '/') =>
  RU_STATIC_ROUTES.includes(path) || /^\/kategoriya\/[^/]+$/.test(path);

// "/ru/products" -> { language: 'ru', path: '/products' }; "/products" -> { language: null, path: '/products' }
export const splitLanguagePrefix = (pathname = '/') => {
  if (pathname === RU_PREFIX || pathname.startsWith(`${RU_PREFIX}/`)) {
    return { language: 'ru', path: pathname.slice(RU_PREFIX.length) || '/' };
  }
  return { language: null, path: pathname || '/' };
};

export const withLanguagePrefix = (path = '/', language) => {
  if (language !== 'ru') return path;
  return path === '/' ? RU_PREFIX : `${RU_PREFIX}${path}`;
};

export const urlLanguage = () => (
  typeof window !== 'undefined' ? splitLanguagePrefix(window.location.pathname).language : null
);

export const SAVED_LANGUAGE_KEY = 'luxx_language';
const BOT_AGENT = /bot|crawl|spider|slurp|Google-InspectionTool|GoogleOther|facebookexternalhit|Lighthouse/i;

// The address decides between Uzbek and Russian; a saved English choice is kept on unprefixed pages.
export const initialLanguage = (pathname = '/', saved = null) => {
  if (splitLanguagePrefix(pathname).language === 'ru') return 'ru';
  return ['uz', 'ru', 'en'].includes(saved) ? saved : 'uz';
};

// A visitor who chose Russian earlier and opens an Uzbek address is sent to its /ru twin
// (crawlers and the admin stay where they are). Returns null when no move is needed.
export const languageRedirectTarget = ({ pathname = '/', search = '', hash = '' } = {}, saved = null, userAgent = '') => {
  const { language, path } = splitLanguagePrefix(pathname);
  if (language || saved !== 'ru' || BOT_AGENT.test(userAgent)) return null;
  if (/^\/(mobile\/)?admin(\/|$)/.test(path)) return null;
  return `${withLanguagePrefix(path, 'ru')}${search}${hash}`;
};

// Where the same page lives in another language: "/ru/mobile/products" + 'uz' -> "/mobile/products".
export const pathForLanguage = (pathname = '/', language = 'uz') =>
  withLanguagePrefix(splitLanguagePrefix(pathname).path, language === 'ru' ? 'ru' : null);

// Path inside the app, without /ru and without /mobile: what canonical and hreflang are built from.
export const contentPath = (pathname = '/') => {
  const { path } = splitLanguagePrefix(pathname);
  return path.replace(/^\/mobile(?=\/|$)/, '') || '/';
};
