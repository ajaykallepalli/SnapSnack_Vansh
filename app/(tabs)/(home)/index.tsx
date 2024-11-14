import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const navigateDate = (direction: 'forward' | 'backward') => {
    const newDate = new Date(selectedDate)
    if (direction === 'forward') {
      newDate.setDate(newDate.getDate() + 1)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setSelectedDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dateNavigator}>
        <TouchableOpacity 
          onPress={() => navigateDate('backward')}
          style={styles.arrowButton}
        >
          <Ionicons name="chevron-back" size={28} color="#4a90e2" />
        </TouchableOpacity>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigateDate('forward')}
          style={styles.arrowButton}
        >
          <Ionicons name="chevron-forward" size={28} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Rest of your home page content will go here */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 2,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  arrowButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
})

export default HomePage