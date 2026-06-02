'use client';

import { useState } from 'react';
import { Achievement, getRarityGradient, getRarityColor } from '@/lib/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  showAnimation?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked = false,
  showAnimation = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const bgGradient = getRarityGradient(achievement.rarity);
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Badge Container */}
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-help transition-all duration-300 ${
          unlocked
            ? `bg-gradient-to-br ${bgGradient} shadow-lg hover:shadow-xl ${
                showAnimation ? 'animate-bounce' : ''
              }`
            : 'bg-gradient-to-br from-gray-300 to-gray-400 opacity-50 grayscale'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icon */}
        <span className="text-3xl">{achievement.icon}</span>

        {/* Unlocked Indicator Ring */}
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: rarityColor }}
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
          className={`absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm z-50 whitespace-nowrap shadow-lg border ${
            unlocked
              ? `border-[${rarityColor}]`
              : 'border-gray-700'
          }`}
          style={unlocked ? { borderColor: rarityColor } : {}}
        >
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-xs text-gray-300">{achievement.description}</div>
          <div className="text-xs mt-1">
            <span style={{ color: rarityColor }} className="font-bold">
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
              borderTop: `6px solid rgb(17, 24, 39)`,
            }}
          />
        </div>
      )}
    </div>
  );
};
