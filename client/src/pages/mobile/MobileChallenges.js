import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Swords, Clock, Trophy, Users, ImageIcon, Heart,
  Calendar, Upload, X, ArrowLeft, ChevronLeft, ChevronRight, Camera, Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const TYPE_COLOR = {
  social: '#d6b47c', orders: '#a8d8ea', reviews: '#c9b8ff',
  spending: '#90ee90', streak: '#ff9999',
};

export default function MobileChallenges() {
  const { user, isAuthenticated, token, isAdmin } = useAuth();
  const { getImageKitAuth } = useProducts();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Submit form
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitCaption, setSubmitCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/challenges');
      if (res.data.success) setChallenges(res.data.data);
    } catch {
      toast.error('Musobaqalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleVote = async (challengeId, submissionId) => {
    if (!isAuthenticated) { toast.error('Ovoz berish uchun kiring'); return; }
    try {
      const res = await axios.post(
        `/api/challenges/${challengeId}/vote/${submissionId}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.votesCount > selectedChallenge?.submissions?.find(s => s._id === submissionId)?.votes?.length 
          ? 'Ovoz berildi!' 
          : 'Ovoz qaytarib olindi');
        fetchChallenges();
      }
    } catch { toast.error('Xatolik yuz berdi'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageFile) { toast.error('Rasm tanlang'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', submitCaption);
      const res = await axios.post(
        `/api/challenges/${selectedChallenge._id}/submit`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        toast.success('Ishtirok etdingiz!');
        setIsSubmitOpen(false);
        setImageFile(null); setImagePreview(''); setSubmitCaption('');
        fetchChallenges();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d6b47c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Submission viewer modal
  if (viewingSubmission) {
    const submissions = selectedChallenge?.submissions || [];
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={() => setViewingSubmission(null)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm font-bold">{viewingSubmission.user?.username}</p>
          <p className="text-[10px] text-gray-500">{viewingIndex + 1}/{submissions.length}</p>
        </div>

        <div className="flex-1 relative">
          <img 
            src={viewingSubmission.post?.images?.[0] || viewingSubmission.imageUrl} 
            alt="" 
            className="w-full h-full object-contain" 
            onError={(e) => { e.target.src = '/mobile.jpg' }}
          />

          {viewingIndex > 0 && (
            <button onClick={() => { const newIdx = viewingIndex - 1; setViewingIndex(newIdx); setViewingSubmission(submissions[newIdx]); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {viewingIndex < submissions.length - 1 && (
            <button onClick={() => { const newIdx = viewingIndex + 1; setViewingIndex(newIdx); setViewingSubmission(submissions[newIdx]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div>
            {viewingSubmission.caption && <p className="text-sm text-gray-300">{viewingSubmission.caption}</p>}
            <p className="text-[10px] text-gray-500 mt-1">{viewingSubmission.votes?.length || 0} ta ovoz</p>
          </div>
          <button
            onClick={() => handleVote(selectedChallenge._id, viewingSubmission._id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              viewingSubmission.votes?.includes(user?._id)
                ? 'bg-[#d6b47c] text-black'
                : 'bg-white/10 text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${viewingSubmission.votes?.includes(user?._id) ? 'fill-current' : ''}`} />
            Ovoz
          </button>
        </div>
      </div>
    );
  }

  // Challenge detail view
  if (selectedChallenge) {
    const color = TYPE_COLOR[selectedChallenge.type] || '#d6b47c';
    const daysLeft = getDaysLeft(selectedChallenge.endDate);
    const hasSubmitted = selectedChallenge.submissions?.some(s => s.user?._id === user?._id || s.user === user?._id);
    const sortedSubmissions = [...(selectedChallenge.submissions || [])].sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));

    return (
      <div className="min-h-screen bg-[#07090f] text-white pb-24">
        {/* Submit bottom sheet */}
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-end">
            <div className="w-full bg-[#0f0f0f] rounded-t-[32px] p-6 border-t border-white/10 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-brilliant">Ishtirok Etish</h3>
                <button onClick={() => setIsSubmitOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <label className="block mb-4">
                <div className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer ${imagePreview ? 'border-transparent' : 'border-white/10'}`}>
                  {imagePreview
                    ? <img src={imagePreview} alt="" className="w-full h-full object-cover rounded-2xl" />
                    : <><Camera className="w-8 h-8 text-gray-600 mb-2" /><p className="text-sm text-gray-500">Rasm tanlang</p></>
                  }
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>

              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none mb-4 focus:outline-none"
                rows={3}
                placeholder="Izoh (ixtiyoriy)..."
                value={submitCaption}
                onChange={e => setSubmitCaption(e.target.value)}
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !imageFile}
                className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-black disabled:opacity-50"
                style={{ background: color }}
              >
                {isSubmitting ? 'Yuklanmoqda...' : 'Ishtirok Etish'}
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-6">
          <button onClick={() => setSelectedChallenge(null)} className="flex items-center gap-2 text-gray-400 mb-5">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Orqaga</span>
          </button>

          {/* Challenge Header */}
          <div className="rounded-[28px] p-5 border mb-5 relative overflow-hidden" style={{ background: `${color}10`, borderColor: `${color}30` }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ background: `${color}20` }} />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black mb-2" style={{ color }}>{selectedChallenge.type}</p>
              <h2 className="text-3xl font-brilliant text-white mb-3">{selectedChallenge.title}</h2>
              <p className="text-sm text-gray-400 mb-4">{selectedChallenge.description}</p>

              <div className="flex flex-wrap gap-3 mb-4">
                {daysLeft !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{daysLeft} kun qoldi</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedChallenge.submissions?.length || 0} ishtirokchi</span>
                </div>
                {selectedChallenge.reward && (
                  <div className="flex items-center gap-1.5 text-xs font-black" style={{ color }}>
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{typeof selectedChallenge.reward === 'object' ? selectedChallenge.reward.points : selectedChallenge.reward} ball</span>
                  </div>
                )}
              </div>

              {isAuthenticated && !hasSubmitted && selectedChallenge.status === 'active' && (
                <button
                  onClick={() => setIsSubmitOpen(true)}
                  className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-black"
                  style={{ background: color }}
                >
                  Ishtirok Etish
                </button>
              )}
              {hasSubmitted && (
                <div className="py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                  ✓ Ishtirok etdingiz
                </div>
              )}
            </div>
          </div>

          {/* Submissions */}
          {sortedSubmissions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-3">Ishtirokchilar</p>
              <div className="grid grid-cols-2 gap-2">
                {sortedSubmissions.map((sub, idx) => {
                  const isVoted = sub.votes?.includes(user?._id);
                  return (
                    <div key={sub._id} className="relative rounded-[20px] overflow-hidden border border-white/5">
                      <div
                        className="aspect-square cursor-pointer"
                        onClick={() => { setViewingSubmission(sub); setViewingIndex(idx); }}
                      >
                        <img 
                          src={sub.post?.images?.[0] || sub.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = '/mobile.jpg' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-center justify-between">
                        <p className="text-[10px] text-white font-bold truncate">{sub.user?.username}</p>
                        <button
                          onClick={() => handleVote(selectedChallenge._id, sub._id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black transition-all ${isVoted ? 'bg-[#d6b47c] text-black' : 'bg-white/20 text-white'}`}
                        >
                          <Heart className={`w-3 h-3 ${isVoted ? 'fill-current' : ''}`} />
                          {sub.votes?.length || 0}
                        </button>
                      </div>

                      {idx === 0 && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-[#d6b47c] rounded-full flex items-center justify-center">
                          <Trophy className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Challenges List
  return (
    <div className="min-h-screen bg-[#07090f] text-white pb-24">
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-[#d6b47c]/8 rounded-full blur-[80px] -translate-y-1/2" />

      <div className="relative z-10 px-4">
        <div className="pt-6 pb-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 mb-5">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Orqaga</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Swords className="w-3.5 h-3.5 text-[#d6b47c]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#d6b47c] font-black">Haftalik Duel</span>
          </div>
          <h1 className="text-4xl font-brilliant text-white">
            Style <span className="text-[#d6b47c]">Challenges</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">Musobaqalarda qatnashing va mukofotlar yutib oling</p>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-16">
            <Swords className="w-14 h-14 text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500">Hali musobaqalar yo'q</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map(challenge => {
              const color = TYPE_COLOR[challenge.type] || '#d6b47c';
              const daysLeft = getDaysLeft(challenge.endDate);
              const isActive = challenge.status === 'active';

              return (
                <button
                  key={challenge._id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className="w-full text-left rounded-[28px] p-5 border relative overflow-hidden transition-all active:scale-[0.98]"
                  style={{ background: `${color}08`, borderColor: `${color}25` }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" style={{ background: `${color}15` }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: `${color}20`, color }}>
                        {isActive ? '● Aktiv' : challenge.status === 'completed' ? 'Yakunlandi' : 'Rejalashtirilgan'}
                      </div>
                      {daysLeft !== null && isActive && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{daysLeft} kun</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-brilliant text-white mb-2">{challenge.title}</h3>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{challenge.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{challenge.submissions?.length || 0} ta</span>
                      </div>
                      {challenge.reward && (
                        <div className="flex items-center gap-1.5 text-xs font-black" style={{ color }}>
                          <Trophy className="w-3.5 h-3.5" />
                          <span>+{typeof challenge.reward === 'object' ? challenge.reward.points : challenge.reward} ball</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
