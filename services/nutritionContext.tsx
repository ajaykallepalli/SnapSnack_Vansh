import React, { createContext, useContext, useState, useEffect } from 'react';
import { NutritionTrackingService } from './nutritionTracking';
import { supabase } from '../utils/supabase';
import type { DailyNutrition, MealLog, NutritionContextType } from '../types/foodTypes';

// Create the context with a default undefined value
const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

// Default goals - should be fetched from user settings
const DAILY_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
} as const;

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const remainingNutrition = {
    calories: (dailyNutrition?.calories_goal ?? DAILY_GOALS.calories) - (dailyNutrition?.calories_consumed ?? 0),
    protein: (dailyNutrition?.protein_goal ?? DAILY_GOALS.protein) - (dailyNutrition?.protein_consumed ?? 0),
    carbs: (dailyNutrition?.carbs_goal ?? DAILY_GOALS.carbs) - (dailyNutrition?.carbs_consumed ?? 0),
    fat: (dailyNutrition?.fat_goal ?? DAILY_GOALS.fat) - (dailyNutrition?.fat_consumed ?? 0),
  };

  useEffect(() => {
    loadTodayNutrition();
  }, []);

  const loadTodayNutrition = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDailyNutrition(null);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const log = await NutritionTrackingService.getDailyLog(session.user.id, today);
      setDailyNutrition(log);
    } catch (error) {
      console.error('Error loading nutrition:', error);
      setDailyNutrition(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDailyNutrition = async (meal: MealLog) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const today = new Date().toISOString().split('T')[0];
      const currentLog = dailyNutrition || {
        user_id: session.user.id,
        log_date: today,
        calories_goal: DAILY_GOALS.calories,
        calories_consumed: 0,
        protein_goal: DAILY_GOALS.protein,
        protein_consumed: 0,
        carbs_goal: DAILY_GOALS.carbs,
        carbs_consumed: 0,
        fat_goal: DAILY_GOALS.fat,
        fat_consumed: 0,
        meals_data: [],
      };

      const updatedLog = {
        ...currentLog,
        calories_consumed: (currentLog.calories_consumed ?? 0) + meal.calories,
        protein_consumed: (currentLog.protein_consumed ?? 0) + meal.protein,
        carbs_consumed: (currentLog.carbs_consumed ?? 0) + meal.carbs,
        fat_consumed: (currentLog.fat_consumed ?? 0) + meal.fat,
        meals_data: [...(currentLog.meals_data ?? []), meal],
      };

      await NutritionTrackingService.updateDailyLog(updatedLog);
      setDailyNutrition(updatedLog);
    } catch (error) {
      console.error('Error updating nutrition:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: NutritionContextType = {
    dailyNutrition,
    updateDailyNutrition,
    remainingNutrition,
    isLoading,
  };

  return (
    <NutritionContext.Provider value={contextValue}>
      {children}
    </NutritionContext.Provider>
  );
}

// Custom hook to use the nutrition context
export function useNutritionContext() {
  const context = useContext(NutritionContext);
  if (undefined === context) {
    throw new Error('useNutritionContext must be used within a NutritionProvider');
  }
  return context;
}

// Export the context itself if needed elsewhere
export { NutritionContext };