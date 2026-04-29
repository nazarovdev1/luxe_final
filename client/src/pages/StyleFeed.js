import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    Heart, 
    MessageSquare, 
    Plus, 
    X, 
    Upload, 
    ShoppingBag, 
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
    Camera,
    Image as ImageIcon,
    Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';

const StyleFeed = () => {
    const { user, isAuthenticated, token, isAdmin } = useAuth();
    const { products, getImageKitAuth } = useProducts();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch posts
    const fetchPosts = async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            const response = await axios.get(`/api/posts?page=${pageNum}&limit=12`);
            if (response.data.success) {
                const newPosts = response.data.data;
                setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
                setHasMore(newPosts.length === 12);
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
            toast.error('Postlarni yuklashda xatolik');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (postId) => {
        if (!isAuthenticated) {
            toast.error('Layk bosish uchun tizimga kiring');
            return;
        }
        try {
            const response = await axios.put(`/api/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const updatedPosts = posts.map(post => 
                    post._id === postId 
                    ? { 
                        ...post, 
                        likes: response.data.isLiked 
                            ? [...post.likes, user._id] 
                            : post.likes.filter(id => id !== user._id) 
                      } 
                    : post
                );
                setPosts(updatedPosts);
                
                if (selectedPost?._id === postId) {
                    setSelectedPost({
                        ...selectedPost,
                        likes: response.data.isLiked 
                            ? [...selectedPost.likes, user._id] 
                            : selectedPost.likes.filter(id => id !== user._id)
                    });
                }
            }
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Haqiqatdan ham ushbu postni o\'chirmoqchimisiz?')) return;

        try {
            const response = await axios.delete(`/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Post o\'chirildi');
                setPosts(posts.filter(p => p._id !== postId));
                setSelectedPost(null);
            }
        } catch (error) {
            toast.error('O\'chirishda xatolik yuz berdi');
        }
    };

    return (
    <div className="min-h-screen bg-[#070707] text-white pt-32 pb-24 relative overflow-hidden">
        {/* Background Cinematic Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#d6b47c]/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#d6b47c]/3 rounded-full blur-[150px] translate-y-1/2" />

        <SEO title="Community Style Feed - Luxe" description="Foydalanuvchilarning eng sara obrazlari va stili." />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#d6b47c]/20 to-transparent border-l-2 border-[#d6b47c] px-4 py-2 mb-6">
                        <ImageIcon className="w-4 h-4 text-[#d6b47c]" />
                        <span className="text-[#d6b47c] text-[10px] tracking-[0.3em] uppercase font-black">Hamjamiyat Galereyasi</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-brilliant text-white mb-6 leading-[0.9]">
                        Style <span className="text-[#d6b47c]">Feed</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed pt-4">
                        Luxe hamjamiyatidan ilhom oling. O'zingizning eng sara obrazlaringizni ulashing, boshqalarni baholang va <span className="text-white font-medium italic underline decoration-[#d6b47c]/40 underline-offset-4">Luxe ballariga</span> ega bo'ling.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-6">
                    <button 
                        onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : toast.error('Post yaratish uchun tizimga kiring')}
                        className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full"
                    >
                        <div className="absolute inset-0 bg-[#d6b47c] opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="absolute inset-0 border border-[#d6b47c]/30 rounded-full" />
                        <span className="relative z-10 flex items-center gap-3 text-[#d6b47c] text-sm font-black tracking-widest uppercase">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Obraz ulashish
                        </span>
                    </button>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Jami postlar</p>
                            <p className="text-2xl font-brilliant text-white">{posts.length}+</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Top stilistlar</p>
                            <p className="text-2xl font-brilliant text-[#d6b47c]">124</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Grid */}
            {isLoading && page === 1 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="w-12 h-12 border-[3px] border-[#d6b47c] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#d6b47c] text-sm tracking-widest font-medium animate-pulse">Galereya yuklanmoqda...</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                    {posts.map((post) => (
                        <PostCard 
                            key={post._id} 
                            post={post} 
                            onLike={handleLike} 
                            currentUserId={user?._id} 
                            onClick={() => setSelectedPost(post)}
                        />
                    ))}
                </div>
            )}

            {posts.length === 0 && !isLoading && (
                <div className="text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                    <Camera className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
                    <h3 className="text-2xl text-gray-400 font-light">Hozircha postlar yo'q</h3>
                    <p className="text-gray-600 mt-3">Birinchilardan bo'lib o'z obrazingizni qo'shing!</p>
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center mt-20">
                    <button 
                        onClick={() => {
                            const nextPage = page + 1;
                            setPage(nextPage);
                            fetchPosts(nextPage, true);
                        }}
                        className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-white opacity-5 group-hover:opacity-10 transition-opacity" />
                        <div className="absolute inset-0 border border-white/10 rounded-full" />
                        <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white">Yana yuklash</span>
                    </button>
                </div>
            )}
        </div>

            {/* Create Post Modal */}
            {isCreateModalOpen && (
                <CreatePostModal 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchPosts(1);
                    }}
                    token={token}
                    products={products}
                    getImageKitAuth={getImageKitAuth}
                />
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostDetailModal 
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onLike={handleLike}
                    onDelete={handleDeletePost}
                    currentUserId={user?._id}
                    isAdmin={isAdmin}
                    token={token}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
};

