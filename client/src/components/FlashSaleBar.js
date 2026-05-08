import React, { useState, useEffect } from 'react';
import { Clock, Zap, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const formatPrice = (value) => {
  if (typeof value !== 'number') return '0';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const TimeBlock = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#0f1014] border border-red-500/20">
      <span className="text-base sm:text-lg font-bold text-[#f4f1eb]">{String(value).padStart(2, '0')}</span>
    </div>
    <span className="text-[9px] uppercase tracking-wider text-[#9aa3b2] mt-1">{label}</span>
  </div>
);

const FlashSaleTimerFull = ({ endTime, originalPrice, salePrice, totalStock, soldCount }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) return null;

  const discountPercent = originalPrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  const soldPercent = totalStock ? Math.round((soldCount / totalStock) * 100) : 0;
  const remaining = totalStock - soldCount;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 text-red-400" />
        <TimeBlock value={timeLeft.hours} label="soat" />
        <span className="text-xl font-bold text-red-400 mt-[-8px]">:</span>
        <TimeBlock value={timeLeft.minutes} label="daq" />
        <span className="text-xl font-bold text-red-400 mt-[-8px]">:</span>
        <TimeBlock value={timeLeft.seconds} label="son" />
      </div>

      <div className="flex items-end justify-center gap-3">
        <span className="text-2xl font-bold text-[#f4f1eb]">{formatPrice(salePrice)} {t('common.sum')}</span>
        {originalPrice && originalPrice > salePrice && (
          <span className="text-sm text-[#9aa3b2] line-through">{formatPrice(originalPrice)} {t('common.sum')}</span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
          -{discountPercent}%
        </span>
      </div>

      {totalStock > 0 && (
        <div className="space-y-1.5">
          <div className="h-2 bg-[#0f1014] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-red-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Faqat {remaining} ta qoldi
            </span>
            <span className="text-[#9aa3b2]">{soldCount} / {totalStock} sotilgan</span>
          </div>
        </div>
      )}
    </div>
  );
};

const FlashSaleBar = ({ originalPrice, salePrice, stock, endTime, soldCount }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!originalPrice || originalPrice <= salePrice) return null;

  const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

  return (
    <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-red-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-red-400 fill-current" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Flash Sale</span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
            -{discountPercent}%
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isExpanded && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Tugaydi: {endTime && new Date(endTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-red-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-red-400" />
          )}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <FlashSaleTimerFull
          endTime={endTime}
          originalPrice={originalPrice}
          salePrice={salePrice}
          totalStock={stock}
          soldCount={soldCount || Math.floor(Math.random() * 7) + 3}
        />
      </div>
    </div>
  );
};

export default FlashSaleBar;
