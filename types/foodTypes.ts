export interface DailyNutritionLogs {
    id?: string;
    user_id: string;
    log_date: string;
    calories_consumed: number;
    protein_consumed: number;
    carbs_consumed: number;
    fat_consumed: number;
    meals_data: MealLog[];
    metadata?: any;
    created_at: string;
    updated_at?: string;
  }

  export interface DailyNutritionGoals {
    id?: string;
    user_id: string;
    effective_date: string;
    calories_goal: number;
    protein_goal: number;
    carbs_goal: number;
    fat_goal: number;
    metadata?: any;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface MealLog {
    id: string;
    user_id: string;
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    meal_type: string;
    eaten_at: string;
    message_id?: string;
    nutrition_data?: any;
    entry_source?: string;
    image_url?: string;
    thumbnail_url?: string;
    created_at?: string;
  }

export interface NutritionContextType {
  dailyNutritionLogs: DailyNutritionLogs | null;
  dailyNutritionGoals: DailyNutritionGoals | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  remainingNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  updateDailyNutrition: (meal: MealLog) => Promise<void>;
  isLoading: boolean;
  refreshNutrition: () => Promise<void>;
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