const PostCard = ({ post, onLike, currentUserId, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isLiked = post.likes?.includes(currentUserId);

    return (
        <div 
            className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-[#111111] border border-white/5 hover:border-[#d6b47c]/30 transition-all duration-500 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* User Info Overlay (Mobile friendly) */}
            <div className="absolute top-0 left-0 w-full p-4 z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-[#d6b47c] flex items-center justify-center font-bold text-xs text-black">
                        {post.user?.profileImage ? (
                            <img src={post.user.profileImage} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            post.user?.username?.[0]?.toUpperCase()
                        )}
                    </div>
                    <span className="text-xs font-semibold tracking-wide">{post.user?.username}</span>
                </div>
            </div>

            {/* Main Image */}
            <div className="relative aspect-auto">
                <img 
                    src={post.images?.[0]} 
                    alt={post.caption}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Interaction Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 ${isHovered ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    <p className="text-sm text-gray-200 line-clamp-2 mb-4 italic">
                        "{post.caption}"
                    </p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onLike(post._id); }}
                                className="flex items-center gap-1.5 group/like"
                            >
                                <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover/like:text-red-400'}`} />
                                <span className="text-xs font-bold">{post.likes?.length || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-5 h-5 text-white" />
                                <span className="text-xs font-bold">{post.commentCount || 0}</span>
                            </div>
                        </div>

                        {post.taggedProducts?.length > 0 && (
                            <div className="flex -space-x-2">
                                {post.taggedProducts.slice(0, 3).map((prod, i) => (
                                    <div key={prod._id} className="w-8 h-8 rounded-full border-2 border-[#111] bg-[#1a1a1a] p-1 overflow-hidden" title={prod.name}>
                                        <img src={prod.image} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                                {post.taggedProducts.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-[#d6b47c] flex items-center justify-center text-[10px] font-black text-black">
                                        +{post.taggedProducts.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreatePostModal = ({ onClose, onSuccess, token, products, getImageKitAuth }) => {
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState('');
    const [taggedProducts, setTaggedProducts] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Rasmlar yuklanmoqda...');

        try {
            const uploadedUrls = [];
            for (const file of files) {
                const auth = await getImageKitAuth();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileName', file.name);
                formData.append('publicKey', 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=');
                formData.append('signature', auth.signature);
                formData.append('expire', auth.expire);
                formData.append('token', auth.token);
                formData.append('folder', '/style_feed');

                const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.url) uploadedUrls.push(result.url);
            }
            setImages([...images, ...uploadedUrls]);
            toast.success('Tayyor!', { id: loadingToast });
        } catch (error) {
            toast.error('Xatolik yuz berdi', { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (images.length === 0) return toast.error('Rasm yuklang');
        if (!caption.trim()) return toast.error('Tavsif kiriting');

        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/posts', {
                images,
                caption,
                taggedProducts: taggedProducts.map(p => p._id)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Post muvaffaqiyatli yaratildi! +30 ball');
                onSuccess();
            }
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = searchQuery.trim() 
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-[#111111] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                {/* Left Side - Image Upload/Preview */}
                <div className="w-full md:w-1/2 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 border-r border-white/5">
                    {images.length > 0 ? (
                        <div className="relative w-full h-full flex flex-col gap-4">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                                <img src={images[0]} className="w-full h-full object-cover" />
                                <button onClick={() => setImages([])} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-black">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                        <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center hover:border-[#d6b47c]/50 transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="w-full aspect-[3/4] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#d6b47c]/30 hover:bg-[#d6b47c]/5 transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-[#d6b47c]" />
                            </div>
                            <p className="font-semibold text-gray-300">Rasm yuklang</p>
                            <p className="text-xs text-gray-600 mt-2">Kiyimlaringiz kiygan obrazingizni ko'rsating</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleUpload} accept="image/*" />
                </div>

                {/* Right Side - Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif">Post tafsilotlari</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-3">Tavsif</label>
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#d6b47c]/50 focus:ring-0 outline-none transition-all resize-none h-32"
                                placeholder="Obrazingiz haqida yozing..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-3">Mahsulotlarni belgilash (Tag)</label>
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-full pl-12 pr-4 py-3 text-sm focus:border-[#d6b47c]/50 outline-none"
                                    placeholder="Mahsulot qidirish..."
                                />
                            </div>

                            {/* Tagged Products list */}
                            {taggedProducts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {taggedProducts.map(p => (
                                        <div key={p._id} className="flex items-center gap-2 bg-[#d6b47c]/10 border border-[#d6b47c]/30 pl-1 pr-2 py-1 rounded-full">
                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white">
                                                <img src={p.image} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[10px] font-bold text-[#d6b47c] max-w-[80px] truncate">{p.name}</span>
                                            <button onClick={() => setTaggedProducts(taggedProducts.filter(x => x._id !== p._id))}>
                                                <X className="w-3 h-3 text-[#d6b47c]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            {filteredProducts.length > 0 && (
                                <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl max-h-40 overflow-y-auto p-2 custom-scrollbar">
                                    {filteredProducts.map(p => (
                                        <button 
                                            key={p._id}
                                            onClick={() => {
                                                if (!taggedProducts.find(x => x._id === p._id)) {
                                                    setTaggedProducts([...taggedProducts, p]);
                                                }
                                                setSearchQuery('');
                                            }}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors text-left"
                                        >
                                            <img src={p.image} className="w-8 h-8 rounded bg-white object-contain" />
                                            <span className="text-xs truncate">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || isUploading}
                            className="w-full py-4 bg-[#d6b47c] text-[#0a0a0a] rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#e8c98a] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Tayyorlanmoqda...' : 'Postni ulashish'}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6b47c; }
            `}} />
        </div>
    );
};

const PostDetailModal = ({ post, onClose, onLike, onDelete, currentUserId, isAdmin, token, isAuthenticated }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const isLiked = post.likes?.includes(currentUserId);
    const isOwner = post.user?._id === currentUserId;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoadingComments(true);
                const response = await axios.get(`/api/comments/${post._id}`);
                if (response.data.success) {
                    setComments(response.data.data);
                }
            } catch (error) {
                console.error('Fetch comments error:', error);
            } finally {
                setIsLoadingComments(false);
            }
        };
        fetchComments();
    }, [post._id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return toast.error('Izoh qoldirish uchun tizimga kiring');
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const response = await axios.post(`/api/comments/${post._id}`, {
                text: newComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setComments([...comments, response.data.data]);
                setNewComment('');
                toast.success('Izoh qo\'shildi');
            }
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Ushbu izohni o\'chirmoqchimisiz?')) return;

        try {
            const response = await axios.delete(`/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setComments(comments.filter(c => c._id !== commentId));
                toast.success('Izoh o\'chirildi');
            }
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                {/* Left Side - Image */}
                <div className="w-full md:w-[60%] bg-black flex items-center justify-center overflow-hidden relative">
                    <img src={post.images?.[0]} className="w-full h-full object-contain" alt={post.caption} />
                    {(isOwner || isAdmin) && (
                        <button 
                            onClick={() => onDelete(post._id)}
                            className="absolute top-4 left-4 p-2.5 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/30 transition-all backdrop-blur-md group"
                            title="Postni o'chirish"
                        >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>

                {/* Right Side - Details & Comments */}
                <div className="w-full md:w-[40%] flex flex-col bg-[#111111] border-l border-white/5">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#d6b47c] flex items-center justify-center font-bold text-black border border-white/10">
                                {post.user?.profileImage ? (
                                    <img src={post.user.profileImage} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    post.user?.username?.[0]?.toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wide">{post.user?.username}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Caption */}
                        <div>
                            <p className="text-sm leading-relaxed text-gray-300 italic">"{post.caption}"</p>
                        </div>

                        {/* Tagged Products */}
                        {post.taggedProducts?.length > 0 && (
                            <div>
                                <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-4">Mahsulotlar</h4>
                                <div className="space-y-3">
                                    {post.taggedProducts.map(prod => (
                                        <div 
                                            key={prod._id}
                                            onClick={() => navigate(`/product/${prod._id}`)}
                                            className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-[#d6b47c]/30 cursor-pointer transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0">
                                                <img src={prod.image} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold truncate group-hover:text-[#d6b47c] transition-colors">{prod.name}</p>
                                                <p className="text-[10px] text-gray-500">{prod.price?.toLocaleString()} so'm</p>
                                            </div>
                                            <ShoppingBag className="w-4 h-4 text-gray-600 group-hover:text-[#d6b47c] transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold">Izohlar ({comments.length})</h4>
                            
                            {isLoadingComments ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-[#d6b47c] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map(comment => (
                                        <div key={comment._id} className="flex gap-3 group/comment">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                                {comment.user?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-[11px] font-bold text-gray-400">{comment.user?.username}</p>
                                                    {(comment.user?._id === currentUserId || isAdmin) && (
                                                        <button 
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="opacity-0 group-hover/comment:opacity-100 p-1 text-gray-600 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-200 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <p className="text-xs text-gray-600 text-center py-4 italic">Hozircha izohlar yo'q</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer - Like & Add Comment */}
                    <div className="p-6 border-t border-white/5 space-y-4 bg-[#0d0d0d]">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => onLike(post._id)}
                                className="flex items-center gap-2 group"
                            >
                                <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover:text-red-400'}`} />
                                <span className="font-bold text-sm">{post.likes?.length || 0} ta layk</span>
                            </button>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                Obraz ulashildi
                            </div>
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Izoh qoldiring..."
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-full py-3 pl-5 pr-12 text-xs focus:border-[#d6b47c]/50 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={isSubmittingComment || !newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#d6b47c] disabled:opacity-30"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StyleFeed;
