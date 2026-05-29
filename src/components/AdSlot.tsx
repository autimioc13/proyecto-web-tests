'use client';

import { useEffect } from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
  style?: 'banner' | 'square' | 'vertical';
}

export default function AdSlot({ slotId, className = '', style = 'banner' }: AdSlotProps) {
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'ad_impression', {
        ad_slot_id: slotId,
      });
    }
  }, [slotId]);

  const sizeClasses = {
    banner: 'w-full h-24 sm:h-32',
    square: 'w-full sm:w-80 h-80',
    vertical: 'w-full sm:w-64 h-96',
  };

  return (
    <div
      className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm font-medium ${sizeClasses[style]} ${className}`}
      data-ad-slot={slotId}
      role="region"
      aria-label="Espacio publicitario"
    >
      <div className="text-center">
        <p className="text-xs">Publicidad</p>
        <p className="text-xs text-gray-400">{slotId}</p>
      </div>
    </div>
  );
}
