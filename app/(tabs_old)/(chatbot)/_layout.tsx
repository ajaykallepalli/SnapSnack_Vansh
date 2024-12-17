import React from 'react'
import { Stack } from 'expo-router'
const ChatbotLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Chatbot',
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default ChatbotLayout