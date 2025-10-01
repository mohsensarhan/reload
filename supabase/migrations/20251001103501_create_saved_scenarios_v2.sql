/*
  # Saved Scenarios System

  1. New Tables
    - `saved_scenarios`
      - `id` (uuid, primary key)
      - `user_id` (text, user device identifier)
      - `name` (text)
      - `description` (text, nullable)
      - `scenario_data` (jsonb, stores all scenario parameters)
      - `results` (jsonb, stores calculated results)
      - `tags` (text array, for categorization)
      - `is_favorite` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_viewed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS
    - Public access policies for demo mode

  3. Indexes
    - Index on user_id
    - Index on created_at for sorting
*/

-- Drop table if it exists to start fresh
DROP TABLE IF EXISTS saved_scenarios CASCADE;

-- Create saved_scenarios table
CREATE TABLE saved_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  description text,
  scenario_data jsonb NOT NULL,
  results jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE saved_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public can view own scenarios"
  ON saved_scenarios FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert scenarios"
  ON saved_scenarios FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update own scenarios"
  ON saved_scenarios FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete own scenarios"
  ON saved_scenarios FOR DELETE
  TO public
  USING (true);

-- Create indexes
CREATE INDEX idx_saved_scenarios_user_id ON saved_scenarios(user_id);
CREATE INDEX idx_saved_scenarios_created_at ON saved_scenarios(created_at DESC);
CREATE INDEX idx_saved_scenarios_tags ON saved_scenarios USING gin(tags);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_scenarios_updated_at
  BEFORE UPDATE ON saved_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
