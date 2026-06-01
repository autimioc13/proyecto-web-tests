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
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
