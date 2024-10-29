import React from 'react';
import { Slot, Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{
      headerShown: false,
      // presentation: 'modal',
    }}>
      <Stack.Screen name='login' />
      </Stack>
  );
};

export default AuthLayout;
