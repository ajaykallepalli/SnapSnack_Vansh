import React from 'react';
import { Stack } from 'expo-router';

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
