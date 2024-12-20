export interface DailyNutrition {
    id?: string;
    user_id: string;
    log_date: string;
    calories_goal: number;
    calories_consumed: number;
    protein_goal: number;
    protein_consumed: number;
    carbs_goal: number;
    carbs_consumed: number;
    fat_goal: number;
    fat_consumed: number;
    meals_data: MealLog[];
    metadata?: any;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface MealLog {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
  }

export interface NutritionContextType {
    dailyNutrition: DailyNutrition | null;
    updateDailyNutrition: (meal: MealLog) => Promise<void>;
    remainingNutrition: {
      calories_goal: number;
      calories_consumed: number;
      protein_goal: number;
      protein_consumed: number;
      carbs_goal: number;
      carbs_consumed: number;
      fat_goal: number;
      fat_consumed: number;
    };
    isLoading: boolean;
  }

export interface UserMetrics {
    user_id: string;
    currentWeight: number;  // in kg
    goalWeight: number;     // in kg
    height: number;        // in cm
    age: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}


export interface WeightEntry {
    id?: string;
    user_id: string;
    weight: number;
    date: string;
    notes?: string;
  }