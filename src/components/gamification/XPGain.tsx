'use client';

import { useEffect, useState } from 'react';

interface XPGainProps {
  amount: number;
  x?: number; // X position on screen
  y?: number; // Y position on screen
  duration?: number; // Animation duration in ms
  onComplete?: () => void;
}

export const XPGain: React.FC<XPGainProps> = ({
  amount,
  x = 50,
  y = 50,
  duration = 1500,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes xpFloatUp {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(0, -80px) scale(1.2);
          }
        }

        @keyframes xpGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.8));
          }
        }

        .xp-gain-container {
          position: fixed;
          left: ${x}%;
          top: ${y}%;
          pointer-events: none;
          z-index: 50;
          animation: xpFloatUp ${duration}ms ease-out forwards;
        }

        .xp-gain-text {
          font-weight: 700;
          font-size: 24px;
          white-space: nowrap;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
          animation: xpGlowPulse 0.6s ease-in-out infinite;
        }

        .xp-gain-icon {
          font-size: 28px;
          margin-right: 4px;
          animation: xpFloatUp ${duration}ms ease-out forwards;
        }
      `}</style>

      <div className="xp-gain-container">
        <div className="flex items-center gap-1">
          <span className="xp-gain-icon">✨</span>
          <span className="xp-gain-text">+{amount} XP</span>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to manage XP gain animations
 * Usage: const { showXPGain, xpGains } = useXPGainAnimation();
 */
export function useXPGainAnimation() {
  const [xpGains, setXpGains] = useState<
    Array<{
      id: string;
      amount: number;
      x: number;
      y: number;
    }>
  >([]);

  const showXPGain = (
    amount: number,
    x: number = 50,
    y: number = 50
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setXpGains((prev) => [
      ...prev,
      {
        id,
        amount,
        x,
        y,
      },
    ]);

    return id;
  };

  const removeXPGain = (id: string) => {
    setXpGains((prev) => prev.filter((gain) => gain.id !== id));
  };

  return {
    showXPGain,
    removeXPGain,
    xpGains,
  };
}
