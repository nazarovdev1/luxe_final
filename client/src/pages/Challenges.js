import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Swords, Clock, Trophy, Users, ImageIcon, ChevronRight,
  Star, Upload, Plus, X, Heart, Calendar,
  MessageCircle, Send, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import SEO from '../components/SEO';

const Challenges = () => {
  const { user, isAuthenticated, token, isAdmin } = useAuth();
  const { getImageKitAuth } = useProducts();
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAdminCreate, setIsAdminCreate] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/challenges');
      if (res.data.success) setChallenges(res.data.data);
    } catch (err) {
      toast.error('Musobaqalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (challengeId, submissionId) => {
    if (!isAuthenticated) return toast.error('Ovoz berish uchun tizimga kiring');
    try {
      const res = await axios.post(
        `/api/challenges/${challengeId}/vote/${submissionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Ovoz berildi!');
        fetchChallenges();
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const typeColor = {
    social: '#d6b47c',
    orders: '#a8d8ea',
    reviews: '#c9b8ff',
    spending: '#90ee90',
    streak: '#ff9999'
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#d6b47c]/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#d6b47c]/3 rounded-full blur-[150px] translate-y-1/2" />

      <SEO 
        title="Style Challenges — Luxe | Модные конкурсы" 
        description="Haftalik stil musobaqalarida qatnashing, ovoz bering va mukofotlar yutib oling. Участвуйте в модных челленджах и выигрывайте призы." 
        keywords="Style Challenges, musobaqalar, modalar, luxe uz, fashion contest, модные конкурсы ташкент"
        breadcrumbSteps={[{ name: 'Challenges', url: '/challenges' }]}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#d6b47c]/20 to-transparent border-l-2 border-[#d6b47c] px-4 py-2 mb-6">
              <Swords className="w-4 h-4 text-[#d6b47c]" />
              <span className="text-[#d6b47c] text-[10px] tracking-[0.3em] uppercase font-black">Haftalik Arena</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-brilliant text-white mb-6 leading-[0.9]">
              Style <span className="text-[#d6b47c]">Challenges</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed pt-6">
              O'z uslubingizni dunyoga ko'rsating. Eng yaxshi obrazlar uchun ovoz yig'ing va eksklyuziv <span className="text-white font-medium italic underline decoration-[#d6b47c]/40 underline-offset-4">Luxe mukofotlarini</span> qo'lga kiriting.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            {isAdmin && (
              <button
                onClick={() => setIsAdminCreate(true)}
                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 bg-[#d6b47c] opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 border border-[#d6b47c]/30 rounded-full" />
                <span className="relative z-10 flex items-center gap-2 text-[#d6b47c] text-sm font-black tracking-widest uppercase">
                  <Plus className="w-4 h-4" /> Musobaqa yaratish
                </span>
              </button>
            )}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Jami ishtirokchilar</p>
                <p className="text-2xl font-brilliant text-white">{challenges.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0)}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Faol musobaqalar</p>
                <p className="text-2xl font-brilliant text-[#d6b47c]">{challenges.filter(c => c.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-12 h-12 border-[3px] border-[#d6b47c] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#d6b47c] text-sm tracking-widest font-medium animate-pulse">Luxe Arena yuklanmoqda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:gap-20">
            {challenges.map(challenge => {
              const daysLeft = getDaysLeft(challenge.endDate);
              const isExpired = daysLeft === 0;
              const submissions = [...(challenge.submissions || [])].sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
              
              return (
                <div key={challenge._id} className="relative">
                  {/* Glowing vertical line for active items */}
                  {challenge.isActive && !isExpired && (
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d6b47c] via-[#d6b47c]/20 to-transparent rounded-full hidden md:block" />
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8 items-start">
                    {/* Challenge Card (Info) */}
                    <div className="sticky top-32">
                      <div className="group p-1 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent hover:from-[#d6b47c]/20 transition-all duration-500 shadow-2xl">
                        <div className="bg-[#0f0f0f] rounded-[39px] p-8 md:p-10">
                          <div className="flex items-center justify-between mb-8">
                            <div 
                              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative"
                              style={{ 
                                background: `linear-gradient(135deg, ${typeColor[challenge.type]}20, ${typeColor[challenge.type]}05)`,
                                border: `1px solid ${typeColor[challenge.type]}30` 
                              }}
                            >
                              <div className="absolute inset-0 blur-lg opacity-20" style={{ backgroundColor: typeColor[challenge.type] }} />
                              <span className="relative">{challenge.type === 'social' ? '📸' : challenge.type === 'orders' ? '🛍️' : challenge.type === 'reviews' ? '⭐' : '🏆'}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] inline-block mb-2 ${challenge.isActive && !isExpired ? 'bg-green-500/10 text-green-400 border border-green-500/20' : challenge.winner ? 'bg-amber-300 text-black shadow-[0_5px_15px_rgba(214,180,124,0.3)]' : 'bg-gray-800 text-gray-500'}`}>
                                {challenge.isActive && !isExpired ? 'Active' : challenge.winner ? 'G\'olib aniqlandi' : 'Yakunlangan'}
                              </span>
                              {challenge.winner && (
                                <p className="text-[10px] text-amber-300/80 font-black uppercase tracking-widest mt-1 animate-pulse">
                                  G'olib: {challenge.submissions?.find(s => s.user?._id === challenge.winner)?.user?.username || 'Noma\'lum'}
                                </p>
                              )}
                              {daysLeft !== null && !isExpired && (
                                <p className="text-xs text-orange-400/80 font-medium">Tugashiga {daysLeft} kun qoldi</p>
                              )}
                            </div>
                          </div>

                          <h2 className="text-3xl md:text-4xl font-brilliant text-white mb-4 group-hover:text-[#d6b47c] transition-colors">{challenge.title}</h2>
                          <p className="text-gray-400 font-light leading-relaxed mb-8">{challenge.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Mukofot</p>
                              <p className="text-lg font-bold text-[#d6b47c]">+{challenge.reward?.points || 500} ball</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Ishtirokchilar</p>
                              <p className="text-lg font-bold text-white">{submissions.length}</p>
                            </div>
                          </div>

                          {challenge.isActive && !isExpired && isAuthenticated && (
                            <button
                              onClick={() => { setSelectedChallenge(challenge); setIsSubmitOpen(true); }}
                              className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#d6b47c] hover:text-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                            >
                              Qatnashish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submissions Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Top Obrazlar</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d6b47c] animate-pulse" />
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Ovoz berish ochiq</span>
                        </div>
                      </div>

                      {submissions.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {submissions.map((sub, idx) => {
                            const hasVoted = sub.votes?.includes(user?._id);
                            const isTop3 = idx < 3;
                            const rankColor = idx === 0 ? '#d6b47c' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'transparent';
                            const isWinner = challenge.winner === sub.user?._id;
                            
                            return (
                              <div 
                                key={sub._id} 
                                className={`group relative aspect-[3/4] rounded-[28px] overflow-hidden bg-[#151515] border cursor-pointer shadow-xl transition-all ${isWinner ? 'border-amber-300 ring-2 ring-amber-300/20' : 'border-white/5'}`}
                                onClick={() => {
                                  setViewingSubmission(sub);
                                  setViewingIndex(idx);
                                }}
                              >
                                {sub.post?.images?.[0] && (
                                  <img 
                                    src={sub.post.images[0]} 
                                    alt="submission" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                  />
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Rank or Winner Badge */}
                                {isWinner ? (
                                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-300 text-black px-3 py-1.5 rounded-full shadow-[0_10px_20px_rgba(214,180,124,0.4)]">
                                    <Trophy className="w-3 h-3 fill-current" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">G'olib</span>
                                  </div>
                                ) : isTop3 && (
                                  <div 
                                    className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 backdrop-blur-md"
                                    style={{ borderColor: rankColor, color: rankColor, backgroundColor: `${rankColor}10` }}
                                  >
                                    #{idx + 1}
                                  </div>
                                )}

                                {/* Card Footer Info */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{sub.user?.username}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Star className={`w-2.5 h-2.5 ${isWinner ? 'text-amber-300 fill-amber-300' : 'text-[#d6b47c] fill-[#d6b47c]'}`} />
                                      <span className="text-[9px] text-gray-400 font-medium">{isWinner ? 'Grand Winner' : `#${idx + 1} Rank`}</span>
                                    </div>
                                  </div>
                                  {!challenge.isClosed && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVote(challenge._id, sub._id);
                                      }}
                                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${hasVoted ? 'bg-red-500 text-white' : 'bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-red-500'}`}
                                    >
                                      <Heart className={`w-4 h-4 ${hasVoted ? 'fill-white' : ''}`} />
                                    </button>
                                  )}
                                </div>

                                {/* Like count floating */}
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
                                  <span className="text-[10px] font-bold text-white">{sub.votes?.length || 0}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-[#111] border border-dashed border-white/10 rounded-[32px] py-20 text-center">
                          <ImageIcon className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 font-light">Birinchi bo'ling! Hali obrazlar yo'q.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {challenges.length === 0 && !isLoading && (
              <div className="text-center py-32 border border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                <Swords className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
                <h3 className="text-2xl text-gray-400 font-light">Hozircha faol musobaqalar mavjud emas</h3>
                <p className="text-gray-600 mt-3 max-w-sm mx-auto">Luxx Arena jamoasi tez orada yangi va hayajonli musobaqalarni e'lon qiladi. Kuzatib boring!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {isSubmitOpen && selectedChallenge && (
        <SubmitModal
          challenge={selectedChallenge}
          token={token}
          onClose={() => { setIsSubmitOpen(false); setSelectedChallenge(null); }}
          onSuccess={() => { setIsSubmitOpen(false); setSelectedChallenge(null); fetchChallenges(); }}
          getImageKitAuth={getImageKitAuth}
        />
      )}

      {/* Full View Modal */}
      {viewingSubmission && (
        <FullViewModal
          submissions={challenges.find(c => c.submissions.some(s => s._id === viewingSubmission._id))?.submissions || []}
          currentIndex={viewingIndex}
          token={token}
          user={user}
          onClose={() => setViewingSubmission(null)}
          onVote={(subId) => {
            const challengeId = challenges.find(c => c.submissions.some(s => s._id === subId))?._id;
            if (challengeId) handleVote(challengeId, subId);
          }}
        />
      )}

      {/* Admin Create Modal */}
      {isAdminCreate && (
        <AdminCreateModal
          token={token}
          onClose={() => setIsAdminCreate(false)}
          onSuccess={() => { setIsAdminCreate(false); fetchChallenges(); }}
        />
      )}
    </div>
  );
};

const SubmitModal = ({ challenge, token, onClose, onSuccess, getImageKitAuth }) => {
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const auth = await getImageKitAuth();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileName', file.name);
      fd.append('publicKey', 'public_mnemyo/d2OAPyIzzxUa3mXisNc0=');
      fd.append('signature', auth.signature);
      fd.append('expire', auth.expire);
      fd.append('token', auth.token);
      fd.append('folder', '/challenges');
      const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) setImage(result.url);
    } catch {
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!image) return toast.error('Rasm yuklang');
    setIsSubmitting(true);
    try {
      const postRes = await axios.post('/api/posts', {
        images: [image],
        caption: `${challenge.title} musobaqasiga ishtirok etmoqdaman! 🏆 #LuxeChallenge`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (!postRes.data.success) throw new Error('Post yaratishda xatolik');

      const res = await axios.post(`/api/challenges/${challenge._id}/submit`, {
        postId: postRes.data.data._id
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success('Musobaqaga muvaffaqiyatli qatnashdiniz! +30 ball');
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-[28px] w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif">Musobaqaga qatnashish</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-400 mb-6">"{challenge.title}" musobaqasi uchun o'z obrazingiz rasmini yuklang.</p>

        <div
          className="relative aspect-square rounded-2xl border-2 border-dashed border-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#d6b47c]/40 transition-all mb-6"
          onClick={() => !image && fileRef.current?.click()}
        >
          {image ? (
            <>
              <img src={image} className="w-full h-full object-cover" />
              <button onClick={() => setImage('')} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center p-8">
              {isUploading ? (
                <div className="w-8 h-8 border-2 border-[#d6b47c] border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[#d6b47c] mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Obraz rasmini yuklang</p>
                </>
              )}
            </div>
          )}
        </div>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading || !image}
          className="w-full py-4 bg-[#d6b47c] text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#e8c98a] transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Qatnashish ✓'}
        </button>
      </div>
    </div>
  );
};

const AdminCreateModal = ({ token, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '', description: '', type: 'social',
    startDate: '', endDate: '', rewardPoints: 500
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.startDate) return toast.error('Barcha maydonlarni to\'ldiring');
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/challenges', {
        title: form.title,
        description: form.description,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        isActive: true,
        criteria: { action: 'submit', target: 1, period: 'weekly' },
        reward: { points: Number(form.rewardPoints) }
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success('Musobaqa yaratildi!');
        onSuccess();
      }
    } catch {
      toast.error('Xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-[28px] w-full max-w-lg p-8 shadow-2xl space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-serif">Yangi musobaqa</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {[
          { key: 'title', label: 'Musobaqa nomi', type: 'text', placeholder: 'Masalan: Kuzgi romantika' },
          { key: 'description', label: 'Tavsif', type: 'textarea', placeholder: 'Musobaqa shartlarini kiriting' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40 resize-none h-20"
                placeholder={f.placeholder}
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40"
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Boshlanish</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Tugash (ixtiyoriy)</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">Mukofot (ball)</label>
          <input type="number" value={form.rewardPoints} onChange={e => setForm({ ...form, rewardPoints: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#d6b47c] text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#e8c98a] transition-all disabled:opacity-50 mt-2"
        >
          {isSubmitting ? 'Yaratilmoqda...' : 'Musobaqa yaratish'}
        </button>
      </div>
    </div>
  );
};

export default Challenges;

const FullViewModal = ({ submissions, currentIndex, token, user, onClose, onVote }) => {
  const [index, setIndex] = useState(currentIndex);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const sub = submissions[index];
  const hasVoted = sub?.votes?.includes(user?._id);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (sub?.post?._id) fetchComments();
  }, [index]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${sub.post._id}`);
      if (res.data.success) setComments(res.data.data);
    } catch {
      console.error('Comments error');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const res = await axios.post(`/api/comments/${sub.post._id}`, { text: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        toast.success('Fikr bildirildi');
      }
    } catch {
      toast.error('Xatolik');
    } finally {
      setIsPosting(false);
    }
  };

  const handleNext = () => setIndex((index + 1) % submissions.length);
  const handlePrev = () => setIndex((index - 1 + submissions.length) % submissions.length);

  if (!sub) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 pb-10 overflow-y-auto admin-scroll">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} 
        className="fixed top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[10010]"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      <button onClick={handlePrev} className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[10010]">
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button onClick={handleNext} className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[10010]">
        <ChevronRight className="w-8 h-8" />
      </button>

      <div 
        className="flex flex-col lg:flex-row w-full h-[70vh] lg:min-h-[80vh] max-w-5xl bg-[#111] overflow-hidden lg:rounded-[32px] relative z-[10005] shadow-[0_32px_64px_rgba(0,0,0,0.8)] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <img src={sub.post.images[0]} className="max-w-full max-h-full object-contain" alt="Full view" />
          
          <div className="absolute bottom-8 left-8 flex items-center gap-4">
             <button
               onClick={() => onVote(sub._id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all ${hasVoted ? 'bg-red-500 text-white' : 'bg-white/10 backdrop-blur-xl text-white hover:bg-red-500'}`}
             >
               <Heart className={`w-5 h-5 ${hasVoted ? 'fill-white' : ''}`} />
               {sub.votes?.length || 0} Like
             </button>
          </div>
        </div>

        {/* Sidebar / Comments */}
        <div className="w-full lg:w-[400px] flex flex-col border-l border-white/5 bg-[#0d0d0d]">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d6b47c]/20 flex items-center justify-center text-[#d6b47c] font-bold">
                {sub.user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm">{sub.user?.username}</p>
                <p className="text-xs text-gray-500">Ihtirokchi</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">{sub.post.caption}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 admin-scroll">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Fikrlar ({comments.length})</h4>
            {comments.map(c => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {c.user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-0.5">{c.user?.username}</p>
                  <p className="text-sm text-gray-200">{c.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">Hali fikrlar yo'q</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handlePostComment} className="p-6 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Fikr bildiring..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:border-[#d6b47c]/40"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isPosting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#d6b47c] hover:scale-110 transition-transform disabled:opacity-30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
