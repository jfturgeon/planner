-- =====================================================================
-- PLANIFICATEUR ANNUEL - Supabase Database Schema
-- Version 1.3.4 - Generated 2026-03-11
-- =====================================================================

-- =====================================================================
-- 1. USER PROFILES
-- =====================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- =====================================================================
-- 2. PLANNER DATA (Main calendar data by year)
-- =====================================================================
CREATE TABLE IF NOT EXISTS planner_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  -- Structure: { "YYYY-MM-DD": { tasks: [...], notes: "..." } }
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year)
);

ALTER TABLE planner_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own planner_data" 
  ON planner_data FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_planner_data_user_year ON planner_data(user_id, year);

-- =====================================================================
-- 3. WEEKLY DATA (Habits, weekly todos, filters)
-- =====================================================================
CREATE TABLE IF NOT EXISTS weekly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,  -- Format: "2026-W10"
  -- Structure: { habits: [{name, color, track: {date: bool}}], weekTodos: [...], filters: {...} }
  data JSONB DEFAULT '{"habits": [], "weekTodos": [], "filters": {}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_key)
);

ALTER TABLE weekly_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own weekly_data" 
  ON weekly_data FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_weekly_data_user_week ON weekly_data(user_id, week_key);

-- =====================================================================
-- 4. DAY EVENTS (Específico events and tasks for each day)
-- =====================================================================
CREATE TABLE IF NOT EXISTS day_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,  -- Format: "2026-03-10"
  -- Structure: { events: [{title, time, allDay, ...}] }
  data JSONB DEFAULT '{"events": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, day_key)
);

ALTER TABLE day_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own day_events" 
  ON day_events FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_day_events_user_day ON day_events(user_id, day_key);

-- =====================================================================
-- 5. HABITS (Global habits for tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#2d6bbf',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own habits" 
  ON habits FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_habits_user ON habits(user_id);

-- =====================================================================
-- 6. CONTACTS (Birthdays, anniversaries, contact info)
-- =====================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_year INTEGER,
  birth_month INTEGER,   -- 1-12
  birth_day INTEGER,     -- 1-31
  death_year INTEGER,
  death_month INTEGER,
  death_day INTEGER,
  phone TEXT,
  email TEXT,
  address TEXT,
  tags TEXT[] DEFAULT '{}',  -- Array of tags/groups
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own contacts" 
  ON contacts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_birth ON contacts(birth_month, birth_day);

-- =====================================================================
-- 7. KANBAN STATUSES (Status definitions for objectives)
-- =====================================================================
CREATE TABLE IF NOT EXISTS kanban_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status_id TEXT NOT NULL,  -- 'todo', 'doing', 'done'
  label TEXT NOT NULL,      -- 'À faire', 'En cours', 'Complété'
  color TEXT NOT NULL,      -- Hex color
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, status_id)
);

ALTER TABLE kanban_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own kanban_statuses" 
  ON kanban_statuses FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_kanban_statuses_user ON kanban_statuses(user_id);

-- =====================================================================
-- 8. KANBAN CARDS (Objectives/Goals)
-- =====================================================================
CREATE TABLE IF NOT EXISTS kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,    -- Unique identifier like 'kb_1234567890_abc'
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  status_id TEXT NOT NULL,  -- References kanban_statuses.status_id
  color TEXT DEFAULT '#2d6bbf',
  position_order INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);

ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own kanban_cards" 
  ON kanban_cards FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_kanban_cards_user_year ON kanban_cards(user_id, year);
CREATE INDEX idx_kanban_cards_user_status ON kanban_cards(user_id, status_id);

-- =====================================================================
-- 9. TRACKER EPISODES (Watched episodes)
-- =====================================================================
CREATE TABLE IF NOT EXISTS tracker_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_id TEXT NOT NULL,      -- 'startrek', 'xfiles', etc.
  series_id TEXT NOT NULL,    -- 'tng', 'xf', etc.
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, show_id, series_id, season_number, episode_number)
);

ALTER TABLE tracker_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own tracker_episodes" 
  ON tracker_episodes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_tracker_episodes_user ON tracker_episodes(user_id);
CREATE INDEX idx_tracker_episodes_show ON tracker_episodes(user_id, show_id, series_id);

-- =====================================================================
-- 10. TRACKER SCHEDULE (Episode schedule for days)
-- =====================================================================
CREATE TABLE IF NOT EXISTS tracker_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,      -- Format: "2026-03-10"
  show_id TEXT NOT NULL,
  series_id TEXT NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tracker_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own tracker_schedule" 
  ON tracker_schedule FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_tracker_schedule_user_day ON tracker_schedule(user_id, day_key);
CREATE INDEX idx_tracker_schedule_date ON tracker_schedule(user_id, scheduled_date);

