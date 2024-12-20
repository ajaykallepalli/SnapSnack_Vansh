import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function PlanScreen() {
  const [selectedDay, setSelectedDay] = useState('Today');
  const days = ['Today', 'Tomorrow', 'Monday', 'Tuesday'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Plan</Text>
        <TouchableOpacity>
          <Text style={styles.viewCalendar}>View Calendar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDay === day && styles.selectedDayText,
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.mealSchedule}>
        <View style={styles.mealSlot}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>Breakfast</Text>
            <Text style={styles.mealTime}>8:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.planButton}>
            <Text style={styles.planButtonText}>+ Plan breakfast</Text>
            <Text style={styles.planButtonSubtext}>Set your morning meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealSlot}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>Lunch</Text>
            <Text style={styles.mealTime}>12:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.planButton}>
            <Text style={styles.planButtonText}>+ Plan lunch</Text>
            <Text style={styles.planButtonSubtext}>Set your afternoon meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealSlot}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>Dinner</Text>
            <Text style={styles.mealTime}>6:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.planButton}>
            <Text style={styles.planButtonText}>+ Plan dinner</Text>
            <Text style={styles.planButtonSubtext}>Set your evening meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  viewCalendar: {
    color: '#007AFF',
  },
  daySelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    color: '#666',
    fontSize: 16,
  },
  selectedDayText: {
    color: '#fff',
  },
  mealSchedule: {
    padding: 16,
  },
  mealSlot: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mealTime: {
    color: '#666',
  },
  planButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  planButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 4,
  },
  planButtonSubtext: {
    color: '#666',
    fontSize: 14,
  },
}); 