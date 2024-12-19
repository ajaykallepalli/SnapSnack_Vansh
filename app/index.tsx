import { View, Text, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatProvider } from '../services/chatContext';
import { NutritionGoalsService } from '../services/weightTracking';
import { NutritionProvider } from '../services/nutritionContext';
const IndexPage = () => {
  useEffect(() => {
    const checkUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/(auth)/landingPage');
        return;
      }

      // Check if user has completed onboarding
      const { data: metrics } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!metrics) {
        router.replace('/(onboarding)/onBoardingForm');
        return;
      }
      router.replace('/(tabs)/');
      // Check if user has daily nutrition log for today
      // TODO: Change to goals table with all future days having goals
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data: dailyGoals } = await supabase
          .from('daily_nutrition_goals')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('effective_date', today)
          .single();
        console.log(dailyGoals);
        console.log(today);
        if (!dailyGoals) {
          // Get user's nutrition goals
          const goals = await NutritionGoalsService.getUserNutritionGoals(session.user.id);
          console.log(goals);
          console.log(today);
          // Create daily goals with goals
          
          await supabase.from('daily_nutrition_goals').insert({
            user_id: session.user.id,
            effective_date: today,
            calories_goal: goals.calories,
            protein_goal: goals.protein,
            carbs_goal: goals.carbs,
            fat_goal: goals.fat,
            meals_data: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching daily goals:', error);
        throw new Error('Failed to fetch daily nutrition goals');
      }
    };

    // Add delay to give time for navigation
    setTimeout(checkUserAndData, 1000);
  }, []);

  const resetSession = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    router.replace('/(auth)/landingPage');
  };

  return (
    <ChatProvider>
      <NutritionProvider>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text onPress={resetSession}>Reset Session</Text>
        </View>
      </NutritionProvider>
    </ChatProvider>
  );
};

export default IndexPage;