// Runs after `vite build`. Writes a crawlable HTML shell for every public page
// (title, meta, canonical, hreflang, JSON-LD and real text inside #root), a 404 page
// and sitemap.xml. React replaces the shell content once JavaScript starts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The shared config files are ES modules inside a package without "type": "module";
// Node loads them fine but warns about each one. That warning is noise here.
process.removeAllListeners('warning');

const { landingsForProducts, productsInLanding, categoryPath, landingForCategory } = await import('../src/config/categoryLandings.js');
const { productPath, productIdOf } = await import('../src/utils/productUrl.js');
const { RETURN_DAYS, OPENING_SALE_ENDS_AT, POLICY_COPY } = await import('../src/config/policies.js');
const { RU_STATIC_ROUTES, withLanguagePrefix } = await import('../src/config/localizedRoutes.js');

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(rootDir, 'build');
const siteUrl = 'https://luxx.uz';
const apiUrl = (process.env.VITE_API_URL || process.env.REACT_APP_API_URL ||
  'https://luxe-backend-355636248339.us-central1.run.app/api').replace(/\/$/, '');
const defaultSocialImage = `${siteUrl}/hero.jpg`;
const verificationTags = [
  ['google-site-verification', process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION],
  ['yandex-verification', process.env.YANDEX_VERIFICATION || process.env.VITE_YANDEX_VERIFICATION],
].filter(([, value]) => value && value.trim());

