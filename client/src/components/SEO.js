import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '../contexts/LanguageContext';
import { contentPath, hasRussianVersion, splitLanguagePrefix, withLanguagePrefix } from '../config/localizedRoutes';

const SITE_NAME = 'Luxx.uz';
const SITE_URL = 'https://luxx.uz';
const SITE_LOGO = `${SITE_URL}/icon-512.png`;

const toAbsoluteUrl = (value) => {
    if (!value) return SITE_LOGO;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizePath = (value) => {
    if (!value) return '/';
    try {
        const parsed = new URL(value, SITE_URL);
        let pathname = parsed.pathname || '/';
        pathname = pathname.replace(/\/{2,}/g, '/');
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
        }
        return pathname || '/';
    } catch (error) {
        return '/';
    }
};

const buildCanonicalUrl = (pathCandidate) => {
    const path = normalizePath(pathCandidate);
    return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
};

// index.html (and every pre-rendered shell) ships its own canonical/meta tags.
// Helmet adds its own copies and never touches those, so after the app starts the
// page would carry two canonicals; on pages without a shell the static one points
// at the home page. Remove the static set once a page renders its own.
const STATIC_HEAD_SELECTOR = [
    'link[rel="canonical"]',
    'link[rel="alternate"][hreflang]',
    'meta[name="description"]',
    'meta[name="keywords"]',
    'meta[name="robots"]',
    'meta[name="googlebot"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
].join(',');

export const removeStaticHeadTags = (head = typeof document !== 'undefined' ? document.head : null) => {
    if (!head) return;
    head.querySelectorAll(STATIC_HEAD_SELECTOR).forEach((element) => {
        if (!element.hasAttribute('data-react-helmet')) element.remove();
    });
};

const LOCALE_MAP = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
};

const SEO = ({
    title,
    description,
    image,
    url,
    canonicalPath,
    noIndex = false,
    type = 'website',
    structuredData,
    keywords,
    breadcrumbSteps = [], // New prop for breadcrumbs
}) => {
    const { language, t } = useLanguage();
    const locale = LOCALE_MAP[language] || 'uz_UZ';
    const defaultTitle = t('seo.defaultTitle');
    const defaultDescription = t('seo.defaultDescription');
    const normalizedTitle = typeof title === 'string'
        ? title
            .replace(/\s*(?:luxx\.uz|luxe)\s*$/i, '')
            .replace(/\s*[|\-\u2014]\s*$/, '')
            .trim()
        : title;
    const pageTitle = normalizedTitle
        ? t('seo.pageTitleTemplate', { title: normalizedTitle })
        : defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageImage = toAbsoluteUrl(image);

    const runtimePath =
        typeof window !== 'undefined' ? window.location.pathname : '/';
    const { language: addressLanguage, path: pathWithoutLanguage } = splitLanguagePrefix(runtimePath);
    const isMobilePath = /^\/mobile(\/|$)/.test(pathWithoutLanguage);
    // Pages pass their path without /ru or /mobile; the Russian twin is added here.
    const basePath = normalizePath(canonicalPath || url || contentPath(runtimePath));
    const hasRussian = hasRussianVersion(basePath);
    const canonical = buildCanonicalUrl(
        addressLanguage === 'ru' && hasRussian ? withLanguagePrefix(basePath, 'ru') : basePath,
    );
    const alternates = hasRussian
        ? [['uz', basePath], ['ru', withLanguagePrefix(basePath, 'ru')], ['x-default', basePath]]
        : [];
    const shouldNoIndex = Boolean(noIndex || isMobilePath);
    const robots = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';

    // Site-wide Organization/WebSite data lives in the static HTML shell.
    // Page-level schemas stay here to avoid duplicate entities after hydration.
    const schemas = [];

    // Add BreadcrumbList if steps provided
    if (breadcrumbSteps && breadcrumbSteps.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: t('seo.homeBreadcrumb'),
                    item: SITE_URL,
                },
                ...breadcrumbSteps.map((step, index) => ({
                    '@type': 'ListItem',
                    position: index + 2,
                    name: step.name,
                    item: step.url.startsWith('http') ? step.url : `${SITE_URL}${step.url}`,
                })),
            ],
        });
    }

    if (structuredData) {
        if (Array.isArray(structuredData)) {
            schemas.push(...structuredData);
        } else {
            schemas.push(structuredData);
        }
    }

    return (
        // Static shell tags go only after Helmet has written its own, never before.
        <Helmet htmlAttributes={{ lang: language }} onChangeClientState={() => removeStaticHeadTags()}>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robots} />
            <meta name="googlebot" content={robots} />
            <link rel="canonical" href={canonical} />
            {!shouldNoIndex && alternates.map(([hreflang, path]) => (
                <link key={hreflang} rel="alternate" hrefLang={hreflang} href={buildCanonicalUrl(path)} />
            ))}

            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:locale" content={locale} />
            {Object.values(LOCALE_MAP)
                .filter((alternateLocale) => alternateLocale !== locale)
                .map((alternateLocale) => (
                    <meta key={alternateLocale} property="og:locale:alternate" content={alternateLocale} />
                ))}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonical} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={pageImage} />

            {schemas.map((schema, index) => (
                <script key={`schema-${index}`} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
