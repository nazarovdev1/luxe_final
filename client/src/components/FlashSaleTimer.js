import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle } from 'lucide-react';

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const TimeBlock = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#0f1014] border border-white/10">
      <span className="text-lg sm:text-xl font-bold text-[#f4f1eb]">{String(value).padStart(2, '0')}</span>
    </div>
    <span className="text-[9px] uppercase tracking-wider text-[#9aa3b2] mt-1">{label}</span>
  </div>
);

const FlashSaleTimer = ({ endTime, originalPrice, salePrice, totalStock, soldCount, productName }) => {
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
    <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/5 via-[#11131e]/95 to-red-500/5 overflow-hidden">
      {/* Flash Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-400 fill-current" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-300">Flash Sale</span>
        </div>
        {discountPercent > 0 && (
          <span className="text-xs font-bold text-red-300">-{discountPercent}%</span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-red-400 mr-1" />
          <TimeBlock value={timeLeft.hours} label="soat" />
          <span className="text-xl font-bold text-red-400 mt-[-12px]">:</span>
          <TimeBlock value={timeLeft.minutes} label="daq" />
          <span className="text-xl font-bold text-red-400 mt-[-12px]">:</span>
          <TimeBlock value={timeLeft.seconds} label="son" />
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-center gap-3">
          <span className="text-2xl font-bold text-[#f4f1eb]">{formatPrice(salePrice)} so'm</span>
          {originalPrice && originalPrice > salePrice && (
            <span className="text-sm text-[#9aa3b2] line-through">{formatPrice(originalPrice)} so'm</span>
          )}
        </div>

        {/* Stock Progress */}
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
    </div>
  );
};

export default FlashSaleTimer;
