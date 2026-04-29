import React, { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, Phone, RefreshCw, ShieldCheck, Gem, Plus, Minus, Info } from 'lucide-react';
import useProductService from '../server/server';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [usersPoints, setUsersPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const { getAllUserPoints, adminAdjustPoints } = useProductService();

  const fetchUsers = async (withRefreshState = false) => {
    if (withRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const token = localStorage.getItem('token');
    const result = await getAllUserPoints(token);

    if (result.success) {
      setUsersPoints(result.data || []);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustPoints = async (type) => {
    if (!selectedUser || !adjustmentAmount || isNaN(adjustmentAmount)) {
      toast.error('To\'g\'ri miqdor kiriting');
      return;
    }

    setIsAdjusting(true);
    const token = localStorage.getItem('token');
    const result = await adminAdjustPoints({
      userId: selectedUser.user._id,
      amount: Math.abs(adjustmentAmount),
      type,
      description: adjustmentReason
    }, token);

    if (result.success) {
      toast.success('Ballar muvaffaqiyatli o\'zgartirildi');
      setSelectedUser(null);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      fetchUsers(true);
    } else {
      toast.error(result.message || 'Xatolik yuz berdi');
    }
    setIsAdjusting(false);
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="admin-loading-ring w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="admin-section-title text-xl">Loyalty & Foydalanuvchilar</h2>
          <p className="admin-muted text-sm mt-1">Mijozlar ballari va VIP darajalari boshqaruvi</p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          className="admin-btn-secondary px-4 py-2.5 w-full lg:w-auto"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {usersPoints.length === 0 ? (
        <div className="admin-empty-state p-12 text-center">
          <Users className="w-14 h-14 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold">Ma'lumot topilmadi</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {usersPoints.map((record) => {
            const user = record.user || {};
            return (
              <article key={record._id} className="admin-card-soft p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 text-lg font-bold flex items-center justify-center flex-shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{user.username || 'Nomaʼlum'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`admin-pill ${record.level === 'Diamond' ? 'admin-pill-info' : record.level === 'Gold' ? 'admin-pill-warning' : 'admin-pill-secondary'} text-[10px]`}>
                          {record.level}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{record.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(record)}
                    className="p-2 hover:bg-white/5 rounded-lg text-amber-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/20 p-2 rounded-lg">
                    <p className="text-slate-500 uppercase tracking-wider">Jami to'plangan</p>
                    <p className="text-white font-semibold mt-0.5">{record.totalEarned}</p>
                  </div>
                  <div className="bg-black/20 p-2 rounded-lg">
                    <p className="text-slate-500 uppercase tracking-wider">Telefon</p>
                    <p className="text-white font-semibold mt-0.5 truncate">{user.phone || '-'}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Point Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="admin-card-soft w-full max-w-md p-6 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gem className="w-5 h-5 text-amber-300" />
                Ballarni sozlash
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                <Minus className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              <span className="font-semibold text-white">{selectedUser.user?.username}</span> uchun ballarni o'zgartirish.
              Hozirgi balans: <span className="text-amber-300">{selectedUser.points} pts</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Miqdor (ball)</label>
                <input 
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-300/50"
                  placeholder="Masalan: 50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Sabab (ixtiyoriy)</label>
                <input 
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-300/50"
                  placeholder="Masalan: Maxsus bonus"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => handleAdjustPoints('add')}
                  disabled={isAdjusting}
                  className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Qo'shish
                </button>
                <button 
                  onClick={() => handleAdjustPoints('deduct')}
                  disabled={isAdjusting}
                  className="flex items-center justify-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" /> Ayirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminUsers;
