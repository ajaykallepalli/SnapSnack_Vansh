import React from 'react';
import { Slot, Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="landingPage" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
    </Stack>
  );
};

export default AuthLayout;
