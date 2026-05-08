import React, { useState } from 'react';
import { Gift, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const GIFT_CARD_AMOUNTS = [100000, 200000, 300000, 500000, 750000, 1000000];

const CARD_DESIGNS = [
  { id: 'classic', nameKey: 'giftCards.classic', gradient: 'from-[#d6b47c] to-[#a67c52]', textColor: 'text-[#0f1014]' },
  { id: 'elegant', nameKey: 'giftCards.modern', gradient: 'from-[#1a1040] to-[#0d0820]', textColor: 'text-[#d6b47c]' },
  { id: 'minimal', nameKey: 'giftCards.minimal', gradient: 'from-[#f4f1eb] to-[#e0ddd5]', textColor: 'text-[#0f1014]' },
  { id: 'dark', nameKey: 'giftCards.darkLuxury', gradient: 'from-[#0f1014] to-[#1a1a2e]', textColor: 'text-[#d6b47c]' },
];

const formatPrice = (value) => {
  return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const GiftCards = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(200000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('classic');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+998');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
  const activeDesign = CARD_DESIGNS.find((d) => d.id === selectedDesign);

  const handleRecipientPhoneChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('+998')) {
      const digits = value.slice(4).replace(/\D/g, '').slice(0, 9);
      setRecipientPhone('+998' + digits);
    } else if (value.length < 4) {
      setRecipientPhone('+998');
    }
  };

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast.error(t('giftCards.loginRequired'));
      return;
    }
    if (activeAmount < 50000) {
      toast.error(t('giftCards.minAmount'));
      return;
    }
    if (!recipientName.trim() || recipientPhone.length < 13) {
      toast.error(t('giftCards.fillInfo'));
      return;
    }

    setIsPurchasing(true);

    const code = `LUXE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const token = localStorage.getItem('token');
    fetch('/api/gift-cards', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code,
        amount: activeAmount,
        designId: selectedDesign,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        senderName: senderName.trim(),
        message: message.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGeneratedCode(code);
          toast.success(t('giftCards.created'));
        } else {
          toast.error(data.message || t('giftCards.error'));
        }
      })
      .catch(err => {
        console.error('Gift card creation error:', err);
        toast.error(t('giftCards.error'));
      })
      .finally(() => {
        setIsPurchasing(false);
      });
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success(t('giftCards.codeCopied'));
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] pt-24 pb-16">
      <SEO
        title="Sovg'a kartalari | Luxx.uz"
        description="Luxx.uz sovg'a kartalari - sevgan insoningizga premium kiyim sovg'a qiling."
        canonicalPath="/gift-cards"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#d6b47c]/10 border border-[#d6b47c]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d6b47c] mb-4">
            <Gift className="w-4 h-4" />
            {t('giftCards.title')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f4f1eb]">
            {t('giftCards.premiumGift')} <span className="text-[#d6b47c]">{t('giftCards.card')}</span>
          </h1>
          <p className="text-[#9aa3b2] mt-3 max-w-lg mx-auto">
            {t('giftCards.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Configuration */}
          <div className="space-y-6">
            {/* Amount Selection */}
            <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2] mb-3">{t('giftCards.selectAmount')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {GIFT_CARD_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                    className={`rounded-xl p-3 text-center transition-all ${
                      selectedAmount === amount && !customAmount
                        ? 'bg-[#d6b47c]/15 border border-[#d6b47c]/30 text-[#f4f1eb]'
                        : 'bg-white/[0.03] border border-white/10 text-[#9aa3b2] hover:bg-white/[0.06]'
                    }`}
                  >
                    <p className="text-sm font-bold">{formatPrice(amount)}</p>
                    <p className="text-[10px]">so'm</p>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t('giftCards.customAmount')}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c] transition-colors"
                />
              </div>
            </div>

            {/* Design Selection */}
            <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2] mb-3">{t('giftCards.selectDesign')}</h3>
              <div className="grid grid-cols-4 gap-2">
                {CARD_DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design.id)}
                    className={`rounded-xl p-2 transition-all ${
                      selectedDesign === design.id
                        ? 'ring-2 ring-[#d6b47c] ring-offset-2 ring-offset-[#11131e]'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <div className={`h-12 rounded-lg bg-gradient-to-br ${design.gradient} flex items-center justify-center`}>
                      <Gift className={`w-5 h-5 ${design.textColor}`} />
                    </div>
                    <p className="text-[10px] text-[#9aa3b2] mt-1 text-center">{t(design.nameKey)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Info */}
            <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2]">{t('giftCards.sendTo')}</h3>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t('giftCards.recipientName')}
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
              />
              <input
                type="tel"
                value={recipientPhone}
                onChange={handleRecipientPhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
              />
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('giftCards.senderName')}
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('giftCards.message')}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] placeholder:text-[#6f7c90] outline-none focus:border-[#d6b47c]"
              />
            </div>
          </div>

          {/* Right - Preview & Purchase */}
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="sticky top-24">
              <div className={`rounded-[2rem] bg-gradient-to-br ${activeDesign?.gradient || 'from-[#d6b47c] to-[#a67c52]'} p-6 sm:p-8 shadow-[0_24px_48px_rgba(0,0,0,0.5)] aspect-[1.6/1] flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 blur-2xl" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.2em] ${activeDesign?.textColor || 'text-[#0f1014]'} opacity-70`}>Luxx.uz</p>
                    <p className={`text-lg font-semibold ${activeDesign?.textColor || 'text-[#0f1014]'} mt-1`}>{t('giftCards.title')}</p>
                  </div>
                  <Gift className={`w-8 h-8 ${activeDesign?.textColor || 'text-[#0f1014]'} opacity-50`} />
                </div>

                <div className="relative z-10">
                  <p className={`text-4xl sm:text-5xl font-bold ${activeDesign?.textColor || 'text-[#0f1014]'}`}>
                    {formatPrice(activeAmount)} <span className="text-lg">so'm</span>
                  </p>
                  {recipientName && (
                    <p className={`text-sm mt-2 ${activeDesign?.textColor || 'text-[#0f1014]'} opacity-70`}>
                      {recipientName} uchun
                    </p>
                  )}
                  {message && (
                    <p className={`text-xs mt-1 ${activeDesign?.textColor || 'text-[#0f1014]'} opacity-50 italic line-clamp-1`}>
                      "{message}"
                    </p>
                  )}
                </div>
              </div>

              {/* Purchase Button */}
              {!generatedCode ? (
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f4f1eb] px-6 py-4 text-base font-semibold text-[#0f1014] transition-all hover:bg-white active:scale-[0.98] disabled:opacity-60"
                >
                  {isPurchasing ? (
                    <span>{t('giftCards.processing')}</span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {t('giftCards.purchase')} — {formatPrice(activeAmount)} so'm
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
                  <p className="text-sm text-emerald-400 mb-2">{t('giftCards.cardReady')}</p>
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-[#0d1423] px-4 py-3">
                    <code className="text-lg font-bold text-[#f4f1eb] tracking-wider">{generatedCode}</code>
                    <button onClick={copyCode} className="text-[#9aa3b2] hover:text-[#f4f1eb] transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#9aa3b2] mt-2">
                    {t('giftCards.useCodeHint')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;
