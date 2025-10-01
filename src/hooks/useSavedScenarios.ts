import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SavedScenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  scenario_data: ScenarioData;
  results?: ScenarioResults;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
}

export interface ScenarioData {
  economicGrowth: number;
  inflationRate: number;
  donorSentiment: number;
  operationalEfficiency: number;
  foodPrices: number;
  unemploymentRate: number;
  corporateCSR: number;
  governmentSupport: number;
  exchangeRate: number;
  logisticsCost: number;
  regionalShock: number;
}

export interface ScenarioResults {
  mealsDelivered: number;
  peopleServed: number;
  costPerMeal: number;
  programEfficiency: number;
  revenue: number;
  expenses: number;
  reserves: number;
  cashPosition: number;
}

function getUserId(): string {
  let userId = localStorage.getItem('efb_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('efb_user_id', userId);
  }
  return userId;
}

export function useSavedScenarios() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = getUserId();

  const fetchScenarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setScenarios(data || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const saveScenario = useCallback(async (
    name: string,
    scenarioData: ScenarioData,
    results?: ScenarioResults,
    description?: string,
    tags?: string[]
  ) => {
    try {
      const { data, error } = await supabase
        .from('saved_scenarios')
        .insert({
          user_id: userId,
          name,
          description,
          scenario_data: scenarioData,
          results,
          tags: tags || [],
          is_favorite: false
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setScenarios(prev => [data, ...prev]);
      }

      return data;
    } catch (error) {
      console.error('Error saving scenario:', error);
      return null;
    }
  }, [userId]);

  const updateScenario = useCallback(async (
    id: string,
    updates: Partial<Omit<SavedScenario, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('saved_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setScenarios(prev =>
          prev.map(s => s.id === id ? data : s)
        );
      }

      return data;
    } catch (error) {
      console.error('Error updating scenario:', error);
      return null;
    }
  }, []);

  const deleteScenario = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScenarios(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting scenario:', error);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    await updateScenario(id, { is_favorite: !scenario.is_favorite });
  }, [scenarios, updateScenario]);

  const updateLastViewed = useCallback(async (id: string) => {
    await updateScenario(id, { last_viewed_at: new Date().toISOString() });
  }, [updateScenario]);

  return {
    scenarios,
    isLoading,
    saveScenario,
    updateScenario,
    deleteScenario,
    toggleFavorite,
    updateLastViewed,
    refresh: fetchScenarios
  };
}
