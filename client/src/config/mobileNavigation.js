export const MOBILE_NAV_ROUTE_GROUPS = {
  home: {
    exact: ['/mobile'],
    prefixes: [],
  },
  shop: {
    exact: ['/mobile/products', '/mobile/bundles'],
    prefixes: ['/mobile/bundles/'],
  },
  explore: {
    exact: [],
    prefixes: [
      '/mobile/events',
      '/mobile/lookbooks',
      '/mobile/vip-club',
      '/mobile/eco-impact',
      '/mobile/live',
      '/mobile/style-feed',
      '/mobile/challenges',
      '/mobile/reels',
      '/mobile/gift-cards',
      '/mobile/blog',
    ],
  },
  cart: {
    exact: ['/mobile/cart'],
    prefixes: [],
  },
  profile: {
    exact: [],
    prefixes: [
      '/mobile/profile',
      '/mobile/orders',
      '/mobile/login',
      '/mobile/register',
      '/mobile/privacy-policy',
      '/mobile/terms',
    ],
  },
};

const normalizePathname = (pathname = '') => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }

  return pathname;
};

export const getActiveMobileNavId = (
  pathname,
  routeGroups = MOBILE_NAV_ROUTE_GROUPS,
) => {
  const normalizedPathname = normalizePathname(pathname);

  for (const [id, routes] of Object.entries(routeGroups)) {
    if (routes.exact?.includes(normalizedPathname)) return id;
    if (
      routes.prefixes?.some((prefix) => {
        const normalizedPrefix = prefix.replace(/\/+$/, '');
        return (
          normalizedPathname === normalizedPrefix ||
          normalizedPathname.startsWith(`${normalizedPrefix}/`)
        );
      })
    ) return id;
  }

  return null;
};

export const shouldHideMobileBottomNav = (pathname = '') => {
  const normalizedPathname = normalizePathname(pathname);

  // Authentication has its own focused, keyboard-safe mobile layout.
  if (normalizedPathname === '/mobile/login' || normalizedPathname === '/mobile/register') return true;
  if (normalizedPathname === '/mobile/checkout') return true;
  if (normalizedPathname === '/mobile/reels' || normalizedPathname.startsWith('/mobile/reels/')) return true;
  if (normalizedPathname.startsWith('/mobile/product/')) return true;
  if (normalizedPathname.startsWith('/mobile/bundle/')) return true;
  if (normalizedPathname.startsWith('/mobile/live/')) return true;
  if (
    normalizedPathname.startsWith('/mobile/lookbooks/') &&
    normalizedPathname !== '/mobile/lookbooks'
  ) return true;
  if (
    normalizedPathname.startsWith('/mobile/admin/new') ||
    normalizedPathname.startsWith('/mobile/admin/edit')
  ) return true;

  return false;
};
