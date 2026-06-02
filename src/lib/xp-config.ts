export const XP_CONFIG = {
  easy: {
    baseXP: 50,
    timeBonus: 4,
    perfectBonus: 25,
    levelGrowth: 1.3, // faster leveling
  },
  medium: {
    baseXP: 100,
    timeBonus: 2,
    perfectBonus: 50,
    levelGrowth: 1.5,
  },
  hard: {
    baseXP: 150,
    timeBonus: 1,
    perfectBonus: 75,
    levelGrowth: 1.7,
  },
  'ultra-hard': {
    baseXP: 200,
    timeBonus: 0.5,
    perfectBonus: 100,
    levelGrowth: 2.0,
  },
} as const;

export type DifficultyLevel = keyof typeof XP_CONFIG;
