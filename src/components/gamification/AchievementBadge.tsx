'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/achievements';
import { useSoundContext } from '@/lib/contexts/SoundContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  showAnimation?: boolean;
  onUnlock?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked = false,
  showAnimation = false,
  onUnlock,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { playSound } = useSoundContext();

  // Play sound when achievement is unlocked with animation
  useEffect(() => {
    if (unlocked && showAnimation) {
      playSound('achievement', 0.9);
      onUnlock?.();
    }
  }, [unlocked, showAnimation, playSound, onUnlock]);

  // Removed color gradients - using grayscale only

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Badge Container */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-help transition-all duration-300 backdrop-blur-sm border-2 ${
          unlocked
            ? `bg-white/20 dark:bg-white/10 shadow-lg hover:shadow-xl border-white/40 ${
                showAnimation ? 'animate-bounce' : ''
              }`
            : 'bg-white/10 dark:bg-white/5 opacity-50 border-white/20'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icon */}
        <span className="text-3xl">{achievement.icon}</span>

        {/* Unlocked Indicator Ring */}
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full border-2 border-white/40"
          />
        )}

        {/* Shine Effect */}
        {unlocked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-lg text-white px-3 py-2 rounded-lg text-sm z-50 whitespace-nowrap shadow-lg border border-white/20"
        >
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-xs text-gray-300">{achievement.description}</div>
          <div className="text-xs mt-1">
            <span className="font-bold text-white">
              +{achievement.xpReward} XP
            </span>
            {' • '}
            <span className="capitalize text-gray-400">{achievement.rarity}</span>
          </div>

          {/* Arrow Pointer */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid rgb(30, 41, 59)`,
            }}
          />
        </div>
      )}
    </div>
  );
};
