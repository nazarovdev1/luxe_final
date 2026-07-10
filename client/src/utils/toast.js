import React from 'react';
import toast from 'react-hot-toast';
import { Check, ShoppingBag, X } from 'lucide-react';

const formatQuantity = (quantity) => {
  const count = Number(quantity);
  if (!Number.isFinite(count) || count <= 0) return null;
  return `${count} DONA`;
};

export const showCartToast = ({
  title = "Savatga qo'shildi",
  itemName,
  meta,
  quantity,
  duration = 4200,
} = {}) => {
  const chipText = formatQuantity(quantity) || (meta ? String(meta).toUpperCase() : null);

  return toast.custom(
    (t) => (
      <div
        className={[
          'pointer-events-auto relative w-[calc(100vw-20px)] max-w-[360px] overflow-hidden',
          'rounded-[22px] border border-[#343a49] bg-[#0d111c]/95 text-white backdrop-blur-2xl',
          'will-change-transform',
        ].join(' ')}
        style={{
          boxShadow:
            '-10px 8px 28px rgba(20, 241, 171, 0.22), 0 14px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          background:
            'linear-gradient(135deg, rgba(12, 17, 29, 0.96) 0%, rgba(12, 15, 24, 0.94) 56%, rgba(8, 10, 17, 0.98) 100%)',
          animation: t.visible
            ? 'luxe-cart-toast-in 640ms cubic-bezier(0.16, 1, 0.3, 1) both'
            : 'luxe-cart-toast-out 220ms ease-in both',
        }}
      >
        <style>
          {`
            @keyframes luxe-cart-toast-in {
              0% {
                opacity: 0;
                transform: translate3d(26px, -8px, 0) scale(0.96);
                filter: blur(6px);
              }
              60% {
                opacity: 1;
                transform: translate3d(-2px, 0, 0) scale(1.01);
                filter: blur(0);
              }
              100% {
                opacity: 1;
                transform: translate3d(0, 0, 0) scale(1);
                filter: blur(0);
              }
            }

            @keyframes luxe-cart-toast-out {
              0% {
                opacity: 1;
                transform: translate3d(0, 0, 0) scale(1);
                filter: blur(0);
              }
              100% {
                opacity: 0;
                transform: translate3d(18px, -4px, 0) scale(0.97);
                filter: blur(3px);
              }
            }
          `}
        </style>
        <div className="absolute inset-0 rounded-[22px] border border-[#23f0aa]/70 [clip-path:polygon(0_0,43%_0,43%_100%,0_100%)]" />
        <div className="absolute -left-14 -top-14 h-28 w-28 rounded-full bg-[#19e79f]/18 blur-3xl" />
        <div className="relative flex min-h-[76px] items-center gap-3 px-4 py-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#24eba7]/24 bg-[#18e19d]/12 text-[#20eba7] shadow-[0_0_24px_rgba(24,225,157,0.18)]">
            <ShoppingBag className="h-6 w-6" strokeWidth={2.2} />
            <span className="absolute -right-1 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#25e6a1] shadow-[0_7px_14px_rgba(37,230,161,0.3)]">
              <Check className="h-3.5 w-3.5 text-[#07130f]" strokeWidth={3.4} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[17px] font-extrabold leading-6 text-white"
              style={{ textShadow: '0 2px 14px rgba(255, 255, 255, 0.12)' }}
            >
              {title}
            </p>
            {itemName && (
              <p className="mt-0.5 truncate text-[13px] leading-5 text-[#a8adbf]">
                {itemName}
              </p>
            )}
            {chipText && (
              <div className="mt-1.5 inline-flex h-6 items-center rounded-full border border-[#20e4a3]/30 bg-[#0f2b29]/78 px-3 text-[11px] font-extrabold uppercase leading-none text-[#23eba7] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {chipText}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3a4050] bg-[#111622]/72 text-[#c7cbda] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:border-[#23e8a5]/45 hover:bg-[#162033] hover:text-white"
            aria-label="Xabarni yopish"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    ),
    { duration, position: 'top-right' }
  );
};
