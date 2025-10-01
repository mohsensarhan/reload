import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  category: 'metric_threshold' | 'system' | 'insight' | 'report';
  title: string;
  message: string;
  related_metric?: string;
  related_section?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  is_dismissed: boolean;
  metadata?: any;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  categories: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  min_priority: 'low' | 'medium' | 'high' | 'critical';
}

function getUserId(): string {
  let userId = localStorage.getItem('efb_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('efb_user_id', userId);
  }
  return userId;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = getUserId();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const validNotifications = (data || []).filter(notif => {
        if (notif.expires_at) {
          return new Date(notif.expires_at) > new Date();
        }
        return true;
      });

      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchPreferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          categories: data.categories || [],
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          min_priority: data.min_priority
        });
      } else {
        const defaultPreferences: NotificationPreferences = {
          email_enabled: false,
          push_enabled: true,
          categories: ['metric_threshold', 'system', 'insight', 'report'],
          min_priority: 'low'
        };
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchPreferences]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications]);

  const dismiss = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      const dismissedNotif = notifications.find(n => n.id === notificationId);
      if (dismissedNotif && !dismissedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }, [notifications]);

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read' | 'is_dismissed'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userId,
          is_read: false,
          is_dismissed: false
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, [userId]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...newPreferences
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          categories: data.categories || [],
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          min_priority: data.min_priority
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [userId]);

  return {
    notifications,
    preferences,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismiss,
    createNotification,
    updatePreferences,
    refresh: fetchNotifications
  };
}
