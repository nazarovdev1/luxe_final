import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Plus, Trash2, Shield, Target, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AdminBadges = () => {
  const { token } = useAuth();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    icon: '',
    criteria: 'purchase_amount',
    threshold: '',
    reward: {
      points: 0,
      discountPercentage: 0,
      freeShipping: false,
      earlyAccess: false
    },
    isActive: true
  });

  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/badges');
      if (res.data.success) setBadges(res.data.data);
    } catch (err) {
      toast.error('Nishonlarni yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/badges', newBadge, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Nishon yaratildi');
        setShowForm(false);
        setNewBadge({
          name: '',
          description: '',
          icon: '',
          criteria: 'purchase_amount',
          threshold: '',
          reward: { points: 0, discountPercentage: 0, freeShipping: false, earlyAccess: false },
          isActive: true
        });
        fetchBadges();
      }
    } catch (err) {
      toast.error('Yaratishda xato');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Nishonni o\'chirmoqchimisiz?')) return;
    try {
      const res = await axios.delete(`/api/badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('O\'chirildi');
        fetchBadges();
      }
    } catch (err) {
      toast.error('O\'chirishda xato');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Medal className="w-6 h-6 text-amber-300" />
            Nishonlar (Badges)
          </h2>
          <p className="text-sm text-gray-500">Muvaffaqiyat nishonlarini boshqarish</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="admin-btn-primary px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Yangi nishon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card-soft p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <h3 className="font-bold mb-4">Yangi nishon qo'shish</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nomi</label>
            <input
              type="text"
              value={newBadge.name}
              onChange={e => setNewBadge({...newBadge, name: e.target.value})}
              placeholder="Masalan: VIP Xaridor"
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ikonka (Emoji)</label>
            <input
              type="text"
              value={newBadge.icon}
              onChange={e => setNewBadge({...newBadge, icon: e.target.value})}
              placeholder="Masalan: 🏆"
              className="admin-input"
              required
            />
          </div>
          <div className="col-span-full">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tavsif</label>
            <input
              type="text"
              value={newBadge.description}
              onChange={e => setNewBadge({...newBadge, description: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kriteriya</label>
            <select
              value={newBadge.criteria}
              onChange={e => setNewBadge({...newBadge, criteria: e.target.value})}
              className="admin-input"
            >
              <option value="purchase_amount">Xarid summasi</option>
              <option value="number_of_orders">Buyurtmalar soni</option>
              <option value="reviews_written">Sharhlar soni</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chegara (Threshold)</label>
            <input
              type="number"
              value={newBadge.threshold}
              onChange={e => setNewBadge({...newBadge, threshold: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary px-6 py-2">Bekor qilish</button>
            <button type="submit" className="admin-btn-primary px-8 py-2">Saqlash</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div key={badge._id} className="admin-card-soft p-6 relative group text-center">
              <button
                onClick={() => handleDelete(badge._id)}
                className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="text-5xl mb-4">{badge.icon}</div>
              <h3 className="font-bold text-white mb-1">{badge.name}</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">{badge.criteria.replace(/_/g, ' ')}</p>
              <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-gray-400">
                Min: {badge.threshold.toLocaleString()}
              </div>
            </div>
          ))}
          {badges.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">Hali nishonlar yo'q</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBadges;
