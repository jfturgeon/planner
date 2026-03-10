-- ==========================================
-- Planificateur Annuel - Schema Supabase
-- ==========================================

-- Table pour les données du planificateur (annual view)
CREATE TABLE planner_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Table pour les événements/tâches hebdomadaires
CREATE TABLE weekly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL, -- Format: "2026-W10" pour la semaine 10 de 2026
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);

-- Table pour les événements/tâches du jour (day extras)
CREATE TABLE day_extra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL, -- Format: "2026-03-10"
  events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_key)
);

-- Table pour les habitudes
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habits JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table pour les préférences utilisateur
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_year INTEGER DEFAULT 2026,
  week_start INTEGER DEFAULT 0,
  left_panel_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE planner_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view their own planner data"
  ON planner_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planner data"
  ON planner_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner data"
  ON planner_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner data"
  ON planner_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly data policies
CREATE POLICY "Users can view their own weekly data"
  ON weekly_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly data"
  ON weekly_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly data"
  ON weekly_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly data"
  ON weekly_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Day extra policies
CREATE POLICY "Users can view their own day extra data"
  ON day_extra
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own day extra data"
  ON day_extra
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own day extra data"
  ON day_extra
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day extra data"
  ON day_extra
  FOR DELETE
  USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits"
  ON habits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits
  FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_planner_data_user_id ON planner_data(user_id);
CREATE INDEX idx_planner_data_year ON planner_data(year);
CREATE INDEX idx_weekly_data_user_id ON weekly_data(user_id);
CREATE INDEX idx_weekly_data_week_key ON weekly_data(week_key);
CREATE INDEX idx_day_extra_user_id ON day_extra(user_id);
CREATE INDEX idx_day_extra_day_key ON day_extra(day_key);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
