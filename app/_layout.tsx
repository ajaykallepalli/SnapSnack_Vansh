import React, { useEffect } from 'react'
import { Slot } from 'expo-router'
import { ChatProvider } from '../services/chatContext'
import { NutritionProvider } from '../services/nutritionContext'
import { useAuth } from '../hooks/useAuth'
import { DailyNutritionService } from '../services/dailyNutritionService'

const _layout = () => {
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      DailyNutritionService.initializeDailyGoals(session.user.id)
        .catch(console.error);
    }
  }, [session]);

  return (
    <NutritionProvider>
      <ChatProvider>
        <Slot></Slot>
      </ChatProvider>
    </NutritionProvider>
  )
}

export default _layout