// [route, uz [title, description, h1], ru [title, description, h1] | null]
const staticPages = [
  ['/', ['Premium ayollar kiyimlari Toshkentda | Luxx.uz', "Toshkentdagi premium ayollar kiyimlari do'koni. Paltolar, kostyumlar va zamonaviy kolleksiyalar: shu kuni bepul yetkazish, uyda kiyib ko'rib to'lash.", 'Toshkentdagi premium ayollar kiyimlari'],
    ['Премиальная женская одежда в Ташкенте | Luxx.uz', 'Магазин премиальной женской одежды в Ташкенте. Пальто, костюмы и современные коллекции: бесплатная доставка в тот же день, примерка дома.', 'Премиальная женская одежда в Ташкенте']],
  ['/products', ['Premium ayollar kiyimlari katalogi | Luxx.uz', "Luxx.uz ayollar kiyimlari katalogi: premium paltolar, kostyumlar, blazerlar va zamonaviy obrazlar. Toshkent bo'ylab shu kuni yetkazish.", 'Premium ayollar kiyimlari'],
    ['Каталог премиальной женской одежды | Luxx.uz', 'Каталог женской одежды Luxx.uz: премиальные пальто, костюмы, блейзеры и готовые образы. Доставка по Ташкенту в тот же день.', 'Премиальная женская одежда']],
  ['/about', ['Luxx.uz haqida | Premium ayollar modasi', "Luxx.uz do'koni, sifat talablari va O'zbekiston ayollari uchun saralangan premium kolleksiyalar haqida.", 'Luxx.uz haqida'],
    ['О Luxx.uz | Премиальная женская мода', 'О магазине Luxx.uz, наших требованиях к качеству и премиальных коллекциях для женщин Узбекистана.', 'О Luxx.uz']],
  ['/blog', ['Moda va uslub bo‘yicha maslahatlar | Luxx.uz Blog', "Ayollar modasi, kiyim kombinatsiyalari, trendlar, o'lcham tanlash va kiyim parvarishi bo'yicha foydali maqolalar.", 'Ayollar modasi va uslub bo‘yicha maslahatlar'], null],
  ['/lookbooks', ['Ayollar uchun tayyor obrazlar va lookbook | Luxx.uz', "Premium ayollar kiyimlaridan tuzilgan tayyor obrazlar, mavsumiy lookbooklar va uslub g'oyalari.", 'Tayyor obrazlar va lookbook'],
    ['Готовые женские образы и лукбуки | Luxx.uz', 'Готовые образы из премиальной женской одежды, сезонные лукбуки и идеи стиля.', 'Готовые образы и лукбуки']],
  ['/bundles', ["Tayyor to'plamlar | Luxx.uz", "Bir-biriga mos kiyimlardan tuzilgan tayyor to'plamlar. Birga olsangiz, alohida olgandan arzonroq.", "Tayyor to'plamlar"],
    ['Готовые комплекты | Luxx.uz', 'Готовые комплекты из вещей, которые подходят друг другу. Вместе дешевле, чем по отдельности.', 'Готовые комплекты']],
  ['/faq', ["Buyurtma va yetkazib berish savollari | Luxx.uz", "Luxx.uz buyurtma, to'lov, Toshkent bo'ylab yetkazib berish, o'lcham va qaytarish bo'yicha savollarga javoblar.", "Ko'p beriladigan savollar"],
    ['Вопросы о заказе и доставке | Luxx.uz', 'Ответы на вопросы о заказе, оплате, доставке по Ташкенту, размерах и возврате в Luxx.uz.', 'Частые вопросы']],
  ['/contact', ["Luxx.uz bilan bog'lanish", "Luxx.uz bilan telefon, Telegram yoki sayt orqali bog'laning. Mahsulot, o'lcham va buyurtma bo'yicha yordam oling.", "Biz bilan bog'lanish"],
    ['Контакты Luxx.uz', 'Свяжитесь с Luxx.uz по телефону, в Telegram или на сайте. Поможем с товаром, размером и заказом.', 'Контакты']],
  ['/gift-cards', ["Premium sovg'a kartalari | Luxx.uz", "Yaqinlaringiz uchun Luxx.uz premium sovg'a kartasini tanlang.", "Sovg'a kartalari"], null],
  ['/vip-club', ['Luxx.uz VIP Club', "Luxx.uz VIP Club imtiyozlari, ballar va doimiy mijozlar uchun maxsus takliflar.", 'Luxx.uz VIP Club'], null],
  ['/eco-impact', ["Barqaror moda va ekologik ta'sir | Luxx.uz", "Luxx.uz xaridlarining ekologik ta'siri va barqaror moda tashabbuslari haqida.", 'Barqaror moda'], null],
  ['/privacy-policy', ['Maxfiylik siyosati | Luxx.uz', "Luxx.uz shaxsiy ma'lumotlarni saqlash va himoya qilish siyosati.", 'Maxfiylik siyosati'], null],
  ['/terms', ['Foydalanish shartlari | Luxx.uz', "Luxx.uz buyurtma, to'lov, yetkazib berish va qaytarish shartlari.", 'Foydalanish shartlari'], null],
];

