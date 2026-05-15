import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, Check, Percent, Eye } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import useProductService from '../server/server';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getImage = (item) => {
  if (!item) return '/placeholder.jpg';
  if (typeof item === 'string') return item;
  if (item.image && typeof item.image === 'string') return item.image;
  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'object' && first.url) return first.url;
    if (typeof first === 'string') return first;
  }
  if (item.image && typeof item.image === 'object' && item.image.url) return item.image.url;
  return '/placeholder.jpg';
};

const BundleCard = ({ look, resolvedProducts }) => {
  const { t } = useLanguage();

  const originalTotal = look.originalPrice || resolvedProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const discountAmount = look.discountType === 'percentage'
    ? Math.round((originalTotal * look.discountValue) / 100)
    : Math.min(look.discountValue || 0, originalTotal);
  const bundlePrice = originalTotal - discountAmount;
  const discountPercent = look.discountType === 'percentage'
    ? look.discountValue
    : originalTotal > 0
      ? Math.round((discountAmount / originalTotal) * 100)
      : 0;

  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all duration-500 hover:border-[#d6b47c]/40 hover:shadow-[0_24px_60px_rgba(20,16,10,0.5)]">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d6b47c] to-[#c4985a] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f1014] shadow-lg">
        <Percent className="w-3 h-3" />
        {discountPercent}% OFF
      </div>

      {/* Bundle Items Preview */}
      <div className="relative p-4 pb-0">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {resolvedProducts.slice(0, 4).map((product, i) => {
            const imgSrc = getImage(product);
            return (
              <div
                key={product.id || i}
                className="flex-shrink-0 w-[80px] h-[100px] rounded-xl bg-[#0d1423] border border-white/10 overflow-hidden"
              >
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        <h3 className="text-lg font-semibold text-[#f4f1eb] group-hover:text-[#d6b47c] transition-colors">
          {look.title}
        </h3>
        {look.description && (
          <p className="text-xs text-[#9aa3b2] mt-1 line-clamp-2">{look.description}</p>
        )}

        {/* Items List */}
        <div className="mt-3 space-y-1.5">
          {resolvedProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between text-xs">
              <span className="text-[#9aa3b2] flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                {product.name}
              </span>
              <span className="text-[#9aa3b2]">{formatPrice(Number(product.price))}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#9aa3b2]">
            <span>Jami alohida</span>
            <span className="line-through">{formatPrice(originalTotal)} {t('common.sum')}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#d6b47c]">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              To'plam chegirmasi
            </span>
            <span>-{formatPrice(discountAmount)} {t('common.sum')}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-[#f4f1eb]">To'plam narxi</span>
            <span className="text-lg font-bold text-[#d6b47c]">{formatPrice(bundlePrice)} {t('common.sum')}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* View detail */}
          <Link
            to={`/bundle/${look._id || look.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:border-[#d6b47c]/30 hover:bg-[#d6b47c]/5 transition-all"
          >
            <Eye className="w-4 h-4" />
            Ko'rish
          </Link>

          {/* Add to Cart */}
          <Link
            to={`/bundle/${look._id || look.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#d6b47c] px-4 py-2.5 text-sm font-semibold text-[#0f1014] transition-all hover:bg-[#e0c08e] active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            Tanlab savatga
          </Link>
        </div>
      </div>
    </article>
  );
};

const ProductBundles = () => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const { getAllBundles } = useProductService();
  const [looks, setLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const result = await getAllBundles();
        if (result?.success) {
          setLooks(result.data || []);
        } else if (Array.isArray(result)) {
          setLooks(result);
        }
      } catch (err) {
        console.error('Failed to fetch bundles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const activeLooks = useMemo(() => {
    return looks.filter((look) => {
      if (!look.isActive) return false;
      if (!look.products || look.products.length === 0) return false;
      if (look.expiresAt && new Date(look.expiresAt) < new Date()) return false;
      return true;
    });
  }, [looks]);

  // Server now guarantees 'image' is a plain string URL on each populated product.
  // We just normalize the id field.
  const resolveProducts = (look) => {
    if (!look.products?.length) return [];

    const first = look.products[0];
    // Products are populated objects (not just IDs)
    if (typeof first === 'object' && (first.id || first._id)) {
      return look.products.map((p) => ({
        ...p,
        id: p.id || p._id,
        // image is already a string URL from server transform; fallback just in case
        image: (typeof p.image === 'string' && p.image) ? p.image
          : Array.isArray(p.images) && p.images.length > 0
            ? (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0])
            : '',
        price: Number(p.price) || 0,
      }));
    }

    // Fallback: products is a list of ObjectId strings → match from context
    return products
      .filter((p) => look.products.includes(p.id || p._id))
      .map((p) => ({
        ...p,
        image: (typeof p.image === 'string' && p.image) ? p.image
          : Array.isArray(p.images) && p.images.length > 0
            ? (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0])
            : '',
        price: Number(p.price) || 0,
      }));
  };

  if (!isLoading && activeLooks.length === 0) return null;

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d6b47c] mb-3">
              <Percent className="w-3 h-3" />
              To'plamlar
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#f4f1eb]">
              To'liq lookni <span className="text-[#d6b47c]">chegirma</span> bilan
            </h2>
            <p className="text-sm text-[#9aa3b2] mt-1">
              Alohida sotib olishdan arzonroq
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeLooks.map((look) => (
            <BundleCard
              key={look._id || look.id}
              look={look}
              resolvedProducts={resolveProducts(look)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductBundles;
