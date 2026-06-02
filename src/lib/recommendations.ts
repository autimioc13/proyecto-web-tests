import { createClient } from '@supabase/supabase-js';
import { Quiz, SiloSlug } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface QuizWithStats extends Quiz {
  completedByUser?: boolean;
  completionCount?: number;
  avgScore?: number;
  trendingScore?: number;
}

/**
 * Get recommended quizzes based on user's history and category
 * Uses: completed quizzes, category preferences, trending quizzes
 */
export async function getRecommendedQuizzes(
  userId: string,
  category?: SiloSlug,
  limit: number = 6
): Promise<QuizWithStats[]> {
  try {
    // Get user's completion history
    const { data: userCompletions } = await supabase
      .from('quiz_completions')
      .select('quiz_slug')
      .eq('user_id', userId);

    const completedSlugs = new Set(userCompletions?.map((c) => c.quiz_slug) || []);

    // Get all quizzes from data (in a real app, this would be from database)
    // For now, we'll implement the logic that can work with imported quiz data
    let allQuizzes: QuizWithStats[] = [];

    // Get trending quizzes (most completed in last 7 days)
    const { data: trendingData } = await supabase
      .from('quiz_completions')
      .select('quiz_slug')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const trendingQuizzes = new Map<string, number>();
    trendingData?.forEach((item) => {
      trendingQuizzes.set(
        item.quiz_slug,
        (trendingQuizzes.get(item.quiz_slug) || 0) + 1
      );
    });

    // Get average scores for quizzes
    const { data: scoreData } = await supabase
      .from('quiz_completions')
      .select('quiz_slug, score, total_questions');

    const quizScores = new Map<
      string,
      { totalScore: number; count: number; scores: number[] }
    >();
    scoreData?.forEach((item) => {
      const percentage = (item.score / item.total_questions) * 100;
      const current = quizScores.get(item.quiz_slug) || {
        totalScore: 0,
        count: 0,
        scores: [],
      };
      current.totalScore += percentage;
      current.count += 1;
      current.scores.push(percentage);
      quizScores.set(item.quiz_slug, current);
    });

    // This would be called with actual quiz data
    // For now, return structure for implementation
    const recommended: QuizWithStats[] = [];

    // Filter by category if provided
    // Filter out already completed quizzes
    // Sort by: trending score + avg user performance + category preference
    const filtered = allQuizzes
      .filter((quiz) => !completedSlugs.has(quiz.slug))
      .filter((quiz) => !category || quiz.silo === category)
      .map((quiz) => {
        const trendScore = trendingQuizzes.get(quiz.slug) || 0;
        const scores = quizScores.get(quiz.slug);
        const avgScore = scores ? scores.totalScore / scores.count : 0;

        return {
          ...quiz,
          completedByUser: false,
          completionCount: trendScore,
          avgScore,
          trendingScore: trendScore * (avgScore / 100),
        };
      })
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, limit);

    return filtered;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Get similar quizzes based on a given quiz
 */
export async function getSimilarQuizzes(
  quizSlug: string,
  userId?: string,
  limit: number = 4
): Promise<QuizWithStats[]> {
  try {
    // Get the reference quiz's category/silo
    // (In real implementation, fetch from database)
    const referenceQuiz = null; // Placeholder - would fetch actual quiz

    if (!referenceQuiz) return [];

    // Get user's completed quizzes if userId provided
    let completedSlugs = new Set<string>();
    if (userId) {
      const { data: completions } = await supabase
        .from('quiz_completions')
        .select('quiz_slug')
        .eq('user_id', userId);
      completedSlugs = new Set(completions?.map((c) => c.quiz_slug) || []);
    }

    // Return similar quizzes from same silo, excluding completed ones
    const similar: QuizWithStats[] = [];

    return similar.slice(0, limit);
  } catch (error) {
    console.error('Error getting similar quizzes:', error);
    return [];
  }
}

/**
 * Get personalized recommendations based on user activity and preferences
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 8
): Promise<QuizWithStats[]> {
  try {
    // Get user's most completed silo
    const { data: completionsByCategory } = await supabase
      .from('quiz_completions')
      .select('quiz_slug')
      .eq('user_id', userId);

    // Analyze category preferences
    // (Would need quiz data to map slug to category)

    // Get trending quizzes
    const { data: recentTrending } = await supabase
      .from('quiz_completions')
      .select('quiz_slug')
      .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const trendingCounts = new Map<string, number>();
    recentTrending?.forEach((item) => {
      trendingCounts.set(
        item.quiz_slug,
        (trendingCounts.get(item.quiz_slug) || 0) + 1
      );
    });

    // Return personalized mix
    const recommendations: QuizWithStats[] = [];
    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}

/**
 * Get quiz completion status for a user
 */
export async function getUserQuizStatus(userId: string, quizSlugs: string[]) {
  try {
    const { data } = await supabase
      .from('quiz_completions')
      .select('quiz_slug, score, total_questions, created_at')
      .eq('user_id', userId)
      .in('quiz_slug', quizSlugs);

    const statusMap = new Map<
      string,
      { completed: boolean; score: number; percentage: number; date: string }
    >();

    data?.forEach((completion) => {
      statusMap.set(completion.quiz_slug, {
        completed: true,
        score: completion.score,
        percentage: Math.round(
          (completion.score / completion.total_questions) * 100
        ),
        date: completion.created_at,
      });
    });

    return statusMap;
  } catch (error) {
    console.error('Error getting user quiz status:', error);
    return new Map();
  }
}
