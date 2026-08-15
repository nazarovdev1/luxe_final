import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Gift, Heart, LockKeyhole, Phone, Send, Sparkles, UserRound } from 'lucide-react';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import GiftCardSvg from '../components/GiftCardSvg';
import { GIFT_CARD_DESIGNS, getGiftCardDesign } from '../data/giftCardDesigns';
import './GiftCards.css';

const GIFT_CARD_AMOUNTS = [100000, 200000, 300000, 500000, 750000, 1000000];
const formatPrice = (value) => Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

  const activeAmount = customAmount ? Number(getDigits(customAmount)) : selectedAmount;
  const activeDesign = useMemo(() => getGiftCardDesign(selectedDesign), [selectedDesign]);

  const handleCustomAmountChange = (event) => {
    const digits = getDigits(event.target.value).slice(0, 9);
    setCustomAmount(digits ? formatPrice(digits) : '');
  };

  const handleRecipientPhoneChange = (event) => {
    const value = event.target.value;
    if (value.startsWith('+998')) setRecipientPhone(`+998${value.slice(4).replace(/\D/g, '').slice(0, 9)}`);
    else if (value.length < 4) setRecipientPhone('+998');
  };

  const handlePurchase = () => {
    if (!isAuthenticated) return toast.error(t('giftCards.loginRequired'));
    if (activeAmount < 50000) return toast.error(t('giftCards.minAmount'));
    if (!recipientName.trim() || recipientPhone.length < 13) return toast.error(t('giftCards.fillInfo'));

    setIsPurchasing(true);
    const code = `LUXE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    fetch('/api/gift-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ code, amount: activeAmount, designId: selectedDesign, recipientName: recipientName.trim(), recipientPhone: recipientPhone.trim(), senderName: senderName.trim(), message: message.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) { setGeneratedCode(code); toast.success(t('giftCards.created')); }
        else toast.error(data.message || t('giftCards.error'));
      })
      .catch(() => toast.error(t('giftCards.error')))
      .finally(() => setIsPurchasing(false));
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    toast.success(t('giftCards.codeCopied'));
  };

  return (
    <main className="gift-atelier">
      <SEO title="Sovg'a kartalari | Luxx.uz" description="Luxx.uz sovg'a kartalari - sevgan insoningizga premium kiyim sovg'a qiling." canonicalPath="/gift-cards" />
      <div className="gift-atelier__glow gift-atelier__glow--one" /><div className="gift-atelier__glow gift-atelier__glow--two" />

      <section className="gift-atelier__hero">
        <div className="gift-atelier__eyebrow"><Gift size={14} /> LUXX GIFT ATELIER</div>
        <span className="gift-atelier__edition">EDITION / 2026</span>
        <h1>Unutilmas <em>sovg‘a</em><br />bir lahzadan boshlanadi.</h1>
        <p>Uning didiga mos keladigan tanlov erkinligini bering. LUXX sovg‘a kartasi — nozik e’tibor, erkin tanlov.</p>
        <div className="gift-atelier__promises"><span><Heart size={14} /> Bir lahzada yuboriladi</span><span><LockKeyhole size={14} /> Xavfsiz to‘lov</span></div>
      </section>

      <section className="gift-atelier__workspace">
        <div className="gift-atelier__form">
          <div className="gift-step"><span>01</span><div><p>QIYMATNI TANLANG</p><h2>Unga qancha erkinlik hadya qilasiz?</h2></div></div>
          <div className="gift-amounts">
            {GIFT_CARD_AMOUNTS.map((amount) => <button type="button" key={amount} onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }} className={selectedAmount === amount && !customAmount ? 'is-selected' : ''}><b>{formatPrice(amount)}</b><small>SO‘M</small></button>)}
          </div>
          <label className="gift-field gift-field--amount"><span>YOKI O‘Z QIYMATINGIZNI KIRITING</span><input type="text" inputMode="numeric" value={customAmount} onChange={handleCustomAmountChange} placeholder="Masalan: 1.500.000" /><i>SO‘M</i></label>

          <div className="gift-step gift-step--spaced"><span>02</span><div><p>KARTA KAYFIYATI</p><h2>Har sovg‘aning o‘z ohangi bor.</h2></div></div>
          <div className="gift-designs">
            {GIFT_CARD_DESIGNS.map((design, index) => <button type="button" key={design.id} onClick={() => setSelectedDesign(design.id)} className={selectedDesign === design.id ? 'is-selected' : ''} aria-pressed={selectedDesign === design.id}>
              <span className="gift-designs__number">0{index + 1}</span><GiftCardSvg design={design} amount={300000} recipientName="" compact /><b>{design.name}</b>
            </button>)}
          </div>

          <div className="gift-step gift-step--spaced"><span>03</span><div><p>KIM UCHUN?</p><h2>Sovg‘angizni shaxsiy qiling.</h2></div></div>
          <div className="gift-recipient">
            <label className="gift-field"><span>OLUVCHI ISMI</span><UserRound size={15} /><input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder={t('giftCards.recipientName')} /></label>
            <label className="gift-field"><span>TELEFON RAQAMI</span><Phone size={15} /><input type="tel" value={recipientPhone} onChange={handleRecipientPhoneChange} placeholder="+998 90 123 45 67" /></label>
            <label className="gift-field"><span>SIZNING ISMINGIZ <i>(ixtiyoriy)</i></span><input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder={t('giftCards.senderName')} /></label>
            <label className="gift-field gift-field--message"><span>QISQA TILAK <i>(ixtiyoriy)</i></span><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('giftCards.message')} rows={3} /></label>
          </div>
        </div>

        <aside className="gift-preview">
          <div className="gift-preview__top"><span>LIVE PREVIEW</span><span>{activeDesign.name}</span></div>
          <div className="gift-preview__card"><GiftCardSvg design={activeDesign} amount={activeAmount} recipientName={recipientName} message={message} /></div>
          <p className="gift-preview__recipient">{recipientName ? `Aziz ${recipientName}, siz uchun.` : 'Kimnidir xursand qilishga tayyormisiz?'}</p>
          {!generatedCode ? <button type="button" onClick={handlePurchase} disabled={isPurchasing} className="gift-preview__purchase"><span>{isPurchasing ? t('giftCards.processing') : 'SOVG‘A KARTASINI OLISH'}</span><b>{formatPrice(activeAmount)} SO‘M</b><ArrowRight size={19} /></button> : (
            <div className="gift-preview__complete"><Check size={21} /><span>KARTANGIZ TAYYOR</span><code>{generatedCode}</code><button type="button" onClick={copyCode}><Copy size={14} /> Kodni nusxalash</button></div>
          )}
          <div className="gift-preview__fine"><Sparkles size={14} /> Karta kodi xariddan so‘ng sizga va oluvchiga yetkaziladi.</div>
        </aside>
      </section>
    </main>
  );
};

export default GiftCards;
