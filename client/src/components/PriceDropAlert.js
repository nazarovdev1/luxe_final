import React, { useState } from 'react';
import { Bell, BellRing, TrendingDown, X, CheckCircle, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PriceDropAlert = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [notifyMethod, setNotifyMethod] = useState('sms'); // sms | push | telegram
  const [submitted, setSubmitted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t } = useLanguage();

  const currentPrice = Number(product.price || product.salePrice || 0);
  const suggestedTarget = Math.round(currentPrice * 0.85 / 1000) * 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubscribed(true);

    // In production, this would call an API:
    // await axios.post('/api/price-alerts', {
    //   productId: product._id,
    //   currentPrice,
    //   targetPrice: targetPrice ? Number(targetPrice) : suggestedTarget,
    //   phone,
    //   notifyMethod
    // });
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    setSubmitted(false);
    // await axios.delete(`/api/price-alerts/${product._id}`);
  };

  // If already subscribed, show active state
  if (isSubscribed && !isOpen) {
    return (
      <button
        onClick={handleUnsubscribe}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all group"
        title="Obunani bekor qilish"
      >
        <BellRing className="w-4 h-4 group-hover:hidden" />
        <Bell className="w-4 h-4 hidden group-hover:block" />
        <span className="group-hover:hidden">{t('priceDropAlert.tracking')}</span>
        <span className="hidden group-hover:inline">{t('priceDropAlert.cancel')}</span>
      </button>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 text-[#d6b47c] text-sm font-medium hover:bg-[#d6b47c]/20 hover:border-[#d6b47c]/30 transition-all"
      >
        <TrendingDown className="w-4 h-4" />
        {t('priceDropAlert.subtitle')}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#11131e] to-[#0d0f18] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-[#d6b47c]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f4f1eb]">{t('priceDropAlert.title')}</h3>
                  <p className="text-[11px] text-[#9aa3b2]">{t('priceDropAlert.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              /* Success State */
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-semibold text-[#f4f1eb] mb-2">{t('priceDropAlert.activated')}</h4>
                <p className="text-sm text-[#9aa3b2] mb-4">
                  {t('priceDrop.notifyWhen')} <span className="text-[#d6b47c] font-semibold">{(targetPrice ? Number(targetPrice) : suggestedTarget).toLocaleString()} {t('common.sum')}</span> {t('priceDrop.fallsTo')}
                </p>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-5">
                  <div className="flex items-center gap-2 text-xs text-[#9aa3b2]">
                    <span className="text-lg">📊</span>
                    <div className="text-left">
                      <p className="text-[#f4f1eb] font-medium">{product.name?.slice(0, 40)}{product.name?.length > 40 ? '...' : ''}</p>
                      <p className="mt-0.5">{t('priceDropAlert.currentPrice')}: {currentPrice.toLocaleString()} {t('common.sum')}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSubscribed(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#d6b47c] text-black font-semibold text-sm hover:bg-[#c9a46d] transition-colors"
                >
                  Tushundim
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Product Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  {product.images?.[0]?.url && (
                    <img src={product.images[0].url} alt="" className="w-12 h-14 rounded-lg object-cover border border-white/5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f4f1eb] truncate">{product.name}</p>
                    <p className="text-xs text-[#9aa3b2]">{t('priceDropAlert.currentPrice')}: <span className="text-[#d6b47c] font-semibold">{currentPrice.toLocaleString()} {t('common.sum')}</span></p>
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <label className="text-xs text-[#9aa3b2] mb-2 block">{t('priceDropAlert.targetPrice')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={suggestedTarget.toLocaleString()}
                      className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9aa3b2]">{t('common.sum')}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[0.9, 0.85, 0.8, 0.7].map((pct) => {
                      const price = Math.round(currentPrice * pct / 1000) * 1000;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTargetPrice(price.toString())}
                          className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                            targetPrice === price.toString()
                              ? 'bg-[#d6b47c]/10 border-[#d6b47c]/30 text-[#d6b47c]'
                              : 'bg-white/[0.02] border-white/5 text-[#9aa3b2] hover:border-white/10'
                          }`}
                        >
                          -{Math.round((1 - pct) * 100)}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notify Method */}
                <div>
                  <label className="text-xs text-[#9aa3b2] mb-2 block">{t('priceDropAlert.notifyMethod')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'sms', label: 'SMS', icon: '📱' },
                      { value: 'telegram', label: 'Telegram', icon: '✈️' },
                      { value: 'push', label: 'Push', icon: '🔔' },
                    ].map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setNotifyMethod(m.value)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          notifyMethod === m.value
                            ? 'bg-[#d6b47c]/5 border-[#d6b47c]/30'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className="text-lg block mb-1">{m.icon}</span>
                        <span className={`text-xs font-medium ${notifyMethod === m.value ? 'text-[#d6b47c]' : 'text-[#9aa3b2]'}`}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone (for SMS/Telegram) */}
                {(notifyMethod === 'sms' || notifyMethod === 'telegram') && (
                  <div>
                    <label className="text-xs text-[#9aa3b2] mb-2 block">{t('priceDropAlert.phoneNumber')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f4658]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        required
                        className="w-full p-3.5 pl-11 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[#3f4658] focus:outline-none focus:border-[#d6b47c]/30"
                      />
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="rounded-xl bg-[#d6b47c]/5 border border-[#d6b47c]/20 p-3">
                  <p className="text-[11px] text-[#9aa3b2]">
                    {t('priceDropAlert.tip')}
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#d6b47c] text-black font-semibold text-sm hover:bg-[#c9a46d] transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Kuzatishni yoqish
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceDropAlert;