const UI = {
  uz: {
    home: 'Bosh sahifa', catalogue: 'Ayollar kiyimlari', categories: 'Bo‘limlar', featured: 'Saralangan mahsulotlar',
    allProducts: 'Barcha mahsulotlar', blog: 'Moda blogi', about: 'Luxx.uz haqida', faq: 'Yetkazib berish va qaytarish savollari',
    sum: 'so‘m', sizes: 'O‘lchamlar', colors: 'Ranglar', category: 'Bo‘lim', more: 'Shu bo‘limdan yana',
    homeLead: 'Luxx.uz katalogida ayollar kostyumlari, jaketlar, paltolar va tayyor to‘plamlar saralangan. Har bir mahsulot sahifasida narx, o‘lcham va tavsif bor.',
    productsLead: 'Toshkent uchun saralangan premium ayollar kiyimlari: kostyum, blazer, jaket, palto va tayyor obrazlar. O‘lcham, narx va tavsifni tekshirib, o‘zingizga mos modelni tanlang.',
    otherCategories: 'Boshqa bo‘limlar', bundles: "Tayyor to'plamlar", bundleLead: "Bu to'plamdagi kiyimlar bir-biriga mos tanlangan.",
    notFound: 'Sahifa topilmadi', notFoundLead: 'Bu manzilda sahifa yo‘q. Katalogdan yoki bosh sahifadan davom eting.', fromCatalogue: 'Katalogdan',
  },
  ru: {
    home: 'Главная', catalogue: 'Женская одежда', categories: 'Разделы', featured: 'Избранные товары',
    allProducts: 'Все товары', blog: 'Блог', about: 'О Luxx.uz', faq: 'Вопросы о доставке и возврате',
    sum: 'сум', sizes: 'Размеры', colors: 'Цвета', category: 'Раздел', more: 'Ещё из этого раздела',
    homeLead: 'В каталоге Luxx.uz собраны женские костюмы, жакеты, пальто и готовые комплекты. На странице каждого товара указаны цена, размеры и описание.',
    productsLead: 'Премиальная женская одежда, отобранная для Ташкента: костюмы, блейзеры, жакеты, пальто и готовые образы. Проверьте размер, цену и описание и выберите свою модель.',
    otherCategories: 'Другие разделы', bundles: 'Готовые комплекты', bundleLead: 'Вещи в этом комплекте подобраны друг к другу.',
    notFound: 'Страница не найдена', notFoundLead: 'По этому адресу страницы нет. Продолжите с каталога или главной страницы.', fromCatalogue: 'Из каталога',
  },
};

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const localizedValue = (value) => {
  if (typeof value === 'string') return value.trim();
  return value?.uz?.trim?.() || value?.ru?.trim?.() || value?.en?.trim?.() || '';
};

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const formatPrice = (value) => Number(value || 0).toLocaleString('ru-RU');
const absoluteUrl = (route) => `${siteUrl}${route === '/' ? '/' : route}`;
const absoluteImage = (value) => {
  if (!value) return defaultSocialImage;
  return /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

const productImages = (product) => {
  const list = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
    .map((entry) => (typeof entry === 'object' ? entry?.url : entry))
    .filter(Boolean);
  return [...new Set(list)];
};
const productImage = (product) => productImages(product)[0] || '';
const listOf = (values) => (Array.isArray(values) ? values : [])
  .map((value) => (typeof value === 'object' ? value?.name || value?.label || value?.value : value))
  .filter(Boolean).map(String);
// Colours are often stored as hex swatches; those mean nothing to a reader or to Google.
const colourNames = (values) => listOf(values).filter((value) => !/^#[0-9a-f]{3,8}$/i.test(value.trim()));

const activeSale = (product, now = new Date()) => {
  const original = Number(product.originalPrice);
  const ends = new Date(product.saleEndsAt || OPENING_SALE_ENDS_AT);
  return original > Number(product.price) && ends > now ? ends : null;
};

const seoShell = (content, lang = 'uz') => `<div data-seo-shell="true" lang="${lang}" style="min-height:100vh;background:#08090b;color:#f7f2e8;padding:clamp(24px,5vw,72px);font-family:Arial,sans-serif">
  <main style="max-width:1120px;margin:0 auto;line-height:1.65">${content}</main>
</div>`;

const link = (href, text) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
const crumbs = (items) => `<nav aria-label="breadcrumb">${items.map(([href, text]) => (href ? link(href, text) : escapeHtml(text))).join(' / ')}</nav>`;

const renderProductLinks = (items, lang = 'uz') => items.map((product) => {
  const landing = landingForCategory(product.category);
  const sizes = listOf(product.sizes);
  return `
  <article>
    <h2>${link(productPath(product), product.name)}</h2>
    <p>${landing ? link(categoryPath(landing, lang), landing[lang].name) : escapeHtml(product.category || UI[lang].catalogue)} · ${escapeHtml(formatPrice(product.price))} ${UI[lang].sum}${sizes.length ? ` · ${UI[lang].sizes}: ${escapeHtml(sizes.join(', '))}` : ''}</p>
    ${product.description ? `<p>${escapeHtml(stripHtml(product.description))}</p>` : ''}
  </article>`;
}).join('');

const renderCategoryLinks = (landings, lang = 'uz', exceptSlug) => {
  const items = landings.filter((landing) => landing.slug !== exceptSlug);
  return items.length ? `<ul>${items.map((landing) => `<li>${link(categoryPath(landing, lang), landing[lang].name)}</li>`).join('')}</ul>` : '';
};

const breadcrumbSchema = (id, items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': `${id}#breadcrumb`,
  itemListElement: items.map(([route, name], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(route) })),
});

