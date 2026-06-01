import React from 'react';

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
  children,
  className = '',
}: GradientBackgroundProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
      }}
    >
      {children}
    </div>
  );
}
