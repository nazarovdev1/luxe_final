import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Flame,
  Package,
  Search,
  SlidersHorizontal,
  Gem,
  Star,
  X,
} from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import SEO from '../components/SEO';

const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Narx mavjud emas';
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} so'm`;
};

const getImage = (product) => {
  return product?.image || product?.images?.[0] || '/placeholder.jpg';
};

const badgeScore = (badge = '') => {
  const normalized = badge.toUpperCase();
  if (normalized === 'BESTSELLER') return 3;
  if (normalized === 'NEW') return 2;
  return 1;
};

const productScore = (product) => {
  return (product.rating || 0) * 100 + badgeScore(product.badge) * 10;
};

const PremiumCatalogCard = ({ product }) => {
  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all duration-500 hover:border-[#d6b47c]/40 hover:shadow-[0_24px_60px_rgba(20,16,10,0.5)]">
      <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden">
        <img
          src={getImage(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/20 to-transparent" />

        {product.badge && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            <Gem className="w-3.5 h-3.5 text-[#f0d0a4]" />
            {product.badge}
          </div>
        )}
      </Link>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-neutral-300">
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            {(product.rating || 0).toFixed(1)}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold text-[#f4f1eb] truncate group-hover:text-white transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold text-[#f4f1eb] truncate">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-sm text-neutral-500 line-through truncate">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/45 transition-colors"
          >
            Ko'rish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

const AllProducts = () => {
  const { products, isLoading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = React.useState(categoryFromUrl || 'Barchasi');
  const [searchText, setSearchText] = React.useState('');
  const [sortBy, setSortBy] = React.useState('featured');

  React.useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'Barchasi');
  }, [categoryFromUrl]);

  const categories = React.useMemo(() => {
    const counts = new Map();

    products.forEach((product) => {
      if (!product.category) return;
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    });

    const dynamic = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return [{ name: 'Barchasi', count: products.length }, ...dynamic];
  }, [products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    if (category === 'Barchasi') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const filteredProducts = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Barchasi' || product.category === selectedCategory;
      const searchMatch =
        q.length === 0 ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q);

      return categoryMatch && searchMatch;
    });
  }, [products, selectedCategory, searchText]);

  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];

    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => {
          const aDate = new Date(a.createdAt || 0).getTime();
          const bDate = new Date(b.createdAt || 0).getTime();
          return bDate - aDate;
        });
      case 'price-low':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'featured':
      default:
        return list.sort((a, b) => productScore(b) - productScore(a));
    }
  }, [filteredProducts, sortBy]);

  const spotlightProduct = sortedProducts[0];
  const gridProducts = sortedProducts.slice(1);

  const bestRated = React.useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((p) => Number(p.rating || 0))).toFixed(1);
  }, [products]);

  const seoData = React.useMemo(() => {
    if (selectedCategory === 'Barchasi') {
      return {
        title: "Barcha ayollar kiyimlari - premium katalog",
        description:
          "Luxx.uz premium katalogi: luxury kiyimlar, yozgi kiyimlar, qishgi kiyimlar, bahorgi kiyimlar, kuzgi kiyimlar va paltolar.",
        keywords:
          "luxury kiyimlar, ayollar kiyimlari, yozgi kiyimlar, qishgi kiyimlar, bahorgi kiyimlar, kuzgi kiyimlar, paltolar, premium katalog",
      };
    }

    return {
      title: `${selectedCategory} - Premium katalog`,
      description: `Luxx.uz katalogida ${selectedCategory.toLowerCase()} kolleksiyasi. Premium fason va tez yetkazib berish bilan xarid qiling.`,
      keywords: `${selectedCategory}, ayollar kiyimlari, luxx.uz, premium kiyimlar, luxury kiyimlar`,
    };
  }, [selectedCategory]);

  const clearFilters = () => {
    setSearchText('');
    setSortBy('featured');
    handleCategoryChange('Barchasi');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07080c] pt-24 pb-16">
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalPath="/products"
      />

      <div className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-[#5c3b13]/25 blur-3xl" />
      <div className="pointer-events-none absolute top-64 -right-20 h-72 w-72 rounded-full bg-[#27314a]/30 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171724]/95 via-[#101321]/95 to-[#15141d]/95 p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(214,180,124,0.18),transparent_35%)]" />

          <div className="relative flex flex-col gap-7">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm text-neutral-200 hover:bg-black/40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Orqaga
                </Link>

                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
                  <Crown className="w-3.5 h-3.5 text-[#f0d0a4]" />
                  Curated catalog
                </p>

                <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-[#f4f1eb]">
                  Premium mahsulotlar
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-neutral-300 leading-relaxed">
                  Sahifa premium xarid tajribasi uchun qayta yig'ildi: tez qidiruv, aqlli saralash,
                  kategoriyalar bo'yicha instant filtering va eksklyuziv kartochka dizayni.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{products.length}</p>
                  <p className="text-xs text-neutral-400 mt-1">Model</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{categories.length - 1}</p>
                  <p className="text-xs text-neutral-400 mt-1">Kategoriya</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-center min-w-[96px]">
                  <p className="text-2xl font-semibold text-[#f4f1eb]">{bestRated}</p>
                  <p className="text-xs text-neutral-400 mt-1">Top baho</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_auto] gap-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Mahsulot nomi yoki kategoriya bo'yicha qidiring"
                  className="w-full h-12 rounded-2xl border border-white/15 bg-black/25 pl-11 pr-11 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#d6b47c]/60 transition-colors"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-white/15 bg-black/40 text-neutral-300 hover:text-white"
                    aria-label="Qidiruvni tozalash"
                  >
                    <X className="w-3.5 h-3.5 mx-auto" />
                  </button>
                )}
              </label>

              <div className="grid grid-cols-2 sm:flex gap-2">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'newest', label: 'Yangi' },
                  { id: 'rating', label: 'Reyting' },
                  { id: 'price-low', label: 'Arzon narx' },
                  { id: 'price-high', label: 'Qimmat narx' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`h-12 px-4 rounded-2xl text-sm border transition-colors ${
                      sortBy === option.id
                        ? 'border-[#d6b47c]/60 bg-[#d6b47c]/15 text-[#f4f1eb]'
                        : 'border-white/15 bg-black/25 text-neutral-300 hover:text-white hover:bg-black/40'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Kategoriyalar
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-300 hover:text-white transition-colors"
              >
                Filterlarni tozalash
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                    selectedCategory === category.name
                      ? 'border-[#d6b47c]/70 bg-[#d6b47c]/15 text-[#f4f1eb]'
                      : 'border-white/15 bg-black/20 text-neutral-300 hover:text-white hover:bg-black/35'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-neutral-400">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-neutral-300">
            <span className="text-[#f4f1eb] font-medium">{sortedProducts.length}</span> ta natija topildi
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-wide text-neutral-300">
            <Flame className="w-3.5 h-3.5 text-orange-300" />
            Premium selection
          </div>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-[#12131c]/90 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-black/30">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-semibold text-[#f4f1eb]">Mahsulot topilmadi</h2>
            <p className="mt-2 text-neutral-400">Filtrlarni o'zgartirib qaytadan qidirib ko'ring.</p>
            <button
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/25 px-5 py-3 text-sm text-white hover:bg-black/40 transition-colors"
            >
              Qayta ko'rsatish
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        ) : (
          <section className="space-y-6">
            {spotlightProduct && (
              <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11131e]/95 p-3 sm:p-4 lg:p-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(214,180,124,0.13),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(76,102,156,0.18),transparent_45%)]" />

                <div className="relative grid lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] gap-4">
                  <div className="relative min-h-[300px] lg:min-h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f1017]">
                    <img
                      src={getImage(spotlightProduct)}
                      alt={spotlightProduct.name}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d14]/45 via-transparent to-[#0b0d14]/45" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0d14]/55 to-transparent" />

                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] uppercase tracking-wide text-neutral-200">
                      <Crown className="w-3.5 h-3.5 text-[#f0d0a4]" />
                      Spotlight
                    </div>
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {(spotlightProduct.rating || 0).toFixed(1)}
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Spotlight mahsulot</p>
                      <h3 className="mt-2 text-2xl font-semibold text-[#f4f1eb]">{spotlightProduct.name}</h3>
                      <p className="mt-1 text-sm text-neutral-300">{spotlightProduct.category}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-xl font-bold text-[#f4f1eb]">{formatPrice(spotlightProduct.price)}</span>
                        <Link
                          to={`/product/${spotlightProduct.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                        >
                          Mahsulotga o'tish
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Nega tanlashmoqda</p>
                      <ul className="mt-3 space-y-2.5">
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Cheklangan drop va premium fason
                        </li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Yuqori reytingli va ko'p tanlangan model
                        </li>
                        <li className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-neutral-200">
                          Kategoriya ichida eng yaxshi narx-sifat balansi
                        </li>
                      </ul>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                        <p className="text-xs uppercase tracking-wide text-neutral-400">Status</p>
                        <p className="mt-1.5 text-base font-semibold text-[#f4f1eb]">Top Selection</p>
                        <p className="mt-1 text-xs text-neutral-400">Stylistlar tavsiya qilgan model</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                        <p className="text-xs uppercase tracking-wide text-neutral-400">Category</p>
                        <p className="mt-1.5 text-base font-semibold text-[#f4f1eb]">{spotlightProduct.category}</p>
                        <p className="mt-1 text-xs text-neutral-400">Fashion capsule ichida</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d6b47c]/35 bg-gradient-to-r from-[#d6b47c]/18 to-transparent p-3.5">
                      <p className="text-sm leading-relaxed text-[#f4f1eb]">
                        Xarid tezligi va vizual preview uchun spotlight blok editorial formatda optimallashtirildi.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {gridProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {gridProducts.map((product) => (
                  <PremiumCatalogCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
