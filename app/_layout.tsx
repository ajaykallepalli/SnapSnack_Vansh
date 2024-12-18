import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import { ChatProvider } from '../services/chatContext'

const _layout = () => {
  return (
    <ChatProvider>
      <Slot></Slot>
    </ChatProvider>
  )
}

export default _layout  