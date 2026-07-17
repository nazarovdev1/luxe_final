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

        <div className="-mt-28 relative z-0">
          <BrandJourney />
        </div>

        {/* All Bundles Banner */}
        {featuredBundle && (
        <section className="px-4 py-2 -mt-32 relative z-20">
          <Link to="/mobile/bundles" className="block w-full rounded-[2rem] overflow-hidden border border-white/[0.05] bg-[#121110] p-6 shadow-2xl">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full border border-[#d6b47c]/30 bg-[#d6b47c]/5 flex-shrink-0">
                  <Gem className="w-4 h-4 text-[#d6b47c]" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold">Premium To'plamlar</span>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Content Area */}
            <div className="mb-6">
              <h3 className="font-brilliant text-[22px] leading-snug text-white mb-2">
                Barcha to'plamlarni ko'rish
              </h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed max-w-[280px]">
                Maxsus chegirmalar va premium to'plamlar faqat siz uchun.
              </p>
            </div>

            {/* Bottom Line */}
            <div className="w-12 h-[1px] bg-white/15" />
          </Link>
        </section>
        )}

        {/* Platform Features */}
        <section className="py-8">
          <div className="px-4 flex items-center justify-between mb-5">
            <h2 className="font-brilliant text-[26px] text-[#f4f1eb]">Platformalar</h2>
            <Link to="/mobile/events" className="text-[11px] text-neutral-400 flex items-center gap-1">
              Barchasini ko'rish <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide scroll-smooth">
              {eventNavItems.filter(item => item.id !== 'reels').map(item => {
                const Icon = EVENT_ICONS[item.icon] || Gem;
                
                // Color-matched gradients
                const gradientMap = {
                  'vip-club': 'from-[#302717] to-[#0f0c07]',
                  'style-feed': 'from-[#211a3b] to-[#0a0812]',
                  'challenges': 'from-[#14262d] to-[#060b0d]',
                  'live': 'from-[#3b1212] to-[#120505]',
                  'eco-impact': 'from-[#11311b] to-[#050f08]',
                  'gift-cards': 'from-[#3b200e] to-[#120a04]',
                  'blog': 'from-[#3b1828] to-[#12070c]',
                };
                
                const gradient = gradientMap[item.id] || 'from-[#1a1a1a] to-[#0d0d0d]';
                
                return (
                  <Link
                    key={item.id}
                    to={item.mobilePath}
                    className="min-w-[130px] w-[130px] rounded-[24px] overflow-hidden h-[220px] flex flex-col p-4 bg-gradient-to-b border border-white/5 relative flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${gradient} z-0`} />
                    
                    <div className="flex-1 flex items-center justify-center relative z-10">
                      <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-black/20" style={{ borderColor: `${item.color}30` }}>
                         <Icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                    </div>
                    
                    <div className="mt-auto relative z-10">
                      <h3 className="text-white font-bold text-xs mb-0.5 leading-tight">{resolveNavLabel(item, t)}</h3>
                      <p className="text-[9px] text-neutral-400 leading-tight mb-2 h-6 line-clamp-2">{item.subtitle}</p>
                      <ArrowRight className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                  </Link>
                );
              })}
              {/* Padding spacer at the end of scroll */}
              <div className="min-w-[4px] h-1 flex-shrink-0" />
            </div>
            {/* Right Fade Indicator */}
            <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-[#060a14] via-[#060a14]/60 to-transparent pointer-events-none z-10" />
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
