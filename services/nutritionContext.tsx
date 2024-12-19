import React, { createContext, useContext, useState, useEffect } from 'react';
import { NutritionTrackingService } from './nutritionTracking';
import { NutritionGoalsService } from './weightTracking';
import { supabase } from '../utils/supabase';
import type { DailyNutrition, MealLog, NutritionContextType, UserMetrics } from '../types/foodTypes';

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const remainingNutrition = {
    calories: (dailyNutrition?.calories_goal ?? 0) - (dailyNutrition?.calories_consumed ?? 0),
    protein: (dailyNutrition?.protein_goal ?? 0) - (dailyNutrition?.protein_consumed ?? 0),
    carbs: (dailyNutrition?.carbs_goal ?? 0) - (dailyNutrition?.carbs_consumed ?? 0),
    fat: (dailyNutrition?.fat_goal ?? 0) - (dailyNutrition?.fat_consumed ?? 0),
  };

  useEffect(() => {
    loadTodayNutrition();

    // Subscribe to changes in user_metrics
    const metricsSubscription = supabase
      .channel('user_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_metrics'
        },
        async (payload) => {
          if (payload.new) {
            await updateDailyGoals(payload.new as UserMetrics);
          }
        }
      )
      .subscribe();

    return () => {
      metricsSubscription.unsubscribe();
    };
  }, []);

  const updateDailyGoals = async (metrics: UserMetrics) => {
    if (!dailyNutrition) return;

    const nutritionGoals = await NutritionGoalsService.updateUserNutritionGoals(metrics.user_id, metrics);
    
    const updatedNutrition = {
      ...dailyNutrition,
      calories_goal: nutritionGoals.calories,
      protein_goal: nutritionGoals.protein,
      carbs_goal: nutritionGoals.carbs,
      fat_goal: nutritionGoals.fat,
    };

    await NutritionTrackingService.updateDailyLog(updatedNutrition);
    setDailyNutrition(updatedNutrition);
  };

  const loadTodayNutrition = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDailyNutrition(null);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      let log = await NutritionTrackingService.getDailyLog(session.user.id, today);
      
      if (!log) {
        // Get current nutrition goals from the service
        const nutritionGoals = await NutritionGoalsService.getUserNutritionGoals(session.user.id);
        
        log = {
          user_id: session.user.id,
          log_date: today,
          calories_goal: nutritionGoals.calories,
          protein_goal: nutritionGoals.protein,
          carbs_goal: nutritionGoals.carbs,
          fat_goal: nutritionGoals.fat,
          calories_consumed: 0,
          protein_consumed: 0,
          carbs_consumed: 0,
          fat_consumed: 0,
          meals_data: [],
        };
        await NutritionTrackingService.updateDailyLog(log);
      }
      
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
        calories_consumed: dailyNutrition?.calories_consumed ?? 0,
        protein_goal: DAILY_GOALS.protein,
        protein_consumed: dailyNutrition?.protein_consumed ?? 0,
        carbs_goal: DAILY_GOALS.carbs,
        carbs_consumed: dailyNutrition?.carbs_consumed ?? 0,
        fat_goal: DAILY_GOALS.fat,
        fat_consumed: dailyNutrition?.fat_consumed ?? 0,
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

export function useNutritionContext() {
  const context = useContext(NutritionContext);
  if (undefined === context) {
    throw new Error('useNutritionContext must be used within a NutritionProvider');
  }
  return context;
}

// Export the context itself if needed elsewhere
export { NutritionContext };