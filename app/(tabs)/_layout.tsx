import React from 'react'
import { Tabs } from 'expo-router'
const TabsLayout = () => {
  return (
    <Tabs>
        <Tabs.Screen name='(home)' options={{
        title: 'Home',
        }} />

        <Tabs.Screen name='(settings)' options={{
        title: 'Settings',
        }} />       

    </Tabs>
  )
}

export default TabsLayout