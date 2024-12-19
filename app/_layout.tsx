import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import { ChatProvider } from '../services/chatContext'
import { NutritionProvider } from '../services/nutritionContext'
const _layout = () => {
  return (
    <NutritionProvider>
      <ChatProvider>
        <Slot></Slot>
      </ChatProvider>
    </NutritionProvider>
  )
}

export default _layout  