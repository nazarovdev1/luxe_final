import React, { useEffect, useMemo, useState } from 'react';
import LookDetailModal from '../../components/LookDetailModal';
import MobileCoutureHome from '../../components/mobile/MobileCoutureHome';
import { eventNavItems, resolveNavLabel } from '../../config/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProducts } from '../../contexts/ProductContext';
import useProductService from '../../server/server';

const imageOf = (product) => product?.image || product?.images?.[0] || '/mobile.jpg';
const idOf = (item) => item?._id || item?.id;

const uniqueById = (items) => {
  const seen = new Map();
  items.forEach((item) => {
    const id = idOf(item);
    if (id && !seen.has(id)) seen.set(id, item);
  });
  return Array.from(seen.values());
};

export default function MobileHome() {
  const { t } = useLanguage();
  const { products, isLoading } = useProducts();
  const { getAllLooks, getAllBundles } = useProductService();
  const [looks, setLooks] = useState([]);
  const [featuredBundle, setFeaturedBundle] = useState(null);
  const [activeLookId, setActiveLookId] = useState(null);

  useEffect(() => {
    let active = true;
    const savedScroll = Number(sessionStorage.getItem('mobileHomeScroll') || 0);
    if (savedScroll > 0) requestAnimationFrame(() => window.scrollTo(0, savedScroll));

    Promise.allSettled([getAllLooks(), getAllBundles()]).then(([looksResult, bundlesResult]) => {
      if (!active) return;
      const lookResponse = looksResult.status === 'fulfilled' ? looksResult.value : null;
      const bundleResponse = bundlesResult.status === 'fulfilled' ? bundlesResult.value : null;
      if (lookResponse?.success && Array.isArray(lookResponse.data)) setLooks(lookResponse.data);
      if (bundleResponse?.success && bundleResponse.data?.length) {
        setFeaturedBundle(bundleResponse.data.find((bundle) => bundle.isActive) || bundleResponse.data[0]);
      }
    });

    const lookId = new URLSearchParams(window.location.search).get('look');
    if (lookId) setActiveLookId(lookId);

    return () => {
      active = false;
      sessionStorage.setItem('mobileHomeScroll', String(window.scrollY));
    };
    // Service methods are recreated by the service hook, so this request must remain mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newestProducts = useMemo(() => [...products].sort((a, b) => (
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )), [products]);

  const categories = useMemo(() => {
    const grouped = new Map();
    products.forEach((product) => {
      if (!product.category) return;
      const current = grouped.get(product.category);
      if (current) current.count += 1;
      else grouped.set(product.category, { name: product.category, count: 1, image: imageOf(product) });
    });
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [products]);

  const bestsellers = useMemo(() => {
    const badged = products.filter((product) => String(product.badge || '').toUpperCase() === 'BESTSELLER');
    const ranked = [...products].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return uniqueById([...badged, ...ranked]).slice(0, 4);
  }, [products]);

  const voices = useMemo(() => [1, 2, 3].map((number) => ({
    id: `voice-${number}`,
    name: t(`mobileHome.voice_name_${number}`),
    quote: t(`mobileHome.voice_quote_${number}`),
    rating: '5.0',
  })), [t]);

  const universeItems = useMemo(() => eventNavItems
    .filter((item) => item.id !== 'reels')
    .slice(0, 6)
    .map((item) => ({ ...item, label: resolveNavLabel(item, t) })), [t]);

  const openLook = (lookId) => {
    setActiveLookId(lookId);
    const url = new URL(window.location.href);
    url.searchParams.set('look', lookId);
    window.history.pushState({}, '', url);
  };

  const closeLook = () => {
    setActiveLookId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('look');
    window.history.replaceState({}, '', url);
  };

  return (
    <>
      {activeLookId && <LookDetailModal lookId={activeLookId} onClose={closeLook} />}
      <MobileCoutureHome
        products={products}
        newestProducts={newestProducts}
        categories={categories}
        bestsellers={bestsellers}
        bundle={featuredBundle}
        looks={looks}
        voices={voices}
        universeItems={universeItems}
        isLoading={isLoading}
        onOpenLook={openLook}
      />
    </>
  );
}
