import React, { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PROVIDERS = [
  {
    id: 'uzum',
    name: 'Uzum Bo\'lib To\'lash',
    logo: '💜',
    months: [3, 6, 12],
    minAmount: 50000,
    interestRates: { 3: 0, 6: 5, 12: 10 },
    color: '#7c3aed',
    description: 'Uzum Pay orqali 0% gacha foiz bilan',
  },
  {
    id: 'zoloto',
    name: 'Zoloto',
    logo: '🟡',
    months: [3, 6, 12],
    minAmount: 30000,
    interestRates: { 3: 3, 6: 7, 12: 14 },
    color: '#d4a017',
    description: 'Zoloto nasiya kartasi orqali',
  },
  {
    id: 'humo',
    name: 'Humo Nasiya',
    logo: '🔵',
    months: [3, 6, 12],
    minAmount: 100000,
    interestRates: { 3: 0, 6: 4, 12: 8 },
    color: '#2563eb',
    description: 'Humo nasiya xizmati orqali',
  },
];

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const InstallmentCalculator = ({ price, isOpen: initialOpen = false }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedProvider, setSelectedProvider] = useState('uzum');
  const [selectedMonths, setSelectedMonths] = useState(3);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);

  const calculation = useMemo(() => {
    if (!provider || !price) return null;

    const interestRate = provider.interestRates[selectedMonths] || 0;
    const totalWithInterest = price + (price * interestRate) / 100;
    const monthlyPayment = Math.ceil(totalWithInterest / selectedMonths);
    const totalInterest = (price * interestRate) / 100;

    return {
      monthlyPayment,
      totalWithInterest,
      totalInterest,
      interestRate,
      isEligible: price >= provider.minAmount,
    };
  }, [price, selectedProvider, selectedMonths, provider]);

  if (!price || price < 30000) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a96e]/10 border border-[#c9a96e]/20">
            <Calculator className="h-4 w-4 text-[#c9a96e]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#f5f5f3] uppercase tracking-wider">Bo'lib to'lash</p>
            <p className="text-[10px] text-[#8a8a8d] font-medium">
              {formatPrice(Math.ceil(price / 3))} {t('common.sum')} / {t('installment.perMonth')}
            </p>
          </div>
        </div>
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
           <ChevronDown className="h-3.5 w-3.5 text-[#8a8a8d]" />
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-6 space-y-6 animate-fade-in">
          {/* Provider Selection */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a8a8d]">Hamkorlarimiz</p>
            <div className="grid grid-cols-1 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProvider(p.id);
                    setSelectedMonths(p.months[0]);
                  }}
                  className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
                    selectedProvider === p.id
                      ? 'border border-[#c9a96e]/30 bg-[#c9a96e]/5 ring-1 ring-[#c9a96e]/20'
                      : 'border border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-2xl grayscale brightness-125">{p.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold tracking-wide ${selectedProvider === p.id ? 'text-[#f5f5f3]' : 'text-[#8a8a8d]'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] text-[#8a8a8d] font-medium truncate">{p.description}</p>
                  </div>
                  {selectedProvider === p.id && (
                    <div className="h-5 w-5 rounded-full bg-[#c9a96e] flex items-center justify-center">
                      <Check className="h-3 w-3 text-[#0a0a0b]" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          {provider && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a8a8d]">To'lov muddati</p>
              <div className="flex gap-2">
                {provider.months.map((months) => {
                  const rate = provider.interestRates[months] || 0;
                  return (
                    <button
                      key={months}
                      onClick={() => setSelectedMonths(months)}
                      className={`flex-1 rounded-xl p-4 text-center transition-all duration-300 ${
                        selectedMonths === months
                          ? 'border border-[#c9a96e]/30 bg-[#f5f5f3]'
                          : 'border border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                      }`}
                    >
                      <p className={`text-lg font-black ${selectedMonths === months ? 'text-[#0a0a0b]' : 'text-[#f5f5f3]'}`}>
                        {months}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedMonths === months ? 'text-[#0a0a0b]/60' : 'text-[#8a8a8d]'}`}>oy</p>
                      {rate === 0 ? (
                        <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${selectedMonths === months ? 'bg-[#c9a96e]/20 text-[#c9a96e]' : 'bg-green-500/10 text-green-500'}`}>
                          0% Komissiya
                        </span>
                      ) : (
                        <span className={`inline-block mt-2 text-[9px] font-bold ${selectedMonths === months ? 'text-[#0a0a0b]/40' : 'text-[#8a8a8d]'}`}>
                          {rate}% ustama
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Calculation Result */}
          {calculation && (
            <div className="rounded-2xl bg-[#c9a96e] p-6 shadow-[0_12px_24px_rgba(201,169,110,0.2)]">
              {!calculation.isEligible ? (
                <p className="text-sm font-bold text-[#0a0a0b] flex items-center gap-2">
                  <span>⚠️</span> {t('installment.minAmount')}: {formatPrice(provider.minAmount)} {t('common.sum')}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0a0b]/60 mb-1">Oylik to'lov</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#0a0a0b] tracking-tight">
                        {formatPrice(calculation.monthlyPayment)}
                      </span>
                      <span className="text-sm font-bold text-[#0a0a0b]/60 pb-1">{t('common.sum')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#0a0a0b]/5 p-3 border border-[#0a0a0b]/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#0a0a0b]/50 mb-1">Jami summa</p>
                      <p className="text-sm font-black text-[#0a0a0b]">
                        {formatPrice(calculation.totalWithInterest)} {t('common.sum')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#0a0a0b]/5 p-3 border border-[#0a0a0b]/5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#0a0a0b]/50 mb-1">Xizmat haqi</p>
                      <p className={`text-sm font-black ${calculation.totalInterest > 0 ? 'text-[#0a0a0b]' : 'text-[#0a0a0b]'}`}>
                        {calculation.totalInterest > 0 ? `+${formatPrice(calculation.totalInterest)}` : '0'} {t('common.sum')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Info className="h-4 w-4 text-[#0a0a0b]/40 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] font-medium text-[#0a0a0b]/70 leading-relaxed">
                      To'lov shartlari provayder tomonidan buyurtmani tasdiqlash vaqtida belgilanadi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstallmentCalculator;
