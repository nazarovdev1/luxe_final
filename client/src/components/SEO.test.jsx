import React from 'react';
import { render } from '@testing-library/react';
import { Helmet } from 'react-helmet';
import { afterEach, describe, expect, test, vi } from 'vitest';
import SEO, { removeStaticHeadTags } from './SEO';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'uz', t: (key, fallback) => (typeof fallback === 'string' ? fallback : key) }),
}));

const renderAt = (pathname, props) => {
  window.history.pushState({}, '', pathname);
  render(<SEO title="Sahifa" description="Tavsif" {...props} />);
  return Helmet.peek();
};

const linkHref = (head, rel, extra = () => true) =>
  (head.linkTags || []).filter((tag) => tag.rel === rel && extra(tag)).map((tag) => tag.href);

afterEach(() => window.history.pushState({}, '', '/'));

describe('SEO canonical and hreflang', () => {
  test('a Russian page points to itself and lists both languages', () => {
    const head = renderAt('/ru/kategoriya/palto-plash', { canonicalPath: '/kategoriya/palto-plash' });
    expect(linkHref(head, 'canonical')).toEqual(['https://luxx.uz/ru/kategoriya/palto-plash']);
    expect(linkHref(head, 'alternate', (tag) => tag.hrefLang === 'ru')).toEqual(['https://luxx.uz/ru/kategoriya/palto-plash']);
    expect(linkHref(head, 'alternate', (tag) => tag.hrefLang === 'x-default')).toEqual(['https://luxx.uz/kategoriya/palto-plash']);
  });

  test('a product opened under /ru keeps its single Uzbek canonical and no hreflang', () => {
    const head = renderAt('/ru/product/palto-697c31b9fe8f5a35a0f25936', { canonicalPath: '/product/palto-697c31b9fe8f5a35a0f25936' });
    expect(linkHref(head, 'canonical')).toEqual(['https://luxx.uz/product/palto-697c31b9fe8f5a35a0f25936']);
    expect(linkHref(head, 'alternate')).toEqual([]);
  });

  test('mobile pages stay out of the index and point to the desktop address', () => {
    const head = renderAt('/ru/mobile/products');
    expect(linkHref(head, 'canonical')).toEqual(['https://luxx.uz/ru/products']);
    expect((head.metaTags || []).find((tag) => tag.name === 'robots').content).toBe('noindex, nofollow');
  });
});

describe('static head tags from the pre-rendered shell', () => {
  test('are removed so the page never carries two canonicals', () => {
    document.head.innerHTML = `
      <link rel="canonical" href="https://luxx.uz/" />
      <meta name="description" content="shell" />
      <meta property="og:title" content="shell" />
      <link rel="canonical" href="https://luxx.uz/products" data-react-helmet="true" />
      <link rel="stylesheet" href="/assets/app.css" />`;
    removeStaticHeadTags();
    expect([...document.head.querySelectorAll('link[rel="canonical"]')].map((tag) => tag.getAttribute('href'))).toEqual(['https://luxx.uz/products']);
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('link[rel="stylesheet"]')).not.toBeNull();
  });
});