const itemListSchema = (route, name, items) => ({
  '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${absoluteUrl(route)}#item-list`, name,
  numberOfItems: items.length,
  itemListElement: items.map((product, index) => ({ '@type': 'ListItem', position: index + 1, name: product.name, url: absoluteUrl(productPath(product)) })),
});

const replaceTag = (html, pattern, replacement) => (pattern.test(html)
  ? html.replace(pattern, replacement)
  : html.replace('</head>', `  ${replacement}\n</head>`));

const renderHtml = (template, page) => {
  const lang = page.lang || 'uz';
  const canonical = absoluteUrl(page.canonicalRoute || page.route);
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const image = escapeHtml(absoluteImage(page.image));
  const robots = page.noindex ? 'noindex, nofollow' : 'index, follow';
  let html = template;
  html = html.replace(/<html([^>]*?)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceTag(html, /<meta\s+name="description"[\s\S]*?\/>/i, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+name="robots"[\s\S]*?\/>/i, `<meta name="robots" content="${robots}" />`);
  html = replaceTag(html, /<meta\s+name="googlebot"[\s\S]*?\/>/i, `<meta name="googlebot" content="${robots}" />`);
  html = page.noCanonical
    ? html.replace(/<link\s+rel="canonical"[\s\S]*?\/>\s*/i, '')
    : replaceTag(html, /<link\s+rel="canonical"[\s\S]*?\/>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<link\s+rel="alternate"\s+hreflang=[\s\S]*?\/>\s*/gi, '');
  if (page.alternates?.length) {
    const tags = page.alternates.map(([hreflang, route]) => `  <link rel="alternate" hreflang="${hreflang}" href="${absoluteUrl(route)}" />`).join('\n');
    html = html.replace('</head>', `${tags}\n</head>`);
  }
  for (const [name, value] of verificationTags) {
    html = replaceTag(html, new RegExp(`<meta\\s+name="${name}"[\\s\\S]*?\\/>`, 'i'), `<meta name="${name}" content="${escapeHtml(value)}" />`);
  }
  html = replaceTag(html, /<meta\s+property="og:locale"[\s\S]*?\/>/i, `<meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'uz_UZ'}" />`);
  html = replaceTag(html, /<meta\s+property="og:type"[\s\S]*?\/>/i, `<meta property="og:type" content="${page.ogType || 'website'}" />`);
  html = replaceTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+property="og:image"[\s\S]*?\/>/i, `<meta property="og:image" content="${image}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:url"[\s\S]*?\/>/i, `<meta name="twitter:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:image"[\s\S]*?\/>/i, `<meta name="twitter:image" content="${image}" />`);
  if (page.structuredData) {
    const schemas = (Array.isArray(page.structuredData) ? page.structuredData : [page.structuredData]).filter(Boolean);
    const scripts = schemas.map((schema) => `  <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`).join('\n');
    html = html.replace('</head>', `${scripts}\n</head>`);
  }
  if (page.contentHtml) {
    html = html.replace(/<div id="root"[^>]*>[\s\S]*<\/div>\s*(?=<\/body>)/i, `<div id="root">${page.contentHtml}</div>\n  `);
  }
  return html;
};

const fetchJson = async (endpoint) => {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`[seo] ${endpoint} olinmadi: ${error.message}`);
    return null;
  }
};
const fetchList = async (endpoint) => {
  const payload = await fetchJson(endpoint);
  return Array.isArray(payload?.data) ? payload.data : [];
};

