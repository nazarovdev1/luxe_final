import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, Check, ArrowRight, Percent } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getImage = (item) => item?.image || item?.images?.[0] || '/placeholder.jpg';

// Bundle data - in production this would come from the backend
const SAMPLE_BUNDLES = [
  {
    id: 'bundle-office',
    name: 'Office Elegance',
    description: 'Ofis uchun to\'liq look — ko\'ylak, blazer va aksessuarlar',
    discount: 15,
    items: [
      { id: 'item-1', name: 'Classic Blazer', price: 450000, image: null, size: 'M', color: 'Qora' },
      { id: 'item-2', name: 'Silk Blouse', price: 280000, image: null, size: 'M', color: 'Oq' },
      { id: 'item-3', name: 'Wide-leg Trousers', price: 320000, image: null, size: 'M', color: 'Qora' },
    ],
  },
  {
    id: 'bundle-evening',
    name: 'Evening Glamour',
    description: 'Kechki tadbir uchun tayyor look',
    discount: 12,
    items: [
      { id: 'item-4', name: 'Evening Dress', price: 580000, image: null, size: 'S', color: 'Qizil' },
      { id: 'item-5', name: 'Clutch Bag', price: 220000, image: null, size: 'One Size', color: 'Oltin' },
    ],
  },
];

const BundleCard = ({ bundle }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const originalTotal = bundle.items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = Math.round((originalTotal * bundle.discount) / 100);
  const bundlePrice = originalTotal - discountAmount;

  const handleAddBundle = async () => {
    setIsAdding(true);
    try {
      for (const item of bundle.items) {
        await addToCart(
          { id: item.id, name: item.name, price: item.price, image: item.image },
          item.color,
          item.size,
          1
        );
      }
      toast.success(`"${bundle.name}" to'plami savatga qo'shildi! ${bundle.discount}% chegirma`);
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] transition-all duration-500 hover:border-[#d6b47c]/40 hover:shadow-[0_24px_60px_rgba(20,16,10,0.5)]">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d6b47c] to-[#c4985a] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f1014] shadow-lg">
        <Percent className="w-3 h-3" />
        {bundle.discount}% OFF
      </div>

      {/* Bundle Items Preview */}
      <div className="relative p-4 pb-0">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {bundle.items.map((item, i) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[80px] h-[100px] rounded-xl bg-[#0d1423] border border-white/10 overflow-hidden"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9aa3b2]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        <h3 className="text-lg font-semibold text-[#f4f1eb] group-hover:text-[#d6b47c] transition-colors">
          {bundle.name}
        </h3>
        <p className="text-xs text-[#9aa3b2] mt-1 line-clamp-2">{bundle.description}</p>

        {/* Items List */}
        <div className="mt-3 space-y-1.5">
          {bundle.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-[#9aa3b2] flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                {item.name}
              </span>
              <span className="text-[#9aa3b2]">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#9aa3b2]">
            <span>Jami alohida</span>
            <span className="line-through">{formatPrice(originalTotal)} so'm</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#d6b47c]">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              To'plam chegirmasi
            </span>
            <span>-{formatPrice(discountAmount)} so'm</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-[#f4f1eb]">To'plam narxi</span>
            <span className="text-lg font-bold text-[#d6b47c]">{formatPrice(bundlePrice)} so'm</span>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddBundle}
          disabled={isAdding}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d6b47c] px-4 py-2.5 text-sm font-semibold text-[#0f1014] transition-all hover:bg-[#e0c08e] active:scale-[0.98] disabled:opacity-60"
        >
          {isAdding ? (
            <span>Qo'shilmoqda...</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              To'plamni savatga qo'shish
            </>
          )}
        </button>
      </div>
    </article>
  );
};

const ProductBundles = () => {
  return (
    <section className="py-16 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
              Alohida sotib olishdan 12-15% arzonroq
            </p>
          </div>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductBundles;
