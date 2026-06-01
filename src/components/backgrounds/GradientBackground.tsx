import React from 'react';
import { generateGradientStyle, GRADIENT_ANIMATIONS } from '@/lib/gradient-utils';

interface GradientBackgroundProps {
  fromColor: string;
  toColor: string;
  animated?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function GradientBackground({
  fromColor,
  toColor,
  animated = false,
  children,
  className = '',
}: GradientBackgroundProps) {
  const gradientStyle = generateGradientStyle(fromColor, toColor, animated);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GRADIENT_ANIMATIONS }} />
      <div
        className={`relative w-full ${className}`}
        style={{
          background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
          backgroundSize: '200% 200%',
          animation: animated ? 'gradientShift 8s ease infinite' : 'none',
        }}
      >
        {children}
      </div>
    </>
  );
}
