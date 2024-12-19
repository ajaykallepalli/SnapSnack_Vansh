import { supabase } from '../utils/supabase';
import { NutritionGoalsService } from './weightTracking';

export class DailyNutritionService {
  static async initializeDailyGoals(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Check if daily goals exist
      const { data: existingGoals } = await supabase
        .from('daily_nutrition_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('effective_date', today)
        .single();

      if (existingGoals) return existingGoals;

      // Get user's base nutrition goals
      const goals = await NutritionGoalsService.getUserNutritionGoals(userId);
      
      // Create new daily goals
      const { data: dailyGoals, error } = await supabase
        .from('daily_nutrition_goals')
        .insert({
          user_id: userId,
          effective_date: today,
          calories_goal: goals.calories,
          protein_goal: goals.protein,
          carbs_goal: goals.carbs,
          fat_goal: goals.fat,
          meals_data: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return dailyGoals;
    } catch (error) {
      console.error('Error initializing daily goals:', error);
      throw error;
    }
  }
} 