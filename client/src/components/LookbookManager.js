import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader2, X, Search } from 'lucide-react';
import useProductService from '../server/server';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  'Palto plash',
  'Koylaklar',
  'Dvoyka va troyka',
  'Kastyum yubka',
  'Kastyum shim',
  'Shim',
  'Yubka',
  'Kofta',
  'Sumka',
  'Oyoq kiyimlar',
];

const INITIAL_FORM = {
  title: '',
  description: '',
  heroImage: '',
  products: [],
  items: [{ category: '', count: 1 }],
};

const LookbookManager = () => {
  const { getAllLooks, createLook, deleteLook, getAllProducts, getImageKitAuth } = useProductService();

  const [looks, setLooks] = useState([]);
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

  const fetchLooks = async () => {
    setIsLoading(true);
    const result = await getAllLooks();
    if (result.success) {
      setLooks(result.data || []);
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
    fetchLooks();
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

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const loadingToast = toast.loading('Rasm yuklanmoqda...');

    try {
      const auth = await getImageKitAuth();
      if (!auth || !auth.signature) {
        throw new Error('Auth signature failed');
      }

      const data = new FormData();
      data.append('file', file);
      data.append('fileName', file.name);
      data.append('publicKey', 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=');
      data.append('signature', auth.signature);
      data.append('expire', auth.expire);
      data.append('token', auth.token);
      data.append('folder', '/luxe_lookbook');

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.url) {
        setFormData((prev) => ({ ...prev, heroImage: result.url }));
        toast.success('Rasm yuklandi!', { id: loadingToast });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Rasm yuklashda xatolik', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu lookni o'chirmoqchimisiz?")) {
      return;
    }

    const token = localStorage.getItem('token');
    const result = await deleteLook(id, token);

    if (result.success) {
      toast.success("Look o'chirildi");
      setLooks((prev) => prev.filter((look) => look._id !== id));
    } else {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { category: '', count: 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      nextItems[index][field] = field === 'count' ? Math.max(1, Number(value) || 1) : value;
      return {
        ...prev,
        items: nextItems,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasEmptyCategory = formData.items.some((item) => !item.category);
    if (!formData.title || !formData.heroImage || hasEmptyCategory) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    const token = localStorage.getItem('token');
    const result = await createLook(formData, token);

    if (result.success) {
      toast.success('Look yaratildi');
      setLooks((prev) => [result.data, ...prev]);
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
            Yangi look yaratish
          </h2>
          <button type="button" onClick={() => setIsCreating(false)} className="admin-btn-secondary p-2.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-200 mb-2">Look nomi</label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                className="admin-input"
                placeholder="Masalan: Urban Grace"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-200 mb-2">Rasm URL (ixtiyoriy)</label>
              <input
                type="text"
                value={formData.heroImage}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    heroImage: event.target.value,
                  }))
                }
                className="admin-input"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-2">Ta'rif</label>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="admin-textarea min-h-[96px]"
              placeholder="Look haqida qisqacha"
            />
          </div>

          <div className="admin-card-soft p-4 space-y-3">
            <label className="block text-sm text-slate-200">Hero rasm yuklash</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-300 file:mr-3 file:px-4 file:py-2.5 file:rounded-lg file:border-0 file:bg-amber-300 file:text-slate-900 file:font-semibold hover:file:bg-amber-200"
            />

            {formData.heroImage ? (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-600/60">
                <img src={formData.heroImage} alt="Preview" className="w-full h-60 object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, heroImage: '' }))}
                  className="admin-btn-danger p-2 absolute top-2 right-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="admin-empty-state p-8 text-center">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                <p className="admin-muted text-sm">Rasm URL kiriting yoki fayl yuklang</p>
              </div>
            )}
          </div>

          <div className="admin-card-soft p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-200">Look tarkibi</p>
              <button type="button" onClick={handleAddItem} className="admin-btn-secondary px-3 py-1.5 text-sm">
                <Plus className="w-4 h-4" />
                Qo'shish
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_auto] gap-2 items-center">
                  <select
                    value={item.category}
                    onChange={(event) => handleItemChange(index, 'category', event.target.value)}
                    className="admin-select"
                  >
                    <option value="">Kategoriya tanlang</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.count}
                    onChange={(event) => handleItemChange(index, 'count', event.target.value)}
                    className="admin-input"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="admin-btn-danger p-2.5"
                    disabled={formData.items.length === 1}
                    title="Elementni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card-soft p-4 space-y-3">
            <label className="block text-sm text-slate-200">Mahsulotlarni biriktirish</label>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Mahsulot nomini qidiring"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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
                        src={product.image || product.images?.[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-600/60"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{product.name}</p>
                        <p className="admin-muted text-xs truncate">
                          {product.category} • {Number(product.price || 0).toLocaleString('uz-UZ')} so'm
                        </p>
                      </div>

                      {isSelected ? <span className="admin-pill admin-pill-best">Tanlangan</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="admin-muted text-xs text-right">Tanlangan: {formData.products.length} ta</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={() => setIsCreating(false)} className="admin-btn-secondary px-5 py-2.5">
              Bekor qilish
            </button>
            <button type="submit" className="admin-btn-primary px-5 py-2.5">
              Lookni saqlash
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
          <h2 className="admin-section-title text-xl">Lookbook boshqaruvi</h2>
          <p className="admin-muted text-sm mt-1">Editorial collection va kombinatsiyalar</p>
        </div>

        <button type="button" onClick={() => setIsCreating(true)} className="admin-btn-primary px-4 py-2.5 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yangi look qo'shish
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="admin-loading-ring w-10 h-10" />
        </div>
      ) : looks.length === 0 ? (
        <div className="admin-empty-state py-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="admin-muted">Hozircha looklar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {looks.map((look) => (
            <article key={look._id} className="admin-card-soft overflow-hidden">
              <div className="relative h-52">
                <img src={look.heroImage} alt={look.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10" />

                <button
                  type="button"
                  onClick={() => handleDelete(look._id)}
                  className="admin-btn-danger p-2 absolute top-3 right-3"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white">{look.title}</h3>
                  <p className="text-sm text-slate-200 line-clamp-2">{look.description}</p>
                </div>
              </div>

              <div className="p-4">
                <p className="admin-muted text-xs mb-2">Tarkibi</p>
                <div className="flex flex-wrap gap-2">
                  {(look.items || []).map((item, index) => (
                    <span key={`${look._id}-${index}`} className="admin-pill admin-pill-info normal-case">
                      {item.count}x {item.category}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default LookbookManager;
