import React from 'react'
import { Slot } from 'expo-router'

const _layout = () => {
  console.log('Hello from _layout')
  return (
    <Slot></Slot>
  )
}

export default _layout