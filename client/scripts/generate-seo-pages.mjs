import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(rootDir, 'build');
const siteUrl = 'https://luxx.uz';
const apiUrl = (process.env.VITE_API_URL || process.env.REACT_APP_API_URL ||
  'https://luxe-backend-355636248339.us-central1.run.app/api').replace(/\/$/, '');

const staticPages = [
  ['/', 'Premium ayollar kiyimlari Toshkentda | Luxx.uz', "Toshkentdagi premium ayollar kiyimlari do'koni. Paltolar, kostyumlar va zamonaviy kolleksiyalarni tez yetkazib berish bilan xarid qiling."],
  ['/products', 'Premium ayollar kiyimlari katalogi | Luxx.uz', "Luxx.uz ayollar kiyimlari katalogi: premium paltolar, kostyumlar, blazerlar va zamonaviy obrazlar. Toshkent bo'ylab tez yetkazib berish."],
  ['/about', 'Luxx.uz haqida | Premium ayollar modasi', "Luxx.uz brendi, sifat standartlari va O'zbekiston ayollari uchun yaratilgan premium fashion kolleksiyalari haqida."],
  ['/blog', 'Moda va uslub bo‘yicha maslahatlar | Luxx.uz Blog', "Ayollar modasi, kiyim kombinatsiyalari, trendlar, o'lcham tanlash va kiyim parvarishi bo'yicha foydali maqolalar."],
  ['/lookbooks', 'Ayollar uchun tayyor obrazlar va lookbook | Luxx.uz', "Premium ayollar kiyimlaridan tuzilgan tayyor obrazlar, mavsumiy lookbooklar va uslub g'oyalari."],
  ['/faq', "Buyurtma va yetkazib berish savollari | Luxx.uz", "Luxx.uz buyurtma, to'lov, Toshkent bo'ylab yetkazib berish, o'lcham va qaytarish bo'yicha savollarga javoblar."],
  ['/contact', "Luxx.uz bilan bog'lanish", "Luxx.uz bilan telefon, Telegram yoki sayt orqali bog'laning. Mahsulot, o'lcham va buyurtma bo'yicha yordam oling."],
  ['/gift-cards', "Premium sovg'a kartalari | Luxx.uz", "Yaqinlaringiz uchun Luxx.uz premium fashion sovg'a kartasini tanlang."],
  ['/vip-club', 'Luxx.uz VIP Club', "Luxx.uz VIP Club imtiyozlari, ballar va premium mijozlar uchun maxsus takliflar."],
  ['/eco-impact', "Barqaror moda va ekologik ta'sir | Luxx.uz", "Luxx.uz xaridlarining ekologik ta'siri va barqaror moda tashabbuslari haqida."],
  ['/privacy-policy', 'Maxfiylik siyosati | Luxx.uz', "Luxx.uz shaxsiy ma'lumotlarni saqlash va himoya qilish siyosati."],
  ['/terms', 'Foydalanish shartlari | Luxx.uz', "Luxx.uz buyurtma, to'lov, yetkazib berish va qaytarish shartlari."],
];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const absoluteImage = (value) => {
  if (!value) return `${siteUrl}/logoweb2.png`;
  return /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith('/') ? '' : '/'}${value}`;
};

const replaceTag = (html, pattern, replacement) => pattern.test(html)
  ? html.replace(pattern, replacement)
  : html.replace('</head>', `  ${replacement}\n</head>`);

const renderHtml = (template, page) => {
  const canonical = `${siteUrl}${page.route === '/' ? '/' : page.route}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const image = escapeHtml(absoluteImage(page.image));
  const robots = page.noindex ? 'noindex, nofollow' : 'index, follow';
  let html = template;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceTag(html, /<meta\s+name="description"[\s\S]*?\/>/i, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+name="robots"[\s\S]*?\/>/i, `<meta name="robots" content="${robots}" />`);
  html = replaceTag(html, /<meta\s+name="googlebot"[\s\S]*?\/>/i, `<meta name="googlebot" content="${robots}" />`);
  html = replaceTag(html, /<link\s+rel="canonical"[\s\S]*?\/>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<link\s+rel="alternate"\s+hreflang=[\s\S]*?\/>\s*/gi, '');
  html = replaceTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"[\s\S]*?\/>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+property="og:image"[\s\S]*?\/>/i, `<meta property="og:image" content="${image}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:url"[\s\S]*?\/>/i, `<meta name="twitter:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:title"[\s\S]*?\/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+name="twitter:image"[\s\S]*?\/>/i, `<meta name="twitter:image" content="${image}" />`);
  return html;
};

const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    console.warn(`[seo] ${endpoint} olinmadi: ${error.message}`);
    return [];
  }
};

const template = await fs.readFile(path.join(buildDir, 'index.html'), 'utf8');
const [products, blogs] = await Promise.all([fetchData('/products?limit=500'), fetchData('/blogs?limit=500')]);
const dynamicPages = [
  ...products.map((product) => ({
    route: `/product/${product._id || product.id}`,
    title: `${product.name} | Luxx.uz`,
    description: product.description || `${product.name}ni Luxx.uz premium ayollar kiyimlari do'konidan Toshkent bo'ylab yetkazib berish bilan xarid qiling.`,
    image: product.image || product.images?.[0]?.url || product.images?.[0],
  })),
  ...blogs.filter((blog) => blog.slug).map((blog) => ({
    route: `/blog/${blog.slug}`,
    title: blog.seoTitle || blog.title?.uz || blog.title?.ru || blog.title?.en || 'Luxx.uz Blog',
    description: blog.seoDescription || blog.excerpt?.uz || blog.excerpt?.ru || blog.excerpt?.en || 'Luxx.uz moda va uslub blogi.',
    image: blog.coverImage,
  })),
];

const privatePages = ['/login', '/register', '/checkout', '/profile', '/orders', '/admin']
  .map((route) => ({ route, title: 'Luxx.uz', description: 'Luxx.uz xizmat sahifasi.', noindex: true }));

for (const [route, title, description] of staticPages) {
  const page = { route, title, description };
  if (route === '/') {
    await fs.writeFile(path.join(buildDir, 'index.html'), renderHtml(template, page));
    continue;
  }
  const directory = path.join(buildDir, route.slice(1));
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), renderHtml(template, page));
}

for (const page of [...dynamicPages, ...privatePages]) {
  const directory = path.join(buildDir, page.route.slice(1));
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), renderHtml(template, page));
}

const sitemapPages = [
  ...staticPages.map(([route]) => ({
    route,
    changefreq: route === '/' || route === '/products' ? 'daily' : 'monthly',
    priority: route === '/' ? '1.0' : '0.7',
  })),
  ...products.map((product) => ({
    route: `/product/${product._id || product.id}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: product.updatedAt,
  })),
  ...blogs.filter((blog) => blog.slug).map((blog) => ({
    route: `/blog/${blog.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: blog.updatedAt || blog.publishedAt,
  })),
];
const xmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPages.map((page) => {
  const lastmod = page.lastmod
    ? `\n    <lastmod>${new Date(page.lastmod).toISOString().slice(0, 10)}</lastmod>`
    : '';
  return `  <url>\n    <loc>${xmlEscape(`${siteUrl}${page.route === '/' ? '/' : page.route}`)}</loc>${lastmod}\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
}).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(buildDir, 'sitemap.xml'), sitemap);

console.log(`[seo] ${staticPages.length + dynamicPages.length + privatePages.length} ta crawlable HTML shell yaratildi (${products.length} mahsulot, ${blogs.length} blog).`);
