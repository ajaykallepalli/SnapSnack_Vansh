// NutritionTracking.ts
import { supabase } from '../utils/supabase';
import { DailyNutritionGoals, DailyNutritionLogs, MealLog } from '../types/foodTypes';
import { useState, useEffect } from 'react';
export class NutritionTrackingService {
  private static _currentLog: DailyNutritionLogs | null = null;
  private static _subscribers: ((log: DailyNutritionLogs | null) => void)[] = [];

  static subscribe(callback: (log: DailyNutritionLogs | null) => void) {
    this._subscribers.push(callback);
    callback(this._currentLog);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  }

  private static notifySubscribers() {
    this._subscribers.forEach(callback => callback(this._currentLog));
  }

  static async getDailyLog(userId: string, date: string): Promise<DailyNutritionLogs | null> {
    const { data, error } = await supabase
      .from('daily_nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .maybeSingle();
    
    if (error) throw error;
    this._currentLog = data;
    this.notifySubscribers();
    return data;
  }

  static async getDailyGoals(userId: string, date: string): Promise<DailyNutritionGoals | null> {
    const { data, error } = await supabase
      .from('daily_nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('effective_date', date)
      .maybeSingle();
    return data;
  }

  static async updateDailyLog(log: DailyNutritionLogs) {
    // First check if record exists
    const { data: existingLog } = await supabase
      .from('daily_nutrition_logs')
      .select('id')
      .eq('user_id', log.user_id)
      .eq('log_date', log.log_date)
      .maybeSingle();

    const { error } = await supabase
      .from('daily_nutrition_logs')
      .upsert({
        id: existingLog?.id, // Include ID if it exists
        user_id: log.user_id,
        log_date: log.log_date,
        calories_consumed: log.calories_consumed,
        protein_consumed: log.protein_consumed,
        carbs_consumed: log.carbs_consumed,
        fat_consumed: log.fat_consumed,
        meals_data: log.meals_data,
        metadata: log.metadata,
        updated_at: new Date().toISOString(),
        // Only set created_at for new records
        ...(existingLog ? {} : { created_at: new Date().toISOString() })
      }, {
        onConflict: 'user_id,log_date'
      });

    if (error) {
      console.error('Error updating daily log:', error);
      throw error;
    }

    this._currentLog = log;
    this.notifySubscribers();
  }

  static getCurrentLog(): DailyNutritionLogs | null {
    return this._currentLog;
  }

  static async addMealToDB(meal: MealLog) {
    // First save to food_entries
    const { data: newEntry, error: foodEntryError } = await supabase
      .from('food_entries')
      .insert({
        user_id: meal.user_id,
        food_name: meal.food_name,
        message_id: meal?.message_id ?? null,
        nutrition_data: meal?.nutrition_data ?? null,
        entry_source: meal?.entry_source ?? null,
        eaten_at: meal.eaten_at,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        meal_type: meal.meal_type,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (foodEntryError) throw foodEntryError;

    // Add the ID to the meal object
    const mealWithId = { ...meal, id: newEntry.id };

    // Get or create daily log
    if (!this._currentLog) {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingLog } = await supabase
        .from('daily_nutrition_logs')
        .select('*')
        .eq('user_id', meal.user_id)
        .eq('log_date', today)
        .maybeSingle();

      if (existingLog) {
        this._currentLog = existingLog;
        console.log('Existing log:', this._currentLog);
      } else {
        this._currentLog = {
          user_id: meal.user_id,
          log_date: today,
          calories_consumed: 0,
          protein_consumed: 0,
          carbs_consumed: 0,
          fat_consumed: 0,
          meals_data: [],
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }
    // Update totals and meals array with the meal that includes ID
    this._currentLog!.calories_consumed += mealWithId.calories;
    this._currentLog!.protein_consumed += mealWithId.protein_g;
    this._currentLog!.carbs_consumed += mealWithId.carbs_g;
    this._currentLog!.fat_consumed += mealWithId.fat_g;
    this._currentLog!.meals_data.push(mealWithId);
    
    // Save updated log
    await this.updateDailyLog(this._currentLog!);
  }

  static async updateMealImage(mealId: string, imageUrl: string, thumbnailUrl: string) {
    const { data: { publicUrl: fullUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(imageUrl);
    
    const { data: { publicUrl: thumbUrl } } = supabase.storage
      .from('food-images')
      .getPublicUrl(thumbnailUrl);

    const { error } = await supabase
      .from('food_entries')
      .update({ 
        image_url: fullUrl,
        thumbnail_url: thumbUrl 
      })
      .eq('id', mealId);

    if (error) throw error;

    // Update the meal in the current log
    if (this._currentLog) {
      const mealIndex = this._currentLog.meals_data.findIndex(m => m.id === mealId);
      if (mealIndex !== -1) {
        this._currentLog.meals_data[mealIndex].image_url = fullUrl;
        this._currentLog.meals_data[mealIndex].thumbnail_url = thumbUrl;
        await this.updateDailyLog(this._currentLog);
      }
    }
  }
}
