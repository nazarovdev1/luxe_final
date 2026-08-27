import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Pipette,
  Gem,
  Sparkles,
  Layers,
  Star,
  Check,
} from 'lucide-react';
import LoginForm from '../../components/LoginForm';
import './mobileAdminTheme.css';

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

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Standard'];

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  images: [],
  badge: '',
  rating: 0,
  colors: [],
  sizes: '',
  description: '',
  isLookbook: false,
};

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

const MobileAdminEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();
  const { products, addProduct, updateProduct, getImageKitAuth } = useProducts();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPipetteActive, setIsPipetteActive] = useState(false);
  const [colorDraft, setColorDraft] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id || products.length === 0) {
      return;
    }

    const product = products.find((item) => item.id === id);
    if (!product) {
      return;
    }

    const images = Array.isArray(product.images) ? product.images : [product.image].filter(Boolean);

    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      images,
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
    });
  }, [id, products]);

  useEffect(
    () => () => {
      document.body.style.cursor = 'default';
    },
    []
  );

  const rgbToHex = (r, g, b) =>
    `#${[r, g, b]
      .map((value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')}`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImages = async (files) => {
    if (!files.length) {
      return;
    }

    const loadingToast = toast.loading(t('mobileAdmin.imagesUploading', 'Rasmlar yuklanmoqda...'));

    try {
      const publicKey =
        import.meta.env.REACT_APP_IMAGEKIT_PUBLIC_KEY ||
        import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ||
        'public_mnemyo/d2OAPyIzzxUa3mXisNc0=';

      for (const file of files) {
        const auth = await getImageKitAuth();
        if (!auth || !auth.signature) {
          throw new Error(t('mobileAdmin.imagekitAuthError', 'ImageKit autentifikatsiya xatosi'));
        }

        const data = new FormData();
        data.append('file', file);
        data.append('fileName', file.name);
        data.append('publicKey', publicKey);
        data.append('signature', auth.signature);
        data.append('expire', auth.expire);
        data.append('token', auth.token);
        data.append('folder', '/luxe_products');

        const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: data,
        });

        const result = await response.json();
        if (result.url) {
          uploadedUrls.push(result.url);
        } else {
          throw new Error(t('mobileAdmin.imageUploadError', 'Rasm yuklashda xatolik'));
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(t('mobileAdmin.imageUploaded', 'Rasm muvaffaqiyatli yuklandi!'), { id: loadingToast });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || t('mobileAdmin.imageUploadFailed', 'Rasm yuklanmadi'), { id: loadingToast });
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    await uploadImages(files);
    event.target.value = '';
  };

  const removeImage = (indexToDelete) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToDelete),
    }));
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
        toast.success(`${t('mobileAdmin.colorPicked', 'Rang tanlandi:')} ${hexColor}`);
      } catch (error) {
        console.error('Pipette error:', error);
        setIsPipetteActive(false);
        document.body.style.cursor = 'default';
        toast.error(t('mobileAdmin.colorPickFailed', 'Rang tanlash amalga oshmadi'));
      }
    };
  };

  const addColor = () => {
    const color = colorDraft.trim();
    if (!color) {
      return;
    }

    setFormData((prev) => {
      const list = Array.isArray(prev.colors) ? prev.colors : [];
      if (list.includes(color)) {
        return prev;
      }

      return {
        ...prev,
        colors: [...list, color],
      };
    });

    setColorDraft('');
  };

  const togglePresetSize = (size) => {
    const currentSizes = (formData.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updated;
    if (currentSizes.includes(size)) {
      updated = currentSizes.filter((s) => s !== size);
    } else {
      updated = [...currentSizes, size];
    }

    setFormData((prev) => ({ ...prev, sizes: updated.join(', ') }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast.error(t('mobileAdmin.requiredFields', 'Iltimos, barcha majburiy maydonlarni to‘ldiring'));
      return;
    }

    if (formData.images.length === 0) {
      toast.error(t('mobileAdmin.needAtLeastOneImage', 'Kamida bitta rasm yuklashingiz shart'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
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
        image: formData.images[0],
      };

      const result = id ? await updateProduct(id, payload) : await addProduct(payload);

      if (result) {
        toast.success(id ? t('mobileAdmin.productUpdated', 'Mahsulot yangilandi!') : t('mobileAdmin.productAdded', 'Yangi mahsulot qo‘shildi!'));
        navigate('/mobile/admin');
      } else {
        toast.error(t('mobileAdmin.saveFailed', 'Saqlashda xatolik'));
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('mobileAdmin.genericError', 'Kutilmagan xatolik'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="lux-admin-shell flex items-center justify-center px-4 min-h-[90vh]">
        <div className="lux-card w-full max-w-sm p-7 text-center space-y-4">
          <h1 className="text-xl font-bold text-white tracking-tight">{t('mobileAdmin.accessDenied', 'Kirish taqiqlandi')}</h1>
          <p className="text-sm text-neutral-400">{t('mobileAdmin.accessDeniedDesc', 'Sizda admin huquqi yo‘q')}</p>
          <button
            type="button"
            onClick={() => navigate('/mobile')}
            className="lux-btn-gold"
          >
            {t('mobileAdmin.backToHome', 'Bosh sahifaga')}
          </button>
        </div>
      </div>
    );
  }

  const selectedSizesList = (formData.sizes || '').split(',').map((s) => s.trim());

  return (
    <div className="lux-admin-shell pb-36">
      {/* ─── Luxury Header ─── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#050608]/85 border-b border-white/5 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/mobile/admin')}
            className="lux-btn-glass py-2 px-3 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('mobileAdmin.back', 'Orqaga')}</span>
          </button>

          <h1 className="text-sm font-bold text-white tracking-tight truncate font-serif">
            {id ? t('mobileAdmin.editTitle', 'Modelni tahrirlash') : t('mobileAdmin.newTitle', 'Yangi Atelier Modeli')}
          </h1>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs font-bold text-amber-300 px-2 py-1 hover:text-amber-200"
          >
            {isSubmitting ? '...' : t('mobileAdmin.save', 'Saqlash')}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 relative z-10">
        {/* ─── Section 1: Media Gallery ─── */}
        <section className="lux-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {t('mobileAdmin.images', 'Mahsulot rasmlari')}
            </h2>
            <span className="text-[11px] text-neutral-400 font-medium">
              {formData.images.length} ta rasm
            </span>
          </div>

          <label className="border-2 border-dashed border-white/10 hover:border-amber-400/50 rounded-2xl p-5 block text-center cursor-pointer transition-all bg-white/[0.02]">
            <div className="flex flex-col items-center gap-2 text-neutral-300 text-xs">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-300">
                <Upload className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white">{t('mobileAdmin.uploadImage', 'Rasm yuklash')}</span>
              <span className="text-[10px] text-neutral-500">PNG, JPG, WEBP (ImageKit orqali)</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {formData.images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group shadow-md">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    crossOrigin="anonymous"
                    onClick={(event) => handleImageColorPick(event, image)}
                    className={`w-full h-full object-cover ${
                      isPipetteActive ? 'ring-2 ring-amber-300 cursor-crosshair' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="lux-badge lux-badge-gold absolute bottom-1.5 left-1.5 text-[8.5px]">
                      {t('mobileAdmin.mainImageBadge', 'Asosiy')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Section 2: Basic Information ─── */}
        <section className="lux-card p-4 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5" />
            {t('mobileAdmin.basicInfo', 'Asosiy maʼlumotlar')}
          </h2>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.productName', 'Mahsulot nomi *')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="lux-input font-medium"
              placeholder={t('mobileAdmin.productNamePlaceholder', 'Masalan: Double-breasted Palto')}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.category', 'Kategoriya *')}</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="lux-select font-medium"
              required
            >
              <option value="">{t('mobileAdmin.selectCategory', 'Kategoriyani tanlang')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.price', 'Narx (so‘m) *')}</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="lux-input font-bold text-amber-300 font-serif"
                placeholder="299000"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.originalPrice', 'Eski narx (so‘m)')}</label>
              <input
                type="text"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="lux-input line-through text-neutral-400"
                placeholder="399000"
              />
            </div>
          </div>
        </section>

        {/* ─── Section 3: Badges, Rating & Lookbook ─── */}
        <section className="lux-card p-4 space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Belgilar va Reyting
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.badge', 'Belgi (Badge)')}</label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="lux-select font-semibold"
              >
                <option value="">{t('mobileAdmin.badgeNone', 'Belgisiz')}</option>
                <option value="NEW">{t('mobileAdmin.badgeNew', 'Yangi (NEW)')}</option>
                <option value="BESTSELLER">{t('mobileAdmin.badgeBestseller', 'Bestseller (TOP)')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.rating', 'Reyting (0 - 5)')}</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                className="lux-input font-bold"
                placeholder="4.8"
              />
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">{t('mobileAdmin.showInLookbook', 'Lookbook kolleksiyasiga kiritish')}</span>
              <p className="text-[10px] text-neutral-400">Mahsulot Lookbook sahifasida ko‘rsatiladi</p>
            </div>
            <input
              type="checkbox"
              checked={formData.isLookbook}
              onChange={(e) => setFormData((prev) => ({ ...prev, isLookbook: e.target.checked }))}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </label>
        </section>

        {/* ─── Section 4: Colors & Sizes ─── */}
        <section className="lux-card p-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {t('mobileAdmin.colorsAndSizes', 'Ranglar va O‘lchamlar')}
          </h2>

          {/* Preset Sizes */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.sizes', 'O‘lchamlar')}</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SIZES.map((sz) => {
                const isSelected = selectedSizesList.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => togglePresetSize(sz)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-300 text-black shadow-md'
                        : 'bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {sz} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              className="lux-input text-xs mt-1"
              placeholder="Masalan: XS, S, M, L, XL"
            />
          </div>

          {/* Colors Palette */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.colors', 'Ranglar palitrasi (HEX)')}</label>

            {formData.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors.map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 border border-white/10 px-2.5 py-1 text-xs text-white shadow-sm"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: color.startsWith('#') ? color : '#777' }}
                    />
                    <span className="font-mono text-[11px] font-semibold">{color}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          colors: prev.colors.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      className="text-neutral-400 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="color"
                value={isValidHexColor(colorDraft) ? colorDraft : '#d6b47c'}
                onChange={(e) => setColorDraft(e.target.value)}
                className="w-11 h-11 rounded-xl border border-white/10 bg-transparent cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={colorDraft}
                onChange={(e) => setColorDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addColor();
                  }
                }}
                className="lux-input font-mono text-xs uppercase"
                placeholder={t('mobileAdmin.colorPlaceholder', '#000000 yoki Pipetka')}
              />
              <button
                type="button"
                onClick={() => {
                  setIsPipetteActive((prev) => !prev);
                  document.body.style.cursor = isPipetteActive ? 'default' : 'crosshair';
                }}
                className={`lux-action-pill-btn w-11 h-11 ${isPipetteActive ? 'border-amber-400 bg-amber-400/20 text-amber-300' : ''}`}
                title="Rasmdan rang tanlash"
              >
                <Pipette className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={addColor}
                className="lux-action-pill-btn w-11 h-11"
                title="Rang qo‘shish"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Description ─── */}
        <section className="lux-card p-4 space-y-2">
          <label className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">{t('mobileAdmin.description', 'Tavsif')}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="lux-textarea text-xs leading-relaxed"
            placeholder={t('mobileAdmin.descriptionPlaceholder', 'Mahsulot haqida batafsil maʼlumot, mato tarkibi...')}
          />
        </section>
      </div>

      {/* ─── Bottom Sticky Action Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] bg-[#050608]/90 backdrop-blur-2xl border-t border-amber-400/20 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="lux-btn-gold py-4 shadow-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="lux-spinner w-4 h-4 border-2" />
              <span>{t('mobileAdmin.saving', 'Saqlanmoqda...')}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{id ? t('mobileAdmin.save', 'O‘zgarishlarni saqlash') : t('mobileAdmin.add', 'Mahsulotni joylash')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileAdminEdit;


