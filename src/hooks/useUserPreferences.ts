import { useState, useEffect } from 'react';
import { supabase, UserPreferences } from '@/lib/supabase';

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  pinned_metrics: [],
  favorite_sections: ['executive'],
  notification_settings: {
    email: false,
    inApp: true,
    thresholdAlerts: true,
    dailyDigest: false
  },
  display_settings: {
    theme: 'dark',
    compactMode: false,
    showSparklines: true,
    defaultTimeRange: '30d'
  }
};

function getUserId(): string {
  let userId = localStorage.getItem('efb_user_id');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('efb_user_id', userId);
  }
  return userId;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userId = getUserId();

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else {
        const newPrefs = await createDefaultPreferences(userId);
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences({
        id: '',
        user_id: getUserId(),
        ...DEFAULT_PREFERENCES,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPreferences = async (userId: string): Promise<UserPreferences> => {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...DEFAULT_PREFERENCES
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const userId = getUserId();

      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const togglePinnedMetric = async (metricId: string) => {
    if (!preferences) return;

    const currentPinned = preferences.pinned_metrics || [];
    const newPinned = currentPinned.includes(metricId)
      ? currentPinned.filter(id => id !== metricId)
      : [...currentPinned, metricId];

    return updatePreferences({ pinned_metrics: newPinned });
  };

  const toggleFavoriteSection = async (sectionId: string) => {
    if (!preferences) return;

    const currentFavorites = preferences.favorite_sections || [];
    const newFavorites = currentFavorites.includes(sectionId)
      ? currentFavorites.filter(id => id !== sectionId)
      : [...currentFavorites, sectionId];

    return updatePreferences({ favorite_sections: newFavorites });
  };

  const updateNotificationSettings = async (settings: Partial<UserPreferences['notification_settings']>) => {
    if (!preferences) return;

    return updatePreferences({
      notification_settings: {
        ...preferences.notification_settings,
        ...settings
      }
    });
  };

  const updateDisplaySettings = async (settings: Partial<UserPreferences['display_settings']>) => {
    if (!preferences) return;

    return updatePreferences({
      display_settings: {
        ...preferences.display_settings,
        ...settings
      }
    });
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    togglePinnedMetric,
    toggleFavoriteSection,
    updateNotificationSettings,
    updateDisplaySettings,
    isPinned: (metricId: string) => preferences?.pinned_metrics?.includes(metricId) || false,
    isFavorite: (sectionId: string) => preferences?.favorite_sections?.includes(sectionId) || false
  };
}
