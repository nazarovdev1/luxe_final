import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, CheckCircle, Heart, Loader2, Send, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useProductService from '../server/server';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';
const IMAGEKIT_PUBLIC_KEY = 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=';

const getUserName = (post) => post?.user?.username || 'LUXX mijoz';
const getUserAvatar = (post) => post?.user?.profileImage || post?.user?.photoUrl || '';
const getPostImage = (post) => post?.images?.[0] || '';
const getPostLikes = (post) => Array.isArray(post?.likes) ? post.likes.length : 0;
const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const id = value._id || value.id || value;
  return id ? String(id) : '';
};
const postBelongsToProduct = (post, productId) => {
  const activeId = normalizeId(productId);
  if (!activeId) return false;
  return (post?.taggedProducts || []).some((item) => normalizeId(item) === activeId);
};
const isPostOwner = (post, user) => {
  const userId = normalizeId(user);
  const postUserId = normalizeId(post?.user);
  return Boolean(userId && postUserId && userId === postUserId);
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
};

const useBodyLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [locked]);
};

const CustomerPhotoReviews = ({ productId, productName }) => {
  const { t } = useLanguage();
  const { isAuthenticated, token, user } = useAuth();
  const { getImageKitAuth } = useProductService();
  const activeProductId = normalizeId(productId);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadComment, setUploadComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useBodyLock(Boolean(selectedPost || showUploadModal));

  const previews = useMemo(
    () => uploadFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [uploadFiles]
  );

  useEffect(() => {
    return () => previews.forEach((item) => URL.revokeObjectURL(item.url));
  }, [previews]);

  const fetchPosts = async () => {
    if (!activeProductId) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/posts`, {
        params: { product: activeProductId, limit: 12 }
      });
      const productPosts = data?.success ? (data.data || []).filter((post) => postBelongsToProduct(post, activeProductId)) : [];
      setPosts(productPosts);
    } catch (error) {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeProductId]);

  const openPost = (post) => {
    if (!postBelongsToProduct(post, activeProductId)) return;
    setConfirmDelete(false);
    setSelectedPost(null);
    requestAnimationFrame(() => setSelectedPost(post));
  };

  const closePost = () => {
    if (isDeleting) return;
    setSelectedPost(null);
    setConfirmDelete(false);
  };

  const openUpload = () => {
    if (!activeProductId) {
      toast.error('Mahsulot aniqlanmadi. Sahifani yangilab ko\'ring');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Uslubingizni ulashish uchun avval profilga kiring');
      return;
    }
    setShowUploadModal(true);
  };

  const resetUpload = () => {
    setUploadFiles([]);
    setUploadComment('');
    setUploaded(false);
  };

  const closeUpload = () => {
    if (isSubmitting) return;
    setShowUploadModal(false);
    resetUpload();
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    setUploadFiles((prev) => [...prev, ...files].slice(0, 4));
    event.target.value = '';
  };

  const removeUploadImage = (idx) => {
    setUploadFiles((prev) => prev.filter((_, index) => index !== idx));
  };

  const uploadToImageKit = async (file) => {
    const auth = await getImageKitAuth();
    if (!auth?.signature || !auth?.token || !auth?.expire) {
      throw new Error('ImageKit auth failed');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
    formData.append('signature', auth.signature);
    formData.append('expire', auth.expire);
    formData.append('token', auth.token);
    formData.append('folder', `/style_feed/${user?._id || user?.id || 'user'}`);

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (!result.url) throw new Error(result.message || 'Upload failed');
    return result.url;
  };

  const handleUploadSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Uslubingizni ulashish uchun avval profilga kiring');
      return;
    }
    if (uploadFiles.length === 0) {
      toast.error('Kamida bitta rasm yuklang');
      return;
    }
    if (!uploadComment.trim()) {
      toast.error('Surat haqida qisqa izoh yozing');
      return;
    }
    if (!activeProductId) {
      toast.error('Mahsulot aniqlanmadi. Sahifani yangilab ko\'ring');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Uslubingiz yuklanmoqda...');
    try {
      const images = [];
      for (const file of uploadFiles) {
        images.push(await uploadToImageKit(file));
      }

      await axios.post(`${API_BASE}/posts`, {
        images,
        caption: uploadComment.trim(),
        taggedProducts: [activeProductId]
      }, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });

      toast.success('Uslubingiz saqlandi', { id: loadingToast });
      setUploaded(true);
      await fetchPosts();
      setTimeout(() => closeUpload(), 900);
    } catch (error) {
      toast.error('Yuklashda xatolik yuz berdi', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost?._id || !isPostOwner(selectedPost, user)) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading('Uslub o\'chirilmoqda...');
    try {
      const authToken = token || localStorage.getItem('token');
      await axios.delete(`${API_BASE}/posts/${selectedPost._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setPosts((prev) => prev.filter((post) => post._id !== selectedPost._id));
      setSelectedPost(null);
      setConfirmDelete(false);
      toast.success('Uslub o\'chirildi', { id: loadingToast });
    } catch (error) {
      toast.error('O\'chirishda xatolik yuz berdi', { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const modal = selectedPost && createPortal(
    <div className="fixed inset-0 z-[2147483000] flex items-center justify-center overflow-hidden p-3 sm:p-5">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closePost} />
      <div className="relative z-10 grid h-[min(82dvh,680px)] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#09090a] shadow-[0_40px_100px_rgba(0,0,0,0.9)] md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="relative min-h-0 bg-black">
          <img src={getPostImage(selectedPost)} alt={getUserName(selectedPost)} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 md:hidden">
            <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">Real uslub</span>
            <button onClick={closePost} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white backdrop-blur-md">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-[#0d0d0f] p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {getUserAvatar(selectedPost) ? (
                <img src={getUserAvatar(selectedPost)} alt={getUserName(selectedPost)} className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-sm font-black text-[#c9a96e]">
                  {getUserName(selectedPost).charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="truncate text-sm font-black text-[#f5f5f3]">{getUserName(selectedPost)}</h4>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a8a8d]">Real xaridor uslubi</p>
              </div>
            </div>
            <button onClick={closePost} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8a8a8d] transition hover:bg-white/10 hover:text-white md:flex">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <p className="text-lg font-medium leading-relaxed text-[#f5f5f3]">"{selectedPost.caption || productName}"</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a8a8d]">{formatDate(selectedPost.createdAt)}</p>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] py-4 text-xs font-black uppercase tracking-[0.18em] text-[#f5f5f3]">
              <Heart className="h-4 w-4 text-[#c9a96e]" />
              {getPostLikes(selectedPost)} ta yoqtirish
            </button>
            {isPostOwner(selectedPost, user) && (
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl border py-4 text-xs font-black uppercase tracking-[0.16em] transition disabled:opacity-50 ${
                  confirmDelete
                    ? 'border-red-500/30 bg-red-500/15 text-red-300'
                    : 'border-white/10 bg-white/[0.03] text-[#8a8a8d] hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-300'
                }`}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {confirmDelete ? 'Tasdiqlash' : 'Uslubni o\'chirish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  const uploadModal = showUploadModal && createPortal(
    <div className="fixed inset-0 z-[2147483000] flex items-center justify-center overflow-hidden p-3 sm:p-5">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeUpload} />
      <div className="relative z-10 flex h-[min(84dvh,680px)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#09090a] shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10">
              <Camera className="h-5 w-5 text-[#c9a96e]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-[0.12em] text-[#f5f5f3]">{t('customerPhotoReviews.photoReview')}</h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a8a8d]">{productName}</p>
            </div>
          </div>
          <button onClick={closeUpload} disabled={isSubmitting} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8a8a8d] transition hover:bg-white/10 hover:text-white disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        {uploaded ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.14em] text-white">{t('customerPhotoReviews.success')}</h4>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#8a8a8d]">Suratingiz mahsulot sahifasida real uslub sifatida ko'rinadi.</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 p-5 sm:p-6">
            <div className="grid h-full grid-rows-[auto_1fr_auto] gap-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white">{t('customerPhotoReviews.imagesMax')}</p>
                  <span className="text-[10px] font-bold text-[#8a8a8d]">{uploadFiles.length}/4</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {previews.map((item, idx) => (
                    <div key={item.url} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => removeUploadImage(idx)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {uploadFiles.length < 4 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center transition hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/10">
                      <Upload className="h-5 w-5 text-[#c9a96e]" />
                      <span className="mt-2 text-[8px] font-black uppercase tracking-widest text-[#8a8a8d]">{t('customerPhotoReviews.upload')}</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <textarea
                value={uploadComment}
                onChange={(event) => setUploadComment(event.target.value)}
                placeholder="Uslubingiz haqida qisqa yozing..."
                className="min-h-0 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-[#f5f5f3] outline-none transition placeholder:text-[#555] focus:border-[#c9a96e]/40"
              />

              <button
                onClick={handleUploadSubmit}
                disabled={isSubmitting || uploadFiles.length === 0}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] py-4 text-[11px] font-black uppercase tracking-[0.22em] text-black transition hover:bg-[#d4b87a] disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Yuborish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div>
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10">
            <Camera className="h-6 w-6 text-[#c9a96e]" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide text-[#f5f5f3]">{t('customerPhotoReviews.title')}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#8a8a8d]">
              {isLoading ? 'Yuklanmoqda...' : `${posts.length} ta real uslub`}
            </p>
          </div>
        </div>
        <button onClick={openUpload} className="flex items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] shadow-[0_10px_20px_rgba(201,169,110,0.2)] transition hover:bg-[#d4b87a] active:scale-[0.98]">
          <Upload className="h-4 w-4" strokeWidth={3} />
          {t('customerPhotoReviews.shareStyle')}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10">
            <Camera className="h-7 w-7 text-[#c9a96e]" />
          </div>
          <h4 className="text-xl font-semibold text-[#f5f5f3]">Hali suratli uslub yo'q</h4>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8a8a8d]">
            Bu mahsulotni sotib olgan mijozlar real obrazlarini ulashganda shu yerda ko'rinadi.
          </p>
          <button onClick={openUpload} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e] transition hover:bg-[#c9a96e]/20">
            <Upload className="h-4 w-4" />
            Uslubingizni ulashing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {posts.map((post, idx) => (
            <div
              key={post._id}
              role="button"
              tabIndex={0}
              onClick={() => openPost(post)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openPost(post);
                }
              }}
              className="group relative z-10 aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] text-left animate-fade-in-up outline-none transition focus-visible:ring-2 focus-visible:ring-[#c9a96e]/70"
              style={{ animationDelay: `${Math.min(idx * 70, 420)}ms` }}
            >
              <img src={getPostImage(post)} alt={getUserName(post)} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="truncate text-[10px] font-black uppercase tracking-widest text-white">{getUserName(post)}</p>
                <div className="mt-2 flex items-center gap-2 text-white/70">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{getPostLikes(post)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal}
      {uploadModal}
    </div>
  );
};

export default CustomerPhotoReviews;
