import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, MessageSquare, Plus, X, Upload, ShoppingBag, Image as ImageIcon, ArrowLeft, Search, Trash2, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';

export default function MobileStyleFeed() {
  const { user, isAuthenticated, token, isAdmin } = useAuth();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Create form state
  const [caption, setCaption] = useState('');
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/posts?page=1&limit=20');
      if (res.data.success) setPosts(res.data.data);
    } catch {
      toast.error('Postlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchComments = async (postId) => {
    try {
      setIsLoadingComments(true);
      const res = await axios.get(`/api/comments/${postId}`);
      if (res.data.success) setComments(res.data.data);
    } catch {
      toast.error('Izohlarni yuklashda xatolik');
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId) => {
    if (!isAuthenticated) { toast.error('Layk bosish uchun kiring'); return; }
    try {
      const res = await axios.put(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const updateLikes = (p) => {
          if (p._id !== postId) return p;
          const isLiked = res.data.isLiked;
          const newLikes = isLiked 
            ? [...(p.likes || []), user._id] 
            : (p.likes || []).filter(id => id !== user._id);
          return { ...p, likes: newLikes };
        };

        setPosts(prev => prev.map(updateLikes));
        if (selectedPost?._id === postId) {
          setSelectedPost(prev => updateLikes(prev));
        }
        
        toast.success(res.data.isLiked ? 'Layk bosildi' : 'Layk olib tashlandi');
      }
    } catch { toast.error('Xatolik'); }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) { toast.error('Izoh qoldirish uchun kiring'); return; }
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/comments/${selectedPost._id}`, { text: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setComments(prev => [...prev, res.data.data]);
        setNewComment('');
        // Update comment count in main list and selected post
        const updateCommentsCount = (p) => {
           if (p._id !== selectedPost._id) return p;
           return { ...p, comments: [...(p.comments || []), res.data.data] };
        };
        setPosts(prev => prev.map(updateCommentsCount));
        setSelectedPost(prev => updateCommentsCount(prev));
        toast.success('Izoh qo\'shildi');
      }
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('O\'chirilsinmi?')) return;
    try {
      await axios.delete(`/api/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Post o\'chirildi');
      setPosts(prev => prev.filter(p => p._id !== postId));
      if (selectedPost?._id === postId) setSelectedPost(null);
    } catch { toast.error('Xatolik'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = async () => {
    if (!imageFile) { toast.error('Rasm tanlang'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption);
      formData.append('taggedProducts', JSON.stringify(taggedProducts));
      const res = await axios.post('/api/posts', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Post qo\'yildi!');
        setIsCreateOpen(false);
        setCaption(''); setTaggedProducts([]); setImageFile(null); setImagePreview('');
        fetchPosts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-24 relative overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d6b47c]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute top-[20%] left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-[80px] -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#d6b47c]/5 rounded-full blur-[120px] translate-y-1/3" />

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <button onClick={() => setSelectedPost(null)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
              <X className="w-5 h-5 text-gray-300" />
            </button>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Post Muallifi</p>
              <p className="text-sm font-bold text-[#d6b47c]">{selectedPost.user?.username}</p>
            </div>
            {(isAdmin || selectedPost.user?._id === user?._id) ? (
              <button onClick={() => handleDelete(selectedPost._id)} className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center active:scale-90 transition-transform">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            ) : <div className="w-10" />}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="aspect-[4/5] w-full bg-white/5 relative">
               <img 
                 src={selectedPost.images?.[0] || selectedPost.imageUrl} 
                 alt="" 
                 className="w-full h-full object-cover" 
                 onError={(e) => { e.target.src = '/mobile.jpg' }}
               />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <button onClick={() => handleLike(selectedPost._id)} className="flex items-center gap-2 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedPost.likes?.includes(user?._id) ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400'}`}>
                    <Heart className={`w-6 h-6 ${selectedPost.likes?.includes(user?._id) ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-lg font-black">{selectedPost.likes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-black">{selectedPost.comments?.length || 0}</span>
                </div>
              </div>

              {selectedPost.caption && (
                <div className="mb-6">
                   <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2">Tavsif</p>
                   <p className="text-base text-gray-200 leading-relaxed italic">"{selectedPost.caption}"</p>
                </div>
              )}

              {selectedPost.taggedProducts?.length > 0 && (
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-[#d6b47c] font-black mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" /> Belgilangan Mahsulotlar
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedPost.taggedProducts.map(p => (
                      <button
                        key={p._id || p.id}
                        onClick={() => { setSelectedPost(null); navigate(`/mobile/product/${p._id || p.id}`); }}
                        className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-[24px] p-3 text-left active:scale-[0.98] transition-all"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                           <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{p.name}</p>
                          <p className="text-xs text-[#d6b47c] font-black uppercase tracking-widest mt-1">Sotib olish</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 mr-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-12 mb-20">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-6">Fikrlar ({comments.length})</p>
                
                <div className="space-y-6">
                  {comments.map((comment, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#d6b47c]/20 flex items-center justify-center shrink-0 border border-[#d6b47c]/20 overflow-hidden">
                        {comment.user?.profileImage ? (
                          <img src={comment.user.profileImage} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-[#d6b47c]">{comment.user?.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-[#d6b47c]">{comment.user?.username}</p>
                          <p className="text-[9px] text-gray-600 font-medium">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && !isLoadingComments && (
                    <div className="text-center py-10 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                      <MessageSquare className="w-8 h-8 text-gray-800 mx-auto mb-3 opacity-20" />
                      <p className="text-xs text-gray-600">Hali fikrlar yo'q. Birinchi bo'ling!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comment Input Sticky */}
          <div className="p-4 bg-black/50 backdrop-blur-2xl border-t border-white/10 safe-area-bottom">
            <div className="flex gap-3 items-center">
              <input
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d6b47c]/40 transition-all"
                placeholder="Fikr bildiring..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="w-12 h-12 rounded-2xl bg-[#d6b47c] flex items-center justify-center shadow-lg shadow-[#d6b47c]/20 disabled:opacity-50 active:scale-90 transition-transform"
              >
                <Plus className="w-6 h-6 text-black rotate-45" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-end">
          <div className="w-full bg-[#0f0f13] rounded-t-[40px] p-6 border-t border-white/10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-brilliant text-white">Yangi <span className="text-[#d6b47c]">Obraz</span></h3>
              <button onClick={() => setIsCreateOpen(false)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6 pb-10">
              {/* Image Upload */}
              <label className="block">
                <div className={`w-full aspect-[4/5] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-500 ${imagePreview ? 'border-transparent ring-2 ring-[#d6b47c]/30' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-[#d6b47c]/10 flex items-center justify-center mx-auto mb-4 border border-[#d6b47c]/20">
                        <Camera className="w-8 h-8 text-[#d6b47c]" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Rasm yuklash yoki suratga olish</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">Max 5MB • JPG, PNG</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              {/* Caption */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mb-3 ml-1">Sizning Taassurotingiz</p>
                <textarea
                  className="w-full bg-white/[0.03] border border-white/10 rounded-[24px] px-5 py-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#d6b47c]/40 transition-all"
                  rows={3}
                  placeholder="Ushbu obrazingiz haqida yozing..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>

              {/* Product tagging */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#d6b47c] font-black mb-3 ml-1">Mahsulotlarni Belgilang</p>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d6b47c]/30"
                    placeholder="Kiyim nomini qidiring..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                </div>
                
                {taggedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {taggedProducts.map(tp => (
                      <div key={tp._id || tp.id} className="flex items-center gap-2 bg-[#d6b47c]/10 border border-[#d6b47c]/30 rounded-full pl-2 pr-1 py-1">
                        <span className="text-[10px] font-bold text-[#d6b47c]">{tp.name}</span>
                        <button onClick={() => setTaggedProducts(prev => prev.filter(i => (i._id || i.id) !== (tp._id || tp.id)))} className="w-4 h-4 rounded-full bg-[#d6b47c] flex items-center justify-center">
                          <X className="w-2.5 h-2.5 text-black" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredProducts.map(p => {
                    const isTagged = taggedProducts.some(tp => (tp._id || tp.id) === (p._id || p.id));
                    return (
                      <button
                        key={p._id || p.id}
                        onClick={() => setTaggedProducts(prev =>
                          isTagged ? prev.filter(tp => (tp._id || tp.id) !== (p._id || p.id)) : [...prev, p]
                        )}
                        className={`w-full flex items-center gap-4 rounded-[20px] p-3 border transition-all text-left ${isTagged ? 'border-[#d6b47c]/40 bg-[#d6b47c]/10' : 'border-white/5 bg-white/[0.02]'}`}
                      >
                        <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <span className="text-sm font-bold text-gray-300 flex-1 truncate">{p.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isTagged ? 'bg-[#d6b47c] border-[#d6b47c]' : 'border-white/10'}`}>
                          {isTagged && <span className="text-black text-[10px] font-black">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmitPost}
                disabled={isSubmitting || !imageFile}
                className="w-full py-4 rounded-[24px] font-black text-sm uppercase tracking-widest text-black disabled:opacity-50 transition-all active:scale-[0.98] shadow-2xl shadow-[#d6b47c]/20"
                style={{ background: '#d6b47c' }}
              >
                {isSubmitting ? 'Tayyorlanmoqda...' : 'Obrazni Ulashish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 px-5 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-8 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-widest">Orqaga</span>
        </button>

        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/5 text-[#d6b47c] mb-4 backdrop-blur-md">
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Luxe Community</span>
            </div>
            <h1 className="text-6xl font-brilliant text-white leading-none">
              Style <span className="text-[#d6b47c]">Feed</span>
            </h1>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-14 h-14 rounded-[24px] bg-[#d6b47c] flex items-center justify-center shadow-xl shadow-[#d6b47c]/20 active:scale-90 transition-all"
            >
              <Plus className="w-8 h-8 text-black" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-400 max-w-[280px] mb-8 leading-relaxed">
          Premium hamjamiyatning eng so'nggi <span className="text-white font-bold">fashion obrazlaridan</span> ilhom oling.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-1 px-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/[0.03] animate-pulse rounded-lg overflow-hidden border border-white/5" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 px-8 mt-10">
            <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6">
               <ImageIcon className="w-10 h-10 text-gray-700" />
            </div>
            <h3 className="text-xl font-brilliant text-gray-400 mb-2">Hali postlar yo'q</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Siz birinchilardan bo'lib o'z obrazingizni ulashishingiz mumkin.</p>
            {isAuthenticated ? (
              <button 
                onClick={() => setIsCreateOpen(true)} 
                className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-black" 
                style={{ background: '#d6b47c' }}
              >
                Post qo'shish
              </button>
            ) : (
              <button 
                onClick={() => navigate('/mobile/login')} 
                className="px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white border border-white/10 bg-white/5"
              >
                Kirish va Ulashish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 px-1">
            {posts.map((post, idx) => {
              const isLiked = post.likes?.includes(user?._id);
              return (
                <div 
                  key={post._id} 
                  className={`relative aspect-[3/4] cursor-pointer group overflow-hidden ${idx % 4 === 1 || idx % 4 === 2 ? 'translate-y-4' : ''}`} 
                  onClick={() => {
                    setSelectedPost(post);
                    fetchComments(post._id);
                  }}
                >
                  <img 
                    src={post.images?.[0] || post.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => { e.target.src = '/mobile.jpg' }}
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Info Overlay */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="flex justify-end">
                      {post.taggedProducts?.length > 0 && (
                        <div className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#d6b47c]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] text-white/80 font-bold tracking-wide truncate pr-2">@{post.user?.username}</p>
                       <div className="flex items-center gap-1">
                         <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
                         <span className="text-[10px] text-white/60 font-black">{post.likes?.length || 0}</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Spacer for staggered grid */}
      <div className="h-20" />
    </div>
  );
}
