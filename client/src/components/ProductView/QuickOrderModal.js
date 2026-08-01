import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, Phone, User, MapPin, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * QuickOrderModal — 1-Click Fast Order Modal for high conversion
 */
export default function QuickOrderModal({ isOpen, onClose, product, selectedColor = '', selectedSize = '' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Iltimos, ismingiz va telefon raqamingizni kiriting!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Buyurtmangiz qabul qilindi! Operatormiz 5 daqiqa ichida bog'lanadi.");
    }, 1200);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#141416] border border-[#c9a96e]/30 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white space-y-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fluid-zoom 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X size={16} />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-serif text-white">Rahmat! Buyurtma Qabul Qilindi</h3>
            <p className="text-xs text-[#8a8a8d] leading-relaxed max-w-xs mx-auto">
              Mutaxassisimiz tez orada siz ko'rsatgan raqamga bog'lanib, yetkazib berish vaqtini tasdiqlaydi.
            </p>
            <button
              onClick={onClose}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#c9a96e] px-8 py-3 text-xs font-bold text-black uppercase tracking-wider hover:bg-[#d4b87a] transition-all"
            >
              Yopish
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 text-[#c9a96e] text-[10px] font-black uppercase tracking-widest">
                <Zap size={12} />
                TEZKOR 1-KLIK BUYURTMA
              </div>
              <h3 className="text-2xl font-serif text-white pt-1">Tezda Buyurtma Berish</h3>
              <p className="text-xs text-[#8a8a8d]">
                Operatorimiz telefon orqali ma'lumotlarni tasdiqlab, darhol yetkazib beradi.
              </p>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <img
                src={product.images?.[0]?.url || product.image}
                alt={product.name}
                className="h-14 w-14 object-cover rounded-xl border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                <p className="text-xs font-bold text-[#c9a96e] mt-0.5">{formatPrice(product.price)} so'm</p>
                {(selectedColor || selectedSize) && (
                  <p className="text-[10px] text-[#8a8a8d] mt-0.5">
                    {[selectedColor && `Rang: ${selectedColor}`, selectedSize && `O'lcham: ${selectedSize}`].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8d] flex items-center gap-1">
                  <User size={12} /> Ismingiz
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Malika"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-[#c9a96e] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8d] flex items-center gap-1">
                  <Phone size={12} /> Telefon raqamingiz
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-[#c9a96e] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8d] flex items-center gap-1">
                  <MapPin size={12} /> Manzil (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Toshkent, Chilonzor 7"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-[#c9a96e] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#c9a96e] py-4 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[0_10px_30px_rgba(201,169,110,0.3)] hover:shadow-[0_15px_40px_rgba(201,169,110,0.5)] active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <Zap className="h-4 w-4 text-black fill-black" />
                )}
                <span>{isSubmitting ? "Yuborilmoqda..." : "Buyurtmani Tasdiqlash"}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8a8a8d] pt-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>To'lov faqat mahsulotni qo'lingizga olgandan keyin amalga oshiriladi</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
