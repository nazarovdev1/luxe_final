import React from 'react';

export default function Card({
  children,
  className = '',
  elevated = false,
  padding = true,
  hover = false,
  ...props
}) {
  return (
    <div
      className={`
        bg-[#18181b] border border-[rgba(255,255,255,0.08)] rounded-[14px]
        ${padding ? 'p-4 sm:p-5' : ''}
        ${hover ? 'transition-all duration-250 hover:border-[rgba(255,255,255,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
