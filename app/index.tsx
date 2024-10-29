import { View, Text, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Async Storage has been cleared!');
  } catch (error) {
    console.error('Error clearing Async Storage:', error);
  }
};

// Call this function when you want to reset storage
// clearAsyncStorage();

const IndexPage = () => {
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     if (session) {
  //       console.log('session', session);
  //       router.replace('/(tabs)/(home)');
  //     }
  //   });

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     if (session) {
  //       router.replace('/(tabs)/(home)');
  //     } else {
  //       router.replace('/(auth)/landingPage');
  //     }
  //   });
  // }, []);

  return(
    // <Redirect href="/(auth)/landingPage" />
    <Redirect href="/(auth)/landingPage" />
  )

};
export default IndexPage;
