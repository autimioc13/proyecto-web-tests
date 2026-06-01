'use client';

import React, { useState, useEffect } from 'react';
import { getRandomGradient, GRADIENT_ANIMATIONS, type GradientStyle } from '@/lib/gradient-utils';

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentGradient(nextGradient);
      setNextGradient(getRandomGradient());

      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 2000);

      return () => clearTimeout(transitionTimer);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, nextGradient]);

  const containerClass = fixed
    ? `fixed inset-0 -z-10 w-full h-full ${className}`
    : `w-full ${className}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GRADIENT_ANIMATIONS }} />
      <div
        className={containerClass}
        style={{
          background: `linear-gradient(135deg, ${currentGradient.from} 0%, ${currentGradient.to} 100%)`,
          backgroundSize: '200% 200%',
          transition: isTransitioning ? 'background 2s ease-in-out' : 'none',
          animation: 'gradientShift 8s ease infinite',
        }}
      />
      {children}
    </>
  );
}
