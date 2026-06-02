import { createClient } from '@supabase/supabase-js';
import { GameificationEvents } from '@/lib/analytics';
import { XP_CONFIG, DifficultyLevel } from '@/lib/xp-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// XP calculation
export function calculateXP(
  score: number,
  total: number,
  completionTime: number,
  difficulty: DifficultyLevel = 'medium'
): number {
  const config = XP_CONFIG[difficulty];
  const scoreMultiplier = (score / total) * 100;
  const timeBonus = Math.max(0, 60 - completionTime / 1000) * config.timeBonus;
  const perfectBonus = score === total ? config.perfectBonus : 0;
  return Math.round(config.baseXP * (scoreMultiplier / 100) + timeBonus + perfectBonus);
}

// Level calculation
export function calculateLevel(totalXP: number): number {
  const baseXP = 1000;
  const xpGrowth = 1.5;
  let level = 1;
  let cumulativeXP = 0;
  while (cumulativeXP + baseXP * Math.pow(xpGrowth, level - 1) <= totalXP) {
    cumulativeXP += baseXP * Math.pow(xpGrowth, level - 1);
    level++;
  }
  return level;
}

// Get XP for next level
export function getXPForNextLevel(currentLevel: number): number {
  const baseXP = 1000;
  const xpGrowth = 1.5;
  return Math.round(baseXP * Math.pow(xpGrowth, currentLevel - 1));
}

// Record quiz completion
export async function recordQuizCompletion(
  userId: string,
  quizSlug: string,
  score: number,
  total: number,
  completionTime: number,
  difficulty: DifficultyLevel = 'medium'
) {
  const xpEarned = calculateXP(score, total, completionTime, difficulty);
  const isPerfect = score === total;

  // Insert completion record
  const { data: completion, error: completionError } = await supabase
    .from('quiz_completions')
    .insert({
      user_id: userId,
      quiz_slug: quizSlug,
      score,
      total_questions: total,
      xp_earned: xpEarned,
      completion_time_seconds: Math.round(completionTime / 1000),
      is_perfect_score: isPerfect,
    })
    .select()
    .single();

  if (completionError) throw completionError;

  // Update user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) {
    await supabase.from('user_stats').insert({
      user_id: userId,
      total_xp: xpEarned,
      level: 1,
      total_quizzes_completed: 1,
      perfect_scores: isPerfect ? 1 : 0,
      last_activity_date: new Date().toISOString().split('T')[0],
    });

    // Track initial quiz completion
    GameificationEvents.quizCompleted(xpEarned, (score / total) * 100, quizSlug);
  } else {
    const oldLevel = stats.level;
    const newTotalXP = stats.total_xp + xpEarned;
    const newLevel = calculateLevel(newTotalXP);

    await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
        total_quizzes_completed: stats.total_quizzes_completed + 1,
        perfect_scores: stats.perfect_scores + (isPerfect ? 1 : 0),
        last_activity_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', userId);

    // Track quiz completion
    GameificationEvents.quizCompleted(xpEarned, (score / total) * 100, quizSlug);

    // Track level up if it happened
    if (newLevel > oldLevel) {
      GameificationEvents.levelUp(newLevel, newTotalXP);
    }
  }

  return { completion, xpEarned };
}

// Get user stats
export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10) {
  const { data, error } = await supabase
    .from('user_leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Get user rank
export async function getUserRank(userId: string) {
  const { data, error } = await supabase
    .from('user_leaderboard')
    .select('rank')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.rank || null;
}
