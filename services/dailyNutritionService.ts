import { supabase } from '../utils/supabase';
import { NutritionGoalsService } from './weightTracking';
import { UserMetrics } from '../types/foodTypes';
import { SupabaseUserMetrics } from '../types/supabaseTypes';


export class DailyNutritionService {
  private static mapActivityLevel(level: string): 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' {
    const activityMap: { [key: string]: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' } = {
      'Sedentary': 'sedentary',
      'Low': 'light',
      'Moderate': 'moderate',
      'High': 'active',
      'Very High': 'very_active'
    };
    return activityMap[level] || 'moderate';
  }

  private static convertToUserMetrics(dbMetrics: SupabaseUserMetrics): UserMetrics {
    return {
      user_id: dbMetrics.user_id,
      currentWeight: dbMetrics.weight * 0.45359237, // Convert lbs to kg
      goalWeight: dbMetrics.goal_weight * 0.45359237, // Convert lbs to kg
      height: dbMetrics.height * 30.48, // Convert feet to cm
      age: dbMetrics.age,
      gender: dbMetrics.gender.toLowerCase() as 'male' | 'female',
      activityLevel: this.mapActivityLevel(dbMetrics.activity_level)
    };
  }

  static async initializeDailyGoals(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if daily goals exist
      const existingGoals = await NutritionGoalsService.getUserNutritionGoals(userId);
    
      if (existingGoals) return existingGoals;
      console.log('No existing goals');

      // Get user's base nutrition goals
      console.log('Getting user metrics', userId);
      const { data: userMetricsRaw, error: metricsError } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('User metrics:', userMetricsRaw);
      if (metricsError) throw metricsError;
      if (!userMetricsRaw) throw new Error('No user metrics found');

      // Convert the metrics to the correct format
      const userMetrics = this.convertToUserMetrics(userMetricsRaw as SupabaseUserMetrics);
      console.log('Converted metrics:', userMetrics);

      const goals = await NutritionGoalsService.updateUserNutritionGoals(userMetrics);
      console.log('User goals:', goals);

      return goals;
    } catch (error) {
      console.error('Error initializing daily goals:', error);
      throw error;
    }
  }

  static async ensureUpcomingGoals(userId: string) {
    try {
      const today = new Date();
      const dates = Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      // Get existing logs for the next 7 days
      const { data: existingLogs } = await supabase
        .from('daily_nutrition_goals')
        .select('effective_date')
        .eq('user_id', userId)
        .in('effective_date', dates);

      const existingDates = new Set(existingLogs?.map(log => log.effective_date));
      
      // Get current goals
      const goals = await NutritionGoalsService.getUserNutritionGoals(userId);
      if (!goals) throw new Error('No nutrition goals found');

      // Create logs for missing dates
      const newGoals = dates
        .filter(date => !existingDates.has(date))
        .map(date => ({
          user_id: userId,
          effective_date: date,
          calories_goal: goals.calories_goal,
          protein_goal: goals.protein_goal,
          carbs_goal: goals.carbs_goal,
          fat_goal: goals.fat_goal,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (newGoals.length > 0) {
        const { error } = await supabase
          .from('daily_nutrition_goals')
          .insert(newGoals);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error ensuring upcoming goals:', error);
      throw error;
    }
  }
} 