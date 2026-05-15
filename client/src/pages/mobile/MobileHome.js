import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Shield, Gem, Star, Truck, Leaf, Radio, Camera, Swords, Gift, MessageSquare, Play } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MobileProductCard from './MobileProductCard';
import LookDetailModal from '../../components/LookDetailModal';
import useProductService from '../../server/server';
import { MobileHero, BrandJourney, Manifesto } from '../../components/mobile/MobileLandingSections';
import ParticleCanvas from '../../components/ParticleCanvas';
import { eventNavItems, resolveNavLabel } from '../../config/navigation';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getProductImage = (product) => {
  return product?.image || product?.images?.[0] || '/mobile.jpg';
};

const uniqueById = (items) => {
  const map = new Map();

  items.forEach((item) => {
    if (item?.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
};

const EVENT_ICONS = {
  Camera,
  Crown,
  Gift,
  Leaf,
  MessageSquare,
  Play,
  Radio,
  Swords,
};

const MobileHome = () => {
  const { t } = useLanguage();
  const { products, isLoading } = useProducts();
  const { getAllLooks, getAllBundles } = useProductService();
  const [looks, setLooks] = useState([]);
  const [featuredBundle, setFeaturedBundle] = useState(null);

  useEffect(() => {
    // Restore scroll position
    const savedScroll = sessionStorage.getItem('mobileHomeScroll');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }

    const fetchLooks = async () => {
      const result = await getAllLooks();
      if (result.success) {
        setLooks(result.data);
      }
    };

    const fetchBundles = async () => {
      const result = await getAllBundles();
      if (result && result.success && result.data && result.data.length > 0) {
        // Select the newest or first active bundle
        const activeBundle = result.data.find(b => b.isActive) || result.data[0];
        setFeaturedBundle(activeBundle);
      }
    };

    fetchLooks();
    fetchBundles();

    // Save scroll position on unmount
    return () => {
      sessionStorage.setItem('mobileHomeScroll', window.scrollY.toString());
    };
  }, []);

  const newestProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [products]);

  const displayProducts = products.slice(0, 6);

  const categoryCards = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      if (!product.category) return;

      const existing = categoryMap.get(product.category);

      if (!existing) {
        categoryMap.set(product.category, {
          name: product.category,
          count: 1,
          image: getProductImage(product),
        });
      } else {
        existing.count += 1;
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [products]);

  const bestsellerProducts = useMemo(() => {
    const fromBadge = products.filter((product) => (product.badge || '').toUpperCase() === 'BESTSELLER');
    const fromRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return uniqueById([...fromBadge, ...fromRating]).slice(0, 4);
  }, [products]);

  const lookbookProducts = useMemo(() => {
    // 1. Manual selection: products with isLookbook = true
    const manualLookbook = products.filter(p => p.isLookbook);

    // Sort manual entries by creation date (newest first)
    manualLookbook.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 2. Auto selection (fallback): Newest + Bestsellers
    // We filter out products that are already in manualLookbook
    const autoPool = uniqueById([...newestProducts, ...bestsellerProducts])
      .filter(p => !manualLookbook.find(m => m.id === p.id));

    // 3. Combine: Take all manual ones (up to 2), fill rest from autoPool
    const combined = [...manualLookbook, ...autoPool];

    return combined.slice(0, 2);
  }, [products, newestProducts, bestsellerProducts]);

  const voices = useMemo(() => {
    const customQuotes = [
      "Bu yerda haqiqatan ham noyob va sifatli kiyimlar bor. Har bir tafsilotga e'tibor qaratilgan. Men doimiy mijozman!",
      "LUXX.UZ dan olgan har bir kiyimim mening kutganimdan ham a'lo chiqdi. Sifati va dizayni haqiqatan ham premium darajada!",
      "Mijozlarga xizmat ko'rsatish darajasi a'lo. Yetkazib berish tez va mahsulotlar sifatli. Tavsiya qilaman!"
    ];
    const names = ['Madina R.', 'Aziza K.', 'Sevinch T.'];

    // Creating an array for the 3 custom voices
    return customQuotes.map((quote, index) => ({
      id: `voice-${index}`,
      name: names[index],
      quote: quote,
      rating: "5.0",
    }));
  }, []);

  const heroImage = getProductImage(newestProducts[0]);

  const [activeLookId, setActiveLookId] = React.useState(null);

  // Parse URL for look query param on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lookId = params.get('look');
    if (lookId) {
      setActiveLookId(lookId);
    }
  }, []);

  const openLook = (id) => {
    setActiveLookId(id);
    const url = new URL(window.location);
    url.searchParams.set('look', id);
    window.history.pushState({}, '', url);
  };

  const closeLook = () => {
    setActiveLookId(null);
    const url = new URL(window.location);
    url.searchParams.delete('look');
    window.history.pushState({}, '', url);
  };

  return (
    <>
      {activeLookId && <LookDetailModal lookId={activeLookId} onClose={closeLook} />}
      <div className="min-h-screen bg-[#060a14] pb-20 text-white relative overflow-hidden">
        <div className="pointer-events-none fixed left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b47c]/[0.02] blur-[100px] z-0" />
        <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-white/[0.01] blur-[80px] z-0" />
        <ParticleCanvas />
        <div className="relative z-10">
          <MobileHero product={newestProducts[0]} />

        <BrandJourney />

        {/* All Bundles Banner */}
        {featuredBundle && (
        <section className="px-4 py-4">
          <Link to="/mobile/bundles" className="relative block w-full rounded-2xl overflow-hidden border border-[#d6b47c]/30 shadow-[0_0_20px_rgba(214,180,124,0.15)] group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1410] via-[#060a14] to-[#1a1410] z-0" />
            <div className="relative z-10 p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Gem className="w-4 h-4 text-[#d6b47c]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold">Premium To'plamlar</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Barcha to'plamlarni ko'rish</h3>
                <p className="text-xs text-[#d6b47c]/80">Maxsus chegirmalar va premium to'plamlar faqat siz uchun</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#d6b47c]/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-[#d6b47c]/30 group-active:scale-90 transition-transform">
                <ArrowRight className="w-5 h-5 text-[#d6b47c]" />
              </div>
            </div>
            {/* Glow effects */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#d6b47c]/20 blur-[25px] rounded-full z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-32 h-10 bg-[#d6b47c]/10 blur-[20px] rounded-full z-0 pointer-events-none" />
          </Link>
        </section>
        )}

        {/* Platform Features */}
        <section className="py-6">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#f4f1eb]">Platform</h2>
          </div>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide scroll-smooth">
              {eventNavItems.map(item => {
                const Icon = EVENT_ICONS[item.icon] || Gem;
                return (
                <Link
                  key={item.id}
                  to={item.mobilePath}
                  className="min-w-[115px] rounded-2xl border border-white/5 p-4 flex-shrink-0 flex flex-col items-center text-center gap-2 transition-all active:scale-95"
                  style={{ background: `${item.color}18`, borderColor: `${item.color}20` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <p className="text-[13px] font-bold text-white">{resolveNavLabel(item, t)}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{item.subtitle}</p>
                </Link>
              )})}
              {/* Extra spacing for scroll */}
              <div className="min-w-[1px] h-1 flex-shrink-0" />
            </div>
            {/* Right Fade Indicator */}
            <div className="absolute top-0 right-0 bottom-2 w-16 bg-gradient-to-l from-[#060a14] via-[#060a14]/60 to-transparent pointer-events-none z-10" />
          </div>
        </section>

        <section className="py-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#f4f1eb]">Kategoriyalar</h2>
            <Link to="/mobile/products" className="text-sm text-neutral-300 inline-flex items-center gap-1">
              Hammasi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide scroll-smooth">
              {categoryCards.map((category) => (
                <Link
                  key={category.name}
                  to={`/mobile/products?category=${encodeURIComponent(category.name)}`}
                  className="min-w-[180px] h-36 relative rounded-2xl overflow-hidden border border-white/10 flex-shrink-0"
                >
                  <img
                    src={category.image || '/mobile.jpg'}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-[#060a14]/30 to-transparent" />
                  <div className="relative h-full p-3.5 flex items-end">
                    <div>
                      <p className="text-base font-semibold text-[#f4f1eb]">{category.name}</p>
                      <p className="text-xs text-neutral-300">{category.count} model</p>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="min-w-[1px] h-1 flex-shrink-0" />
            </div>
            {/* Right Fade Indicator */}
            <div className="absolute top-0 right-0 bottom-2 w-20 bg-gradient-to-l from-[#060a14] via-[#060a14]/60 to-transparent pointer-events-none z-10" />
          </div>
        </section>

        <section className="px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#f4f1eb]">Bestsellerlar</h2>
            <Link to="/mobile/products" className="text-sm text-neutral-300 inline-flex items-center gap-1">
              Korish
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {bestsellerProducts.map((product) => (
              <Link
                key={product.id}
                to={`/mobile/product/${product.id}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                <div className="aspect-[3/4] relative">
                  <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wide text-neutral-400">{product.category}</p>
                  <p className="text-sm font-semibold text-[#f4f1eb] mt-1 line-clamp-1">{product.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-neutral-300 inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />
                      {(product.rating || 5).toFixed(1)}
                    </span>
                    <span className="text-xs font-semibold text-[#f4f1eb]">{formatPrice(product.price)} {t('common.sum')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#f4f1eb]">Lookbook</h2>
            <Link to="/mobile/lookbooks" className="text-sm text-neutral-300 inline-flex items-center gap-1">
              Hammasi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="columns-2 gap-3 space-y-3">
            {looks.slice(0, 4).map((look) => (
              <div
                key={look._id || look.id}
                onClick={() => openLook(look._id || look.id)}
                className="relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer break-inside-avoid mb-3"
              >
                <div className="relative w-full pt-[125%]">
                  <img
                    src={look.heroImage}
                    alt={look.title}
                    onError={(e) => { e.target.src = '/mobile.jpg' }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 text-black text-[10px] uppercase font-bold px-2 py-1 rounded-full">
                    Shop
                  </div>
                </div>

                <div className="absolute inset-0 p-3.5 flex items-end">
                  <div>
                    <p className="text-sm font-semibold text-[#f4f1eb] mt-1 line-clamp-2">{look.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-semibold text-[#f4f1eb]">Mijozlar fikri</h3>
            {voices.map((voice) => (
              <article key={voice.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#f4f1eb]">{voice.name}</p>
                  <span className="text-xs text-amber-300 inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {voice.rating}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mt-2">{voice.quote}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Mahsulotlar</h2>
            <Link
              to="/mobile/products"
              className="text-fuchsia-400 text-sm font-medium flex items-center gap-1"
            >
              Hammasi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayProducts.map((product, index) => (
                <MobileProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {products.length > 6 && (
            <div className="text-center mt-6">
              <Link
                to="/mobile/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-medium"
              >
                Barcha mahsulotlar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
        </div>
      </div>
    </>
  );
};

export default MobileHome;
