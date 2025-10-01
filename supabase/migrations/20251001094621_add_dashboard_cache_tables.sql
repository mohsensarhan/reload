/*
  # Dashboard Cache and Interactions Tables
  
  1. New Tables
    - `global_signals_cache` - Stores external API data with timestamps for performance
    - `saved_scenarios` - Stores user-created scenario models
    - `dashboard_interactions` - Tracks user behavior for analytics
    
  2. Security
    - Enable RLS on all tables
    - Add policies for public/authenticated access
*/

-- Global signals data cache
CREATE TABLE IF NOT EXISTS global_signals_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  date_value date NOT NULL,
  source_api text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_type, date_value)
);

CREATE INDEX IF NOT EXISTS idx_global_signals_type_date ON global_signals_cache(metric_type, date_value DESC);
CREATE INDEX IF NOT EXISTS idx_global_signals_updated ON global_signals_cache(updated_at DESC);

ALTER TABLE global_signals_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Global signals are publicly readable" ON global_signals_cache;
CREATE POLICY "Global signals are publicly readable"
  ON global_signals_cache FOR SELECT
  USING (true);

-- Saved scenario models
CREATE TABLE IF NOT EXISTS saved_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  scenario_name text NOT NULL,
  description text,
  parameters jsonb NOT NULL,
  projected_metrics jsonb NOT NULL,
  is_public boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_user ON saved_scenarios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_public_filter ON saved_scenarios(created_at DESC) WHERE is_public = true;

ALTER TABLE saved_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view scenarios" ON saved_scenarios;
CREATE POLICY "Users can view scenarios"
  ON saved_scenarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create scenarios" ON saved_scenarios;
CREATE POLICY "Users can create scenarios"
  ON saved_scenarios FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update scenarios" ON saved_scenarios;
CREATE POLICY "Users can update scenarios"
  ON saved_scenarios FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete scenarios" ON saved_scenarios;
CREATE POLICY "Users can delete scenarios"
  ON saved_scenarios FOR DELETE
  USING (true);

-- Dashboard interaction tracking
CREATE TABLE IF NOT EXISTS dashboard_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  session_id text,
  action_type text NOT NULL,
  target_element text NOT NULL,
  interaction_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON dashboard_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON dashboard_interactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON dashboard_interactions(action_type, timestamp DESC);

ALTER TABLE dashboard_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log interactions" ON dashboard_interactions;
CREATE POLICY "Anyone can log interactions"
  ON dashboard_interactions FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_global_signals_cache_updated_at ON global_signals_cache;
CREATE TRIGGER update_global_signals_cache_updated_at BEFORE UPDATE ON global_signals_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_scenarios_updated_at ON saved_scenarios;
CREATE TRIGGER update_saved_scenarios_updated_at BEFORE UPDATE ON saved_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();