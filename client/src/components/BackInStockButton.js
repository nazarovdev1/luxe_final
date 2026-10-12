import React, { useState } from 'react';
import { Bell, BellRing, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

export const PHONE_PATTERN = /^\+998[0-9]{9}$/;

// Accepts "90 123 45 67", "998901234567", "+998 90 123-45-67" and returns +998XXXXXXXXX (or the cleaned input).
export const normalizeUzPhone = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 12 && digits.startsWith('998')) return `+${digits}`;
  return `+${digits}`;
};

const TEXT = {
  uz: {
    outOfStock: 'Hozirda mavjud emas',
    sub: 'Sotuvga qaytganda SMS orqali xabar beramiz',
    open: 'Qaytganda xabar bering',
    title: 'Navbatga yozilish',
    product: 'Mahsulot',
    phone: 'Telefon raqamingiz',
    placeholder: '+998 90 123 45 67',
    submit: 'Xabar berishni yoqish',
    foot: 'Raqamingiz faqat shu mahsulot haqida xabar berish uchun ishlatiladi.',
    badPhone: "Telefon raqamni +998 formatida kiriting",
    ok: 'Mahsulot qaytganda sizga xabar beramiz',
    error: "Xatolik yuz berdi. Keyinroq urinib ko'ring",
    done: "Siz navbatdasiz",
  },
  ru: {
    outOfStock: 'Сейчас нет в наличии',
    sub: 'Сообщим по SMS, когда товар вернётся',
    open: 'Сообщить о поступлении',
    title: 'Встать в очередь',
    product: 'Товар',
    phone: 'Ваш номер телефона',
    placeholder: '+998 90 123 45 67',
    submit: 'Включить уведомление',
    foot: 'Номер используется только для уведомления об этом товаре.',
    badPhone: 'Введите номер в формате +998',
    ok: 'Сообщим, когда товар вернётся',
    error: 'Произошла ошибка. Попробуйте позже',
    done: 'Вы в очереди',
  },
  en: {
    outOfStock: 'Currently unavailable',
    sub: "We'll text you when it is back in stock",
    open: 'Notify me',
    title: 'Join the waitlist',
    product: 'Product',
    phone: 'Your phone number',
    placeholder: '+998 90 123 45 67',
    submit: 'Turn on notification',
    foot: 'Your number is only used to notify you about this product.',
    badPhone: 'Enter the number in +998 format',
    ok: "We'll let you know when it is back",
    error: 'Something went wrong. Please try again later',
    done: "You're on the list",
  },
};

const BackInStockButton = ({ productId, productName, hasStock = true, size = '', color = '' }) => {
  const { language } = useLanguage();
  const tx = TEXT[language] || TEXT.uz;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (hasStock) return null;

  const handleSubscribe = async () => {
    const normalized = normalizeUzPhone(phone);
    if (!PHONE_PATTERN.test(normalized)) {
      toast.error(tx.badPhone);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/stock-alerts', {
        productId,
        phone: normalized,
        size,
        color,
      });
      setIsSubscribed(true);
      toast.success(data?.message || tx.ok);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.message || tx.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
            <Bell className="h-6 w-6 text-[#c9a96e]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#f5f5f3] uppercase tracking-wider">{tx.outOfStock}</p>
            <p className="text-[11px] text-[#8a8a8d] font-bold tracking-wide mt-1">{tx.sub}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={isSubscribed}
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] hover:bg-[#d4b87a] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          <BellRing className="w-4 h-4" strokeWidth={3} />
          {isSubscribed ? tx.done : tx.open}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={tx.title}>
          <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-[#0a0a0b] shadow-2xl border border-white/10 p-8">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#8a8a8d] hover:text-[#f5f5f3] transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
                <BellRing className="h-6 w-6 text-[#c9a96e]" />
              </div>
              <h3 className="text-xl font-bold text-[#f5f5f3] tracking-wide uppercase">{tx.title}</h3>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 mb-6">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{tx.product}</p>
              <p className="text-sm font-bold text-[#f5f5f3]">
                {productName}
                {(size || color) && <span className="text-[#8a8a8d] font-medium"> · {[color, size].filter(Boolean).join(' / ')}</span>}
              </p>
            </div>

            <label className="block mb-8">
              <span className="block px-2 mb-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{tx.phone}</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={tx.placeholder}
                className="w-full rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 text-sm text-[#f5f5f3] placeholder-[#3f4658] outline-none focus:border-[#c9a96e]/30 transition-all"
              />
            </label>

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#c9a96e] py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0a0a0b] hover:bg-[#d4b87a] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><BellRing className="w-4 h-4" strokeWidth={3} />{tx.submit}</>)}
            </button>

            <p className="text-[10px] font-bold text-[#8a8a8d] text-center mt-6 leading-relaxed">{tx.foot}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default BackInStockButton;
