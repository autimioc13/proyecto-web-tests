'use client';

import React, { ButtonHTMLAttributes } from 'react';

type Variant = 'gradient' | 'solid' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  variant = 'gradient',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
  const baseStyles = 'rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold backdrop-blur-sm';

  const variants = {
    gradient: 'bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white hover:shadow-xl hover:shadow-gray-400/30 dark:hover:shadow-gray-500/30 hover:scale-105 disabled:opacity-50 border border-white/20 hover:bg-white/30 dark:hover:bg-white/15',
    solid: 'bg-white/15 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/25 dark:hover:bg-white/15 hover:shadow-lg disabled:opacity-50 border border-white/20',
    outline: 'border-2 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white hover:bg-white/10 dark:hover:bg-white/15 disabled:opacity-50 backdrop-blur-md',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon}
      {children}
    </button>
  );
}
