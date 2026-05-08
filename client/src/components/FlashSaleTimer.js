import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, ChevronDown } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const TimeBlock = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
      <span className="text-xl font-black text-[#f5f5f3] tabular-nums">{String(value).padStart(2, '0')}</span>
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8a8a8d] mt-2">{label}</span>
  </div>
);

const FlashSaleTimer = ({ endTime, originalPrice, salePrice, totalStock, soldCount, productName }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
  const timeString = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  return (
    <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.06] to-transparent overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-red-500/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-red-500/20 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-red-500 fill-current" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400">Flash Sale</span>
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black tracking-wider">
              -{discountPercent}%
            </span>
          )}
          <span className="text-[11px] font-bold text-[#f5f5f3] tabular-nums tracking-wider">{timeString}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-red-400/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-red-500/10" />
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-center gap-4">
            <TimeBlock value={timeLeft.hours} label="soat" />
            <span className="text-2xl font-black text-red-500/40 mt-[-24px] animate-pulse">:</span>
            <TimeBlock value={timeLeft.minutes} label="daq" />
            <span className="text-2xl font-black text-red-500/40 mt-[-24px] animate-pulse">:</span>
            <TimeBlock value={timeLeft.seconds} label="son" />
          </div>

          {totalStock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Faqat {remaining} ta qoldi
                </span>
                <span className="text-[#8a8a8d]">{soldCount} / {totalStock} sotildi</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%] animate-shimmer transition-all duration-1000"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashSaleTimer;
