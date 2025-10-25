-- Feb 1 Game Plan - Supabase Database Schema
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES
-- =====================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  age INTEGER,
  gender TEXT,
  activity_level TEXT,
  start_date DATE DEFAULT '2025-10-25',
  target_date DATE DEFAULT '2026-02-01',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DAILY TASK COMPLETIONS
-- =====================================================
CREATE TABLE daily_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_date DATE NOT NULL,
  category TEXT NOT NULL,
  task_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_date, task_id)
);

CREATE INDEX idx_daily_completions_user_date ON daily_completions(user_id, task_date);
CREATE INDEX idx_daily_completions_category ON daily_completions(category);

-- =====================================================
-- BODY MEASUREMENTS
-- =====================================================
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  arms DECIMAL(5,2),
  thighs DECIMAL(5,2),
  neck DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_measurements_user_date ON measurements(user_id, measured_at DESC);

-- =====================================================
-- PROGRESS PHOTOS
-- =====================================================
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_user_date ON progress_photos(user_id, taken_at DESC);

-- =====================================================
-- GYM WORKOUT LOGS
-- =====================================================
CREATE TABLE gym_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  workout_date DATE NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER,
  reps_completed INTEGER[],
  weight_used DECIMAL(6,2)[],
  rest_time INTEGER[],
  rir INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gym_logs_user_date ON gym_logs(user_id, workout_date DESC);
CREATE INDEX idx_gym_logs_exercise ON gym_logs(user_id, exercise_name);

-- =====================================================
-- DAILY JOURNAL ENTRIES
-- =====================================================
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  morning_reflection TEXT,
  evening_reflection TEXT,
  wins TEXT[],
  challenges TEXT[],
  gratitude TEXT[],
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 10),
  focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date DESC);

-- =====================================================
-- INSTAGRAM CONTENT TRACKING
-- =====================================================
CREATE TABLE instagram_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  post_date DATE NOT NULL,
  post_type TEXT CHECK (post_type IN ('reel', 'carousel', 'story', 'live', 'post')),
  post_url TEXT,
  caption TEXT,
  hook_used TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  saves_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ig_posts_user_date ON instagram_posts(user_id, post_date DESC);

-- =====================================================
-- DAILY METRICS
-- =====================================================
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  steps_count INTEGER,
  water_intake_ml INTEGER,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  calories_consumed INTEGER,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fats_grams INTEGER,
  deep_work_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

CREATE INDEX idx_daily_metrics_user_date ON daily_metrics(user_id, metric_date DESC);

-- =====================================================
-- WEEKLY REVIEWS
-- =====================================================
CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  wins TEXT[],
  challenges TEXT[],
  lessons_learned TEXT[],
  next_week_focus TEXT[],
  body_progress_notes TEXT,
  mind_progress_notes TEXT,
  instagram_progress_notes TEXT,
  career_progress_notes TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_number DESC);

-- =====================================================
-- HABIT STREAKS
-- =====================================================
CREATE TABLE habit_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  habit_name TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_completions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_name)
);

CREATE INDEX idx_habit_streaks_user ON habit_streaks(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily Completions Policies
CREATE POLICY "Users can view own completions" ON daily_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions" ON daily_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions" ON daily_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions" ON daily_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Measurements Policies
CREATE POLICY "Users can view own measurements" ON measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements" ON measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Progress Photos Policies
CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Gym Logs Policies
CREATE POLICY "Users can view own gym logs" ON gym_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gym logs" ON gym_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gym logs" ON gym_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gym logs" ON gym_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Journal Entries Policies
CREATE POLICY "Users can view own journal" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Instagram Posts Policies
CREATE POLICY "Users can view own ig posts" ON instagram_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ig posts" ON instagram_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ig posts" ON instagram_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ig posts" ON instagram_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Daily Metrics Policies
CREATE POLICY "Users can view own metrics" ON daily_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON daily_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON daily_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics" ON daily_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly Reviews Policies
CREATE POLICY "Users can view own reviews" ON weekly_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON weekly_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON weekly_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON weekly_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Habit Streaks Policies
CREATE POLICY "Users can view own streaks" ON habit_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON habit_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON habit_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks" ON habit_streaks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_completions_updated_at BEFORE UPDATE ON daily_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at BEFORE UPDATE ON instagram_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at BEFORE UPDATE ON weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_streaks_updated_at BEFORE UPDATE ON habit_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS (Create via Supabase Dashboard)
-- =====================================================
-- Create these buckets in Supabase Dashboard > Storage:
-- 1. 'progress-photos' - for before/after photos
-- 2. 'meal-photos' - for nutrition tracking
-- 3. 'avatars' - for user profile pictures

-- Storage policies will be:
-- - Users can upload to their own folder (user_id/)
-- - Users can view their own uploads
-- - Users can delete their own uploads

COMMENT ON TABLE user_profiles IS 'User profile information and preferences';
COMMENT ON TABLE daily_completions IS 'Tracks completion status of daily tasks';
COMMENT ON TABLE measurements IS 'Body measurements tracking over time';
COMMENT ON TABLE progress_photos IS 'Progress photos with timestamps';
COMMENT ON TABLE gym_logs IS 'Detailed gym workout logging';
COMMENT ON TABLE journal_entries IS 'Daily journal and reflection entries';
COMMENT ON TABLE instagram_posts IS 'Instagram content tracking and metrics';
COMMENT ON TABLE daily_metrics IS 'Daily quantitative metrics (steps, sleep, etc)';
COMMENT ON TABLE weekly_reviews IS 'End-of-week review and planning';
COMMENT ON TABLE habit_streaks IS 'Habit streak tracking and statistics';
