import React, { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info, Check } from 'lucide-react';

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
    <div className="rounded-2xl border border-white/10 bg-[#0d1423]/80 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d6b47c]/10 border border-[#d6b47c]/20">
            <Calculator className="h-4 w-4 text-[#d6b47c]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#f4f1eb]">Bo'lib to'lash</p>
            <p className="text-[11px] text-[#9aa3b2]">
              {formatPrice(Math.ceil(price / 3))} so'm dan boshlab / oyiga
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[#9aa3b2]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#9aa3b2]" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {/* Provider Selection */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9aa3b2]">Taqsimot turi</p>
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
                      ? 'border border-[#d6b47c]/30 bg-[#d6b47c]/5'
                      : 'border border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-xl">{p.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${selectedProvider === p.id ? 'text-[#f4f1eb]' : 'text-[#9aa3b2]'}`}>
                      {p.name}
                    </p>
                    <p className="text-[10px] text-[#9aa3b2] truncate">{p.description}</p>
                  </div>
                  {selectedProvider === p.id && (
                    <Check className="h-4 w-4 text-[#d6b47c] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Month Selection */}
          {provider && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.12em] text-[#9aa3b2]">Muddat</p>
              <div className="flex gap-2">
                {provider.months.map((months) => {
                  const rate = provider.interestRates[months] || 0;
                  return (
                    <button
                      key={months}
                      onClick={() => setSelectedMonths(months)}
                      className={`flex-1 rounded-xl p-3 text-center transition-all ${
                        selectedMonths === months
                          ? 'border border-[#d6b47c]/30 bg-[#d6b47c]/5'
                          : 'border border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <p className={`text-lg font-bold ${selectedMonths === months ? 'text-[#f4f1eb]' : 'text-[#9aa3b2]'}`}>
                        {months}
                      </p>
                      <p className="text-[10px] text-[#9aa3b2]">oy</p>
                      {rate === 0 ? (
                        <span className="inline-block mt-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                          0% foiz
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-[9px] text-[#9aa3b2]">
                          {rate}% foiz
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
            <div className="rounded-xl bg-gradient-to-r from-[#d6b47c]/10 to-transparent border border-[#d6b47c]/20 p-4">
              {!calculation.isEligible ? (
                <p className="text-sm text-amber-400">
                  ⚠️ Minimal summa: {formatPrice(provider.minAmount)} so'm
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-[#f4f1eb]">
                      {formatPrice(calculation.monthlyPayment)}
                    </span>
                    <span className="text-sm text-[#9aa3b2] pb-1">so'm / oyiga</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/[0.03] p-2.5">
                      <p className="text-[10px] text-[#9aa3b2]">Umumiy summa</p>
                      <p className="text-sm font-semibold text-[#f4f1eb]">
                        {formatPrice(calculation.totalWithInterest)} so'm
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] p-2.5">
                      <p className="text-[10px] text-[#9aa3b2]">Foiz</p>
                      <p className={`text-sm font-semibold ${calculation.totalInterest > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {calculation.totalInterest > 0 ? `+${formatPrice(calculation.totalInterest)}` : '0'} so'm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-[#9aa3b2] mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-[#9aa3b2] leading-relaxed">
                      Buyurtma berish sahifasida to'lov turini tanlashingiz mumkin. Haqiqiy shartlar to'lov tizimi tomonidan tasdiqlanadi.
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