const template = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8');
const [products, blogList, bundleList] = await Promise.all([
  fetchList('/products?limit=500'),
  fetchList('/blogs?limit=500'),
  fetchList('/bundles'),
]);
if ((process.env.VERCEL === '1' || process.env.SEO_STRICT === 'true') && products.length === 0) {
  throw new Error('[seo] Mahsulot API bo‘sh qaytdi. Noto‘liq sitemap bilan deploy bekor qilindi.');
}
// The list endpoint leaves out article bodies, so each post is loaded in full.
const blogs = await Promise.all(blogList.filter((blog) => blog.slug).map(async (blog) => ({
  ...blog, ...((await fetchJson(`/blogs/${encodeURIComponent(blog.slug)}`))?.data || {}),
})));
const bundles = bundleList.filter((bundle) => bundle?._id && bundle.isActive !== false);
const landings = landingsForProducts(products);
const productById = new Map(products.map((product) => [productIdOf(product), product]));

const pages = [];
const sitemapEntries = [];
const addSitemap = (route, extra = {}) => sitemapEntries.push({ route, changefreq: 'monthly', priority: '0.6', ...extra });

// ── Static pages (uz, plus a /ru twin where Russian copy exists) ──────────────
const staticBody = (route, lang, [, description, h1]) => {
  const ui = UI[lang];
  const prefix = (target) => withLanguagePrefix(target, lang);
  const categoryBlock = landings.length ? `<section><h2>${ui.categories}</h2>${renderCategoryLinks(landings, lang)}</section>` : '';
  if (route === '/') {
    return `<h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(ui.homeLead)}</p>
      <p>${link(prefix('/products'), ui.allProducts)} · ${link('/blog', ui.blog)} · ${link(prefix('/about'), ui.about)}</p>
      ${categoryBlock}
      <section><h2>${ui.featured}</h2>${renderProductLinks(products.slice(0, 8), lang)}</section>`;
  }
  if (route === '/products') {
    return `${crumbs([[prefix('/'), ui.home], [null, ui.catalogue]])}<h1>${escapeHtml(h1)}</h1><p>${escapeHtml(ui.productsLead)}</p>
      ${categoryBlock}<section>${renderProductLinks(products, lang)}</section><p>${link(prefix('/faq'), ui.faq)}</p>`;
  }
  if (route === '/blog') {
    const articles = blogs.filter((blog) => localizedValue(blog.content)).map((blog) => `<article><h2>${link(`/blog/${blog.slug}`, localizedValue(blog.title))}</h2><p>${escapeHtml(stripHtml(localizedValue(blog.excerpt)))}</p></article>`).join('');
    return `<h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p>${articles}`;
  }
  if (route === '/bundles') {
    const items = bundles.map((bundle) => `<article><h2>${link(`/bundle/${bundle._id}`, bundle.title)}</h2>${bundle.discountedPrice ? `<p>${escapeHtml(formatPrice(bundle.discountedPrice))} ${ui.sum}</p>` : ''}</article>`).join('');
    return `<h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p>${items}<p>${link(prefix('/products'), ui.allProducts)}</p>`;
  }
  return `<h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p><p>${link(prefix('/products'), ui.allProducts)} · ${link(prefix('/'), ui.home)}</p>`;
};

for (const [route, uz, ru] of staticPages) {
  const hasRu = Boolean(ru) && RU_STATIC_ROUTES.includes(route);
  const ruRoute = withLanguagePrefix(route, 'ru');
  const alternates = hasRu ? [['uz', route], ['ru', ruRoute], ['x-default', route]] : undefined;
  const variants = [['uz', route, uz], ...(hasRu ? [['ru', ruRoute, ru]] : [])];
  for (const [lang, pageRoute, copy] of variants) {
    const page = { route: pageRoute, lang, title: copy[0], description: copy[1], alternates, contentHtml: seoShell(staticBody(route, lang, copy), lang) };
    if (route === '/products') page.structuredData = itemListSchema(pageRoute, copy[2], products);
    pages.push(page);
  }
  addSitemap(route, {
    changefreq: route === '/' || route === '/products' ? 'daily' : 'monthly',
    priority: route === '/' ? '1.0' : route === '/products' ? '0.9' : '0.6',
    alternates,
  });
  if (hasRu) addSitemap(ruRoute, { changefreq: route === '/' || route === '/products' ? 'daily' : 'monthly', priority: route === '/' ? '0.9' : '0.6', alternates });
}

