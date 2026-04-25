import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
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

    const loadingToast = toast.loading('Rasmlar yuklanmoqda...');

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const auth = await getImageKitAuth();
        if (!auth || !auth.signature) {
          throw new Error('ImageKit auth xato');
        }

        const data = new FormData();
        data.append('file', file);
        data.append('fileName', file.name);
        data.append('publicKey', 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=');
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
          throw new Error('Rasm yuklash xatoligi');
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success('Rasm yuklandi', { id: loadingToast });
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
        toast.success(`Rang tanlandi: ${hexColor}`);
      } catch (error) {
        console.error('Pipette error:', error);
        setIsPipetteActive(false);
        document.body.style.cursor = 'default';
        toast.error("Rangni aniqlab bo'lmadi");
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Kamida bitta rasm yuklang');
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
        toast.success(id ? 'Mahsulot yangilandi' : "Mahsulot qo'shildi");
        navigate('/mobile/admin');
      } else {
        toast.error('Saqlashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="mobile-admin-shell flex items-center justify-center px-4">
        <div className="mobile-admin-card w-full max-w-sm p-6 text-center space-y-4">
          <h1 className="text-xl font-semibold">Ruxsat yo'q</h1>
          <p className="mobile-admin-muted text-sm">Bu sahifa faqat adminlar uchun.</p>
          <button
            type="button"
            onClick={() => navigate('/mobile')}
            className="mobile-admin-btn-primary w-full py-3"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-admin-shell pb-36">
      <header className="mobile-admin-header px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/mobile/admin')}
            className="mobile-admin-btn-secondary px-3 py-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>

          <h1 className="mobile-admin-title text-[12px] text-center">
            {id ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
          </h1>

          <div className="w-20" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <section className="mobile-admin-card p-3.5 space-y-3">
          <h2 className="text-sm font-semibold text-white inline-flex items-center gap-1.5">
            <Gem className="w-4 h-4 text-amber-300" />
            Asosiy ma'lumotlar
          </h2>

          <div>
            <label className="block text-[11px] mobile-admin-muted mb-1">Mahsulot nomi *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mobile-admin-input"
              placeholder="Masalan: Elegant ko'ylak"
            />
          </div>

          <div>
            <label className="block text-[11px] mobile-admin-muted mb-1">Kategoriya *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mobile-admin-select"
            >
              <option value="">Tanlang</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] mobile-admin-muted mb-1">Narx *</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mobile-admin-input"
                placeholder="299000"
              />
            </div>
            <div>
              <label className="block text-[11px] mobile-admin-muted mb-1">Eski narx</label>
              <input
                type="text"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                className="mobile-admin-input"
                placeholder="399000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] mobile-admin-muted mb-1">Badge</label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="mobile-admin-select"
              >
                <option value="">Tanlanmagan</option>
                <option value="NEW">Yangi</option>
                <option value="BESTSELLER">Bestseller</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] mobile-admin-muted mb-1">Reyting</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                className="mobile-admin-input"
                placeholder="4.5"
              />
            </div>
          </div>
        </section>

        <section className="mobile-admin-card p-3.5 space-y-3">
          <h2 className="text-sm font-semibold text-white inline-flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-300" />
            Rasmlar
          </h2>

          <label className="mobile-admin-empty p-4 block text-center cursor-pointer">
            <div className="inline-flex items-center gap-2 text-slate-200 text-sm">
              <Upload className="w-4 h-4 text-amber-300" />
              Rasm yuklash
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

          {formData.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    crossOrigin="anonymous"
                    onClick={(event) => handleImageColorPick(event, image)}
                    className={`w-full h-full object-cover rounded-xl border border-slate-600/55 ${
                      isPipetteActive ? 'ring-2 ring-amber-300/60 cursor-crosshair' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {index === 0 ? (
                    <span className="mobile-admin-pill mobile-admin-pill-warning absolute bottom-1 left-1">Asosiy</span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mobile-admin-card p-3.5 space-y-3">
          <h2 className="text-sm font-semibold text-white">Ranglar va o'lchamlar</h2>

          <div>
            <label className="block text-[11px] mobile-admin-muted mb-1">Ranglar</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors.map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900/75 border border-slate-600/60 px-2.5 py-1"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-400/50"
                    style={{ backgroundColor: color.startsWith('#') ? color : '#7d8da6' }}
                  />
                  <span className="text-[11px] text-slate-100">{color}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        colors: prev.colors.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="color"
                value={isValidHexColor(colorDraft) ? colorDraft : '#f6b73a'}
                onChange={(event) => setColorDraft(event.target.value)}
                className="w-11 h-11 rounded-lg border border-slate-600/55 bg-transparent"
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
                className="mobile-admin-input"
                placeholder="Rang kodi yoki nomi"
              />
              <button
                type="button"
                onClick={() => {
                  setIsPipetteActive((prev) => !prev);
                  document.body.style.cursor = isPipetteActive ? 'default' : 'crosshair';
                }}
                className={isPipetteActive ? 'mobile-admin-btn-primary px-3' : 'mobile-admin-btn-secondary px-3'}
              >
                <Pipette className="w-4 h-4" />
              </button>
              <button type="button" onClick={addColor} className="mobile-admin-btn-secondary px-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] mobile-admin-muted mb-1">O'lchamlar</label>
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              className="mobile-admin-input"
              placeholder="S, M, L, XL"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isLookbook}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  isLookbook: event.target.checked,
                }))
              }
            />
            Lookbookda ko'rsatish
          </label>

          <div>
            <label className="block text-[11px] mobile-admin-muted mb-1">Tavsif</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mobile-admin-textarea"
              placeholder="Mahsulot haqida ma'lumot"
            />
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-[#06101bcc] backdrop-blur-xl border-t border-white/10 z-30">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mobile-admin-btn-primary w-full py-3.5 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="mobile-admin-loading w-4 h-4" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {id ? 'Saqlash' : "Qo'shish"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileAdminEdit;
