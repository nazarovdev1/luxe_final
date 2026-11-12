import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { extractProductId, productPath, productSlugId, slugify } from '../utils/productUrl';
import {
  CATEGORY_LANDINGS, categoryPath, landingForCategory, landingsForProducts, productsInLanding, resolveLanding,
} from './categoryLandings';
import {
  contentPath, hasRussianVersion, initialLanguage, languageRedirectTarget, pathForLanguage, splitLanguagePrefix,
} from './localizedRoutes';

const ID = '697c31b9fe8f5a35a0f25936';

describe('product addresses', () => {
  test('carry a readable slug and end with the id', () => {
    expect(productPath({ _id: ID, name: 'MAX MARA PALTO' })).toBe(`/product/max-mara-palto-${ID}`);
    expect(productPath({ id: ID, name: 'Bordo palto' }, { mobile: true })).toBe(`/mobile/product/bordo-palto-${ID}`);
  });

  test('transliterate Cyrillic and drop Uzbek apostrophes', () => {
    expect(slugify('ВЕЧЕРНЫЙ КОСТЮМ ЮБКА')).toBe('vecherniy-kostyum-yubka');
    expect(slugify("Qo‘ng‘ir jun to'plam")).toBe('qongir-jun-toplam');
  });

  test('fall back to the bare id when the name is unknown', () => {
    expect(productSlugId({ id: ID })).toBe(ID);
  });

  test('read the id from new and old addresses alike', () => {
    expect(extractProductId(`max-mara-palto-${ID}`)).toBe(ID);
    expect(extractProductId(ID)).toBe(ID);
  });
});

describe('category landings', () => {
  const products = [
    { id: '1', category: 'Palto plash' },
    { id: '2', category: 'Kastyum shim' },
    { id: '3', category: 'Ko‘ylak' },
  ];

  test('every curated page has unique slug and full uz/ru copy', () => {
    const slugs = CATEGORY_LANDINGS.map((landing) => landing.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    CATEGORY_LANDINGS.forEach((landing) => {
      ['uz', 'ru'].forEach((lang) => {
        const copy = landing[lang];
        expect(copy.title && copy.h1 && copy.description && copy.name).toBeTruthy();
        expect(copy.intro.length).toBeGreaterThan(0);
        expect(copy.description.length).toBeLessThanOrEqual(170);
      });
    });
  });

  test('a category the admin adds later still gets a page', () => {
    const landing = landingForCategory('Ko‘ylak');
    expect(landing.generic).toBe(true);
    expect(landing.slug).toBe('koylak');
    expect(resolveLanding('koylak', products)).toMatchObject({ slug: 'koylak' });
    expect(resolveLanding('yoq-bolim', products)).toBeNull();
  });

  test('only departments with products are listed, curated ones first', () => {
    expect(landingsForProducts(products).map((landing) => landing.slug)).toEqual(['palto-plash', 'kastyum-shim', 'koylak']);
    expect(productsInLanding(CATEGORY_LANDINGS[0], products).map((product) => product.id)).toEqual(['1']);
    expect(categoryPath(CATEGORY_LANDINGS[0], 'ru')).toBe('/ru/kategoriya/palto-plash');
  });
});

describe('Russian addresses', () => {
  test('split and rebuild the /ru prefix', () => {
    expect(splitLanguagePrefix('/ru/products')).toEqual({ language: 'ru', path: '/products' });
    expect(splitLanguagePrefix('/ru')).toEqual({ language: 'ru', path: '/' });
    expect(splitLanguagePrefix('/rules')).toEqual({ language: null, path: '/rules' });
    expect(pathForLanguage('/mobile/products', 'ru')).toBe('/ru/mobile/products');
    expect(pathForLanguage('/ru/mobile/products', 'uz')).toBe('/mobile/products');
    expect(pathForLanguage('/ru', 'en')).toBe('/');
    expect(contentPath('/ru/mobile/kategoriya/palto-plash')).toBe('/kategoriya/palto-plash');
  });

  test('only translated pages claim a Russian twin', () => {
    expect(hasRussianVersion('/products')).toBe(true);
    expect(hasRussianVersion('/kategoriya/palto-plash')).toBe(true);
    expect(hasRussianVersion(`/product/${ID}`)).toBe(false);
    expect(hasRussianVersion('/blog/kapsula')).toBe(false);
  });

  test('the address decides the starting language', () => {
    expect(initialLanguage('/ru/products', 'uz')).toBe('ru');
    expect(initialLanguage('/products', 'en')).toBe('en');
    expect(initialLanguage('/products', null)).toBe('uz');
  });

  test('a returning Russian reader is sent to the /ru twin, crawlers and admin are not', () => {
    const location = { pathname: '/products', search: '?q=palto', hash: '' };
    expect(languageRedirectTarget(location, 'ru', 'Mozilla/5.0')).toBe('/ru/products?q=palto');
    expect(languageRedirectTarget(location, 'ru', 'Googlebot/2.1')).toBeNull();
    expect(languageRedirectTarget(location, 'uz', 'Mozilla/5.0')).toBeNull();
    expect(languageRedirectTarget({ pathname: '/ru/products' }, 'ru', 'Mozilla/5.0')).toBeNull();
    expect(languageRedirectTarget({ pathname: '/admin' }, 'ru', 'Mozilla/5.0')).toBeNull();
  });
});

describe('vercel.json', () => {
  // Unknown addresses now get a real 404, so every app route must be listed in a rewrite.
  const vercel = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../vercel.json'), 'utf8'));
  const toRegExp = (source) => new RegExp(`^${source
    .replace(/\/:\w+\(([^)]+)\)\?/g, '(?:/(?:$1))?')
    .replace(/\/:\w+\(([^)]+)\)/g, '/(?:$1)')
    .replace(/\/:\w+\*/g, '(?:/.*)?')
    .replace(/\/:\w+/g, '/[^/]+')}$`);
  const patterns = vercel.rewrites.map((rewrite) => toRegExp(rewrite.source));
  const served = (url) => url === '/' || patterns.some((pattern) => pattern.test(url));

  const appSource = fs.readFileSync(path.resolve(__dirname, '../App.js'), 'utf8');
  const routes = [...appSource.matchAll(/<Route path="([^"]+)"/g)].map((match) => match[1])
    .filter((route) => route !== '*' && route !== '/mobile/*');

  test.each(routes)('%s is served on its own and under /ru', (route) => {
    const sample = route.replace(/:\w+/g, 'sample-1');
    expect(served(sample)).toBe(true);
    expect(served(sample === '/' ? '/ru' : `/ru${sample}`)).toBe(true);
  });

  test('mobile app paths and unknown addresses', () => {
    expect(served('/mobile')).toBe(true);
    expect(served('/mobile/product/x')).toBe(true);
    expect(served('/ru/mobile/kategoriya/palto-plash')).toBe(true);
    expect(served('/wp-login.php')).toBe(false);
    expect(served('/products/extra/segment')).toBe(false);
    expect(served('/assets/missing.js')).toBe(false);
  });
});
