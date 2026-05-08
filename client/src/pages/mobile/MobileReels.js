import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Heart, MessageCircle, Share2, ShoppingBag, X, Plus, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import ReelComments from '../../components/ReelComments';
import { uploadVideoToAppwrite } from '../../utils/appwrite';

// Detect iOS PWA standalone mode
const isIOSPWA = () => {
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isStandalone && isIOS;
};

const isPWAMode = () => {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
};

const MobileReels = () => {
  const { t } = useLanguage();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [likes, setLikes] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isMuted, setIsMuted] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [newMuse, setNewMuse] = useState({
    title: '',
    videoUrl: '',
    description: ''
  });

  // PWA-specific states
  const [videosUnlocked, setVideosUnlocked] = useState(!isPWAMode());
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const gestureUnlockedRef = useRef(false);

  const prevIndexRef = useRef(currentIndex);
  const playedIframesRef = useRef(new Set());
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const handleCreateMuse = async (e) => {
    e.preventDefault();
    if (!newMuse.title || (!newMuse.videoUrl && !videoFile)) {
      toast.error('Sarlavha va video kiritilishi shart');
      return;
    }

    try {
      setSubmitting(true);
      let finalVideoUrl = newMuse.videoUrl;

      // If a file is selected, upload it to Appwrite first
      if (videoFile) {
        toast.loading('Video Appwrite\'ga yuklanmoqda...', { id: 'upload-toast' });
        try {
          finalVideoUrl = await uploadVideoToAppwrite(videoFile);
          toast.success('Video yuklandi!', { id: 'upload-toast' });
        } catch (uploadError) {
          toast.error('Video yuklashda xatolik: ' + uploadError.message, { id: 'upload-toast' });
          setSubmitting(false);
          return;
        }
      }

      const response = await axios.post('/api/reels', {
        ...newMuse,
        videoUrl: finalVideoUrl
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success('Yangi Muse muvaffaqiyatli qo\'shildi!');
        setCreateModalOpen(false);
        setNewMuse({ title: '', videoUrl: '', description: '' });
        setVideoFile(null);
        fetchReels(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating muse:', error);
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // === iOS PWA Video Unlock Strategy ===
  // iOS PWA standalone mode blocks autoplay even for muted+playsinline videos.
  // We must "unlock" video elements during a user gesture (tap/touch).
  const unlockAllVideos = useCallback(() => {
    if (gestureUnlockedRef.current) return;
    gestureUnlockedRef.current = true;

    // Find all video elements and unlock them via play+pause in user gesture context
    const allVideos = document.querySelectorAll('video[id^="reel-video-"]');
    allVideos.forEach((video) => {
      video.muted = true;
      video.setAttribute('playsinline', '');
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          // If this isn't the current video, pause it immediately
          const videoIndex = parseInt(video.id.replace('reel-video-', ''), 10);
          if (videoIndex !== currentIndex) {
            video.pause();
            video.currentTime = 0;
          }
        }).catch(() => {});
      }
    });

    setVideosUnlocked(true);
    setShowPlayOverlay(false);
    console.log('[PWA] Videos unlocked via user gesture');
  }, [currentIndex]);

  // Check if autoplay actually works — if not, show "tap to play" overlay
  useEffect(() => {
    if (!isPWAMode() || videosUnlocked) return;

    const checkTimer = setTimeout(() => {
      const currentVideo = document.getElementById(`reel-video-${currentIndex}`);
      if (currentVideo) {
        const playAttempt = currentVideo.play();
        if (playAttempt !== undefined) {
          playAttempt.then(() => {
            // Autoplay works! No overlay needed
            setVideosUnlocked(true);
            gestureUnlockedRef.current = true;
          }).catch(() => {
            // Autoplay blocked — show tap overlay
            console.log('[PWA] Autoplay blocked, showing play overlay');
            setShowPlayOverlay(true);
          });
        }
      }
    }, 300);

    return () => clearTimeout(checkTimer);
  }, [currentIndex, videosUnlocked, reels]);

  // === PWA Visibility Change Handler ===
  // When iOS PWA goes to background and comes back, videos stop.
  // We need to re-trigger load + play.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const reel = reels[currentIndex];
        if (!reel) return;

        if (reel.videoType === 'direct' || (!reel.videoType || reel.videoType === '')) {
          const video = document.getElementById(`reel-video-${currentIndex}`);
          if (video) {
            // Force reload the video source to recover from iOS PWA freeze
            video.load();
            video.muted = isMuted;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.log('[PWA] Resume play failed, will retry:', err.name);
                // Retry once more after a short delay
                setTimeout(() => {
                  video.play().catch(() => {});
                }, 200);
              });
            }
          }
        } else {
          // For iframes, re-send play command
          const iframe = document.getElementById(`reel-iframe-${currentIndex}`);
          if (iframe) {
            try {
              if (reel.videoType === 'youtube') {
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
              } else if (reel.videoType === 'vimeo') {
                iframe.contentWindow.postMessage('{"method":"play"}', '*');
              }
            } catch (e) {}
          }
        }
      } else {
        // Pausing when going to background helps iOS recover better
        const video = document.getElementById(`reel-video-${currentIndex}`);
        if (video) {
          video.pause();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentIndex, reels, isMuted]);

  // Handle Mute/Unmute Toggle
  const toggleMute = () => {
    try {
      const reel = reels[currentIndex];
      if (!reel) return;
      const newMutedState = !isMuted;

      if (reel.videoType === 'direct') {
        // HTML5 <video> element for ImageKit/direct videos
        const currentVideo = document.getElementById(`reel-video-${currentIndex}`);
        if (currentVideo) {
          currentVideo.muted = newMutedState;
          currentVideo.play().catch(e => console.log(e));
        }
      } else {
        const currentIframe = document.getElementById(`reel-iframe-${currentIndex}`);
        if (!currentIframe) return;

        if (reel.videoType === 'youtube') {
          currentIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          if (newMutedState) {
            currentIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
          } else {
            currentIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            currentIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
          }
        } else if (reel.videoType === 'vimeo') {
          currentIframe.contentWindow.postMessage('{"method":"play"}', '*');
          currentIframe.contentWindow.postMessage(`{"method":"setVolume","value":${newMutedState ? 0 : 1}}`, '*');
        }
      }

      setIsMuted(newMutedState);
    } catch (err) {
      console.error('Error controlling sound:', err);
    }
  };

  // Sync play/mute state when scrolling
  useEffect(() => {
    const playCurrent = () => {
      const reel = reels[currentIndex];
      if (!reel) return;
      
      const iframe = document.getElementById(`reel-iframe-${currentIndex}`);
      const video = document.getElementById(`reel-video-${currentIndex}`);

      try {
        if (reel.videoType === 'youtube' && iframe) {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          
          if (!isMuted) {
            iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
          } else {
            iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
          }
        } else if (reel.videoType === 'vimeo' && iframe) {
          iframe.contentWindow.postMessage('{"method":"play"}', '*');
          
          if (!isMuted) {
            iframe.contentWindow.postMessage('{"method":"setVolume","value":1}', '*');
          } else {
            iframe.contentWindow.postMessage('{"method":"setVolume","value":0}', '*');
          }
        } else if (video) {
          video.muted = isMuted;
          // Ensure critical iOS attributes are set
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', 'true');
          
          // In PWA mode, if not yet unlocked, don't force play — wait for gesture
          if (isPWAMode() && !gestureUnlockedRef.current) {
            // Try anyway — it might work on some iOS versions
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                console.log('[PWA] Autoplay blocked for index', currentIndex);
                setShowPlayOverlay(true);
              });
            }
          } else {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.log('Autoplay blocked:', error.name);
              });
            }
          }
        }
        playedIframesRef.current.add(currentIndex);
      } catch (err) {
        console.error('Play error:', err);
      }
    };

    // Attempt to play slightly delayed to ensure DOM is ready
    const timer = setTimeout(playCurrent, isPWAMode() ? 150 : 50);

    // Pause others
    reels.forEach((reel, idx) => {
      if (idx !== currentIndex && playedIframesRef.current.has(idx)) {
        const iframe = document.getElementById(`reel-iframe-${idx}`);
        const video = document.getElementById(`reel-video-${idx}`);

        try {
          if (reel.videoType === 'youtube' && iframe) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } else if (reel.videoType === 'vimeo' && iframe) {
            iframe.contentWindow.postMessage('{"method":"pause"}', '*');
          } else if (video) {
            video.pause();
            video.currentTime = 0;
          }
        } catch (err) {}
      }
    });
    
    prevIndexRef.current = currentIndex;
    return () => clearTimeout(timer);
  }, [currentIndex, isMuted, reels]);

  // Fetch reels
  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reels?active=true&limit=50');
      if (response.data.success) {
        setReels(response.data.data);
        // Initialize likes state
        const likesMap = {};
        response.data.data.forEach(reel => {
          likesMap[reel._id] = {
            count: reel.likes.length,
            liked: user && reel.likes.includes(user._id)
          };
        });
        setLikes(likesMap);

        // Set initial index if ID is provided in URL
        if (id) {
          const index = response.data.data.findIndex(r => r._id === id);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Reellarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Handle like
  const handleLike = async (reelId) => {
    if (!user) {
      toast.error('Layk qilish uchun tizimga kiring');
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
      toast.error('Xatolik yuz berdi');
    }
  };

  // Handle share
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
          toast.success('Link nusxalandi!');
        }
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/mobile/product/${productId}`);
  };

  // Handle scroll/swipe for navigation
  const handleTouchStart = (e) => {
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].screenY;
    const diff = touchStartY.current - touchEndY.current;
    
    if (Math.abs(diff) > 50) {
      const direction = diff > 0 ? 'UP' : 'DOWN';
      
      let nextIndex = currentIndex;
      if (direction === 'UP' && currentIndex < reels.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (direction === 'DOWN' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }

      // 1. Force synchronous play execution inside touch event context for iOS native permission
      if (nextIndex !== currentIndex) {
        const nextReel = reels[nextIndex];
        
        if (nextReel) {
          try {
            if (nextReel.videoType === 'youtube' || nextReel.videoType === 'vimeo') {
              const nextIframe = document.getElementById(`reel-iframe-${nextIndex}`);
              if (nextIframe) {
                if (nextReel.videoType === 'youtube') {
                  nextIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                  if (!isMuted) {
                    nextIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                    nextIframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
                  } else {
                    nextIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                  }
                } else {
                  nextIframe.contentWindow.postMessage('{"method":"play"}', '*');
                  nextIframe.contentWindow.postMessage(`{"method":"setVolume","value":${isMuted ? 0 : 1}}`, '*');
                }
              }
            } else {
              const nextVideo = document.getElementById(`reel-video-${nextIndex}`);
              if (nextVideo) {
                nextVideo.muted = isMuted;
                nextVideo.play().catch(e => console.log(e));
              }
            }
          } catch (err) {}
        }
      }
      
      // 2. Perform the actual index update (if not already handled by snap scroll)
      handleSwipe(direction);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'UP') {
      if (currentIndex < reels.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (direction === 'DOWN') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPos = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPos / itemHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={24} className="text-amber-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full" />

        <div className="text-center relative z-10 max-w-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
            <Play size={48} className="text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Hozircha reellar yo'q</h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Tez orada eng so'nggi trendlar va yangi kolleksiyalar haqida qiziqarli videolar qo'shiladi.
          </p>
          <button
            onClick={() => navigate('/mobile')}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-2xl transition-all active:scale-95 shadow-[0_8px_24px_rgba(214,180,124,0.3)]"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div className="h-screen w-full bg-black overflow-hidden flex flex-col relative">
      {/* Immersive Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6 pb-12 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => navigate('/mobile')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-white text-lg font-black tracking-tighter uppercase italic drop-shadow-lg">Muse</h1>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500 text-black active:scale-90 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>

      {/* Create Muse Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setCreateModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#1a1a1f] rounded-[32px] p-8 border border-white/10 shadow-2xl animate-scale-up">
            <h2 className="text-white text-2xl font-black mb-6 flex items-center gap-2 italic uppercase">
              Yangi Muse
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </h2>

            <form onSubmit={handleCreateMuse} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Video Sarlavhasi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Yangi kolleksiya 2024"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                  value={newMuse.title}
                  onChange={(e) => setNewMuse({ ...newMuse, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Video Yuklash (Appwrite)</label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
                {videoFile && (
                  <p className="text-[10px] text-amber-500 ml-1">Tanlandi: {videoFile.name}</p>
                )}
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-700 bg-[#1a1a1f] px-2">yoki</div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Video URL (ImageKit/YouTube)</label>
                <input
                  type="url"
                  placeholder="https://ik.imagekit.io/..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                  value={newMuse.videoUrl}
                  onChange={(e) => setNewMuse({ ...newMuse, videoUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Tavsif (ixtiyoriy)</label>
                <textarea
                  rows="3"
                  placeholder="Video haqida qisqacha..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  value={newMuse.description}
                  onChange={(e) => setNewMuse({ ...newMuse, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm active:scale-95 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 rounded-2xl bg-amber-500 text-black font-black text-sm active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Yuklanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* iOS PWA: Tap to Play Overlay — shown when autoplay is blocked */}
      {showPlayOverlay && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => {
            unlockAllVideos();
          }}
          onTouchEnd={() => {
            unlockAllVideos();
          }}
        >
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
              <Play size={48} className="text-amber-500 ml-1" />
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-bold">Videoni boshlash</p>
              <p className="text-gray-400 text-sm mt-1">Ekranga bosing</p>
            </div>
          </div>
        </div>
      )}

      {/* Snap Container */}
      <div
        className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory custom-scrollbar"
        onScroll={handleScroll}
        onTouchStart={(e) => {
          // Capture user gesture to unlock videos in PWA mode
          if (isPWAMode() && !gestureUnlockedRef.current) {
            unlockAllVideos();
          }
          handleTouchStart(e);
        }}
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden"
          >
            {/* Video Container - Truly Immersive */}
            <div className="absolute inset-0 w-full h-full" onClick={toggleMute}>
              {/* Thumbnail Placeholder */}
              {reel.thumbnailUrl && (
                <div 
                  className={`absolute inset-0 z-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    backgroundImage: `url(${reel.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              
              {Math.abs(index - currentIndex) <= 1 ? (
                (reel.videoType === 'youtube' || reel.videoType === 'vimeo') ? (
                  <iframe
                    id={`reel-iframe-${index}`}
                    src={getEmbedUrl(reel.videoUrl, reel.videoType)}
                    className="w-full h-full pointer-events-none scale-[1.05] object-cover relative z-10"
                    allow="autoplay; encrypted-media; gyroscope; accelerometer"
                    loading={Math.abs(index - currentIndex) === 0 ? "eager" : "lazy"}
                    allowFullScreen
                    title={reel.title}
                  />
                ) : (
                   <video
                    key={reel._id}
                    id={`reel-video-${index}`}
                    src={reel.videoUrl}
                    className="w-full h-full object-contain relative z-10 bg-black"
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    x-webkit-airplay="allow"
                    loop
                    autoPlay={index === currentIndex}
                    muted
                    preload={Math.abs(index - currentIndex) <= 1 ? 'auto' : 'metadata'}
                    poster={reel.thumbnailUrl || undefined}
                    crossOrigin="anonymous"
                    onLoadedData={(e) => {
                      // In PWA mode, attempt play as soon as data is loaded
                      if (index === currentIndex && gestureUnlockedRef.current) {
                        e.target.play().catch(() => {});
                      }
                    }}
                  />
                )
              ) : (
                <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
                   {reel.thumbnailUrl ? (
                     <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-30 blur-sm" />
                   ) : (
                     <Play size={48} className="text-white/10" />
                   )}
                </div>
              )}

              {/* Interaction Overlay */}
              <div className="absolute inset-0 z-10 bg-black/10" />

              {/* Volume Status Overlay */}
              {index === currentIndex && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-300">
                  <div className={`p-6 rounded-full bg-black/20 backdrop-blur-md border border-white/10 ${isMuted ? 'opacity-100' : 'opacity-0'}`}>
                    {isMuted ? <VolumeX size={32} className="text-white" /> : <Volume2 size={32} className="text-white" />}
                  </div>
                </div>
              )}
            </div>

            {/* Content & Actions Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 pb-10 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none">
              <div className="flex items-end justify-between gap-3">
                {/* Info (Bottom Left) */}
                <div className="flex-1 space-y-3 pointer-events-auto pb-2">
                  {/* User Profile */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-white/30 p-0.5 bg-gradient-to-tr from-amber-500 to-fuchsia-600">
                      {reel.user?.profileImage ? (
                        <img src={reel.user.profileImage} alt="" className="w-full h-full rounded-full object-cover border border-black" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-[10px] border border-black">L</div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-xs drop-shadow-lg leading-none">@{reel.user?.username || 'luxx.uz'}</span>
                      <button className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Follow</button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-0.5">
                    <h3 className="text-white font-bold text-sm drop-shadow-lg">{reel.title}</h3>
                    {reel.description && (
                      <p className="text-white/80 text-[10px] line-clamp-1 leading-relaxed drop-shadow-md max-w-[80%]">{reel.description}</p>
                    )}
                  </div>

                  {/* Tagged Products */}
                  {reel.taggedProducts && reel.taggedProducts.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
                      {reel.taggedProducts.map(product => (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10 min-w-[120px]"
                        >
                          <img src={product.images?.[0]?.url} alt="" className="w-6 h-6 rounded object-cover" />
                          <div className="text-left overflow-hidden">
                            <p className="text-white text-[9px] font-bold truncate">{product.name}</p>
                            <p className="text-amber-400 text-[8px] font-black">{product.price?.toLocaleString()} {t('common.sum')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vertical Actions (Bottom Right) */}
                <div className="flex flex-col gap-4 items-center pointer-events-auto pb-2">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(reel._id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <Heart
                        size={22}
                        className={`transition-colors ${likes[reel._id]?.liked ? 'text-red-500 fill-current' : 'text-white'}`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white drop-shadow-md">{likes[reel._id]?.count || 0}</span>
                  </button>

                  {/* Comments */}
                  <button
                    onClick={() => {
                      setSelectedReel(reel);
                      setCommentsOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <MessageCircle
                        size={22}
                        className={`transition-colors ${commentsOpen && selectedReel?._id === reel._id ? 'text-amber-500' : 'text-white'}`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white drop-shadow-md text-center">Izohlar</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => handleShare(reel._id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                      <Share2 size={22} />
                    </div>
                    <span className="text-[9px] font-bold text-white drop-shadow-md">{reel.shares || 0}</span>
                  </button>

                  {/* Stats */}
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <Play size={16} className="text-white" />
                    <span className="text-[8px] font-bold text-white">{reel.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Comments Bottom Sheet */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${commentsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommentsOpen(false)} />
        <div
          className={`absolute inset-x-0 bottom-0 bg-[#0f0f12] rounded-t-[40px] h-[75vh] transition-transform duration-500 ease-out transform ${commentsOpen ? 'translate-y-0' : 'translate-y-full'
            } shadow-[0_-20px_40px_rgba(0,0,0,0.4)]`}
        >
          {/* Bottom Sheet Handle */}
          <div className="w-full flex justify-center py-4">
            <div className="w-12 h-1.5 bg-white/10 rounded-full" />
          </div>

          <div className="h-full overflow-hidden">
            {selectedReel && (
              <ReelComments
                reelId={selectedReel._id}
                isOpen={commentsOpen}
                isEmbedded={true}
                onClose={() => setCommentsOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

// Helper function to get embed URL - Optimized for iOS Autoplay
const getEmbedUrl = (url, type) => {
  if (!url) return '';
  
  // Static autoplay parameter prevents iframe reloading and "zagruzka" lag
  const autoplayParam = 'autoplay=1';
  const muteParam = type === 'vimeo' ? 'muted=1' : 'mute=1';
  
  const baseParams = `${autoplayParam}&${muteParam}&loop=1&playsinline=1&controls=0&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`;

  if (type === 'youtube') {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?${baseParams}&playlist=${match[1]}&origin=${window.location.origin}`;
    }
  }

  if (type === 'vimeo') {
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const match = url.match(vimeoRegex);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}?${baseParams}&title=0&byline=0&portrait=0`;
    }
  }

  return url;
};

export default MobileReels;