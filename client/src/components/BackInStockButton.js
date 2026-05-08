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
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
            <Bell className="h-6 w-6 text-[#c9a96e]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#f5f5f3] uppercase tracking-wider">Hozirda mavjud emas</p>
            <p className="text-[11px] text-[#8a8a8d] font-bold uppercase tracking-widest mt-1">Eksklyuziv obuna bo'ling</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] hover:bg-[#d4b87a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_12px_24px_rgba(201,169,110,0.2)]"
        >
          <BellRing className="w-4 h-4" strokeWidth={3} />
          Xabar berish
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-[#0a0a0b] shadow-2xl border border-white/10 p-8 animate-scale-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#8a8a8d] hover:text-[#f5f5f3] transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
                <BellRing className="h-6 w-6 text-[#c9a96e]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#f5f5f3] tracking-wide uppercase">Navbatga yozilish</h3>
                <p className="text-[10px] font-bold text-[#8a8a8d] uppercase tracking-widest mt-1">Mahsulot qaytishi haqida xabar</p>
              </div>
            </div>

            {/* Product Name */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 mb-8">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Mahsulot nomi</p>
              <p className="text-sm font-bold text-[#f5f5f3]">{productName}</p>
            </div>

            {/* Notify Method */}
            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-2">Xabar olish usuli</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'sms', label: 'SMS', icon: Phone },
                  { id: 'push', label: 'Push', icon: Bell },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setNotifyMethod(m.id)}
                    className={`flex flex-col items-center gap-3 rounded-2xl p-5 border transition-all duration-300 ${
                      notifyMethod === m.id
                        ? 'bg-[#c9a96e]/5 border-[#c9a96e]/30 text-[#c9a96e]'
                        : 'bg-white/[0.02] border-white/5 text-[#8a8a8d] hover:border-white/10'
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{m.label}</p>
                    {notifyMethod === m.id && <div className="w-1 h-1 rounded-full bg-[#c9a96e]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input for SMS */}
            {notifyMethod === 'sms' && (
              <div className="mb-8 animate-fade-in">
                <label className="block px-2 mb-3">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Telefon raqamingiz</span>
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-[#f5f5f3] placeholder-[#3f4658] outline-none focus:border-[#c9a96e]/30 transition-all"
                />
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] hover:bg-[#d4b87a] active:scale-[0.98] transition-all shadow-[0_12px_24px_rgba(201,169,110,0.2)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <BellRing className="w-4 h-4" strokeWidth={3} />
                  Navbatga yozilish
                </>
              )}
            </button>

            <p className="text-[9px] font-bold text-[#8a8a8d] text-center mt-6 uppercase tracking-widest leading-relaxed">
              Mahsulot qayta sotuvga chiqqanda faqat bir marta xabar yuboramiz.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BackInStockButton;
