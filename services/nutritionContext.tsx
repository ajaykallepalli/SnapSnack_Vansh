import React, { createContext, useContext, useState, useEffect } from 'react';
import { NutritionTrackingService } from './nutritionTracking';
import { NutritionGoalsService } from './weightTracking';
import { supabase } from '../utils/supabase';
import type { DailyNutritionLogs, MealLog, NutritionContextType, UserMetrics } from '../types/foodTypes';

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyNutritionLogs, setDailyNutritionLogs] = useState<DailyNutritionLogs | null>(null);
  const [dailyNutritionGoals, setDailyNutritionGoals] = useState<DailyNutritionGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const remainingNutrition = {
    calories: (dailyNutritionGoals?.calories_goal ?? 0) - (dailyNutritionLogs?.calories_consumed ?? 0),
    protein: (dailyNutritionGoals?.protein_goal ?? 0) - (dailyNutritionLogs?.protein_consumed ?? 0),
    carbs: (dailyNutritionGoals?.carbs_goal ?? 0) - (dailyNutritionLogs?.carbs_consumed ?? 0),
    fat: (dailyNutritionGoals?.fat_goal ?? 0) - (dailyNutritionLogs?.fat_consumed ?? 0),
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
    if (!dailyNutritionGoals) return;

    const nutritionGoals = await NutritionGoalsService.updateUserNutritionGoals(metrics);
    
    const updatedNutrition = {
      ...dailyNutritionGoals,
      calories_goal: nutritionGoals.calories_goal,
      protein_goal: nutritionGoals.protein_goal,
      carbs_goal: nutritionGoals.carbs_goal,
      fat_goal: nutritionGoals.fat_goal,
    };

    await NutritionTrackingService.updateDailyLog(updatedNutrition);
    setDailyNutritionGoals(updatedNutrition);
  };

  const loadTodayNutrition = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDailyNutritionLogs(null);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('Getting daily log for', session.user.id, today);
      let log = await NutritionTrackingService.getDailyLog(session.user.id, today);
      console.log('Daily log:', log);
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
          meals_data: [],
        };
        await NutritionTrackingService.updateDailyLog(log);
      }
      
      setDailyNutritionLogs(log);
    } catch (error) {
      console.error('Error loading nutrition:', error);
      setDailyNutritionLogs(null);
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
      const currentLog = dailyNutritionLogs || {
        user_id: session.user.id,
        log_date: today,
        calories_consumed: dailyNutritionLogs?.calories_consumed ?? 0,
        protein_consumed: dailyNutritionLogs?.protein_consumed ?? 0,
        carbs_consumed: dailyNutritionLogs?.carbs_consumed ?? 0,
        fat_consumed: dailyNutritionLogs?.fat_consumed ?? 0,
      };

      const updatedLog = {
        ...currentLog,
        calories_consumed: (currentLog.calories_consumed ?? 0) + meal.calories,
        protein_consumed: (currentLog.protein_consumed ?? 0) + meal.protein_g,
        carbs_consumed: (currentLog.carbs_consumed ?? 0) + meal.carbs_g,
        fat_consumed: (currentLog.fat_consumed ?? 0) + meal.fat_g,
      };

      await NutritionTrackingService.updateDailyLog(updatedLog);
      setDailyNutritionLogs(updatedLog);
    } catch (error) {
      console.error('Error updating nutrition:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: NutritionContextType = {
    dailyNutritionLogs,
    dailyNutritionGoals,
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