// ── Category landings ───────────────────────────────────────────────────────
for (const landing of landings) {
  const items = productsInLanding(landing, products);
  const routes = { uz: categoryPath(landing, 'uz'), ru: categoryPath(landing, 'ru') };
  const alternates = [['uz', routes.uz], ['ru', routes.ru], ['x-default', routes.uz]];
  for (const lang of ['uz', 'ru']) {
    const copy = landing[lang];
    const ui = UI[lang];
    const home = withLanguagePrefix('/', lang);
    const catalogue = withLanguagePrefix('/products', lang);
    pages.push({
      route: routes[lang], lang, title: copy.title, description: copy.description, alternates,
      image: items[0] ? productImage(items[0]) : undefined,
      contentHtml: seoShell(`${crumbs([[home, ui.home], [catalogue, ui.catalogue], [null, copy.name]])}
        <h1>${escapeHtml(copy.h1)}</h1>${copy.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        <section>${renderProductLinks(items, lang)}</section>
        <section><h2>${ui.otherCategories}</h2>${renderCategoryLinks(landings, lang, landing.slug)}<p>${link(catalogue, ui.allProducts)}</p></section>`, lang),
      structuredData: [
        itemListSchema(routes[lang], copy.h1, items),
        breadcrumbSchema(absoluteUrl(routes[lang]), [[home, ui.home], [catalogue, ui.catalogue], [routes[lang], copy.name]]),
      ],
    });
    addSitemap(routes[lang], { changefreq: 'weekly', priority: lang === 'uz' ? '0.9' : '0.8', alternates });
  }
}