-- =====================================================================
-- 11. OSCARS WATCHED (Watched films and categories)
-- =====================================================================
CREATE TABLE IF NOT EXISTS oscars_watched (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  film_title TEXT NOT NULL,
  category_id TEXT,          -- 'picture', 'director', etc.
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year, film_title)
);

ALTER TABLE oscars_watched ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own oscars_watched" 
  ON oscars_watched FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_oscars_watched_user_year ON oscars_watched(user_id, year);

-- =====================================================================
-- 12. CALENDARS SYSTEM (Custom calendars)
-- =====================================================================
CREATE TABLE IF NOT EXISTS calendars_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, calendar_id)
);

ALTER TABLE calendars_system ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own calendars_system" 
  ON calendars_system FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_calendars_system_user ON calendars_system(user_id);

-- =====================================================================
-- 13. CALENDAR EVENTS (Events in custom calendars)
-- =====================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT,
  all_day BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own calendar_events" 
  ON calendar_events FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_calendar_events_calendar ON calendar_events(user_id, calendar_id);

-- =====================================================================
-- 14. CONNECTION HISTORY (Login history)
-- =====================================================================
CREATE TABLE IF NOT EXISTS connection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE connection_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connection_history" 
  ON connection_history FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_connection_history_user ON connection_history(user_id, login_at DESC);

-- =====================================================================
-- 15. APP SETTINGS (User preferences and settings)
-- =====================================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_year INTEGER DEFAULT 2026,
  week_start_offset INTEGER DEFAULT 0,
  compact_view BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  auto_backup BOOLEAN DEFAULT TRUE,
  last_backup TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own app_settings" 
  ON app_settings FOR ALL USING (auth.uid() = user_id);

-- =====================================================================
-- 16. AUDIT LOG (Track changes for sync)
-- =====================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,      -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit_log" 
  ON audit_log FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_audit_log_user_table ON audit_log(user_id, table_name, created_at DESC);

-- =====================================================================
-- FUNCTIONS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER tr_user_profiles_updated BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_planner_data_updated BEFORE UPDATE ON planner_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_weekly_data_updated BEFORE UPDATE ON weekly_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_day_events_updated BEFORE UPDATE ON day_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_habits_updated BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_contacts_updated BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_kanban_statuses_updated BEFORE UPDATE ON kanban_statuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_kanban_cards_updated BEFORE UPDATE ON kanban_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_tracker_episodes_updated BEFORE UPDATE ON tracker_episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_tracker_schedule_updated BEFORE UPDATE ON tracker_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_oscars_watched_updated BEFORE UPDATE ON oscars_watched
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_calendars_system_updated BEFORE UPDATE ON calendars_system
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_calendar_events_updated BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_app_settings_updated BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================================
-- VIEWS
-- =====================================================================

-- View for upcoming birthdays
CREATE OR REPLACE VIEW upcoming_birthdays AS
SELECT 
  user_id,
  id,
  first_name,
  last_name,
  birth_month,
  birth_day,
  birth_year,
  CASE 
    WHEN birth_year IS NOT NULL 
    THEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year
    ELSE NULL
  END as age
FROM contacts
WHERE birth_month IS NOT NULL AND birth_day IS NOT NULL;

-- View for unwatched episodes
CREATE OR REPLACE VIEW unwatched_episodes AS
SELECT 
  user_id,
  show_id,
  series_id,
  season_number,
  episode_number,
  COUNT(*) as count
FROM tracker_episodes
WHERE watched = FALSE
GROUP BY user_id, show_id, series_id, season_number, episode_number;

-- =====================================================================
-- INITIAL DATA (Default kanban statuses)
-- =====================================================================

-- These will be created per-user through application logic
-- INSERT INTO kanban_statuses (user_id, status_id, label, color, position)
-- VALUES 
--   (user_uuid, 'todo', 'À faire', '#8b7355', 0),
--   (user_uuid, 'doing', 'En cours', '#2d6bbf', 1),
--   (user_uuid, 'done', 'Complété', '#2a7a4b', 2);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX idx_planner_data_updated ON planner_data(updated_at DESC);
CREATE INDEX idx_weekly_data_updated ON weekly_data(updated_at DESC);
CREATE INDEX idx_day_events_updated ON day_events(updated_at DESC);
CREATE INDEX idx_tracker_episodes_watch ON tracker_episodes(watched) WHERE watched = FALSE;
CREATE INDEX idx_calendar_events_updated ON calendar_events(updated_at DESC);

-- =====================================================================
-- RLS POLICIES FOR AUDIT LOG
-- =====================================================================

CREATE POLICY "Enable insert for authenticated users" 
  ON audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
