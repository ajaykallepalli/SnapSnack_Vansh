import { supabase } from '../utils/supabase';
import { WeightEntry, UserMetrics } from '../types/foodTypes';

export class NutritionGoalsService {
  private static ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    very_active: 1.9     // Very heavy exercise, physical job
  };

  private static calculateBMR(metrics: UserMetrics): number {
    // Mifflin-St Jeor Equation
    if (metrics.gender === 'male') {
      return (10 * metrics.currentWeight) + (6.25 * metrics.height) - (5 * metrics.age) + 5;
    } else {
      return (10 * metrics.currentWeight) + (6.25 * metrics.height) - (5 * metrics.age) - 161;
    }
  }
  // TODO: Add ability to adjust based on time goals
  static calculateDailyCalories(metrics: UserMetrics): number {
    const bmr = this.calculateBMR(metrics);
    const tdee = bmr * this.ACTIVITY_MULTIPLIERS[metrics.activityLevel];

    // Calculate weekly weight change goal
    const weeklyWeightDiff = metrics.currentWeight - metrics.goalWeight;
    const weeklyCalorieAdjustment = weeklyWeightDiff * 1100; // ~7700 calories per kg / 7 days
    
    // Ensure we don't create too aggressive a deficit/surplus
    const maxDeficit = -1000; // Max 1000 calorie deficit per day
    const maxSurplus = 500;   // Max 500 calorie surplus per day
    
    const dailyAdjustment = Math.max(
      maxDeficit,
      Math.min(maxSurplus, weeklyCalorieAdjustment / 7)
    );

    return Math.round(tdee + dailyAdjustment);
  }

  static async updateUserNutritionGoals(metrics: UserMetrics) {
    const dailyCalories = this.calculateDailyCalories(metrics);
    // Calculate macros based on bodyweight and goals
    const protein = Math.round(metrics.currentWeight * 2.2); // 1g per lb of bodyweight
    const proteinCals = protein * 4;
    const remainingCals = dailyCalories - proteinCals;
    const fat = Math.round((remainingCals * 0.3) / 9); // 30% of remaining calories from fat
    const carbs = Math.round((remainingCals - (fat * 9)) / 4); // Rest from carbs

    const today = new Date().toISOString();

    const nutritionGoals = {
      calories_goal: dailyCalories,
      protein_goal: protein,
      carbs_goal: carbs,
      fat_goal: fat,
      effective_date: today,
      updated_at: today,
    };
    console.log('Nutrition goals:', nutritionGoals);
    const { error } = await supabase
      .from('daily_nutrition_goals')
      .upsert({
        user_id: metrics.user_id,
        ...nutritionGoals
      })
      .select()
      .single();

    if (error) throw error;
    return nutritionGoals;
  }

  static async getUserNutritionGoals(userId: string) {
    const { data, error } = await supabase
      .from('daily_nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return data;
    return null;
  }
}

export class WeightTrackingService {
  static async logWeight(userId: string, weight: number, notes?: string) {
    const entry: WeightEntry = {
      user_id: userId,
      weight,
      date: new Date().toISOString(),
      notes
    };

    const { data, error } = await supabase
      .from('weight_logs')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    // Update user metrics with new weight
    await this.updateUserMetrics(userId, weight);

    return data;
  }

  static async getWeightHistory(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getWeightTrend(userId: string, days = 7) {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('weight, date')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return null;

    const weights = data.map(entry => entry.weight);
    return {
      average: weights.reduce((a, b) => a + b) / weights.length,
      min: Math.min(...weights),
      max: Math.max(...weights),
      trend: this.calculateTrend(data)
    };
  }

  private static calculateTrend(data: { weight: number; date: string }[]) {
    if (data.length < 2) return 0;

    // Simple linear regression
    const xValues = data.map(d => new Date(d.date).getTime());
    const yValues = data.map(d => d.weight);
    
    const xMean = xValues.reduce((a, b) => a + b) / xValues.length;
    const yMean = yValues.reduce((a, b) => a + b) / yValues.length;
    
    const numerator = xValues.reduce((sum, x, i) => {
      return sum + (x - xMean) * (yValues[i] - yMean);
    }, 0);
    
    const denominator = xValues.reduce((sum, x) => {
      return sum + Math.pow(x - xMean, 2);
    }, 0);
    
    // Returns weight change per millisecond, convert to kg per week
    return (numerator / denominator) * (7 * 24 * 60 * 60 * 1000);
  }

  private static async updateUserMetrics(userId: string, newWeight: number) {
    // Get current user metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (metricsError) throw metricsError;

    if (metrics) {
      // Update current weight and recalculate nutrition goals
      const updatedMetrics = {
        ...metrics,
        currentWeight: newWeight,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('user_metrics')
        .upsert(updatedMetrics);

      if (updateError) throw updateError;

      // Recalculate nutrition goals with new weight
      await NutritionGoalsService.updateUserNutritionGoals(updatedMetrics);
    }
  }
} 