// ── Products ────────────────────────────────────────────────────────────────
const policy = POLICY_COPY.uz;
for (const product of products) {
  const id = productIdOf(product);
  const route = productPath(product);
  const images = productImages(product);
  const sizes = listOf(product.sizes);
  const colors = colourNames(product.colors);
  const landing = landingForCategory(product.category);
  const landingRoute = landing ? categoryPath(landing, 'uz') : '/products';
  const landingName = landing ? landing.uz.name : UI.uz.catalogue;
  const description = stripHtml(product.description || '') || `${product.name} — Luxx.uz premium ayollar kiyimlari. Toshkent bo‘ylab shu kuni yetkazish, uyda kiyib ko‘rib to‘lash.`;
  const siblings = landing ? productsInLanding(landing, products).filter((item) => productIdOf(item) !== id).slice(0, 4) : [];
  const saleEnds = activeSale(product);
  const crumbItems = [['/', UI.uz.home], [landingRoute, landingName], [route, product.name]];

  const contentHtml = seoShell(`${crumbs(crumbItems.slice(0, 2).concat([[null, product.name]]))}
    <article>
      <h1>${escapeHtml(product.name)}</h1>
      ${images.map((src, index) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(`${product.name}${index ? ` — ${index + 1}-rasm` : ''}`)}" width="800" height="1000" />`).join('')}
      <p><strong>${escapeHtml(formatPrice(product.price))} so‘m</strong>${saleEnds ? ` <s>${escapeHtml(formatPrice(product.originalPrice))} so‘m</s>` : ''}</p>
      <p>${escapeHtml(description)}</p>
      ${sizes.length ? `<p>${UI.uz.sizes}: ${escapeHtml(sizes.join(', '))}</p>` : ''}
      ${colors.length ? `<p>${UI.uz.colors}: ${escapeHtml(colors.join(', '))}</p>` : ''}
      <p>${UI.uz.category}: ${link(landingRoute, landingName)}</p>
      <ul><li>${escapeHtml(policy.delivery)}</li><li>${escapeHtml(policy.tryOn)}</li><li>${escapeHtml(policy.returns)}</li><li>${escapeHtml(policy.payment)}</li></ul>
    </article>
    ${siblings.length ? `<section><h2>${UI.uz.more}</h2>${renderProductLinks(siblings)}</section>` : ''}`);

  const offer = {
    '@type': 'Offer', url: absoluteUrl(route), priceCurrency: 'UZS', price: product.price,
    availability: product.stock == null || Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    ...(saleEnds ? { priceValidUntil: saleEnds.toISOString().slice(0, 10) } : {}),
    seller: { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Luxx.uz' },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'UZS' },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UZ', addressRegion: 'Toshkent' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy', applicableCountry: 'UZ',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: RETURN_DAYS,
      returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/FreeReturn', merchantReturnLink: `${siteUrl}/terms`,
    },
  };
  const reviewCount = Number(product.numOfReviews);
  const structuredData = [
    {
      '@context': 'https://schema.org', '@type': 'Product', '@id': `${absoluteUrl(route)}#product`,
      name: product.name, image: images.length ? images.map(absoluteImage) : undefined, description,
      sku: product.sku || id, category: product.category,
      ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
      ...(sizes.length ? { size: sizes.join(', ') } : {}),
      ...(colors.length ? { color: colors.join(', ') } : {}),
      ...(reviewCount > 0 && Number(product.rating) > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(product.rating), reviewCount } }
        : {}),
      offers: offer,
    },
    breadcrumbSchema(absoluteUrl(route), crumbItems),
  ];

  const page = { route, title: `${product.name} | Luxx.uz`, description: description.slice(0, 300), image: images[0], ogType: 'product', contentHtml, structuredData };
  pages.push(page);
  // Old /product/<id> links (already shared and crawled) point Google at the named address.
  if (route !== `/product/${id}`) pages.push({ ...page, route: `/product/${id}`, canonicalRoute: route });
  addSitemap(route, { changefreq: 'weekly', priority: '0.8', lastmod: product.updatedAt || product.createdAt, images: images.slice(0, 6) });
}

// ── Bundles ─────────────────────────────────────────────────────────────────
for (const bundle of bundles) {
  const route = `/bundle/${bundle._id}`;
  const items = (bundle.products || [])
    .map((entry) => (typeof entry === 'object' ? productById.get(productIdOf(entry.product || entry)) || entry.product || entry : productById.get(String(entry))))
    .filter((item) => item?.name);
  const description = stripHtml(bundle.description || '') || `${bundle.title}: ${items.map((item) => item.name).join(', ')}. ${UI.uz.bundleLead}`;
  pages.push({
    route, title: `${bundle.title} | Luxx.uz`, description: description.slice(0, 300), image: bundle.heroImage || (items[0] && productImage(items[0])),
    contentHtml: seoShell(`${crumbs([['/', UI.uz.home], ['/bundles', UI.uz.bundles], [null, bundle.title]])}<h1>${escapeHtml(bundle.title)}</h1><p>${escapeHtml(description)}</p>
      ${bundle.discountedPrice ? `<p><strong>${escapeHtml(formatPrice(bundle.discountedPrice))} so‘m</strong>${bundle.originalPrice > bundle.discountedPrice ? ` <s>${escapeHtml(formatPrice(bundle.originalPrice))} so‘m</s>` : ''}</p>` : ''}
      <section>${renderProductLinks(items)}</section>`),
    structuredData: breadcrumbSchema(absoluteUrl(route), [['/', UI.uz.home], ['/bundles', UI.uz.bundles], [route, bundle.title]]),
  });
  addSitemap(route, { changefreq: 'weekly', priority: '0.7', lastmod: bundle.updatedAt || bundle.createdAt });
}

