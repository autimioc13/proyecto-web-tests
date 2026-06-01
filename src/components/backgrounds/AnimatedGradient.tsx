'use client';

import React, { useState, useEffect } from 'react';
import { getRandomGradient, type GradientStyle } from '@/lib/gradient-utils';

interface AnimatedGradientProps {
  children?: React.ReactNode;
  duration?: number;
  className?: string;
  fixed?: boolean;
}

export default function AnimatedGradient({
  children,
  duration = 8000,
  className = '',
  fixed = true,
}: AnimatedGradientProps) {
  const [currentGradient, setCurrentGradient] = useState<GradientStyle>(() =>
    getRandomGradient()
  );
  const [nextGradient, setNextGradient] = useState<GradientStyle>(() =>
    getRandomGradient()
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const interval = setInterval(() => {
      setCurrentGradient(nextGradient);
      setNextGradient(getRandomGradient());

      // Clean up previous timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }, duration);

    return () => {
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [duration]);

  const containerClass = fixed
    ? `fixed inset-0 -z-10 w-full h-full ${className}`
    : `w-full ${className}`;

  return (
    <>
      <div
        className={containerClass}
        style={{
          background: `linear-gradient(135deg, ${currentGradient.from} 0%, ${currentGradient.to} 100%)`,
          transition: 'background 2s ease-in-out',
        }}
      />
      {children}
    </>
  );
}
