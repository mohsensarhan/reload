/*
  # Notification System for EFB Dashboard

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (text, references user device)
      - `type` (text: alert, info, warning, success)
      - `category` (text: metric_threshold, system, insight, report)
      - `title` (text)
      - `message` (text)
      - `related_metric` (text, nullable)
      - `related_section` (text, nullable)
      - `action_url` (text, nullable)
      - `priority` (text: low, medium, high, critical)
      - `is_read` (boolean, default false)
      - `is_dismissed` (boolean, default false)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz, nullable)
      - `expires_at` (timestamptz, nullable)
    
    - `notification_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, user device identifier)
      - `email_enabled` (boolean, default false)
      - `push_enabled` (boolean, default true)
      - `categories` (jsonb, array of enabled categories)
      - `quiet_hours_start` (time, nullable)
      - `quiet_hours_end` (time, nullable)
      - `min_priority` (text: low, medium, high)
      - `updated_at` (timestamptz)

    - `metric_thresholds`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `metric_id` (text)
      - `threshold_type` (text: above, below, change_percent)
      - `threshold_value` (numeric)
      - `notification_enabled` (boolean)
      - `last_triggered_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (demo mode)
    - Add policies for authenticated users (future)

  3. Indexes
    - Index on user_id for fast queries
    - Index on is_read and created_at for notification lists
    - Index on expires_at for cleanup jobs
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('alert', 'info', 'warning', 'success')),
  category text NOT NULL CHECK (category IN ('metric_threshold', 'system', 'insight', 'report')),
  title text NOT NULL,
  message text NOT NULL,
  related_metric text,
  related_section text,
  action_url text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  email_enabled boolean DEFAULT false,
  push_enabled boolean DEFAULT true,
  categories jsonb DEFAULT '["metric_threshold", "system", "insight", "report"]'::jsonb,
  quiet_hours_start time,
  quiet_hours_end time,
  min_priority text DEFAULT 'low' CHECK (min_priority IN ('low', 'medium', 'high', 'critical')),
  updated_at timestamptz DEFAULT now()
);

-- Create metric_thresholds table (extends existing metric_alerts)
CREATE TABLE IF NOT EXISTS metric_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  metric_id text NOT NULL,
  threshold_type text NOT NULL CHECK (threshold_type IN ('above', 'below', 'change_percent')),
  threshold_value numeric NOT NULL,
  notification_enabled boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_id, threshold_type)
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_thresholds ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY "Public can view own notifications"
  ON notifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert notifications"
  ON notifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update own notifications"
  ON notifications FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view notification preferences"
  ON notification_preferences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert notification preferences"
  ON notification_preferences FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update notification preferences"
  ON notification_preferences FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view metric thresholds"
  ON metric_thresholds FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert metric thresholds"
  ON metric_thresholds FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update metric thresholds"
  ON metric_thresholds FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete metric thresholds"
  ON metric_thresholds FOR DELETE
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_thresholds_user_id ON metric_thresholds(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_thresholds_metric_id ON metric_thresholds(metric_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metric_thresholds_updated_at ON metric_thresholds;
CREATE TRIGGER update_metric_thresholds_updated_at
  BEFORE UPDATE ON metric_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