// ── Blog posts ──────────────────────────────────────────────────────────────
for (const blog of blogs) {
  const route = `/blog/${blog.slug}`;
  const content = localizedValue(blog.content);
  const title = localizedValue(blog.title);
  pages.push({
    route,
    title: blog.seoTitle || `${title} | Luxx.uz` || 'Luxx.uz Blog',
    description: blog.seoDescription || stripHtml(localizedValue(blog.excerpt)) || 'Luxx.uz moda va uslub blogi.',
    image: blog.coverImage,
    ogType: 'article',
    noindex: !content,
    contentHtml: seoShell(`${crumbs([['/', UI.uz.home], ['/blog', UI.uz.blog], [null, title]])}<article><h1>${escapeHtml(title)}</h1><p>${escapeHtml(stripHtml(localizedValue(blog.excerpt)))}</p>${content || '<p>Maqolaning to‘liq matni tayyorlanmoqda.</p>'}</article>
      ${landings.length ? `<section><h2>${UI.uz.fromCatalogue}</h2>${renderCategoryLinks(landings)}</section>` : ''}`),
    structuredData: content ? [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title,
      description: stripHtml(localizedValue(blog.excerpt)), image: blog.coverImage ? [absoluteImage(blog.coverImage)] : undefined,
      datePublished: blog.publishedAt || blog.createdAt, dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
      author: { '@type': 'Organization', name: 'Luxx.uz' },
      publisher: { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Luxx.uz' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(route) },
    }, breadcrumbSchema(absoluteUrl(route), [['/', UI.uz.home], ['/blog', UI.uz.blog], [route, title]])] : undefined,
  });
  if (content) addSitemap(route, { changefreq: 'monthly', priority: '0.7', lastmod: blog.updatedAt || blog.publishedAt });
}

// ── Private pages: reachable, never indexed ─────────────────────────────────
for (const route of ['/login', '/register', '/checkout', '/profile', '/orders', '/admin']) {
  pages.push({ route, title: 'Luxx.uz', description: 'Luxx.uz xizmat sahifasi.', noindex: true });
}

// ── Write shells ────────────────────────────────────────────────────────────
for (const page of pages) {
  const file = page.route === '/' ? path.join(buildDir, 'index.html') : path.join(buildDir, page.route.slice(1), 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, renderHtml(template, page));
}

// Served by Vercel with status 404 for any address that is not a known page.
await fs.writeFile(path.join(buildDir, '404.html'), renderHtml(template, {
  route: '/404', title: `${UI.uz.notFound} | Luxx.uz`, description: UI.uz.notFoundLead, noindex: true, noCanonical: true,
  contentHtml: seoShell(`<h1>${UI.uz.notFound}</h1><p>${UI.uz.notFoundLead}</p><p>${link('/products', UI.uz.allProducts)} · ${link('/', UI.uz.home)}</p>`),
}));

// ── Sitemap ─────────────────────────────────────────────────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.map((entry) => {
  const lastmod = entry.lastmod ? `\n    <lastmod>${new Date(entry.lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
  const alternates = (entry.alternates || []).map(([hreflang, route]) => `\n    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xmlEscape(absoluteUrl(route))}" />`).join('');
  const images = (entry.images || []).map((src) => `\n    <image:image><image:loc>${xmlEscape(absoluteImage(src))}</image:loc></image:image>`).join('');
  return `  <url>\n    <loc>${xmlEscape(absoluteUrl(entry.route))}</loc>${lastmod}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>${alternates}${images}\n  </url>`;
}).join('\n')}
</urlset>
`;
await fs.writeFile(path.join(buildDir, 'sitemap.xml'), sitemap);

console.log(`[seo] ${pages.length} ta HTML shell + 404 (${products.length} mahsulot, ${landings.length} kategoriya, ${bundles.length} to'plam, ${blogs.length} blog), sitemap: ${sitemapEntries.length} havola.`);
