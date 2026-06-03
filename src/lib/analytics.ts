import { track } from '@vercel/analytics';

export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>
) {
  track(name, data);
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
