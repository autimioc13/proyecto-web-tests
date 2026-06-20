import { anonSupabase as supabase } from '@/lib/supabase/service';

/**
 * Updates user streak based on activity dates
 * - If last_activity_date was yesterday: increment streak
 * - If last_activity_date was today: maintain streak
 * - If last_activity_date was before yesterday: reset to 1
 */
export async function updateUserStreak(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Get current user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') throw statsError;

    let newCurrentStreak = 1;
    let newLongestStreak = 1;

    if (stats) {
      const lastActivityDate = stats.last_activity_date;

      if (lastActivityDate === todayString) {
        // Already updated today, maintain streak
        newCurrentStreak = stats.current_streak;
        newLongestStreak = stats.longest_streak;
      } else if (lastActivityDate === yesterdayString) {
        // Last activity was yesterday, increment streak
        newCurrentStreak = (stats.current_streak || 0) + 1;
        newLongestStreak = Math.max(newCurrentStreak, stats.longest_streak || 1);
      } else {
        // Last activity was before yesterday or no previous activity, reset to 1
        newCurrentStreak = 1;
        newLongestStreak = stats.longest_streak || 1;
      }

      // Update user stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: todayString,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // New user, create initial stats
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: todayString,
          total_xp: 0,
          level: 1,
          total_quizzes_completed: 0,
          perfect_scores: 0,
        });

      if (insertError) throw insertError;
    }

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
    };
  } catch (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }
}

/**
 * Get user streak information
 */
export async function getUserStreak(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        daysUntilBreak: 1,
      };
    }

    // Calculate days until streak breaks
    let daysUntilBreak = 1;
    if (data.last_activity_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastActivity = new Date(data.last_activity_date);
      lastActivity.setHours(0, 0, 0, 0);

      const timeDiff = today.getTime() - lastActivity.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      // If activity was today, streak won't break for 2 more days
      // If activity was yesterday, streak will break after 1 more day
      daysUntilBreak = daysDiff === 0 ? 2 : daysDiff === 1 ? 1 : 0;
    }

    return {
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      lastActivityDate: data.last_activity_date,
      daysUntilBreak,
    };
  } catch (error) {
    console.error('Error getting user streak:', error);
    throw error;
  }
}
