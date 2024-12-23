import React, { createContext, useContext, useState, useEffect } from 'react';
import { NutritionTrackingService } from './nutritionTracking';
import { NutritionGoalsService } from './weightTracking';
import { DailyNutritionService } from './dailyNutritionService';
import { supabase } from '../utils/supabase';
import type { DailyNutritionGoals, DailyNutritionLogs, MealLog, NutritionContextType, UserMetrics } from '../types/foodTypes';

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [dailyNutritionLogs, setDailyNutritionLogs] = useState<DailyNutritionLogs | null>(null);
  const [dailyNutritionGoals, setDailyNutritionGoals] = useState<DailyNutritionGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const remainingNutrition = {
    calories: (dailyNutritionGoals?.calories_goal ?? 0) - (dailyNutritionLogs?.calories_consumed ?? 0),
    protein: (dailyNutritionGoals?.protein_goal ?? 0) - (dailyNutritionLogs?.protein_consumed ?? 0),
    carbs: (dailyNutritionGoals?.carbs_goal ?? 0) - (dailyNutritionLogs?.carbs_consumed ?? 0),
    fat: (dailyNutritionGoals?.fat_goal ?? 0) - (dailyNutritionLogs?.fat_consumed ?? 0),
  };

  const loadNutritionForDate = async (date: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDailyNutritionLogs(null);
        setDailyNutritionGoals(null);
        return;
      }

      let goals = await NutritionTrackingService.getDailyGoals(session.user.id, date);
      if (!goals) {
        goals = await DailyNutritionService.ensureUpcomingGoals(session.user.id);
      }
      setDailyNutritionGoals(goals);

      let log = await NutritionTrackingService.getDailyLog(session.user.id, date);
      if (!log) {
        log = {
          user_id: session.user.id,
          log_date: date,
          calories_consumed: 0,
          protein_consumed: 0,
          carbs_consumed: 0,
          fat_consumed: 0,
          meals_data: [],
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await NutritionTrackingService.updateDailyLog(log);
      }
      setDailyNutritionLogs(log);
    } catch (error) {
      console.error('Error loading nutrition:', error);
      setDailyNutritionLogs(null);
      setDailyNutritionGoals(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for date changes
  useEffect(() => {
    loadNutritionForDate(selectedDate);
  }, [selectedDate]);

  const updateDailyNutrition = async (meal: MealLog) => {
    try {
      // Just call addMealToDB - the subscription will handle state updates
      await NutritionTrackingService.addMealToDB(meal);
    } catch (error) {
      console.error('Error updating daily nutrition:', error);
      throw error;
    }
  };

  const contextValue: NutritionContextType = {
    dailyNutritionLogs,
    dailyNutritionGoals,
    remainingNutrition,
    selectedDate,
    setSelectedDate,
    updateDailyNutrition,
    isLoading,
    refreshNutrition: () => loadNutritionForDate(selectedDate),
    setDailyNutritionLogs: (logs: DailyNutritionLogs | null) => setDailyNutritionLogs(logs)
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