import {
  getActiveMobileNavId,
  shouldHideMobileBottomNav,
} from './mobileNavigation';

describe('mobile navigation route state', () => {
  test.each([
    ['/mobile', 'home'],
    ['/mobile/', 'home'],
    ['/mobile/products', 'shop'],
    ['/mobile/bundles', 'shop'],
    ['/mobile/events', 'explore'],
    ['/mobile/lookbooks', 'explore'],
    ['/mobile/vip-club', 'explore'],
    ['/mobile/live', 'explore'],
    ['/mobile/style-feed', 'explore'],
    ['/mobile/blog/a-premium-look', 'explore'],
    ['/mobile/cart', 'cart'],
    ['/mobile/profile', 'profile'],
    ['/mobile/orders', 'profile'],
    ['/mobile/login', 'profile'],
    ['/mobile/privacy-policy', 'profile'],
  ])('%s activates %s', (pathname, expectedId) => {
    expect(getActiveMobileNavId(pathname)).toBe(expectedId);
  });

  test('unknown mobile routes do not force an active tab', () => {
    expect(getActiveMobileNavId('/mobile/admin')).toBeNull();
  });
});

describe('mobile navigation visibility', () => {
  test.each([
    '/mobile/checkout',
    '/mobile/product/123',
    '/mobile/reels',
    '/mobile/reels/123',
    '/mobile/lookbooks/123',
    '/mobile/bundle/123',
    '/mobile/live/123',
  ])('hides on fullscreen route %s', (pathname) => {
    expect(shouldHideMobileBottomNav(pathname)).toBe(true);
  });

  test.each([
    '/mobile',
    '/mobile/products',
    '/mobile/lookbooks',
    '/mobile/bundles',
    '/mobile/live',
    '/mobile/blog/article',
  ])('stays visible on primary route %s', (pathname) => {
    expect(shouldHideMobileBottomNav(pathname)).toBe(false);
  });
});
