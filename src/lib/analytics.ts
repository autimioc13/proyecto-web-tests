import { track } from '@vercel/analytics';

export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>
) {
  try {
    track(name, data);
  } catch (error) {
    console.error('Analytics track failed:', error);
  }
}

export const GameificationEvents = {
  quizCompleted: (xpEarned: number, scorePercentage: number, quizSlug: string) =>
    trackEvent('quiz_completed', { xpEarned, scorePercentage, quiz: quizSlug }),

  levelUp: (newLevel: number, totalXp: number) =>
    trackEvent('level_up', { level: newLevel, total_xp: totalXp }),

  achievementUnlocked: (achievementSlug: string) =>
    trackEvent('achievement_unlocked', { achievement: achievementSlug }),

  streakMilestone: (streakDays: number) =>
    trackEvent('streak_milestone', { days: streakDays }),
};
