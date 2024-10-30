import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome, Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <Ionicons name="home" size={24} color="black" />
            ) : (
              <Ionicons name="home-outline" size={24} color="black" />
            ),
        }}
      />

      <Tabs.Screen
        name="(chatbot)"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <Entypo name="message" size={24} color="black" />
            ) : (
              <Feather name="message-square" size={24} color="black" />
            ),
        }}
      />

      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <Ionicons name="settings" size={24} color="black" />
            ) : (
              <Feather name="settings" size={24} color="black" />
            ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;