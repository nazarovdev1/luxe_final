import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  AlertCircle,
  Gem,
  ArrowUpRight,
  ChevronRight,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

const formatPrice = (price) => {
  if (typeof price !== 'number') {
    return '';
  }

  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getSizes = (product) =>
  Array.isArray(product.sizes)
    ? product.sizes
        .flatMap((size) => (typeof size === 'string' && size.includes(' ') ? size.split(' ') : [size]))
        .map(String)
        .filter(Boolean)
    : [];

const LookProductCard = ({ product, selection, error, onSelect, onOpenProduct }) => {
  const sizeOptions = getSizes(product);
  const hasVariants = (product.colors?.length || 0) > 0 || sizeOptions.length > 0;

  return (
    <article
      className={`rounded-2xl border p-3.5 transition-all ${
        error
          ? 'bg-red-950/25 border-red-400/40'
          : 'bg-[#101b2d]/70 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex gap-3">
        <img
          src={product.image || product.images?.[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          onError={(event) => {
            event.target.src = '/placeholder.jpg';
          }}
          className="w-16 h-20 rounded-xl object-cover border border-white/10"
        />

        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#56c4bb] mb-1">{product.category}</p>
          <h3 className="text-sm font-medium text-[#f4efe7] line-clamp-1">{product.name}</h3>

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-semibold text-[#d6b47c]">{formatPrice(product.price)} {t('common.sum')}</p>
            <button
              type="button"
              onClick={() => onOpenProduct(product.id)}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white transition-colors"
            >
              Ochish
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {hasVariants ? (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-white/5 pt-3">
          {product.colors?.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Rang</p>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((color, index) => {
                  const isHex = color.startsWith('#');
                  const isSelected = selection?.color === color;

                  return (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      title={color}
                      onClick={() => onSelect(product.id, 'color', color)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#d6b47c] ring-2 ring-[#d6b47c]/40 scale-105'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: isHex ? color : '#263247' }}
                    >
                      {!isHex ? (
                        <span className="text-[7px] text-white px-0.5 truncate">{color}</span>
                      ) : null}
                      {isSelected && isHex ? <Check className="w-3 h-3 text-white" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizeOptions.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">O'lcham</p>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map((size) => {
                  const isSelected = selection?.size === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onSelect(product.id, 'size', size)}
                      className={`px-2.5 h-6 rounded-lg text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-[#d6b47c] text-[#060810]'
                          : 'bg-white/5 text-neutral-300 border border-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 text-[11px] text-red-300 inline-flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      ) : null}
    </article>
  );
};

const MobileLookDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();

  const [look, setLook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
  }, [id]);

  useEffect(() => {
    const fetchLook = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/looks');
        const result = await response.json();

        if (result.success) {
          const found = (result.data || []).find((item) => item._id === id || item.id === id);
          setLook(found || null);
        } else {
          setLook(null);
        }
      } catch (error) {
        console.error('Failed to fetch look:', error);
        setLook(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLook();
  }, [id]);

  useEffect(() => {
    if (isImageFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isImageFullscreen]);

  const lookProducts = useMemo(() => {
    if (!look) {
      return [];
    }

    if (Array.isArray(look.products) && look.products.length > 0) {
      const first = look.products[0];

      if (typeof first === 'object') {
        return look.products.map((item) => {
          const productId = item.id || item._id;
          const found = products.find((product) => product.id === productId);

          return (
            found || {
              id: productId,
              name: item.name,
              price: item.price,
              category: item.category,
              colors: item.colors || [],
              sizes: item.sizes || [],
              images: item.images || [],
              image: item.image || item.images?.[0] || '/placeholder.jpg',
            }
          );
        });
      }

      return products.filter((product) => look.products.includes(product.id));
    }

    const resolved = [];
    (look.items || []).forEach((item) => {
      const byCategory = products
        .filter((product) => product.category === item.category)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, item.count || 1);

      resolved.push(...byCategory);
    });

    return [...new Set(resolved)];
  }, [look, products]);

  useEffect(() => {
    if (!lookProducts.length) {
      return;
    }

    const nextSelections = {};
    lookProducts.forEach((product) => {
      const next = {};
      if ((product.colors || []).length === 1) {
        next.color = product.colors[0];
      }

      const sizes = getSizes(product);
      if (sizes.length === 1) {
        next.size = sizes[0];
      }

      nextSelections[product.id] = next;
    });

    setSelections(nextSelections);
  }, [lookProducts]);

  const totalPrice = lookProducts.reduce(
    (sum, product) => sum + (typeof product.price === 'number' ? product.price : 0),
    0
  );
  const heroImage = look?.heroImage || look?.image || look?.images?.[0] || '/mobile.jpg';

  const handleSelect = (productId, field, value) => {
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value,
      },
    }));

    if (errors[productId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  const handleAddAll = async () => {
    if (!lookProducts.length) {
      return;
    }

    const nextErrors = {};
    let hasError = false;

    lookProducts.forEach((product) => {
      const selected = selections[product.id] || {};
      if ((product.colors || []).length > 0 && !selected.color) {
        nextErrors[product.id] = 'Rang tanlang';
        hasError = true;
      }

      const sizes = getSizes(product);
      if (sizes.length > 0 && !selected.size) {
        nextErrors[product.id] = nextErrors[product.id]
          ? "Rang va o'lcham tanlang"
          : "O'lcham tanlang";
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(nextErrors);
      toast.error('Barcha variantlarni tanlang');
      return;
    }

    setIsAddingAll(true);
    let added = 0;

    for (const product of lookProducts) {
      const selected = selections[product.id] || {};
      try {
        // add each product with selected variants
        // eslint-disable-next-line no-await-in-loop
        await addToCart(product, selected.color, selected.size, 1);
        added += 1;
      } catch (error) {
        console.error('Failed to add look product:', error);
      }
    }

    setIsAddingAll(false);

    if (added > 0) {
      toast.success(`Look savatga qo'shildi (${added} mahsulot)`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#d6b47c]/25 border-t-[#d6b47c] animate-spin" />
      </div>
    );
  }

  if (!look) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl font-semibold text-[#f4f1eb] mb-2">Look topilmadi</h2>
        <p className="text-sm text-neutral-400 mb-6">Ushbu look mavjud emas yoki o'chirilgan.</p>
        <button
          type="button"
          onClick={() => navigate('/mobile/lookbooks')}
          className="px-5 py-3 rounded-2xl bg-[#d6b47c] text-[#060810] font-semibold"
        >
          Lookbookga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#08090d] text-white">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <button
          type="button"
          onClick={() => navigate('/mobile/lookbooks')}
          className="w-10 h-10 rounded-full bg-black/35 backdrop-blur-md border border-white/15 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/mobile/cart')}
          className="h-10 px-4 rounded-full bg-black/35 backdrop-blur-md border border-white/15 inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/90"
        >
          <ShoppingBag className="w-4 h-4 text-[#d6b47c]" />
          Savat
        </button>
      </div>

      <section className="relative h-[100svh] min-h-[32rem] bg-[#060810] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsImageFullscreen(true)}
          className="block w-full h-full cursor-zoom-in"
          aria-label="Rasmni to'liq ochish"
        >
          <img
            src={heroImage}
            alt={look.title}
            onError={(event) => {
              event.target.src = '/mobile.jpg';
            }}
            className="w-full h-full object-cover object-center"
          />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/35 pointer-events-none" />
      </section>

      <section className="relative z-10 bg-[#08090d] border-t border-white/10 px-4 pt-7 pb-[8.5rem]">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d6b47c]/20 border border-[#d6b47c]/30 mb-3">
            <Gem className="w-3.5 h-3.5 text-[#d6b47c]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#d6b47c]">Look {look.id || ''}</span>
          </div>

          <h1 className="font-brilliant text-[1.85rem] leading-[1.06] text-[#f4f1eb]">{look.title}</h1>
          {look.description ? (
            <p className="text-[15px] text-neutral-400 mt-2 leading-relaxed">{look.description}</p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-[#0e1625]/75 border border-white/10 p-3.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 uppercase tracking-[0.2em]">Look tarkibi</span>
            <span className="text-[#d6b47c] font-semibold">{lookProducts.length} mahsulot</span>
          </div>
        </div>

        {lookProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f1623]/65 p-8 text-center">
            <p className="text-neutral-400 text-sm">Ushbu look uchun mahsulotlar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lookProducts.map((product) => (
              <LookProductCard
                key={product.id}
                product={product}
                selection={selections[product.id]}
                error={errors[product.id]}
                onSelect={handleSelect}
                onOpenProduct={(productId) => navigate(`/mobile/product/${productId}`)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#070b13] via-[#070b13]/95 to-transparent">
        <div className="rounded-2xl border border-white/10 bg-[#090f1c] p-3.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">{t('common.total')}</span>
            <span className="text-lg font-semibold text-[#d6b47c]">{formatPrice(totalPrice)} {t('common.sum')}</span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/mobile/lookbooks')}
              className="h-12 rounded-xl border border-white/10 text-neutral-300 text-sm inline-flex items-center justify-center gap-1.5"
            >
              Looklar
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAddAll}
              disabled={isAddingAll || lookProducts.length === 0}
              className="h-12 px-5 rounded-xl bg-[#d6b47c] text-[#060810] font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {isAddingAll ? "Qo'shilmoqda..." : 'Barchasini savatga'}
            </button>
          </div>
        </div>
      </div>

      {isImageFullscreen ? (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-3"
          onClick={() => setIsImageFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={heroImage}
            alt={look.title}
            onClick={(event) => event.stopPropagation()}
            onError={(event) => {
              event.target.src = '/mobile.jpg';
            }}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      ) : null}
    </div>
  );
};

export default MobileLookDetail;
