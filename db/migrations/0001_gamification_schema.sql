-- User gamification statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
  perfect_scores INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

-- Achievements/Badges system
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  xp_reward INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common',
  unlock_condition VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- User achievements (earned badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Quiz completion with XP tracking
CREATE TABLE IF NOT EXISTS quiz_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_slug VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completion_time_seconds INTEGER,
  is_perfect_score BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP DEFAULT now()
);

-- Leaderboard view (cached)
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT
  us.user_id,
  us.total_xp,
  us.level,
  us.current_streak,
  COUNT(DISTINCT qc.id) as total_completions,
  SUM(qc.xp_earned) as lifetime_xp,
  ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as rank
FROM user_stats us
LEFT JOIN quiz_completions qc ON us.user_id = qc.user_id
GROUP BY us.user_id, us.total_xp, us.level, us.current_streak;

-- RLS Policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view achievement tracking"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view all completions"
  ON quiz_completions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own completions"
  ON quiz_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
