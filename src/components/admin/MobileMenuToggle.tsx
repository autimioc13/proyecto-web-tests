'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface MobileMenuToggleProps {
  onClick: () => void;
}

export function MobileMenuToggle({ onClick }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onClick}
      className="
        md:hidden
        fixed bottom-6 right-6 z-50
        p-3
        bg-gradient-to-r from-purple-600 to-blue-600
        hover:from-purple-700 hover:to-blue-700
        text-white
        rounded-full
        shadow-lg
        transition-all duration-200
      "
      aria-label="Toggle menu"
    >
      <Menu size={24} />
    </button>
  );
}

export default MobileMenuToggle;
