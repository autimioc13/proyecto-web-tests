'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface MicroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function MicroButton({
  icon,
  children,
  className = '',
  ...props
}: MicroButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-white/20 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/15 transition-all duration-200 backdrop-blur-md border border-white/20 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
