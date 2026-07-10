import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3, CheckCircle2, ImagePlus, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';

const emptyOption = () => ({
  _id: '',
  label: '',
  image: '',
  product: '',
});

const initialForm = {
  question: "Qaysi ko'rinishni tanlaysiz?",
  category: 'Kundalik',
  expiresAt: '',
  isActive: true,
  options: [emptyOption(), emptyOption()],
};

const getProductImage = (product) => {
  if (!product) return '';
  if (product.image) return product.image;
  const first = Array.isArray(product.images) ? product.images[0] : null;
  return typeof first === 'object' ? first?.url : first || '';
};

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const AdminStylePolls = () => {
  const { token } = useAuth();
  const { products } = useProducts();
  const [polls, setPolls] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const productOptions = useMemo(
    () => products.filter((product) => getProductImage(product)),
    [products]
  );

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/style-polls/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setPolls(res.data.data);
    } catch (error) {
      toast.error("So'rovnomalarni yuklashda xato");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPolls();
  }, [token]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const updateOption = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, idx) => idx === index ? { ...option, ...patch } : option)
    }));
  };

  const selectProduct = (index, productId) => {
    const product = productOptions.find((item) => item.id === productId || item._id === productId);
    updateOption(index, {
      product: productId,
      image: getProductImage(product),
      label: form.options[index].label || product?.name || ''
    });
  };

  const addOption = () => {
    setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption()] }));
  };

  const removeOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }));
  };

  const editPoll = (poll) => {
    setEditingId(poll._id);
    setForm({
      question: poll.question || '',
      category: poll.category || '',
      expiresAt: formatDateInput(poll.expiresAt),
      isActive: poll.isActive !== false,
      options: poll.options.map((option) => ({
        _id: option._id || '',
        label: option.label || '',
        image: option.image || '',
        product: option.product?._id || option.product || ''
      }))
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedOptions = form.options
      .map((option) => ({
        label: option.label.trim(),
        image: option.image.trim(),
        product: option.product || null,
        _id: option._id || undefined
      }))
      .filter((option) => option.label && option.image);

    if (!form.question.trim()) {
      toast.error('Savol kiriting');
      return;
    }

    if (cleanedOptions.length < 2) {
      toast.error('Kamida 2 ta rasmli variant tanlang');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question: form.question.trim(),
        category: form.category.trim() || 'Community',
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
        options: cleanedOptions
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = editingId
        ? await axios.put(`/api/style-polls/${editingId}`, payload, config)
        : await axios.post('/api/style-polls', payload, config);

      if (res.data.success) {
        toast.success(editingId ? "So'rovnoma yangilandi" : "So'rovnoma yaratildi");
        resetForm();
        fetchPolls();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Saqlashda xato');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePoll = async (pollId) => {
    if (!window.confirm("So'rovnomani o'chirmoqchimisiz?")) return;

    try {
      const res = await axios.delete(`/api/style-polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("So'rovnoma o'chirildi");
        fetchPolls();
      }
    } catch (error) {
      toast.error("O'chirishda xato");
    }
  };

  const totalVotes = (poll) => poll.totalVotes || poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="admin-section-title flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-300" />
            Community so'rovnomalari
          </h2>
          <p className="admin-muted mt-1 text-sm">
            Style Feed dagi ovoz berish blokini real kiyim rasmlari bilan boshqaring.
          </p>
        </div>
        {editingId && (
          <button type="button" onClick={resetForm} className="admin-btn-secondary px-4 py-2">
            <X className="h-4 w-4" />
            Bekor qilish
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-card p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.45fr_0.45fr]">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Savol</span>
            <input
              value={form.question}
              onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
              className="admin-input w-full"
              placeholder="Masalan: Qaysi ko'rinishni tanlaysiz?"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Kategoriya</span>
            <input
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="admin-input w-full"
              placeholder="Kundalik"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Tugash vaqti</span>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              className="admin-input w-full"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            className="h-4 w-4 accent-amber-300"
          />
          Style Feed da ko'rsatilsin
        </label>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {form.options.map((option, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Variant {index + 1}</p>
                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="admin-btn-danger p-2"
                    title="Variantni o'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-[112px_1fr] gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  {option.image ? (
                    <img src={option.image} alt={option.label || 'Poll option'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    value={option.label}
                    onChange={(event) => updateOption(index, { label: event.target.value })}
                    className="admin-input w-full"
                    placeholder="Variant nomi"
                  />

                  <select
                    value={option.product}
                    onChange={(event) => selectProduct(index, event.target.value)}
                    className="admin-select w-full"
                  >
                    <option value="">Mahsulotdan rasm tanlash</option>
                    {productOptions.map((product) => (
                      <option key={product.id || product._id} value={product.id || product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  <input
                    value={option.image}
                    onChange={(event) => updateOption(index, { image: event.target.value, product: '' })}
                    className="admin-input w-full"
                    placeholder="Yoki rasm URL"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={addOption} className="admin-btn-secondary px-4 py-2.5">
            <Plus className="h-4 w-4" />
            Variant qo'shish
          </button>

          <button type="submit" disabled={isSaving} className="admin-btn-primary px-5 py-2.5">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingId ? 'Yangilash' : 'Saqlash'}
          </button>
        </div>
      </form>

      <section className="admin-card overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold text-white">Natijalar</h3>
          <p className="admin-muted text-sm">Admin barcha ovozlar soni va taqsimotini shu yerda ko'radi.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-amber-300" />
          </div>
        ) : polls.length === 0 ? (
          <div className="admin-empty-state m-5 p-10 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-semibold text-white">Hali so'rovnoma yo'q</h3>
            <p className="admin-muted mt-2">Yuqoridan birinchi community so'rovnomasini yarating.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {polls.map((poll) => {
              const pollTotal = totalVotes(poll);

              return (
                <article key={poll._id} className="p-5">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="admin-pill admin-pill-best">{poll.category}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${poll.isActive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-500/10 text-slate-300'}`}>
                          {poll.isActive ? 'Faol' : 'Yopiq'}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white">{poll.question}</h4>
                      <p className="admin-muted mt-1 text-sm">{pollTotal} ta ovoz</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => editPoll(poll)} className="admin-btn-soft px-3 py-2">
                        Tahrirlash
                      </button>
                      <button type="button" onClick={() => deletePoll(poll._id)} className="admin-btn-danger px-3 py-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {poll.options.map((option) => {
                      const percent = pollTotal > 0 ? Math.round(((option.votes || 0) / pollTotal) * 100) : 0;
                      return (
                        <div key={option._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex gap-3">
                            <img src={option.image} alt={option.label} className="h-20 w-16 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-white">{option.label}</p>
                                <span className="text-sm font-bold text-amber-200">{percent}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-amber-300" style={{ width: `${percent}%` }} />
                              </div>
                              <p className="mt-2 text-xs text-slate-400">{option.votes || 0} ovoz</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {poll.votes?.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        Oxirgi ovozlar
                      </p>
                      <div className="max-h-28 space-y-1 overflow-y-auto admin-scroll">
                        {poll.votes.slice(-8).reverse().map((vote) => {
                          const chosen = poll.options.find((option) => String(option._id) === String(vote.option));
                          return (
                            <div key={vote._id} className="flex items-center justify-between gap-3 text-xs text-slate-400">
                              <span className="truncate">{vote.user?.username || 'Mehmon'} - {chosen?.label || 'Variant'}</span>
                              <span>{new Date(vote.createdAt).toLocaleString('uz-UZ')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminStylePolls;
