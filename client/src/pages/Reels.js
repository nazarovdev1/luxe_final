import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Heart, MessageCircle, Share2, ShoppingBag, ArrowUp, ArrowDown } from 'lucide-react';
import SEO from '../components/SEO';
import ReelComments from '../components/ReelComments';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [likes, setLikes] = useState({});
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reels?active=true&limit=50');
      if (response.data.success) {
        setReels(response.data.data);
        const likesMap = {};
        response.data.data.forEach(reel => {
          likesMap[reel._id] = {
            count: reel.likes.length,
            liked: user && reel.likes.includes(user._id)
          };
        });
        setLikes(likesMap);

        if (id) {
          const index = response.data.data.findIndex(r => r._id === id);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error(t('reels.loading'));
    } finally {
      setLoading(false);
    }
  }, [user, id, t]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const handleLike = async (reelId) => {
    if (!user) {
      toast.error(t('reels.loginToLike'));
      return;
    }

    try {
      const response = await axios.post(`/api/reels/${reelId}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setLikes(prev => ({
          ...prev,
          [reelId]: {
            count: response.data.data.likesCount,
            liked: response.data.data.liked
          }
        }));
      }
    } catch (error) {
      console.error('Error liking reel:', error);
      toast.error(t('reels.loading'));
    }
  };

  const handleShare = async (reelId) => {
    try {
      const response = await axios.post(`/api/reels/${reelId}/share`);
      if (response.data.success) {
        if (navigator.share) {
          await navigator.share({
            title: reels[currentIndex]?.title || 'Reel',
            url: response.data.data.shareUrl
          });
        } else {
          navigator.clipboard.writeText(response.data.data.shareUrl);
          toast.success(t('reels.linkCopied'));
        }
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const nextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') prevReel();
      if (e.key === 'ArrowDown') nextReel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  const handleWheel = (e) => {
    if (e.deltaY > 50) nextReel();
    if (e.deltaY < -50) prevReel();
  };

  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (currentReel.videoType === 'youtube' || currentReel.videoType === 'vimeo') {
      const iframe = document.querySelector('iframe');
      if (!iframe) return;

      if (isPlaying) {
        if (currentReel.videoType === 'youtube') {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
          iframe.contentWindow.postMessage('{"method":"pause"}', '*');
        }
      } else {
        if (currentReel.videoType === 'youtube') {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        } else {
          iframe.contentWindow.postMessage('{"method":"play"}', '*');
          iframe.contentWindow.postMessage('{"method":"setVolume","value":1}', '*');
        }
      }
    } else {
      const video = document.querySelector('video');
      if (!video) return;

      if (isPlaying) {
        video.pause();
      } else {
        video.muted = false;
        video.play().catch(e => console.log(e));
      }
    }

    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={32} className="text-amber-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">{t('reels.loading')}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full" />
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
            <Play size={48} className="text-amber-500" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">{t('reels.noReels')}</h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto leading-relaxed text-lg">
            {t('reels.noReelsHint')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20"
          >
            {t('reels.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const embedUrl = getEmbedUrl(currentReel.videoUrl, currentReel.videoType);

  return (
    <div className="h-screen bg-[#07070a] relative overflow-hidden flex flex-col">
      <SEO
        title="Muse | Luxx.uz"
        description="Luxx.uz videolari - eng zamonaviy kiyimlar va kolleksiyalar"
        canonicalPath="/reels"
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          ←
        </button>
        <div className="pointer-events-none flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Play size={16} className="text-black fill-current" />
          </div>
          <h1 className="text-white text-lg font-black tracking-tighter uppercase">{t('reels.title')}</h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 relative flex items-center justify-center pt-16 pb-8 transition-all duration-500"
      >
        {/* Navigation - Sides */}
        {!commentsOpen && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-10 pointer-events-none z-30">
            <button
              onClick={prevReel}
              disabled={currentIndex === 0}
              className="pointer-events-auto w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all disabled:opacity-0"
            >
              <ArrowUp size={24} />
            </button>
            <button
              onClick={nextReel}
              disabled={currentIndex === reels.length - 1}
              className="pointer-events-auto w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all disabled:opacity-0"
            >
              <ArrowDown size={24} />
            </button>
          </div>
        )}

        {/* Unified Video & Comments Container */}
        <div className={`flex items-stretch transition-all duration-500 ease-in-out gap-0 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden border border-white/5 ${commentsOpen ? 'scale-100' : 'scale-[1.02]'
          }`}>
          {/* Reel Card */}
          <div
            className="relative bg-black transition-all duration-500"
            style={{ width: '420px', height: '88vh' }}
          >
            <div className="w-full h-full relative" onClick={togglePlay}>
              {currentReel.videoType === 'youtube' || currentReel.videoType === 'vimeo' ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full pointer-events-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={currentReel.title}
                />
              ) : (
                <video
                  src={currentReel.videoUrl}
                  className="w-full h-full object-contain bg-black"
                  playsInline
                  loop
                  autoPlay
                  muted
                />
              )}

              {/* Clickable Overlay */}
              <div className="absolute inset-0 cursor-pointer z-10" />

              {/* Play/Pause Icon Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/20">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play size={48} className="text-white fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />

            {/* Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-5 z-20 transition-opacity duration-300">
              <button
                onClick={() => handleLike(currentReel._id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all text-white hover:bg-white/20">
                  <Heart
                    size={20}
                    className={`transition-colors ${likes[currentReel._id]?.liked ? 'text-red-500 fill-current' : 'text-white'}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">{likes[currentReel._id]?.count || 0}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedReel(currentReel);
                  setCommentsOpen(!commentsOpen);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <MessageCircle
                    size={20}
                    className={`transition-colors ${commentsOpen ? 'text-amber-500' : 'text-white'}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">{t('reels.comments')}</span>
              </button>

              <button
                onClick={() => handleShare(currentReel._id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <Share2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">{currentReel.shares || 0}</span>
              </button>
            </div>

            {/* Info */}
            <div className="absolute bottom-10 left-6 right-16 pointer-events-none z-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-lg">
                  {currentReel.user?.profileImage ? (
                    <img src={currentReel.user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-black font-black">L</span>
                  )}
                </div>
                <span className="text-white text-sm font-black drop-shadow-lg">@{currentReel.user?.username || 'luxx.uz'}</span>
              </div>
              <h3 className="text-white font-black text-xl mb-2 drop-shadow-xl">{currentReel.title}</h3>
              {currentReel.description && (
                <p className="text-white/80 text-xs line-clamp-2 drop-shadow-lg leading-relaxed">{currentReel.description}</p>
              )}
            </div>
          </div>

          {/* Comments Panel Sidebar */}
          {commentsOpen && selectedReel && (
            <div className="w-[360px] bg-[#0f0f12] border-l border-white/5 animate-slide-left overflow-hidden">
              <ReelComments
                reelId={selectedReel._id}
                isOpen={commentsOpen}
                isEmbedded={true}
                onClose={() => {
                  setCommentsOpen(false);
                  setSelectedReel(null);
                }}
              />
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-left {
          from { width: 0; opacity: 0; }
          to { width: 360px; opacity: 1; }
        }
        .animate-slide-left {
          animation: slide-left 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}} />
    </div>
  );
};

const getEmbedUrl = (url, type) => {
  if (!url) return '';

  if (type === 'youtube') {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&playsinline=1&controls=0&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`;
    }
  }

  if (type === 'vimeo') {
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const match = url.match(vimeoRegex);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0`;
    }
  }

  return url;
};

export default Reels;
