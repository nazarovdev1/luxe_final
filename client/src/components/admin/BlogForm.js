import React, { useState, useEffect } from 'react';
import { Save, Loader2, ImagePlus, X, Type, FileText, Settings, Globe, Hash } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['Trendlar', 'Maslahatlar', 'Kombinatsiyalar', 'Parvarish', 'Aksessuarlar'];
const LANGUAGES = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const BlogForm = ({ blog, onClose }) => {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('uz');
  const [activeSection, setActiveSection] = useState('content');
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: { uz: '', ru: '', en: '' },
    excerpt: { uz: '', ru: '', en: '' },
    content: { uz: '', ru: '', en: '' },
    coverImage: '',
    images: [],
    category: 'Trendlar',
    tags: [],
    status: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: '',
  });

  // Populate form with existing blog data
  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || { uz: '', ru: '', en: '' },
        excerpt: blog.excerpt || { uz: '', ru: '', en: '' },
        content: blog.content || { uz: '', ru: '', en: '' },
        coverImage: blog.coverImage || '',
        images: blog.images || [],
        category: blog.category || 'Trendlar',
        tags: blog.tags || [],
        status: blog.status || 'draft',
        featured: blog.featured || false,
        seoTitle: blog.seoTitle || '',
        seoDescription: blog.seoDescription || '',
      });
    }
  }, [blog]);

  const handleNestedChange = (field, lang, value) => {
    setForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 15) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleImageUpload = async (e, field = 'coverImage') => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading('Rasm yuklanmoqda...', { id: 'img-upload' });

      // Get ImageKit auth params
      const authRes = await axios.get('/api/imagekit-auth');
      const { token: uploadToken, expire, signature } = authRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `blog-${Date.now()}-${file.name}`);
      formData.append('publicKey', process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || 'public_m6JkP8vnN9V0u9WFF/6YqN2D9YI=');
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', uploadToken);

      const uploadRes = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);

      if (field === 'coverImage') {
        handleChange('coverImage', uploadRes.data.url);
      } else {
        setForm(prev => ({ ...prev, images: [...prev.images, uploadRes.data.url] }));
      }

      toast.success('Rasm yuklandi', { id: 'img-upload' });
    } catch (err) {
      toast.error('Rasm yuklashda xato', { id: 'img-upload' });
    }
  };

  const handleRemoveImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.title.uz && !form.title.en && !form.title.ru) {
      toast.error('Kamida bitta tilida sarlavha kiriting');
      return;
    }

    try {
      setSaving(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (blog) {
        // Update
        await axios.put(`/api/blogs/${blog._id}`, form, config);
        toast.success('Maqola yangilandi');
      } else {
        // Create
        await axios.post('/api/blogs', form, config);
        toast.success('Maqola yaratildi');
      }

      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Saqlashda xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (draftData) => {
    if (!draftData.title.uz && !draftData.title.en && !draftData.title.ru) {
      toast.error('Kamida bitta tilida sarlavha kiriting');
      return;
    }

    try {
      setSaving(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (blog) {
        // Update existing blog as draft
        await axios.put(`/api/blogs/${blog._id}`, draftData, config);
        toast.success('Qoralama yangilandi');
      } else {
        // Create new blog as draft
        await axios.post('/api/blogs', draftData, config);
        toast.success('Qoralama saqlandi');
      }
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Saqlashda xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  // Simple rich text toolbar actions
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById(`content-${activeLang}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.content[activeLang] || '';
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    handleNestedChange('content', activeLang, newText);

    // Restore cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveLang(lang.code)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLang === lang.code
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
        {[
          { id: 'content', label: 'Kontent', icon: Type },
          { id: 'media', label: 'Rasmlar', icon: ImagePlus },
          { id: 'settings', label: 'Sozlamalar', icon: Settings },
          { id: 'seo', label: 'SEO', icon: Globe },
        ].map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      {activeSection === 'content' && (
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sarlavha {activeLang === 'uz' && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              value={form.title[activeLang] || ''}
              onChange={(e) => handleNestedChange('title', activeLang, e.target.value)}
              placeholder={`Sarlavha (${activeLang.toUpperCase()})`}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Qisqa ta'rif
            </label>
            <textarea
              value={form.excerpt[activeLang] || ''}
              onChange={(e) => handleNestedChange('excerpt', activeLang, e.target.value)}
              placeholder={`Qisqa ta'rif (${activeLang.toUpperCase()})`}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30 resize-none"
            />
          </div>

          {/* Content with formatting toolbar */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              To'liq maqola (HTML)
            </label>
            {/* Formatting toolbar */}
            <div className="flex items-center gap-1 p-2 rounded-t-xl bg-white/[0.03] border border-b-0 border-white/10">
              <button type="button" onClick={() => insertFormatting('<h2>', '</h2>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors font-bold">H2</button>
              <button type="button" onClick={() => insertFormatting('<h3>', '</h3>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors font-bold">H3</button>
              <button type="button" onClick={() => insertFormatting('<p>', '</p>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">P</button>
              <button type="button" onClick={() => insertFormatting('<strong>', '</strong>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors font-bold">B</button>
              <button type="button" onClick={() => insertFormatting('<em>', '</em>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors italic">I</button>
              <button type="button" onClick={() => insertFormatting('<blockquote>', '</blockquote>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">❝</button>
              <button type="button" onClick={() => insertFormatting('<ul><li>', '</li></ul>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">• List</button>
              <button type="button" onClick={() => insertFormatting('<a href="">', '</a>')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">🔗</button>
              <button type="button" onClick={() => insertFormatting('<img src="" alt="', '" />')} className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">🖼</button>
            </div>
            <textarea
              id={`content-${activeLang}`}
              value={form.content[activeLang] || ''}
              onChange={(e) => handleNestedChange('content', activeLang, e.target.value)}
              placeholder={`Maqola kontenti HTML formatida (${activeLang.toUpperCase()})`}
              rows={15}
              className="w-full px-4 py-3 rounded-b-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30 font-mono resize-y"
            />
          </div>
        </div>
      )}

      {/* Media Section */}
      {activeSection === 'media' && (
        <div className="space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Muqova rasmi
            </label>
            {form.coverImage ? (
              <div className="relative group rounded-xl overflow-hidden border border-white/10">
                <img src={form.coverImage} alt="Cover" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleChange('coverImage', '')}
                    className="p-2 bg-red-500/80 rounded-lg text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-400/30 transition-colors cursor-pointer">
                <ImagePlus className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-500">Muqova rasmi yuklash</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} className="hidden" />
              </label>
            )}
            {/* URL input */}
            <div className="mt-2">
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                placeholder="Yoki rasm URL manzilini kiriting"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30"
              />
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Qo'shimcha rasmlar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-amber-400/30 transition-colors cursor-pointer">
                <ImagePlus className="w-5 h-5 text-gray-500" />
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'images')} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <div className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Kategoriya <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/30"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="flex gap-3">
              {[
                { value: 'draft', label: 'Qoralama', color: 'gray' },
                { value: 'published', label: 'Chop etish', color: 'green' },
                { value: 'archived', label: 'Arxivlash', color: 'amber' },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleChange('status', status.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.status === status.value
                      ? `bg-${status.color}-500/10 border-${status.color}-500/30 text-${status.color}-400`
                      : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'
                  }`}
                  style={form.status === status.value ? {
                    backgroundColor: status.color === 'green' ? 'rgba(34,197,94,0.1)' : status.color === 'amber' ? 'rgba(245,158,11,0.1)' : 'rgba(156,163,175,0.1)',
                    borderColor: status.color === 'green' ? 'rgba(34,197,94,0.3)' : status.color === 'amber' ? 'rgba(245,158,11,0.3)' : 'rgba(156,163,175,0.3)',
                    color: status.color === 'green' ? '#4ade80' : status.color === 'amber' ? '#fbbf24' : '#9ca3af',
                  } : {}}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400/50"></div>
            </label>
            <span className="text-sm text-gray-300">Tavsiya etilgan maqola</span>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <Hash className="w-3.5 h-3.5 inline mr-1" />
              Teglar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Teg qo'shish..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors"
              >
                Qo'shish
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs"
                  >
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Section */}
      {activeSection === 'seo' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              SEO Sarlavha
            </label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => handleChange('seoTitle', e.target.value)}
              placeholder="SEO sarlavha (50-60 belgi)"
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30"
            />
            <p className="text-[10px] text-gray-600 mt-1">{form.seoTitle.length}/200 belgi</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              SEO Ta'rif
            </label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              placeholder="SEO ta'rif (150-160 belgi)"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-400/30 resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1">{form.seoDescription.length}/500 belgi</p>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => onClose(false)}
          className="admin-btn-secondary px-5 py-2.5"
        >
          Bekor qilish
        </button>
        <div className="flex items-center gap-3">
          {!blog && (
            <button
              type="button"
              onClick={() => {
                const draftForm = { ...form, status: 'draft' };
                handleSaveDraft(draftForm);
              }}
              className="admin-btn-secondary px-5 py-2.5"
              disabled={saving}
            >
              Qoralama saqlash
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary px-5 py-2.5 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{blog ? 'Yangilash' : 'Chop etish'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
