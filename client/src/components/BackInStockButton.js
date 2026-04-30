import React, { useState } from 'react';
import { Bell, BellRing, Phone, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const BackInStockButton = ({ productId, productName, hasStock = true }) => {
  const { isAuthenticated, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [notifyMethod, setNotifyMethod] = useState('sms'); // sms, push
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Don't show if product is in stock
  if (hasStock) return null;

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Iltimos, avval ro\'yxatdan o\'ting');
      return;
    }

    if (notifyMethod === 'sms' && !phone.trim()) {
      toast.error('Telefon raqamni kiriting');
      return;
    }

    setIsSubmitting(true);
    try {
      // In production, this would call the backend API
      // await axios.post('/api/back-in-stock/subscribe', {
      //   productId,
      //   method: notifyMethod,
      //   phone: notifyMethod === 'sms' ? phone : undefined,
      // }, { headers: { Authorization: `Bearer ${token}` } });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      toast.success('Mahsulot paydo bo\'lganda sizga xabar beramiz!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Out of Stock + Notify Button */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Bell className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">Hozirda tugagan</p>
            <p className="text-[11px] text-[#9aa3b2]">Bu mahsulot hozirda sotuvda yo'q</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          <BellRing className="w-4 h-4" />
          Qachon paydo bo'lishini bilish
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2rem] bg-gradient-to-b from-[#151b27] to-[#10151f] shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/10 p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#9aa3b2] hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <BellRing className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#f4f1eb]">Bildirishnoma olish</h3>
                <p className="text-xs text-[#9aa3b2]">Mahsulot qayta paydo bo'lganda xabar beramiz</p>
              </div>
            </div>

            {/* Product Name */}
            <div className="rounded-xl bg-white/[0.03] p-3 mb-4">
              <p className="text-xs text-[#9aa3b2]">Mahsulot</p>
              <p className="text-sm font-medium text-[#f4f1eb] mt-0.5">{productName}</p>
            </div>

            {/* Notify Method */}
            <div className="space-y-3 mb-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9aa3b2]">Xabar olish usuli</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNotifyMethod('sms')}
                  className={`rounded-xl p-3 text-center transition-all ${
                    notifyMethod === 'sms'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : 'bg-white/[0.03] border border-white/10 text-[#9aa3b2] hover:bg-white/[0.06]'
                  }`}
                >
                  <Phone className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">SMS</p>
                </button>
                <button
                  onClick={() => setNotifyMethod('push')}
                  className={`rounded-xl p-3 text-center transition-all ${
                    notifyMethod === 'push'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : 'bg-white/[0.03] border border-white/10 text-[#9aa3b2] hover:bg-white/[0.06]'
                  }`}
                >
                  <Bell className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Push bildirishnoma</p>
                </button>
              </div>
            </div>

            {/* Phone Input for SMS */}
            {notifyMethod === 'sms' && (
              <div className="mb-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#9aa3b2]">Telefon raqam</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-xl border border-[#2d3442] bg-[#0e131d] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-amber-500/50 transition-colors"
                  />
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-[#0f1014] transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Yuborilmoqda...</span>
              ) : (
                <>
                  <BellRing className="w-4 h-4" />
                  Bildirishnoma olish
                </>
              )}
            </button>

            <p className="text-[10px] text-[#9aa3b2] text-center mt-3">
              Mahsulot qayta sotuvga chiqqanda faqat bir marta xabar yuboramiz.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BackInStockButton;
