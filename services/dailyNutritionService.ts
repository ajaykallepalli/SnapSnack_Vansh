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
} 