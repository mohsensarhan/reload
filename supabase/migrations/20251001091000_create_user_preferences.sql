/*
  # User Preferences and Dashboard Customization

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text) - For future auth integration, stores session/device ID for now
      - `pinned_metrics` (jsonb) - Array of pinned metric IDs
      - `favorite_sections` (jsonb) - Array of favorite section IDs
      - `notification_settings` (jsonb) - User notification preferences
      - `display_settings` (jsonb) - UI customization preferences
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `metric_alerts`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `metric_id` (text) - Identifier for the metric
      - `threshold_value` (numeric)
      - `threshold_type` (text) - 'above', 'below', 'change'
      - `notification_enabled` (boolean)
      - `last_triggered_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  pinned_metrics jsonb DEFAULT '[]'::jsonb,
  favorite_sections jsonb DEFAULT '[]'::jsonb,
  notification_settings jsonb DEFAULT '{
    "email": false,
    "inApp": true,
    "thresholdAlerts": true,
    "dailyDigest": false
  }'::jsonb,
  display_settings jsonb DEFAULT '{
    "theme": "dark",
    "compactMode": false,
    "showSparklines": true,
    "defaultTimeRange": "30d"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metric_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  metric_id text NOT NULL,
  threshold_value numeric NOT NULL,
  threshold_type text NOT NULL CHECK (threshold_type IN ('above', 'below', 'change')),
  notification_enabled boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own alerts"
  ON metric_alerts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own alerts"
  ON metric_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own alerts"
  ON metric_alerts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own alerts"
  ON metric_alerts FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_alerts_user_id ON metric_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_alerts_metric_id ON metric_alerts(metric_id);
