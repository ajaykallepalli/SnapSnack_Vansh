// NutritionTracking.ts
import { supabase } from '../utils/supabase';
import { DailyNutrition, MealLog } from '../types/foodTypes';
import { useState, useEffect } from 'react';
export class NutritionTrackingService {
  private static _currentLog: DailyNutrition | null = null;
  private static _subscribers: ((log: DailyNutrition | null) => void)[] = [];

  static subscribe(callback: (log: DailyNutrition | null) => void) {
    this._subscribers.push(callback);
    callback(this._currentLog);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  }

  private static notifySubscribers() {
    this._subscribers.forEach(callback => callback(this._currentLog));
  }

  static async getDailyLog(userId: string, date: string): Promise<DailyNutrition | null> {
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

  static async updateDailyLog(log: DailyNutrition) {
    const { error } = await supabase
      .from('daily_nutrition_logs')
      .upsert({
        user_id: log.user_id,
        log_date: log.log_date,
        calories_consumed: log.calories_consumed,
        protein_consumed: log.protein_consumed,
        carbs_consumed: log.carbs_consumed,
        fat_consumed: log.fat_consumed,
        meals_data: log.meals_data,
        metadata: log.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    this._currentLog = log;
    this.notifySubscribers();
  }

  static getCurrentLog(): DailyNutrition | null {
    return this._currentLog;
  }
}