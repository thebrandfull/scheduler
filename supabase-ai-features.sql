-- AI Features Migration - Add tables for achievements, streaks, and AI context
-- Run this after the main migration (supabase-migration-reset.sql)

-- =====================================================
-- DROP EXISTING TABLES (for clean migration)
-- =====================================================
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS ai_context CASCADE;

-- =====================================================
-- ACHIEVEMENTS SYSTEM
-- =====================================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'fitness', 'consistency', 'milestone', 'social'
  requirement_type TEXT NOT NULL, -- 'streak', 'total', 'milestone', 'special'
  requirement_value INTEGER,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_key TEXT REFERENCES achievements(achievement_key) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_key)
);

-- =====================================================
-- STREAKS SYSTEM
-- =====================================================
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  streak_type TEXT NOT NULL, -- 'workout', 'journal', 'instagram', 'overall'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- =====================================================
-- XP & LEVELS SYSTEM
-- =====================================================
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  tasks_completed INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  workouts_completed INTEGER DEFAULT 0,
  journal_entries INTEGER DEFAULT 0,
  instagram_posts INTEGER DEFAULT 0,
  measurements_taken INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI CONTEXT & CACHE
-- =====================================================
CREATE TABLE ai_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  context_type TEXT NOT NULL, -- 'morning_briefing', 'evening_reflection', 'progress_analysis'
  context_data JSONB NOT NULL,
  ai_response TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_ai_context_user_type;
DROP INDEX IF EXISTS idx_ai_context_expires;
CREATE INDEX idx_ai_context_user_type ON ai_context(user_id, context_type);
CREATE INDEX idx_ai_context_expires ON ai_context(expires_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own ai_context" ON ai_context;
DROP POLICY IF EXISTS "Users can insert own ai_context" ON ai_context;
DROP POLICY IF EXISTS "Users can update own ai_context" ON ai_context;
DROP POLICY IF EXISTS "Users can delete own ai_context" ON ai_context;

-- Achievements (public read)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- User Achievements
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- User Streaks
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- AI Context
CREATE POLICY "Users can view own ai_context" ON ai_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_context" ON ai_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_context" ON ai_context FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_context" ON ai_context FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SEED ACHIEVEMENTS DATA
-- =====================================================
INSERT INTO achievements (achievement_key, name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
-- Consistency Achievements
('first_day', 'First Day Done', 'Complete your first day of tasks', '🎯', 'consistency', 'milestone', 1, 50),
('week_warrior', 'Week Warrior', 'Complete 7 days in a row', '⚡', 'consistency', 'streak', 7, 100),
('two_week_champion', 'Two Week Champion', '14-day streak', '🔥', 'consistency', 'streak', 14, 200),
('month_master', 'Month Master', '30-day streak', '💪', 'consistency', 'streak', 30, 500),
('unstoppable_50', 'Unstoppable', '50-day streak', '🏆', 'consistency', 'streak', 50, 1000),
('legendary_100', 'Legendary', '100-day streak', '👑', 'consistency', 'streak', 100, 2000),

-- Fitness Achievements
('first_workout', 'First Workout', 'Complete your first gym session', '💪', 'fitness', 'milestone', 1, 50),
('workout_week', 'Workout Week', 'Complete 7 workouts', '🏋️', 'fitness', 'total', 7, 100),
('workout_month', 'Gym Rat', 'Complete 30 workouts', '🦍', 'fitness', 'total', 30, 300),
('iron_warrior', 'Iron Warrior', 'Lift 1000kg total in one session', '⚔️', 'fitness', 'special', 1000, 200),

-- Progress Achievements
('first_photo', 'Progress Documented', 'Upload your first progress photo', '📸', 'milestone', 'milestone', 1, 50),
('weight_5kg', '5kg Down', 'Lose 5kg from starting weight', '⚖️', 'milestone', 'milestone', 5, 300),
('weight_10kg', '10kg Club', 'Lose 10kg from starting weight', '🎖️', 'milestone', 'milestone', 10, 500),
('measurements_10', 'Body Tracker', 'Take 10 measurements', '📏', 'milestone', 'total', 10, 100),

-- Content Achievements
('first_post', 'Content Creator', 'Post your first Instagram update', '📱', 'social', 'milestone', 1, 50),
('posts_10', 'Influencer', 'Post 10 times on Instagram', '🌟', 'social', 'total', 10, 200),
('posts_50', 'Social Star', 'Post 50 times on Instagram', '⭐', 'social', 'total', 50, 500),

-- Journal Achievements
('first_journal', 'Reflective Mind', 'Write your first journal entry', '📝', 'consistency', 'milestone', 1, 50),
('journal_week', 'Thoughtful Week', 'Journal for 7 days straight', '✍️', 'consistency', 'streak', 7, 100),
('journal_month', 'Deep Thinker', 'Journal for 30 days straight', '🧠', 'consistency', 'streak', 30, 300),

-- Perfect Day Achievements
('perfect_day', 'Perfect Day', 'Complete all 5 daily tasks in one day', '✨', 'consistency', 'milestone', 1, 100),
('perfect_week', 'Perfect Week', 'Complete all tasks for 7 days straight', '🌟', 'consistency', 'special', 7, 500),

-- Final Achievement
('transformation_complete', 'Transformation Complete', 'Reach Day 102 - Feb 1, 2026', '🏆', 'milestone', 'milestone', 102, 5000)

ON CONFLICT (achievement_key) DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION get_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN 500 + (level - 1) * 500; -- Level 1: 500 XP, Level 2: 1000 XP, etc.
END;
$$ LANGUAGE plpgsql;

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  xp_needed INTEGER;
BEGIN
  new_level := NEW.current_level;
  xp_needed := get_xp_for_level(new_level);

  -- Keep leveling up while XP exceeds requirement
  WHILE NEW.total_xp >= xp_needed LOOP
    new_level := new_level + 1;
    xp_needed := get_xp_for_level(new_level);
  END LOOP;

  NEW.current_level := new_level;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level
DROP TRIGGER IF EXISTS trigger_update_user_level ON user_stats;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF total_xp ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- =====================================================
-- INDEXES
-- =====================================================
DROP INDEX IF EXISTS idx_user_achievements_user;
DROP INDEX IF EXISTS idx_user_streaks_user;
DROP INDEX IF EXISTS idx_achievements_category;

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
