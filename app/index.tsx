import { View, Text, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      if (metrics) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/(onboarding)/onBoardingForm');
      }
    };

    // Add delay to give time to press button
    setTimeout(checkUserAndData, 1000);
  }, []);

  const resetSession = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.clear();
    router.replace('/(auth)/landingPage');
  };

  // Temporary return with button instead of null
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text onPress={resetSession}>Reset Session</Text>
    </View>
  );
};

export default IndexPage;
