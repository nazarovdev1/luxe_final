import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Plus, Trash2, Calendar, User, Percent, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const AdminCoupons = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    expiryDate: '',
    description: ''
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setCoupons(res.data.data);
    } catch (err) {
      toast.error('Kuponlarni yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/coupons', newCoupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Kupon yaratildi');
        setShowAddForm(false);
        setNewCoupon({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minPurchase: '',
          expiryDate: '',
          description: ''
        });
        fetchCoupons();
      }
    } catch (err) {
      toast.error('Yaratishda xato');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kuponni o\'chirmoqchimisiz?')) return;
    try {
      const res = await axios.delete(`/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('O\'chirildi');
        fetchCoupons();
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
            <Ticket className="w-6 h-6 text-amber-300" />
            Loyallik Kuponlari
          </h2>
          <p className="text-sm text-gray-500">Mijozlar uchun chegirma kuponlarini boshqarish</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="admin-btn-primary px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          Yangi kupon
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="admin-card-soft p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <h3 className="font-bold mb-4">Yangi kupon yaratish</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kupon kodi</label>
            <input
              type="text"
              value={newCoupon.code}
              onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              placeholder="LUXE-2026"
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Turi</label>
            <select
              value={newCoupon.discountType}
              onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}
              className="admin-input"
            >
              <option value="percentage">Foiz (%)</option>
              <option value="fixed">Aniq summa (so'm)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Qiymati</label>
            <input
              type="number"
              value={newCoupon.discountValue}
              onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Minimal xarid</label>
            <input
              type="number"
              value={newCoupon.minPurchase}
              onChange={e => setNewCoupon({...newCoupon, minPurchase: e.target.value})}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Amal qilish muddati</label>
            <input
              type="date"
              value={newCoupon.expiryDate}
              onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tavsif</label>
            <input
              type="text"
              value={newCoupon.description}
              onChange={e => setNewCoupon({...newCoupon, description: e.target.value})}
              className="admin-input"
            />
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="admin-btn-secondary px-6 py-2">Bekor qilish</button>
            <button type="submit" className="admin-btn-primary px-8 py-2">Saqlash</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div key={coupon._id} className="admin-card-soft p-5 relative group">
              <button
                onClick={() => handleDelete(coupon._id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-300/10 flex items-center justify-center text-amber-300">
                  {coupon.discountType === 'percentage' ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-mono font-bold text-lg text-white">{coupon.code}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{coupon.user ? `Foydalanuvchi: ${coupon.user.username}` : 'Global Kupon'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chegirma:</span>
                  <span className="font-bold text-amber-200">
                    {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' so\'m'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Min. xarid:</span>
                  <span className="text-white">{coupon.minPurchase?.toLocaleString()} so'm</span>
                </div>
                {coupon.expiryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Muddati:</span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Calendar className="w-3 h-3" />
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {coupon.isUsed && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-red-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Ishlatilgan
                  </div>
                )}
              </div>
            </div>
          ))}
          {coupons.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">Hali kuponlar yo'q</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
