/*
  # Matrix Dashboard Enhancements Migration

  ## Overview
  This migration adds comprehensive analytics, interaction tracking, and real-time
  features to support the Matrix-themed annual report dashboard transformation.

  ## New Tables
  1. `page_views` - Track section visits and engagement duration
  2. `metric_interactions` - Track clicks, hovers, and expansions on metrics
  3. `user_feedback` - Collect user feedback and ratings
  4. `external_data_cache` - Cache external API responses
  5. `donations` - Real-time donation tracking (if not using Metabase)
  6. `performance_metrics` - Monitor dashboard performance

  ## Security
  - All tables have RLS enabled
  - Appropriate policies for authenticated and anonymous users
  - Performance indexes on frequently queried columns

  ## Notes
  - Uses JSONB for flexible data storage
  - Implements automatic timestamp updates
  - Includes data retention policies
*/

-- =====================================================
-- Page Views Analytics Table
-- =====================================================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id TEXT NOT NULL,
  duration_seconds INTEGER,
  device_type TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  user_agent TEXT,
  session_id TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views (anonymous analytics)
CREATE POLICY "Anyone can log page views"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view all page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_section ON page_views(section_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_device ON page_views(device_type);

-- =====================================================
-- Metric Interactions Tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS metric_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  section_id TEXT NOT NULL,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE metric_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log interactions"
  ON metric_interactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all interactions"
  ON metric_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_metric_interactions_metric ON metric_interactions(metric_name);
CREATE INDEX IF NOT EXISTS idx_metric_interactions_section ON metric_interactions(section_id);
CREATE INDEX IF NOT EXISTS idx_metric_interactions_created ON metric_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_interactions_type ON metric_interactions(interaction_type);

-- =====================================================
-- User Feedback System
-- =====================================================

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  section_id TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'suggestion', 'positive', 'negative', 'feature_request')),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit feedback"
  ON user_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update feedback"
  ON user_feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback(created_at DESC);

-- =====================================================
-- External Data Cache
-- =====================================================

CREATE TABLE IF NOT EXISTS external_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  cached_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  http_status INTEGER,
  error_message TEXT,
  UNIQUE(data_source, endpoint)
);

ALTER TABLE external_data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached data"
  ON external_data_cache
  FOR SELECT
  TO public
  USING (expires_at > now());

CREATE POLICY "System can manage cache"
  ON external_data_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_external_data_cache_source ON external_data_cache(data_source, endpoint);
CREATE INDEX IF NOT EXISTS idx_external_data_cache_expires ON external_data_cache(expires_at);

-- Function to auto-delete expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM external_data_cache WHERE expires_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Donations Tracking (Real-time)
-- =====================================================

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_egp DECIMAL(15,2) NOT NULL,
  amount_usd DECIMAL(15,2),
  donor_type TEXT CHECK (donor_type IN ('individual', 'corporate', 'foundation', 'government', 'anonymous')),
  channel TEXT CHECK (channel IN ('online', 'offline', 'wire', 'mobile', 'pos')),
  campaign_id TEXT,
  program_id TEXT,
  is_recurring BOOLEAN DEFAULT false,
  donor_location TEXT,
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view aggregated donations"
  ON donations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert donations"
  ON donations
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(donor_type);
CREATE INDEX IF NOT EXISTS idx_donations_channel ON donations(channel);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);

-- =====================================================
-- Performance Metrics Monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dns_lookup INTEGER,
  tcp_connection INTEGER,
  ttfb INTEGER,
  download INTEGER,
  dom_processing INTEGER,
  total_load_time INTEGER,
  lcp DECIMAL(10,2),
  fid DECIMAL(10,2),
  cls DECIMAL(10,4),
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  connection_type TEXT,
  device_memory INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log performance"
  ON performance_metrics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view performance metrics"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_performance_created ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_load_time ON performance_metrics(total_load_time);

-- =====================================================
-- Automatic Timestamp Updates
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Analytics Helper Views
-- =====================================================

-- Daily donations summary
CREATE OR REPLACE VIEW daily_donations_summary AS
SELECT
  donation_date,
  COUNT(*) as donation_count,
  SUM(amount_egp) as total_egp,
  SUM(amount_usd) as total_usd,
  AVG(amount_egp) as avg_egp,
  COUNT(DISTINCT donor_type) as unique_donor_types
FROM donations
GROUP BY donation_date
ORDER BY donation_date DESC;

-- Popular sections by views
CREATE OR REPLACE VIEW popular_sections AS
SELECT
  section_id,
  COUNT(*) as view_count,
  AVG(duration_seconds) as avg_duration_seconds,
  COUNT(DISTINCT DATE(created_at)) as days_active
FROM page_views
WHERE created_at > now() - interval '30 days'
GROUP BY section_id
ORDER BY view_count DESC;

-- Most interacted metrics
CREATE OR REPLACE VIEW top_metrics AS
SELECT
  metric_name,
  section_id,
  interaction_type,
  COUNT(*) as interaction_count,
  AVG(duration_ms) as avg_duration_ms
FROM metric_interactions
WHERE created_at > now() - interval '30 days'
GROUP BY metric_name, section_id, interaction_type
ORDER BY interaction_count DESC;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE page_views IS 'Tracks user visits to different dashboard sections for analytics';
COMMENT ON TABLE metric_interactions IS 'Captures user interactions with specific metrics (clicks, hovers, expansions)';
COMMENT ON TABLE user_feedback IS 'Stores user feedback, bug reports, and feature requests';
COMMENT ON TABLE external_data_cache IS 'Caches responses from external APIs to reduce latency and API costs';
COMMENT ON TABLE donations IS 'Real-time donation tracking for live counters and analytics';
COMMENT ON TABLE performance_metrics IS 'Monitors dashboard performance metrics (Core Web Vitals, load times)';
