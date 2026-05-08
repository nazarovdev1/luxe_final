import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Send, Trash2, ExternalLink } from 'lucide-react';
import useProductService from '../server/server';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const CARD_DESIGNS = [
  { id: 'classic', name: 'Klassik', gradient: 'from-[#d6b47c] to-[#a67c52]', textColor: 'text-[#0f1014]' },
  { id: 'elegant', name: 'Zamonaviy', gradient: 'from-[#1a1040] to-[#0d0820]', textColor: 'text-[#d6b47c]' },
  { id: 'minimal', name: 'Minimal', gradient: 'from-[#f4f1eb] to-[#e0ddd5]', textColor: 'text-[#0f1014]' },
  { id: 'dark', name: 'Dark Luxury', gradient: 'from-[#0f1014] to-[#1a1a2e]', textColor: 'text-[#d6b47c]' },
];

const formatPrice = (value) => {
  return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const MyGiftCards = () => {
  const { t } = useLanguage();
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getMyGiftCards, transferGiftCard } = useProductService();
  const [transferModal, setTransferModal] = useState(null);
  const [transferPhone, setTransferPhone] = useState('+998');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      const result = await getMyGiftCards(token);
      if (result.success) {
        setGiftCards(result.data);
      }
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!transferPhone || transferPhone === '+998') {
      toast.error('Qabul qiluvchi telefon raqamini kiriting');
      return;
    }
    
    setIsTransferring(true);
    const token = localStorage.getItem('token');
    const result = await transferGiftCard(transferModal._id, transferPhone, token);
    if (result.success) {
      toast.success('Karta muvaffaqiyatli o\'tkazildi');
      setTransferModal(null);
      setTransferPhone('+998');
      fetchGiftCards();
    } else {
      toast.error(result.message || 'Xatolik yuz berdi');
    }
    setIsTransferring(false);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('+998')) {
      const digits = value.slice(4).replace(/\D/g, '').slice(0, 9);
      setTransferPhone('+998' + digits);
    } else if (value.length < 4) {
      setTransferPhone('+998');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod nusxalandi!');
  };

  const shareCard = (card) => {
    const text = `Salom! Men sizga Luxx.uz dan sovg'a kartasini yubordim. \n\nKod: ${card.code}\n${t('common.price')}: ${formatPrice(card.amount)} ${t('common.sum')}\n\nXarid uchun: https://luxx.uz/products`;
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://luxx.uz')}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d6b47c]"></div>
      </div>
    );
  }

  if (giftCards.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111] rounded-[32px] border border-white/5 border-dashed">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-white font-medium">Sovg'a kartalaringiz yo'q</h3>
        <p className="text-gray-500 text-sm mt-2">Sotib olingan kartalar shu yerda ko'rinadi</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {giftCards.map((card) => {
        const design = CARD_DESIGNS.find(d => d.id === card.designId) || CARD_DESIGNS[0];
        return (
          <div key={card._id} className="relative group">
            {/* Card Visual */}
            <div className={`rounded-3xl bg-gradient-to-br ${design.gradient} p-6 aspect-[1.6/1] flex flex-col justify-between shadow-xl relative overflow-hidden transition-transform group-hover:scale-[1.02]`}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className={`text-[10px] uppercase tracking-[0.2em] ${design.textColor} opacity-60 font-black`}>Luxx.uz</p>
                  <p className={`text-sm font-bold ${design.textColor}`}>Sovg'a kartasi</p>
                </div>
                <div className={`px-2 py-1 rounded-md bg-black/10 backdrop-blur-md border border-white/10`}>
                  <p className={`text-[10px] font-bold ${design.textColor} uppercase`}>
                    {card.isUsed ? 'Ishlatilgan' : 'Faol'}
                  </p>
                </div>
              </div>

              <div className="relative z-10">
                <p className={`text-3xl font-bold ${design.textColor}`}>
                  {formatPrice(card.amount)} <span className="text-sm font-normal">{t('common.sum')}</span>
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <code className={`px-3 py-1.5 rounded-lg bg-black/10 backdrop-blur-md border border-white/10 text-sm font-mono font-bold ${design.textColor}`}>
                    {card.code}
                  </code>
                </div>
              </div>
            </div>

            {/* Actions Overlay/Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => copyCode(card.code)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-medium text-white transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Nusxalash
              </button>
              {!card.isUsed && (
                <>
                  <button
                    onClick={() => setTransferModal(card)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#d6b47c]/10 hover:bg-[#d6b47c]/20 border border-[#d6b47c]/20 rounded-xl py-2.5 text-xs font-medium text-[#d6b47c] transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    O'tkazish
                  </button>
                  <button
                    onClick={() => shareCard(card)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 transition-all"
                    title="Telegram orqali yuborish"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            
            {card.recipientName && (
              <p className="mt-2 text-[10px] text-gray-500 text-center">
                Kimga: <span className="text-gray-400">{card.recipientName}</span>
              </p>
            )}
          </div>
        );
      })}

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTransferModal(null)} />
          <div className="relative z-10 w-full max-w-md bg-[#111] border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-medium text-white mb-2">Kartani o'tkazish</h3>
            <p className="text-gray-500 text-sm mb-6">
              Qabul qiluvchining telefon raqamini kiriting. Karta uning profiliga ko'chib o'tadi.
            </p>
            
            <input
              type="tel"
              value={transferPhone}
              onChange={handlePhoneChange}
              placeholder="+998 90 123 45 67"
              className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d6b47c]/50 mb-6 transition-all"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setTransferModal(null); setTransferPhone('+998'); }}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || transferPhone.length < 13}
                className="flex-2 py-4 px-8 rounded-2xl bg-[#d6b47c] text-black font-bold hover:bg-[#c5a36c] transition-all disabled:opacity-50"
              >
                {isTransferring ? 'Yuborilmoqda...' : 'O\'tkazish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGiftCards;
