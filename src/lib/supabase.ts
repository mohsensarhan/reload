import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserPreferences {
  id: string;
  user_id: string;
  pinned_metrics: string[];
  favorite_sections: string[];
  notification_settings: {
    email: boolean;
    inApp: boolean;
    thresholdAlerts: boolean;
    dailyDigest: boolean;
  };
  display_settings: {
    theme: 'dark' | 'light';
    compactMode: boolean;
    showSparklines: boolean;
    defaultTimeRange: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MetricAlert {
  id: string;
  user_id: string;
  metric_id: string;
  threshold_value: number;
  threshold_type: 'above' | 'below' | 'change';
  notification_enabled: boolean;
  last_triggered_at: string | null;
  created_at: string;
}
