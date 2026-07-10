import React, { useState } from 'react';
import { Gift, Copy, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import GiftCardSvg from '../components/GiftCardSvg';
import { GIFT_CARD_DESIGNS, getGiftCardDesign } from '../data/giftCardDesigns';

const GIFT_CARD_AMOUNTS = [100000, 200000, 300000, 500000, 750000, 1000000];

const formatPrice = (value) => {
  return Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getDigits = (value) => value.toString().replace(/\D/g, '');

const GiftCards = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(300000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDesign, setSelectedDesign] = useState(GIFT_CARD_DESIGNS[0].id);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+998');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  const customAmountValue = customAmount ? Number(getDigits(customAmount)) : 0;
  const activeAmount = customAmount ? customAmountValue : selectedAmount;
  const activeDesign = getGiftCardDesign(selectedDesign);

  const handleCustomAmountChange = (e) => {
    const digits = getDigits(e.target.value).slice(0, 9);
    setCustomAmount(digits ? formatPrice(digits) : '');
  };

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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d6b47c]/20 bg-[#d6b47c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#d6b47c]">
            <Gift className="h-4 w-4" />
            {t('giftCards.title')}
          </div>
          <h1 className="text-3xl font-semibold text-[#f4f1eb] sm:text-4xl">
            {t('giftCards.premiumGift')} <span className="text-[#d6b47c]">{t('giftCards.card')}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[#9aa3b2]">
            {t('giftCards.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2]">{t('giftCards.selectAmount')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {GIFT_CARD_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      selectedAmount === amount && !customAmount
                        ? 'border-[#d6b47c]/40 bg-[#d6b47c]/15 text-[#f4f1eb] shadow-[0_10px_24px_rgba(214,180,124,0.12)]'
                        : 'border-white/10 bg-white/[0.03] text-[#9aa3b2] hover:bg-white/[0.06]'
                    }`}
                  >
                    <p className="text-sm font-bold">{formatPrice(amount)}</p>
                    <p className="text-[10px]">so'm</p>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder={t('giftCards.customAmount')}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] outline-none transition-colors placeholder:text-[#6f7c90] focus:border-[#d6b47c]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#11131e]/95 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2]">{t('giftCards.selectDesign')}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
                {GIFT_CARD_DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design.id)}
                    className={`rounded-2xl p-1.5 transition-all ${
                      selectedDesign === design.id
                        ? 'bg-[#d6b47c] shadow-[0_0_0_3px_rgba(214,180,124,0.18)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08]'
                    }`}
                    title={design.name}
                  >
                    <div className="relative aspect-[1.6/1] overflow-hidden rounded-xl">
                      <GiftCardSvg
                        design={design}
                        amount={1000000}
                        recipientName="Luxx"
                        compact
                        className="h-full w-full"
                      />
                    </div>
                    <p className={`mt-1 truncate text-center text-[10px] ${selectedDesign === design.id ? 'text-[#0f1014]' : 'text-[#9aa3b2]'}`}>
                      {design.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#11131e]/95 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9aa3b2]">{t('giftCards.sendTo')}</h3>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={t('giftCards.recipientName')}
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] outline-none placeholder:text-[#6f7c90] focus:border-[#d6b47c]"
              />
              <input
                type="tel"
                value={recipientPhone}
                onChange={handleRecipientPhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] outline-none placeholder:text-[#6f7c90] focus:border-[#d6b47c]"
              />
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={t('giftCards.senderName')}
                className="w-full rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] outline-none placeholder:text-[#6f7c90] focus:border-[#d6b47c]"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('giftCards.message')}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0d1423] px-4 py-2.5 text-sm text-[#f4f1eb] outline-none placeholder:text-[#6f7c90] focus:border-[#d6b47c]"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-24">
              <GiftCardSvg
                design={activeDesign}
                amount={activeAmount}
                recipientName={recipientName}
                message={message}
                className="h-auto w-full drop-shadow-[0_28px_70px_rgba(0,0,0,0.55)]"
              />

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
                      <Sparkles className="h-5 w-5" />
                      {t('giftCards.purchase')} - {formatPrice(activeAmount)} so'm
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
                  <p className="mb-2 text-sm text-emerald-400">{t('giftCards.cardReady')}</p>
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-[#0d1423] px-4 py-3">
                    <code className="text-lg font-bold tracking-wider text-[#f4f1eb]">{generatedCode}</code>
                    <button onClick={copyCode} className="text-[#9aa3b2] transition-colors hover:text-[#f4f1eb]">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#9aa3b2]">
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
