import React, { useState, useMemo } from 'react';
import { CreditCard, ChevronDown, ChevronUp, Calculator, Check, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

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

const InstallmentContent = ({ price }) => {
  const [selectedProvider, setSelectedProvider] = useState('uzum');
  const [selectedMonths, setSelectedMonths] = useState(12);

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
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProvider(p.id);
              setSelectedMonths(p.months[0]);
            }}
            className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
              selectedProvider === p.id
                ? 'border border-[#c9a96e]/30 bg-[#c9a96e]/5'
                : 'border border-[rgba(255,255,255,0.08)] bg-[#1c1c1f] hover:bg-[#252529]'
            }`}
          >
            <span className="text-xl">{p.logo}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${selectedProvider === p.id ? 'text-[#f5f5f3]' : 'text-[#8a8a8d]'}`}>
                {p.name}
              </p>
              <p className="text-[10px] text-[#6b6b6e] truncate">{p.description}</p>
            </div>
            {selectedProvider === p.id && (
              <Check className="h-4 w-4 text-[#c9a96e] flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {provider && (
        <div className="flex gap-2">
          {provider.months.map((months) => {
            const rate = provider.interestRates[months] || 0;
            return (
              <button
                key={months}
                onClick={() => setSelectedMonths(months)}
                className={`flex-1 rounded-xl p-3 text-center transition-all ${
                  selectedMonths === months
                    ? 'border border-[#c9a96e]/30 bg-[#c9a96e]/5'
                    : 'border border-[rgba(255,255,255,0.08)] bg-[#1c1c1f] hover:bg-[#252529]'
                }`}
              >
                <p className={`text-lg font-bold ${selectedMonths === months ? 'text-[#f5f5f3]' : 'text-[#8a8a8d]'}`}>
                  {months}
                </p>
                <p className="text-[10px] text-[#6b6b6e]">oy</p>
                {rate === 0 ? (
                  <span className="inline-block mt-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    0% foiz
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-[9px] text-[#6b6b6e]">
                    {rate}% foiz
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {calculation && (
        <div className="rounded-xl bg-gradient-to-r from-[#c9a96e]/10 to-transparent border border-[#c9a96e]/20 p-4">
          {!calculation.isEligible ? (
            <p className="text-sm text-amber-400">
              ⚠️ {t('installment.minAmount')}: {formatPrice(provider.minAmount)} {t('common.sum')}
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#f5f5f3]">
                  {formatPrice(calculation.monthlyPayment)}
                </span>
                <span className="text-sm text-[#8a8a8d] pb-1">{t('common.sum')} / {t('installment.perMonth')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#1c1c1f] p-2.5">
                  <p className="text-[10px] text-[#6b6b6e]">Umumiy summa</p>
                  <p className="text-sm font-semibold text-[#f5f5f3]">
                    {formatPrice(calculation.totalWithInterest)} {t('common.sum')}
                  </p>
                </div>
                <div className="rounded-lg bg-[#1c1c1f] p-2.5">
                  <p className="text-[10px] text-[#6b6b6e]">Foiz</p>
                  <p className={`text-sm font-semibold ${calculation.totalInterest > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {calculation.totalInterest > 0 ? `+${formatPrice(calculation.totalInterest)}` : '0'} {t('common.sum')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-[#6b6b6e] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#6b6b6e] leading-relaxed">
                  {t('installment.selectAtCheckout')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InstallmentBar = ({ price }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!price || price < 50000) return null;

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141416] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#1c1c1f] transition-colors"
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#c9a96e]" />
          <span className="text-sm text-[#f5f5f3]">Bo'lib to'lash</span>
          <span className="text-xs text-[#6b6b6e]">
            {formatPrice(Math.ceil(price / 12))} {t('common.sum')} / {t('installment.perMonth')}
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-[#8a8a8d]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#8a8a8d]" />
        )}
      </button>

      <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <InstallmentContent price={price} />
      </div>
    </div>
  );
};

export default InstallmentBar;
