import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Swords, Clock, Trophy, Users, ImageIcon, ChevronRight,
  Upload, Plus, X, Heart, Calendar,
  MessageCircle, Send, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CommunityOpening, { CommunityChapter, useCommunityMotion } from '../components/CommunityOpening';
import { ChallengesSkeleton } from '../components/EventSkeletons';

const Challenges = () => {
  const { user, isAuthenticated, token, isAdmin } = useAuth();
  const { getImageKitAuth } = useProducts();
  const { t } = useLanguage();
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAdminCreate, setIsAdminCreate] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const pageRef = useRef(null);
  const initialFetchRef = useRef(false);
  useCommunityMotion(pageRef);

  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/challenges');
      if (res.data.success) setChallenges(res.data.data);
    } catch (err) {
      toast.error(t('challenges.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (challengeId, submissionId) => {
    if (!isAuthenticated) return toast.error(t('challenges.loginToVote'));
    try {
      const res = await axios.post(
        `/api/challenges/${challengeId}/vote/${submissionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(t('challenges.voteSuccess'));
        fetchChallenges();
      }
    } catch {
      toast.error(t('challenges.error'));
    }
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div ref={pageRef} className="community-page community-page--challenges">

      <SEO 
        title="Challenges — Luxe | Модные конкурсы" 
        description="Haftalik stil musobaqalarida qatnashing, ovoz bering va mukofotlar yutib oling. Участвуйте в модных челленджах и выигрывайте призы." 
        keywords="Challenges, musobaqalar, modalar, luxe uz, fashion contest, модные конкурсы ташкент"
        breadcrumbSteps={[{ name: 'Challenges', url: '/challenges' }]}
      />

      <CommunityOpening variant="challenges" description={t('challenges.subtitle')}>
        <span>{challenges.filter(c => c.isActive).length} {t('challenges.activeChallenges')}</span>
        {isAdmin && <button type="button" onClick={() => setIsAdminCreate(true)}>+ {t('challenges.createChallenge')}</button>}
      </CommunityOpening>
      <div className="community-page__body community-content">
        <CommunityChapter variant="challenges" />

        {/* Challenges Grid */}
        {isLoading ? (
          <ChallengesSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:gap-20">
            {challenges.map(challenge => {
              const daysLeft = getDaysLeft(challenge.endDate);
              const isExpired = daysLeft === 0;
              const submissions = [...(challenge.submissions || [])].sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
              
              return (
                <div key={challenge._id} className="challenge-editorial relative">
                  {challenge.isActive && !isExpired && (
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d6b47c] via-[#d6b47c]/20 to-transparent rounded-full hidden md:block" />
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8 items-start">
                    {/* Challenge Card (Info) */}
                    <div className="sticky top-32">
                      <div className="group p-1 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent hover:from-[#d6b47c]/20 transition-all duration-500 shadow-2xl">
                        <div className="challenge-editorial__card bg-[#0f0f0f] rounded-[39px] p-8 md:p-10">
                          <div className="flex items-center justify-between mb-8">
                            <div className="challenge-editorial__type"><span>LUXX</span><b>01</b></div>
                            <div className="text-right">
                              <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] inline-block mb-2 ${challenge.isActive && !isExpired ? 'bg-green-500/10 text-green-400 border border-green-500/20' : challenge.winner ? 'bg-amber-300 text-black shadow-[0_5px_15px_rgba(214,180,124,0.3)]' : 'bg-gray-800 text-gray-500'}`}>
                                {challenge.isActive && !isExpired ? t('challenges.statusActive') : challenge.winner ? t('challenges.statusWinner') : t('challenges.statusFinished')}
                              </span>
                              {challenge.winner && (
                                <p className="text-[10px] text-amber-300/80 font-black uppercase tracking-widest mt-1 animate-pulse">
                                  {t('challenges.winner')}: {challenge.submissions?.find(s => s.user?._id === challenge.winner)?.user?.username || t('challenges.anonymous')}
                                </p>
                              )}
                              {daysLeft !== null && !isExpired && (
                                <p className="text-xs text-orange-400/80 font-medium">{t('challenges.daysLeftPrefix')}{daysLeft} {t('challenges.daysLeftSuffix')}</p>
                              )}
                            </div>
                          </div>

                          <h2 className="text-3xl md:text-4xl font-brilliant text-white mb-4 group-hover:text-[#d6b47c] transition-colors">{challenge.title}</h2>
                          <p className="text-gray-400 font-light leading-relaxed mb-8">{challenge.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{t('challenges.reward')}</p>
                              <p className="text-lg font-bold text-[#d6b47c]">+{challenge.reward?.points || 500} {t('vip.points')}</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{t('challenges.participants')}</p>
                              <p className="text-lg font-bold text-white">{submissions.length}</p>
                            </div>
                          </div>

                          {challenge.isActive && !isExpired && isAuthenticated && (
                            <button
                              onClick={() => { setSelectedChallenge(challenge); setIsSubmitOpen(true); }}
                              className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#d6b47c] hover:text-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                            >
                              {t('challenges.participate')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submissions Section */}
                    <div className="challenge-editorial__entries space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">{t('challenges.topLooks')}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d6b47c] animate-pulse" />
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t('challenges.voteOpen')}</span>
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
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {isWinner ? (
                                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-amber-300 text-black px-3 py-1.5 rounded-full shadow-[0_10px_20px_rgba(214,180,124,0.4)]">
                                    <Trophy className="w-3 h-3 fill-current" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{t('challenges.winner')}</span>
                                  </div>
                                ) : isTop3 && (
                                  <div 
                                    className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 backdrop-blur-md"
                                    style={{ borderColor: rankColor, color: rankColor, backgroundColor: `${rankColor}10` }}
                                  >
                                    #{idx + 1}
                                  </div>
                                )}

                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                  <div className="min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{sub.user?.username}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Trophy className={`w-2.5 h-2.5 ${isWinner ? 'text-amber-300' : 'text-[#d6b47c]'}`} />
                                      <span className="text-[9px] text-gray-400 font-medium">{isWinner ? t('challenges.grandWinner') : `#{idx + 1} ${t('challenges.rank')}`}</span>
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

                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
                                  <span className="text-[10px] font-bold text-white">{sub.votes?.length || 0}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="challenge-editorial__empty">
                          <span>00 / ENTRIES</span>
                          <strong>Hikoya endi boshlanadi.</strong>
                          <p>{t('challenges.noSubmissions')}</p>
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
                <h3 className="text-2xl text-gray-400 font-light">{t('challenges.noChallenges')}</h3>
                <p className="text-gray-600 mt-3 max-w-sm mx-auto">{t('challenges.noChallengesHint')}</p>
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
          t={t}
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
          t={t}
        />
      )}

      {/* Admin Create Modal */}
      {isAdminCreate && (
        <AdminCreateModal
          token={token}
          onClose={() => setIsAdminCreate(false)}
          onSuccess={() => { setIsAdminCreate(false); fetchChallenges(); }}
          t={t}
        />
      )}
    </div>
  );
};

const SubmitModal = ({ challenge, token, onClose, onSuccess, getImageKitAuth, t }) => {
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const publicKey =
        import.meta.env.REACT_APP_IMAGEKIT_PUBLIC_KEY ||
        import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ||
        'public_mnemyo/d2OAPyIzzxUa3mXisNc0=';

      const auth = await getImageKitAuth();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileName', file.name);
      fd.append('publicKey', publicKey);
      fd.append('signature', auth.signature);
      fd.append('expire', auth.expire);
      fd.append('token', auth.token);
      fd.append('folder', '/challenges');
      const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) setImage(result.url);
    } catch (error) {
      toast.error(error.message || t('challenges.uploadErrorGeneric'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!image) return toast.error(t('challenges.uploadError'));
    setIsSubmitting(true);
    try {
      const postRes = await axios.post('/api/posts', {
        images: [image],
        caption: `${challenge.title} musobaqasiga ishtirok etmoqdaman! 🏆 #LuxeChallenge`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (!postRes.data.success) throw new Error(t('challenges.submitError'));

      const res = await axios.post(`/api/challenges/${challenge._id}/submit`, {
        postId: postRes.data.data._id
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        toast.success(t('challenges.participateSuccess'));
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('challenges.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-[28px] w-full max-w-lg p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif">{t('challenges.participateTitle')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-400 mb-6">"{challenge.title}" {t('challenges.challengeFor')}</p>

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
                <div className="py-2 space-y-3">
                  <div className="w-16 h-1 bg-[#d6b47c]/20 rounded-full mx-auto overflow-hidden">
                    <div className="w-full h-full bg-[#d6b47c] -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <p className="text-xs text-[#d6b47c] tracking-widest uppercase font-bold animate-pulse">{t('challenges.uploading') || 'Yuklanmoqda...'}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[#d6b47c] mx-auto mb-3" />
                  <p className="text-sm text-gray-400">{t('challenges.uploadLook')}</p>
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
          {isSubmitting ? t('challenges.submitting') : t('challenges.submit')}
        </button>
      </div>
    </div>
  );
};

const AdminCreateModal = ({ token, onClose, onSuccess, t }) => {
  const [form, setForm] = useState({
    title: '', description: '', type: 'social',
    startDate: '', endDate: '', rewardPoints: 500
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.startDate) return toast.error(t('challenges.fillAllFields'));
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
        toast.success(t('challenges.createSuccess'));
        onSuccess();
      }
    } catch {
      toast.error(t('challenges.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-[28px] w-full max-w-lg p-8 shadow-2xl space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-serif">{t('challenges.newChallenge')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {[
          { key: 'title', label: t('challenges.challengeName'), type: 'text', placeholder: t('challenges.namePlaceholder') },
          { key: 'description', label: t('challenges.description'), type: 'textarea', placeholder: t('challenges.descriptionPlaceholder') },
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
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{t('challenges.startLabel')}</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{t('challenges.endLabel')}</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-widest">{t('challenges.rewardLabel')}</label>
          <input type="number" value={form.rewardPoints} onChange={e => setForm({ ...form, rewardPoints: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl p-3 text-sm outline-none focus:border-[#d6b47c]/40" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#d6b47c] text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#e8c98a] transition-all disabled:opacity-50 mt-2"
        >
          {isSubmitting ? t('challenges.creating') : t('challenges.createButton')}
        </button>
      </div>
    </div>
  );
};

export default Challenges;

const FullViewModal = ({ submissions, currentIndex, token, user, onClose, onVote, t }) => {
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
        toast.success(t('challenges.commentPosted'));
      }
    } catch {
      toast.error(t('challenges.error'));
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
               {sub.votes?.length || 0} {t('challenges.like')}
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
                <p className="text-xs text-gray-500">{t('challenges.participant')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">{sub.post.caption}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 admin-scroll">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{t('challenges.comments')} ({comments.length})</h4>
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
                <p className="text-xs">{t('challenges.noComments')}</p>
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
                placeholder={t('challenges.commentPlaceholder')}
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
