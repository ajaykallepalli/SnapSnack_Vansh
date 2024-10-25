import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, router } from 'expo-router'
import { useEffect } from 'react'
import { supabase } from '../utils/supabase'
const IndexPage = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)/Home')
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if(session) {
        router.replace('/(tabs)/Home')
      }
      else {
        router.replace('/(auth)/login')
      }
    })
  }, [])

  return (

    <Redirect href="/(auth)/login" /> 
  )
}

export default IndexPage