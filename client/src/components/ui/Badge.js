import React from 'react';

const variants = {
  default: 'bg-[#1c1c1f] text-[#8a8a8d] border border-[rgba(255,255,255,0.08)]',
  accent: 'bg-[rgba(201,169,110,0.12)] text-[#c9a96e] border border-[rgba(201,169,110,0.2)]',
  success: 'bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[rgba(74,222,128,0.2)]',
  warning: 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border border-[rgba(251,191,36,0.2)]',
  error: 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-[11px] font-medium uppercase tracking-[0.05em]
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
