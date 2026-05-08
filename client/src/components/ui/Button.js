import React from 'react';

const variants = {
  primary: 'bg-[#f5f5f3] text-[#0a0a0b] hover:bg-white hover:-translate-y-0.5',
  secondary: 'bg-[#1c1c1f] text-[#f5f5f3] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#18181b]',
  accent: 'bg-[#c9a96e] text-[#0a0a0b] hover:bg-[#d4b87a]',
  ghost: 'bg-transparent text-[#8a8a8d] hover:text-[#f5f5f3] hover:bg-[rgba(255,255,255,0.05)]',
  outline: 'bg-transparent text-[#f5f5f3] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
  xl: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-[10px]
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-1">
          <span className="h-3.5 w-3.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="h-3.5 w-3.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '140ms' }} />
          <span className="h-3.5 w-3.5 rounded-full bg-current animate-pulse" style={{ animationDelay: '280ms' }} />
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
}
