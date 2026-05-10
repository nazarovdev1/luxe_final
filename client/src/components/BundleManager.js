import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader2, X, Search, DollarSign, Percent, Check } from 'lucide-react';
import useProductService from '../server/server';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-hot-toast';

const INITIAL_FORM = {
  title: '',
  description: '',
  heroImage: '',
  products: [],
  discountType: 'percentage',
  discountValue: 0,
  isActive: true,
};

const BundleManager = () => {
  const { t } = useLanguage();
  const { getAllBundles, createBundle, deleteBundle, getAllProducts } = useProductService();

  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [allProducts, searchTerm]
  );

  const selectedProductsData = useMemo(
    () => allProducts.filter((p) => formData.products.includes(p.id)),
    [allProducts, formData.products]
  );

  const pricePreview = useMemo(() => {
    const original = selectedProductsData.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    let discount = 0;
    let discounted = original;
    if (formData.discountType === 'percentage' && formData.discountValue > 0) {
      discount = original * (formData.discountValue / 100);
      discounted = original - discount;
    } else if (formData.discountType === 'fixed' && formData.discountValue > 0) {
      discount = formData.discountValue;
      discounted = Math.max(0, original - discount);
    }
    return { original, discount, discounted };
  }, [selectedProductsData, formData.discountType, formData.discountValue]);

  const fetchBundles = async () => {
    setIsLoading(true);
    const result = await getAllBundles();
    if (result.success) {
      setBundles(result.data || []);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const result = await getAllProducts();
    if (Array.isArray(result)) {
      setAllProducts(result);
    }
  };

  useEffect(() => {
    fetchBundles();
    fetchProducts();
}, []);

  const handleProductSelect = (productId) => {
    setFormData((prev) => {
      const exists = prev.products.includes(productId);
      return {
        ...prev,
        products: exists ? prev.products.filter((id) => id !== productId) : [...prev.products, productId],
      };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu to'plamni o'chirmoqchimisiz?")) return;
    const token = localStorage.getItem('token');
    const result = await deleteBundle(id, token);
    if (result.success) {
      toast.success("To'plam o'chirildi");
      setBundles((prev) => prev.filter((b) => b._id !== id));
    } else {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title || formData.products.length === 0) {
      toast.error("Nom va kamida 1 ta mahsulot tanlang");
      return;
    }

    const token = localStorage.getItem('token');
    const result = await createBundle(formData, token);

    if (result.success) {
      toast.success("To'plam yaratildi");
      setBundles((prev) => [result.data, ...prev]);
      setIsCreating(false);
      setFormData(INITIAL_FORM);
      setSearchTerm('');
    } else {
      toast.error(result.message || 'Xatolik yuz berdi');
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="admin-section-title text-xl inline-flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-300" />
            Yangi to'plam yaratish
          </h2>
          <button type="button" onClick={() => setIsCreating(false)} className="admin-btn-secondary p-2.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-200 mb-2">To'plam nomi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="admin-input"
                placeholder="Masalan: Kuzgi klassik"
              />
            </div>
            <div />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-2">Tavsif</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="admin-textarea min-h-[80px]"
              placeholder="To'plam haqida qisqacha"
            />
          </div>

          

          <div className="admin-card-soft p-4 space-y-3">
            <label className="block text-sm text-slate-200">Mahsulotlarni tanlash *</label>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Mahsulot nomini qidiring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto admin-scroll space-y-2 pr-1">
              {filteredProducts.map((product) => {
                const isSelected = formData.products.includes(product.id);
                return (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className={`w-full text-left rounded-xl border p-2.5 transition-colors ${
                      isSelected
                        ? 'border-amber-300/50 bg-amber-200/10'
                        : 'border-slate-600/50 hover:border-slate-500/60 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-600/60"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{product.name}</p>
                        <p className="admin-muted text-xs truncate">
                          {product.category} • {Number(product.price || 0).toLocaleString('uz-UZ')} {t('common.sum')}
                        </p>
                      </div>
                      {isSelected && <span className="admin-pill admin-pill-best">Tanlangan</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="admin-muted text-xs text-right">Tanlangan: {formData.products.length} ta</p>
          </div>

          <div className="admin-card-soft p-4 space-y-3">
            <label className="block text-sm text-slate-200">Chegirma sozlamalari</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Chegirma turi</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discountType: 'percentage' }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      formData.discountType === 'percentage' ? 'bg-amber-300 text-slate-900' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Percent className="w-3 h-3 inline mr-1" />
                    Foiz %
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discountType: 'fixed' }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      formData.discountType === 'fixed' ? 'bg-amber-300 text-slate-900' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    Qat'iy summa
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Chegirma qiymati</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) || 0 }))}
                  className="admin-input"
                  placeholder={formData.discountType === 'percentage' ? '15' : '50000'}
                />
              </div>
            </div>

            {pricePreview.original > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 border border-slate-600/30">
                <p className="text-xs text-slate-400 font-medium">Narx hisobi</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Original:</span>
                  <span className="text-slate-300">{pricePreview.original.toLocaleString('uz-UZ')} so'm</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Chegirma:</span>
                  <span className="text-emerald-400">
                    -{pricePreview.discount.toLocaleString('uz-UZ')} so'm {formData.discountType === 'percentage' ? `(-${formData.discountValue}%)` : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-slate-600/30">
                  <span className="text-slate-200">Yakuniy:</span>
                  <span className="text-amber-300">{pricePreview.discounted.toLocaleString('uz-UZ')} so'm</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={() => setIsCreating(false)} className="admin-btn-secondary px-5 py-2.5">
              Bekor qilish
            </button>
            <button type="submit" className="admin-btn-primary px-5 py-2.5">
              To'plamni saqlash
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="admin-section-title text-xl">To'plamlar boshqaruvi</h2>
          <p className="admin-muted text-sm mt-1">Mahsulot to'plamlari va chegirmalar</p>
        </div>
        <button type="button" onClick={() => setIsCreating(true)} className="admin-btn-primary px-4 py-2.5 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yangi to'plam
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="admin-loading-ring w-10 h-10" />
        </div>
      ) : bundles.length === 0 ? (
        <div className="admin-empty-state py-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="admin-muted">Hozircha to'plamlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bundles.map((bundle) => {
            const originalPrice = bundle.originalPrice || 0;
            const discountedPrice = bundle.discountedPrice || 0;
            const discountPercent = originalPrice > 0 && bundle.discountType === 'percentage'
              ? bundle.discountValue
              : originalPrice > 0
                ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                : 0;
            const firstProductImage = bundle.products?.[0]?.image || bundle.products?.[0]?.images?.[0] || '/placeholder.jpg';

            return (
              <article key={bundle._id} className="admin-card-soft overflow-hidden">
                <div className="relative h-44">
                  <img src={firstProductImage} alt={bundle.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10" />
                  {discountPercent > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold">
                      -{discountPercent}%
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(bundle._id)}
                    className="admin-btn-danger p-2 absolute top-3 right-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white">{bundle.title}</h3>
                    {bundle.description && <p className="text-sm text-slate-200 line-clamp-2">{bundle.description}</p>}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(bundle.products || []).map((p) => (
                      <span key={p._id || p.id} className="admin-pill admin-pill-info normal-case">
                        {p.name || 'Mahsulot'}
                      </span>
                    ))}
                  </div>

                  {originalPrice > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
                      <div className="flex items-center gap-2">
                        {discountedPrice < originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            {originalPrice.toLocaleString('uz-UZ')} so'm
                          </span>
                        )}
                        <span className="text-sm font-semibold text-amber-300">
                          {discountedPrice.toLocaleString('uz-UZ')} so'm
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{bundle.products?.length || 0} mahsulot</span>
                    </div>
                  )}

                  {!bundle.heroImage && (
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-100">{bundle.title}</h3>
                      <button
                        type="button"
                        onClick={() => handleDelete(bundle._id)}
                        className="admin-btn-danger p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BundleManager;
