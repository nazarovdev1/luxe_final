import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_NAME = 'Luxx.uz';
const SITE_URL = 'https://luxx.uz';
const SITE_LOGO = `${SITE_URL}/logoweb2.png`;

const DEFAULT_TITLE = "Luxx.uz - Ayollar kiyimlari, luxury kiyimlar va paltolar";
const DEFAULT_DESCRIPTION =
    "Luxx.uz - O'zbekistondagi premium ayollar kiyimlari do'koni. Luxury kiyimlar, yozgi kiyimlar, qishgi kiyimlar, bahorgi kiyimlar, kuzgi kiyimlar, paltolar va zamonaviy kolleksiyalar.";
const DEFAULT_KEYWORDS =
    "luxx.uz, luxx uz, luxe uz, luxury uz, luxe, luxury, luxury kiyimlar, ayollar kiyimlari, yozgi kiyimlar, qishgi kiyimlar, bahorgi kiyimlar, kuzgi kiyimlar, paltolar, ko'ylaklar, yubkalar, premium kiyimlar, onlayn kiyim do'kon";

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

const CATEGORY_KEYWORDS = [
    'Luxury kiyimlar',
    'Yozgi kiyimlar',
    'Qishgi kiyimlar',
    'Bahorgi kiyimlar',
    'Kuzgi kiyimlar',
    'Paltolar',
];

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    canonicalPath,
    noIndex = false,
    structuredData,
}) => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const pageKeywords = keywords || DEFAULT_KEYWORDS;
    const pageImage = toAbsoluteUrl(image);

    const runtimePath =
        typeof window !== 'undefined' ? window.location.pathname : '/';
    const isMobilePath =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile');
    const canonical = buildCanonicalUrl(canonicalPath || url || runtimePath);
    const shouldNoIndex = Boolean(noIndex || isMobilePath);
    const robots = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';

    const schemas = [
        {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Luxx.uz',
            alternateName: 'Luxe',
            url: SITE_URL,
            logo: SITE_LOGO,
            sameAs: ['https://www.instagram.com/luxx.uz_/'],
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+998884299969',
                contactType: 'customer service',
                areaServed: 'UZ',
                availableLanguage: ['uz', 'ru'],
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Luxx.uz',
            url: SITE_URL,
            inLanguage: 'uz',
            potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/products?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ClothingStore',
            name: 'Luxx.uz',
            image: SITE_LOGO,
            url: SITE_URL,
            telephone: '+998884299969',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Toshkent',
                addressCountry: 'UZ',
            },
            keywords: CATEGORY_KEYWORDS.join(', '),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: "Ayollar kiyimlari kategoriyalari",
            itemListOrder: 'https://schema.org/ItemListOrderAscending',
            itemListElement: CATEGORY_KEYWORDS.map((name, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Thing',
                    name,
                },
            })),
        },
    ];

    if (structuredData) {
        if (Array.isArray(structuredData)) {
            schemas.push(...structuredData);
        } else {
            schemas.push(structuredData);
        }
    }

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />
            <meta name="robots" content={robots} />
            <meta name="googlebot" content={robots} />
            <link rel="canonical" href={canonical} />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={pageImage} />
            <meta property="og:locale" content="uz_UZ" />

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
