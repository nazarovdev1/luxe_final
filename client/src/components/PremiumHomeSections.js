import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Shield, ShoppingBag, Gem, Star, Truck } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { ProductGridSkeleton } from './ProductCardSkeleton';
import LookDetailModal from './LookDetailModal';
import useProductService from '../server/server';

const CUSTOMER_NAMES = ['Madina R.', 'Aziza K.', 'Sevinch T.'];

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Narx mavjud emas';
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} so'm`;
};

const getProductImage = (product) => {
  return product?.image || product?.images?.[0] || '/hero.jpg';
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

const PremiumHomeSections = () => {
  const { products, isLoading } = useProducts();
  const { getAllLooks } = useProductService();
  const [looks, setLooks] = useState([]);

  useEffect(() => {
    const fetchLooks = async () => {
      const result = await getAllLooks();
      if (result.success) {
        setLooks(result.data);
      }
    };
    fetchLooks();
  }, []);

  const newestProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [products]);

  const editorialProduct = newestProducts[0];

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
        return;
      }

      existing.count += 1;

      if (!existing.image && getProductImage(product)) {
        existing.image = getProductImage(product);
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [products]);

  const bestsellerProducts = useMemo(() => {
    const fromBadge = products.filter(
      (product) => (product.badge || '').toUpperCase() === 'BESTSELLER'
    );

    const fromRating = [...products].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    return uniqueById([...fromBadge, ...fromRating]).slice(0, 4);
  }, [products]);

  const lookbookProducts = useMemo(() => {
    return uniqueById([...newestProducts, ...bestsellerProducts]).slice(0, 3);
  }, [newestProducts, bestsellerProducts]);

  const customerVoices = useMemo(() => {
    const source = uniqueById([...bestsellerProducts, ...newestProducts]).slice(0, 3);
    const customQuotes = [
      "Bu yerda haqiqatan ham noyob va sifatli kiyimlar bor. Har bir tafsilotga e'tibor qaratilgan. Men doimiy mijozman!",
      "LUXX.UZ dan olgan har bir kiyimim mening kutganimdan ham a'lo chiqdi. Sifati va dizayni haqiqatan ham premium darajada!",
      "Mijozlarga xizmat ko'rsatish darajasi a'lo. Yetkazib berish tez va mahsulotlar sifatli. Tavsiya qilaman!"
    ];

    return source.map((product, index) => ({
      id: product.id,
      name: CUSTOMER_NAMES[index] || 'Luxx mijoz',
      rating: Number(product.rating || 5).toFixed(1),
      quote: customQuotes[index] || customQuotes[0],
      productName: product.name,
    }));
  }, [bestsellerProducts, newestProducts]);

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
      <section id="premium-home" className="bg-[#08090d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16 md:space-y-20">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
            <img
              src="/second_pose.jpg"
              alt="Luxx editorial kolleksiya"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f]/95 via-[#090a0f]/70 to-[#090a0f]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f]/95 via-transparent to-transparent" />

            <div className="relative grid lg:grid-cols-2 gap-8 p-7 sm:p-10 lg:p-12 min-h-[420px] items-end">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs tracking-wide uppercase">
                  <Gem className="w-3.5 h-3.5 text-amber-300" />
                  Editorial Drop
                </div>

                <h2 className="font-brilliant text-5xl md:text-7xl tracking-tight text-[#f4f1eb] flex flex-col gap-4">
                  <span className="leading-none">Yangi</span>
                  <span className="leading-none">Kolleksiya</span>
                  <span className="leading-none">2026</span>
                </h2>

                <p className="text-sm md:text-base text-neutral-200/90 max-w-lg">
                  Premium fasonlar, cheklangan drop va mukammal tikuv sifati. Har bir detal
                  ko'cha modasidan emas, podium kayfiyatidan ilhomlangan.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-tr-[30px] rounded-bl-[30px] rounded-tl-none rounded-br-none border-2 border-black bg-white text-black font-semibold hover:bg-neutral-100 transition-colors"
                  >
                    Ko'rish
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {editorialProduct?.id && (
                    <Link
                      to={`/lookbooks`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/25 bg-black/25 text-white font-medium hover:bg-black/35 transition-colors"
                    >
                      Lookbook item
                      <ShoppingBag className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 self-end">
                <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md p-4">
                  <div className="text-2xl font-bold text-[#f4f1eb]">{products.length}+</div>
                  <div className="text-xs text-neutral-300 mt-1">Premium mahsulotlar</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md p-4">
                  <div className="text-2xl font-bold text-[#f4f1eb]">{categoryCards.length}+</div>
                  <div className="text-xs text-neutral-300 mt-1">Asosiy kategoriyalar</div>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md p-4">
                  <div className="flex items-center gap-2 text-amber-300 mb-2">
                    <Crown className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Premium service</span>
                  </div>
                  <p className="text-sm text-neutral-200">
                    Tez buyurtma, aniq o'lcham guidance va elegant qadoqlash bilan xarid jarayoni
                    maksimal qulayliklar qilib qurilgan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section id="home-categories" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Shop by style</p>
                <h3 className="text-3xl md:text-4xl font-semibold text-[#f4f1eb] mt-2">Kategoriyalar</h3>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-[#f4f1eb] border border-white/20 rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
              >
                Hammasini ochish
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryCards.map((category) => (
                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-3xl h-52 border border-white/10"
                >
                  <img
                    src={category.image || '/hero.jpg'}
                    alt={`${category.name} kategoriyasi`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
                  <div className="relative h-full p-5 flex items-end justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-semibold text-[#f4f1eb]">{category.name}</h4>
                      <p className="text-sm text-neutral-300 mt-1">{category.count} ta model</p>
                    </div>
                    <span className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center bg-black/25">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section id="home-bestsellers" className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Top picks</p>
              <h3 className="text-3xl md:text-4xl font-semibold text-[#f4f1eb] mt-2">Bestsellerlar</h3>
              <p className="text-neutral-300 mt-3 text-sm md:text-base">
                Eng ko'p tanlangan pozitsiyalar. Narx, fason va sifat balansida eng kuchli lineup.
              </p>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {bestsellerProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] overflow-hidden"
                  >
                    <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/45 border border-white/20 text-[11px] uppercase tracking-wide">
                        {product.badge || 'TOP'}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent" />
                    </Link>

                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
                      <Link to={`/product/${product.id}`}>
                        <h4 className="mt-1 text-base font-semibold text-[#f4f1eb] group-hover:text-white transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-1 mt-3 text-amber-300">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-neutral-200">{(product.rating || 5).toFixed(1)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-base font-bold text-[#f4f1eb]">{formatPrice(product.price)}</span>
                        <Link
                          to={`/product/${product.id}`}
                          className="inline-flex items-center gap-1 text-sm text-neutral-200 hover:text-white transition-colors"
                        >
                          Ko'rish
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="home-lookbook" className="space-y-8">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Lookbook</p>
              <h3 className="text-3xl md:text-4xl font-semibold text-[#f4f1eb] mt-2">Evening to Street stories</h3>
              <p className="text-neutral-300 mt-3 text-sm md:text-base">
                Bir nechta kayfiyat, bitta premium standart. Outfitlar orasida tez tanlash uchun
                lookbook kadrlarini oldindan ko'rsatdik.
              </p>
            </div>

            <div className="columns-1 md:columns-3 gap-4 space-y-4">
              {looks.map((look) => (
                <div
                  key={look._id || look.id}
                  onClick={() => openLook(look._id || look.id)}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 cursor-pointer break-inside-avoid mb-4"
                >
                  <img
                    src={look.heroImage}
                    alt={look.title}
                    onError={(e) => { e.target.src = '/hero.jpg' }}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/10 to-transparent" />

                  {/* Shop The Look CTA */}
                  <div className="absolute top-4 right-4 z-10 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black shadow-lg">
                      Shop Look
                      <ShoppingBag className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="absolute inset-0 p-5 flex items-end">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-300">Look {look.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div id="customer-voices" className="pt-2">
              <div className="flex items-end justify-between flex-wrap gap-4 mb-5">
                <h4 className="text-2xl md:text-3xl font-semibold text-[#f4f1eb]">Mijozlar fikri</h4>
                <p className="text-sm text-neutral-400">Lookbookdan keyingi real tajribalar</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customerVoices.map((voice) => (
                  <article key={voice.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[#f4f1eb]">{voice.name}</p>
                        <p className="text-xs text-neutral-400">{voice.productName}</p>
                      </div>
                      <div className="inline-flex items-center gap-1 text-amber-300 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        {voice.rating}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-200 mt-4 leading-relaxed">{voice.quote}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="home-journey" className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <h4 className="text-2xl font-semibold text-[#f4f1eb]">Xarid jarayoni</h4>
              <div className="mt-6 space-y-4">
                {[
                  { title: '01. Kolleksiyani kashf qiling', desc: 'Nafis kategoriyalar va lookbook orqali mos uslubni toping.' },
                  { title: '02. Variantni belgilang', desc: 'Rang, o\'lcham va detalni bir oynada tanlab chiqing.' },
                  { title: '03. Tez checkout', desc: 'Minimal qadam bilan buyurtmani tasdiqlang.' },
                  { title: '04. Yetkazib berish', desc: 'Buyurtma holatini profile va bildirishnomalarda kuzating.' },
                ].map((step) => (
                  <div key={step.title} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5">
                    <p className="text-sm font-semibold text-[#f4f1eb]">{step.title}</p>
                    <p className="text-sm text-neutral-300 mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <h4 className="text-2xl font-semibold text-[#f4f1eb]">Nega Luxx.uz</h4>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <Shield className="w-5 h-5 text-emerald-300" />
                  <p className="mt-3 font-semibold text-[#f4f1eb]">Sifat nazorati</p>
                  <p className="text-sm text-neutral-300 mt-1">Har model tekshiruvdan o'tib keyin vitrinaga chiqadi.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <Truck className="w-5 h-5 text-sky-300" />
                  <p className="mt-3 font-semibold text-[#f4f1eb]">Tez logistika</p>
                  <p className="text-sm text-neutral-300 mt-1">Buyurtma atigi 3 soat ichida yetkazib beriladi.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:col-span-2">
                  <Crown className="w-5 h-5 text-amber-300" />
                  <p className="mt-3 font-semibold text-[#f4f1eb]">Premium ko'rinish</p>
                  <p className="text-sm text-neutral-300 mt-1">
                    Barcha kiyimlar PREMIUM darajada sifatli va original.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
};

export default PremiumHomeSections;
