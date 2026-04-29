import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Plus, Trash2, Calendar, Target, Award, Loader2, UserCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import useProductService from '../server/server';

const AdminChallenges = () => {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isSettingWinner, setIsSettingWinner] = useState(false);

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    rewardPoints: '500',
    type: 'social',
    isActive: true
  });

  const { setChallengeWinner } = useProductService();

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/challenges');
      if (res.data.success) setChallenges(res.data.data);
    } catch (err) {
      toast.error('Musobaqalarni yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/challenges', newChallenge, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Musobaqa yaratildi');
        setShowForm(false);
        setNewChallenge({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          rewardPoints: '100',
          type: 'curated',
          isActive: true
        });
        fetchChallenges();
      }
    } catch (err) {
      toast.error('Yaratishda xato');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Musobaqani o\'chirmoqchimisiz?')) return;
    try {
      const res = await axios.delete(`/api/challenges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('O\'chirildi');
        fetchChallenges();
      }
    } catch (err) {
      toast.error('O\'chirishda xato');
    }
  };

  const handleSetWinner = async (challengeId, userId) => {
    const challenge = challenges.find(c => c._id === challengeId);
    const points = challenge?.reward?.points || 100;
    if (!window.confirm(`Bu foydalanuvchini g'olib deb belgilamoqchimisiz? ${points} ball avtomatik beriladi.`)) return;
    
    setIsSettingWinner(true);
    const result = await setChallengeWinner(challengeId, userId, token);
    if (result.success) {
      toast.success('G\'olib belgilandi!');
      fetchChallenges();
    } else {
      toast.error(result.message || 'Xatolik yuz berdi');
    }
    setIsSettingWinner(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Trophy className="w-6 h-6 text-amber-300" />
            Style Challenges
          </h2>
          <p className="text-sm text-gray-500">G'oliblarni aniqlash va mukofotlash</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-btn-primary px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Yangi musobaqa
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card-soft p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <h3 className="font-bold mb-4 text-white">Yangi musobaqa qo'shish</h3>
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sarlavha</label>
            <input
              type="text"
              value={newChallenge.title}
              onChange={e => setNewChallenge({...newChallenge, title: e.target.value})}
              placeholder="Masalan: Yozgi eng yaxshi obraz"
              className="admin-input"
              required
            />
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tavsif</label>
            <textarea
              value={newChallenge.description}
              onChange={e => setNewChallenge({...newChallenge, description: e.target.value})}
              className="admin-input min-h-[80px]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Musobaqa turi</label>
            <select
              value={newChallenge.type}
              onChange={e => setNewChallenge({...newChallenge, type: e.target.value})}
              className="admin-input"
            >
              <option value="social">Ijtimoiy (Obraz ulashish)</option>
              <option value="orders">Xaridlar (Eng ko'p xarid)</option>
              <option value="reviews">Izohlar (Sifatli sharhlar)</option>
              <option value="spending">Sarflov (Eng katta xarid)</option>
              <option value="streak">Streak (Kunlik faollik)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mukofot (Ball)</label>
            <input
              type="number"
              value={newChallenge.rewardPoints}
              onChange={e => setNewChallenge({...newChallenge, rewardPoints: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Boshlanish sanasi</label>
            <input
              type="date"
              value={newChallenge.startDate}
              onChange={e => setNewChallenge({...newChallenge, startDate: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tugash sanasi</label>
            <input
              type="date"
              value={newChallenge.endDate}
              onChange={e => setNewChallenge({...newChallenge, endDate: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary px-6 py-2">Bekor qilish</button>
            <button type="submit" className="admin-btn-primary px-8 py-2">Yaratish</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20 text-white"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {challenges.map(challenge => (
            <div key={challenge._id} className="admin-card-soft overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-300/10 flex items-center justify-center text-amber-300">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{challenge.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                      {challenge.isClosed && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Trophy className="w-3 h-3" />
                          YOPILGAN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setExpandedId(expandedId === challenge._id ? null : challenge._id)}
                    className="admin-btn-secondary px-3 py-1.5 text-xs flex items-center gap-2"
                  >
                    Submissions ({challenge.submissions?.length || 0})
                    {expandedId === challenge._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(challenge._id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedId === challenge._id && (
                <div className="border-t border-white/5 bg-black/10 p-5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Ishtirokchilar</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenge.submissions?.map(sub => (
                      <div key={sub._id} className={`admin-card-soft p-4 border ${challenge.winner === sub.user?._id ? 'border-amber-300/50' : 'border-white/5'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {sub.user?.username?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{sub.user?.username}</p>
                            <p className="text-[10px] text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        {sub.post?.images?.[0] && (
                          <div className="relative group/img aspect-square rounded-lg overflow-hidden mb-3">
                            <img src={sub.post.images[0]} className="w-full h-full object-cover" alt="Submission" />
                            <a href={`/style-feed`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </a>
                          </div>
                        )}
                        {!challenge.isClosed ? (
                          <button
                            onClick={() => handleSetWinner(challenge._id, sub.user?._id)}
                            disabled={isSettingWinner}
                            className="w-full py-2 bg-amber-300 text-slate-900 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            G'olib deb tanlash
                          </button>
                        ) : challenge.winner === sub.user?._id ? (
                          <div className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                            <Trophy className="w-4 h-4" />
                            G'OLIB
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {(!challenge.submissions || challenge.submissions.length === 0) && (
                      <p className="col-span-full text-center text-sm text-gray-500 py-4 italic">Hech qanday ishtirokchi yo'q</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {challenges.length === 0 && (
            <div className="py-20 text-center text-gray-500">Hali musobaqalar yo'q</div>
          )}
        </div>
      )}
    </div>
  );
};


export default AdminChallenges;
