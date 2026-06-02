export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string; // emoji
  xpReward: number;
  rarity: AchievementRarity;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_quiz: {
    id: 'first_quiz',
    slug: 'first-quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    xpReward: 10,
    rarity: 'common',
  },
  perfect_score: {
    id: 'perfect_score',
    slug: 'perfect-score',
    name: 'Perfect Score',
    description: 'Achieve 100% on a quiz',
    icon: '⭐',
    xpReward: 50,
    rarity: 'rare',
  },
  speed_demon: {
    id: 'speed_demon',
    slug: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: '⚡',
    xpReward: 30,
    rarity: 'rare',
  },
  streak_5: {
    id: 'streak_5',
    slug: 'streak-5',
    name: 'On Fire',
    description: 'Achieve a 5-day quiz streak',
    icon: '🔥',
    xpReward: 40,
    rarity: 'rare',
  },
  streak_30: {
    id: 'streak_30',
    slug: 'streak-30',
    name: 'Unstoppable',
    description: 'Achieve a 30-day quiz streak',
    icon: '💪',
    xpReward: 100,
    rarity: 'epic',
  },
  quiz_master: {
    id: 'quiz_master',
    slug: 'quiz-master',
    name: 'Quiz Master',
    description: 'Complete 50 quizzes',
    icon: '👑',
    xpReward: 75,
    rarity: 'epic',
  },
  collector: {
    id: 'collector',
    slug: 'collector',
    name: 'Collector',
    description: 'Unlock all achievement badges',
    icon: '🏆',
    xpReward: 200,
    rarity: 'legendary',
  },
  social_butterfly: {
    id: 'social_butterfly',
    slug: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Share your quiz results 10 times',
    icon: '🦋',
    xpReward: 25,
    rarity: 'common',
  },
};

export const getRarityColor = (rarity: AchievementRarity): string => {
  const colors: Record<AchievementRarity, string> = {
    common: '#6B7280',
    rare: '#3B82F6',
    epic: '#9333EA',
    legendary: '#F59E0B',
  };
  return colors[rarity];
};

export const getRarityGradient = (rarity: AchievementRarity): string => {
  const gradients: Record<AchievementRarity, string> = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
  };
  return gradients[rarity];
};
