import React, { useState, useEffect, useRef } from 'react';
import StylePolls from '../components/StylePolls';
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
    Trash2,
    User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import CommunityOpening, { CommunityChapter, useCommunityMotion } from '../components/CommunityOpening';

const StyleFeed = () => {
    const { user, isAuthenticated, token, isAdmin } = useAuth();
    const { products, getImageKitAuth } = useProducts();
    const { t } = useLanguage();
    const pageRef = useRef(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const initialFetchRef = useRef(false);
    useCommunityMotion(pageRef);

    const fetchPosts = async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const response = await axios.get(`/api/posts?page=${pageNum}&limit=12`);
            if (response.data.success) {
                const newPosts = response.data.data;
                setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
                setHasMore(newPosts.length === 12);
            }
        } catch (error) {
            console.error('Fetch posts error:', error);
            toast.error(t('styleFeed.error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (initialFetchRef.current) return;
        initialFetchRef.current = true;
        fetchPosts();
    }, []);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('luxx:chrome-visibility', {
            detail: { hidden: Boolean(selectedPost) }
        }));

        return () => {
            window.dispatchEvent(new CustomEvent('luxx:chrome-visibility', {
                detail: { hidden: false }
            }));
        };
    }, [selectedPost]);

    const handleLike = async (postId) => {
        if (!isAuthenticated) {
            toast.error(t('styleFeed.loginToLike'));
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
            toast.error(t('styleFeed.error'));
        }
    };

    const handleDeletePost = async (postId) => {
        if (!await window.luxeConfirm(t('styleFeed.confirmDeletePost'))) return;

        try {
            const response = await axios.delete(`/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success(t('styleFeed.postDeleted'));
                setPosts(posts.filter(p => p._id !== postId));
                setSelectedPost(null);
            }
        } catch (error) {
            toast.error(t('styleFeed.error'));
        }
    };

    return (
    <div ref={pageRef} className="community-page community-page--community">

        <SEO title="Community Style Feed - Luxe" description="Foydalanuvchilarning eng sara obrazlari va stili." />
        
        <CommunityOpening variant="community" description={t('styleFeed.subtitle')}>
            <button type="button" onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : toast.error(t('styleFeed.loginToCreate'))}>+ {t('styleFeed.shareLook')}</button>
            <span>{posts.length} {t('styleFeed.totalPosts')}</span>
        </CommunityOpening>
        <div className="community-page__body community-content community-page__body--dark">
            <CommunityChapter variant="community" />

            {/* Feed Grid */}
            {isLoading && page === 1 ? (
                <div className="community-feed-grid" aria-busy="true" aria-label="Galereya yuklanmoqda">
                    <div className="community-feed-note relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-[#d6b47c]/5 to-transparent pointer-events-none" />
                        <span>THE COMMUNITY EDIT / 01</span>
                        <h3>Bir obraz.<br /><em>Ming ilhom.</em></h3>
                        <p>O‘zingizga yaqin uslubni toping, o‘z obrazingiz bilan suhbatga qo‘shiling.</p>
                        <div className="w-44 h-9 mt-6 rounded-full bg-gradient-to-r from-white/10 to-[#d6b47c]/10 border border-[#d6b47c]/20 animate-pulse" />
                    </div>
                    {[...Array(5)].map((_, index) => (
                        <StyleFeedCardSkeleton key={`feed-skeleton-${index}`} delay={index * 120} />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                    <Camera className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
                    <h3 className="text-2xl text-gray-400 font-light">{t('styleFeed.noPosts')}</h3>
                    <p className="text-gray-600 mt-3">{t('styleFeed.beFirst')}</p>
                </div>
            ) : (
                <div className="community-feed-grid">
                    <div className="community-feed-note">
                        <span>THE COMMUNITY EDIT / 01</span>
                        <h3>Bir obraz.<br /><em>Ming ilhom.</em></h3>
                        <p>O‘zingizga yaqin uslubni toping, o‘z obrazingiz bilan suhbatga qo‘shiling.</p>
                        <button type="button" onClick={() => isAuthenticated ? setIsCreateModalOpen(true) : toast.error(t('styleFeed.loginToCreate'))}>{t('styleFeed.shareLook')} <span aria-hidden="true">↗</span></button>
                    </div>
                    {posts.map((post) => (
                        <PostCard 
                            key={post._id} 
                            post={post} 
                            onLike={handleLike} 
                            currentUserId={user?._id} 
                            onClick={() => setSelectedPost(post)}
                        />
                    ))}
                    {isLoadingMore && [...Array(3)].map((_, index) => (
                        <StyleFeedCardSkeleton key={`feed-skeleton-more-${index}`} delay={index * 120} />
                    ))}
                </div>
            )}

            {hasMore && !isLoading && posts.length > 0 && (
                <div className="flex justify-center mt-20">
                    <button 
                        onClick={() => {
                            if (isLoadingMore) return;
                            const nextPage = page + 1;
                            setPage(nextPage);
                            fetchPosts(nextPage, true);
                        }}
                        disabled={isLoadingMore}
                        className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-white opacity-5 group-hover:opacity-10 transition-opacity" />
                        <div className="absolute inset-0 border border-white/10 rounded-full" />
                        <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-white flex items-center gap-2">
                            {isLoadingMore ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-[#d6b47c] border-t-transparent rounded-full animate-spin" />
                                    <span>{t('styleFeed.loading')}</span>
                                </>
                            ) : (
                                t('styleFeed.loadMore')
                            )}
                        </span>
                    </button>
                </div>
            )}

            {/* Style Polls */}
            <div className="mt-24 pt-16 border-t border-[#c1a88e]/20">
                <StylePolls />
            </div>
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
                    t={t}
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
                    t={t}
                />
            )}
        </div>
    );
};

const StyleFeedCardSkeleton = ({ delay = 0 }) => {
    return (
        <div 
            className="group break-inside-avoid relative rounded-[0_60px_0_0] overflow-hidden bg-gradient-to-b from-[#18181b] via-[#111114] to-[#09090b] border border-white/5 shadow-2xl transition-all duration-500"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Golden Shimmer Wave */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-[#d6b47c]/10 to-transparent pointer-events-none z-20" />

            {/* Top User Pill Skeleton */}
            <div className="absolute top-0 left-0 w-full p-4 z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/10 to-[#d6b47c]/20 animate-pulse flex items-center justify-center">
                        <User className="w-4 h-4 text-[#d6b47c]/60" />
                    </div>
                    <div className="w-20 h-3 rounded-full bg-white/10 animate-pulse" />
                </div>
            </div>

            {/* Main Visual Skeleton */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#1c1c20] via-[#141417] to-[#0a0a0c] flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-[#d6b47c]/15 flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-[#d6b47c]/30 animate-pulse" />
                    </div>
                    <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#d6b47c]/40">Luxe Editorial</span>
                </div>
            </div>

            {/* Bottom Interaction & Caption Skeleton */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end gap-3 z-10">
                <div className="h-3 w-4/5 rounded-full bg-white/15 animate-pulse" />
                <div className="h-2.5 w-1/2 rounded-full bg-white/10 animate-pulse" />
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                            <div className="w-6 h-2.5 rounded-full bg-white/10 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                            <div className="w-6 h-2.5 rounded-full bg-white/10 animate-pulse" />
                        </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#d6b47c]/20 border border-[#d6b47c]/30 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

const PostCard = ({ post, onLike, currentUserId, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const isLiked = post.likes?.includes(currentUserId);
    const imageUrl = post.images?.[0] || post.imageUrl;

    return (
        <div 
            className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-[#111111] border border-white/5 hover:border-[#d6b47c]/30 transition-all duration-500 cursor-pointer shadow-xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* User Info Overlay (Mobile friendly) */}
            <div className="absolute top-0 left-0 w-full p-4 z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/10 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-[#d6b47c] flex items-center justify-center font-bold text-xs text-black overflow-hidden flex-shrink-0">
                        {post.user?.profileImage ? (
                            <img src={post.user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            post.user?.username?.[0]?.toUpperCase() || 'L'
                        )}
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-white/90 truncate max-w-[130px]">{post.user?.username || 'Luxe Member'}</span>
                </div>
            </div>

            {/* Main Image with Progressive Skeleton Loading */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#141416]">
                {/* Skeleton shimmer shown while image is loading */}
                {!isImageLoaded && !imageError && (
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1c1c20] via-[#141417] to-[#0c0c0e] flex items-center justify-center">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#d6b47c]/10 to-transparent pointer-events-none" />
                        <Camera className="w-8 h-8 text-[#d6b47c]/20 animate-pulse" />
                    </div>
                )}

                {imageError ? (
                    <div className="w-full h-full aspect-[3/4] flex flex-col items-center justify-center bg-[#151518] text-gray-500 p-4 text-center">
                        <ImageIcon className="w-10 h-10 text-[#d6b47c]/30 mb-2" />
                        <span className="text-[11px] uppercase tracking-wider text-gray-400">Luxe Editorial</span>
                    </div>
                ) : (
                    <img 
                        src={imageUrl} 
                        alt={post.caption || 'Luxe Style Post'}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setIsImageLoaded(true)}
                        onError={() => {
                            setIsImageLoaded(true);
                            setImageError(true);
                        }}
                        className={`w-full h-full aspect-[3/4] object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                            isImageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105 absolute inset-0'
                        }`}
                    />
                )}
                
                {/* Interaction Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 z-10 ${isHovered ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    {post.caption && (
                        <p className="text-sm text-gray-200 line-clamp-2 mb-4 italic font-serif">
                            "{post.caption}"
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onLike(post._id); }}
                                className="flex items-center gap-1.5 group/like focus:outline-none"
                                aria-label="Like post"
                            >
                                <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover/like:text-red-400'}`} />
                                <span className="text-xs font-bold text-white">{post.likes?.length || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-5 h-5 text-white" />
                                <span className="text-xs font-bold text-white">{post.commentCount || 0}</span>
                            </div>
                        </div>

                        {post.taggedProducts?.length > 0 && (
                            <div className="flex -space-x-2">
                                {post.taggedProducts.slice(0, 3).map((prod) => (
                                    <div key={prod._id || prod.id} className="w-8 h-8 rounded-full border-2 border-[#111] bg-[#1a1a1a] p-1 overflow-hidden shadow-md" title={prod.name}>
                                        <img src={prod.image || prod.images?.[0]?.url || prod.images?.[0]} alt="" className="w-full h-full object-contain" />
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

const CreatePostModal = ({ onClose, onSuccess, token, products, getImageKitAuth, t }) => {
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
        const loadingToast = toast.loading(t('styleFeed.uploadingImages'));

        try {
            const uploadedUrls = [];
            const publicKey =
                import.meta.env.REACT_APP_IMAGEKIT_PUBLIC_KEY ||
                import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ||
                'public_mnemyo/d2OAPyIzzxUa3mXisNc0=';

            for (const file of files) {
                const auth = await getImageKitAuth();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('fileName', file.name);
                formData.append('publicKey', publicKey);
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
            toast.success(t('styleFeed.uploadReady'), { id: loadingToast });
        } catch (error) {
            toast.error(t('styleFeed.error'), { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (images.length === 0) return toast.error(t('styleFeed.uploadError'));
        if (!caption.trim()) return toast.error(t('styleFeed.enterCaption'));

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
                toast.success(t('styleFeed.postCreated'));
                onSuccess();
            }
        } catch (error) {
            toast.error(t('styleFeed.error'));
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
                            <p className="font-semibold text-gray-300">{t('styleFeed.uploadImage')}</p>
                            <p className="text-xs text-gray-600 mt-2">{t('styleFeed.showYourLook')}</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleUpload} accept="image/*" />
                </div>

                {/* Right Side - Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-serif">{t('styleFeed.postDetails')}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-3">{t('styleFeed.caption')}</label>
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-sm focus:border-[#d6b47c]/50 focus:ring-0 outline-none transition-all resize-none h-32"
                                placeholder={t('styleFeed.captionPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-3">{t('styleFeed.tagProducts')}</label>
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-full pl-12 pr-4 py-3 text-sm focus:border-[#d6b47c]/50 outline-none"
                                    placeholder={t('styleFeed.searchProducts')}
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
                            {isSubmitting ? t('styleFeed.submitting') : t('styleFeed.sharePost')}
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

const PostDetailModal = ({ post, onClose, onLike, onDelete, currentUserId, isAdmin, token, isAuthenticated, t }) => {
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
        if (!isAuthenticated) return toast.error(t('styleFeed.loginToComment'));
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
                toast.success(t('styleFeed.commentAdded'));
            }
        } catch (error) {
            toast.error(t('styleFeed.error'));
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!await window.luxeConfirm(t('styleFeed.confirmDeleteComment'))) return;

        try {
            const response = await axios.delete(`/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setComments(comments.filter(c => c._id !== commentId));
                toast.success(t('styleFeed.commentDeleted'));
            }
        } catch (error) {
            toast.error(t('styleFeed.error'));
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
                            title={t('styleFeed.deletePostTitle')}
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
                                <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold mb-4">{t('styleFeed.taggedProducts')}</h4>
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
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#d6b47c] font-bold">{t('styleFeed.comments')} ({comments.length})</h4>
                            
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
                                        <p className="text-xs text-gray-600 text-center py-4 italic">{t('styleFeed.noComments')}</p>
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
                                <span className="font-bold text-sm">{post.likes?.length || 0} {t('styleFeed.likesCount')}</span>
                            </button>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                {t('styleFeed.lookShared')}
                            </div>
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('styleFeed.leaveComment')}
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
