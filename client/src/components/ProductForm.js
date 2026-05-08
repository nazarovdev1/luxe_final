import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Upload, Save, Pipette, Plus, Image as ImageIcon, Gem, Flame } from 'lucide-react';

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

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  images: [],
  image: '',
  badge: '',
  rating: 0,
  colors: [],
  sizes: '',
  description: '',
  isLookbook: false,
  earlyAccessTier: 'none',
  earlyAccessUntil: '',
  isNewCollection: false,
};

const ProductForm = ({ product, onClose }) => {
  const { t } = useLanguage();
  const { addProduct, updateProduct, getImageKitAuth } = useProducts();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPipetteActive, setIsPipetteActive] = useState(false);
  const [colorDraft, setColorDraft] = useState('');

  const fileInputRef = useRef(null);

  const rgbToHex = (r, g, b) =>
    `#${[r, g, b]
      .map((value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')}`;

  useEffect(() => {
    if (!product) {
      setFormData(EMPTY_FORM);
      return;
    }

    const images = Array.isArray(product.images)
      ? product.images
      : [product.image].filter(Boolean);

    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      images,
      image: images[0] || '',
      badge: product.badge || '',
      rating: product.rating || 0,
      colors: Array.isArray(product.colors)
        ? product.colors
        : product.colors
          ? [product.colors]
          : [],
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      description: product.description || '',
      isLookbook: Boolean(product.isLookbook),
      earlyAccessTier: product.earlyAccessTier || 'none',
      earlyAccessUntil: product.earlyAccessUntil ? new Date(product.earlyAccessUntil).toISOString().split('T')[0] : '',
      isNewCollection: Boolean(product.isNewCollection),
    });
  }, [product]);

  useEffect(
    () => () => {
      document.body.style.cursor = 'default';
    },
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImages = async (files) => {
    if (!files.length) {
      return;
    }

    const loadingToast = toast.loading('Rasmlar yuklanmoqda...');

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const auth = await getImageKitAuth();
        if (!auth || !auth.signature) {
          throw new Error('Auth signature failed');
        }

        const payload = new FormData();
        payload.append('file', file);
        payload.append('fileName', file.name);
        payload.append('publicKey', 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=');
        payload.append('signature', auth.signature);
        payload.append('expire', auth.expire);
        payload.append('token', auth.token);
        payload.append('folder', '/luxe_products');

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: payload,
        });

        const result = await response.json();

        if (result.url) {
          uploadedUrls.push(result.url);
        } else {
          throw new Error('Upload failed');
        }
      }

      setFormData((prev) => {
        const nextImages = [...prev.images, ...uploadedUrls];
        return {
          ...prev,
          images: nextImages,
          image: nextImages[0] || '',
        };
      });

      toast.success('Rasmlar muvaffaqiyatli yuklandi', { id: loadingToast });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Rasm yuklashda xatolik', { id: loadingToast });
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    await uploadImages(files);
    event.target.value = '';
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []).filter((file) =>
      file.type.startsWith('image/')
    );
    await uploadImages(files);
  };

  const removeImage = (indexToDelete) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, index) => index !== indexToDelete);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || '',
      };
    });
  };

  const handleImageColorPick = (event, imageSrc) => {
    if (!isPipetteActive) {
      return;
    }

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);

      const rect = event.target.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (image.naturalWidth / rect.width);
      const y = (event.clientY - rect.top) * (image.naturalHeight / rect.height);

      try {
        const pixel = context.getImageData(x, y, 1, 1).data;
        const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
        setColorDraft(hexColor);
        setIsPipetteActive(false);
        document.body.style.cursor = 'default';
        toast.success(`Rang tanlandi: ${hexColor}`);
      } catch (error) {
        console.error('Error picking color:', error);
        setIsPipetteActive(false);
        document.body.style.cursor = 'default';
        toast.error("Rangni aniqlab bo'lmadi. Rasm CORS himoyalangan bo'lishi mumkin.");
      }
    };
  };

  const addColor = () => {
    const value = colorDraft.trim();
    if (!value) {
      return;
    }

    setFormData((prev) => {
      const current = Array.isArray(prev.colors) ? prev.colors : [];
      if (current.includes(value)) {
        return prev;
      }

      return {
        ...prev,
        colors: [...current, value],
      };
    });

    setColorDraft('');
  };

  const removeColor = (indexToDelete) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, index) => index !== indexToDelete),
    }));
  };

  const togglePipette = () => {
    if (isPipetteActive) {
      setIsPipetteActive(false);
      document.body.style.cursor = 'default';
      return;
    }

    setIsPipetteActive(true);
    document.body.style.cursor = 'crosshair';
    toast('Rasm ustiga bosing');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.category || !formData.price || formData.images.length === 0) {
        toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring va kamida bitta rasm yuklang", {
          duration: 6000,
        });
        return;
      }

      const processedData = {
        ...formData,
        price: Number(formData.price.toString().replace(/[^0-9.]/g, '')),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice.toString().replace(/[^0-9.]/g, ''))
          : null,
        colors: Array.isArray(formData.colors) ? formData.colors : [],
        sizes: formData.sizes
          ? formData.sizes
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        rating: Number(formData.rating) || 0,
        image: formData.images[0] || '',
      };

      const result = product
        ? await updateProduct(product.id, processedData)
        : await addProduct(processedData);

      if (result) {
        toast.success(product ? 'Mahsulot muvaffaqiyatli yangilandi' : "Mahsulot muvaffaqiyatli qo'shildi", {
          duration: 5000,
        });
        onClose();
      } else {
        toast.error(product ? 'Mahsulotni yangilashda xatolik yuz berdi' : "Mahsulotni qo'shishda xatolik yuz berdi", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.', { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-200 mb-2">Mahsulot nomi *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="admin-input"
            placeholder="Masalan: Zamonaviy ko'ylak"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-200 mb-2">Kategoriya *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="admin-select"
            required
          >
            <option value="">Kategoriyani tanlang</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-200 mb-2">Narx *</label>
          <div className="relative">
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="admin-input pr-14"
              placeholder="299 000"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{t('common.sum')}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-200 mb-2">Eski narx</label>
          <div className="relative">
            <input
              type="text"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              className="admin-input pr-14"
              placeholder="399 000"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{t('common.sum')}</span>
          </div>
        </div>
      </div>

      <section className="admin-card-soft p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="admin-section-title text-base inline-flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-300" />
            Mahsulot rasmlari
          </h3>
          <button
            type="button"
            className="admin-btn-secondary px-3 py-1.5 text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Yuklash
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div
          className="admin-empty-state p-7 text-center cursor-pointer hover:border-amber-300/45 transition-colors"
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-200">Rasmlarni sudrab tashlang yoki bosing</p>
          <p className="admin-muted text-xs mt-1">JPG, PNG, WEBP formatlar qo'llab-quvvatlanadi</p>
        </div>

        {formData.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formData.images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative group">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className={`w-full h-28 object-cover rounded-xl border border-slate-600/60 ${
                    isPipetteActive ? 'cursor-crosshair ring-2 ring-amber-300/60' : ''
                  }`}
                  onClick={(event) => handleImageColorPick(event, image)}
                  crossOrigin="anonymous"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {index === 0 ? <span className="admin-pill admin-pill-best absolute bottom-1.5 left-1.5">Asosiy</span> : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-200 mb-2">Kolleksiya badge</label>
          <select name="badge" value={formData.badge} onChange={handleChange} className="admin-select">
            <option value="">Tanlanmagan</option>
            <option value="NEW">Yangi kolleksiya</option>
            <option value="BESTSELLER">Bestseller</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-200 mb-2">Reyting (0-5)</label>
          <input
            type="number"
            name="rating"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            className="admin-input"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm text-slate-200 mb-2">Ranglar</label>

          <div className="flex flex-wrap gap-2 mb-3">
            {formData.colors.map((color, index) => (
              <div key={`${color}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 border border-slate-600/60 pl-1 pr-3 py-1">
                <span
                  className="w-5 h-5 rounded-full border border-slate-500"
                  style={{ backgroundColor: color.startsWith('#') ? color : '#7a869d' }}
                />
                <span className="text-xs text-slate-200">{color}</span>
                <button type="button" onClick={() => removeColor(index)} className="text-slate-400 hover:text-red-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="color"
              value={isValidHexColor(colorDraft) ? colorDraft : '#f8b749'}
              onChange={(event) => setColorDraft(event.target.value)}
              className="w-11 h-11 rounded-lg bg-transparent border border-slate-600/60"
            />

            <input
              type="text"
              value={colorDraft}
              onChange={(event) => setColorDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addColor();
                }
              }}
              className="admin-input flex-1 min-w-[180px]"
              placeholder="Rang kodi yoki nomi"
            />

            <button type="button" onClick={togglePipette} className={isPipetteActive ? 'admin-btn-primary px-3.5 py-2.5' : 'admin-btn-secondary px-3.5 py-2.5'}>
              <Pipette className="w-4 h-4" />
              Pipetka
            </button>

            <button type="button" onClick={addColor} className="admin-btn-secondary px-3.5 py-2.5">
              <Plus className="w-4 h-4" />
              Qo'shish
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-200 mb-2">O'lchamlar</label>
          <input
            type="text"
            name="sizes"
            value={formData.sizes}
            onChange={handleChange}
            className="admin-input"
            placeholder="S, M, L, XL"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isLookbook}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isLookbook: event.target.checked,
                }))
              }
              className="sr-only"
            />
            <span
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isLookbook ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.isLookbook ? 'translate-x-6' : ''
                }`}
              />
            </span>
            <span className="text-sm text-slate-200 inline-flex items-center gap-1">
              <Gem className="w-4 h-4 text-amber-300" />
              Lookbook
            </span>
          </label>

          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isNewCollection}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isNewCollection: event.target.checked,
                }))
              }
              className="sr-only"
            />
            <span
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isNewCollection ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.isNewCollection ? 'translate-x-6' : ''
                }`}
              />
            </span>
            <span className="text-sm text-slate-200 inline-flex items-center gap-1">
              <Flame className="w-4 h-4 text-emerald-400" />
              New Collection
            </span>
          </label>
        </div>

        <div className="admin-card-soft p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          <div className="col-span-full border-b border-white/5 pb-2 mb-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
              <Gem className="w-4 h-4" />
              Early Access (VIP)
            </h4>
          </div>
          <div>
            <label className="block text-sm text-slate-200 mb-2">Tier</label>
            <select
              name="earlyAccessTier"
              value={formData.earlyAccessTier}
              onChange={handleChange}
              className="admin-select"
            >
              <option value="none">Hech kim (Ochiq)</option>
              <option value="Gold">Gold & Diamond</option>
              <option value="Diamond">Faqat Diamond</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-200 mb-2">Gacha (Sana)</label>
            <input
              type="date"
              name="earlyAccessUntil"
              value={formData.earlyAccessUntil}
              onChange={handleChange}
              className="admin-input"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm text-slate-200 mb-2">Tavsif</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="admin-textarea"
            placeholder="Mahsulot haqida batafsil ma'lumot"
          />
        </div>
      </div>

      <div className="pt-5 border-t border-slate-700/55 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button type="button" onClick={onClose} className="admin-btn-secondary px-5 py-2.5">
          Bekor qilish
        </button>

        <button type="submit" disabled={isSubmitting} className="admin-btn-primary px-5 py-2.5 disabled:opacity-60">
          {isSubmitting ? (
            <>
              <div className="admin-loading-ring w-4 h-4" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {product ? 'Saqlash' : "Qo'shish"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
