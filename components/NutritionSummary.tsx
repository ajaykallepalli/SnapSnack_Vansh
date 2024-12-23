import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyNutritionLogs, DailyNutritionGoals } from '../types/foodTypes';

interface NutritionSummaryProps {
  logs: DailyNutritionLogs | null;
  goals: DailyNutritionGoals | null;
}

export const NutritionSummary = ({ logs, goals }: NutritionSummaryProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Summary</Text>
      <View style={styles.grid}>
        <View style={styles.nutrientBox}>
          <Text style={styles.label}>Calories</Text>
          <Text style={styles.value}>
            {logs?.calories_consumed || 0} / {goals?.calories_goal || 0}
          </Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.label}>Protein</Text>
          <Text style={styles.value}>
            {logs?.protein_consumed || 0}g / {goals?.protein_goal || 0}g
          </Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.label}>Carbs</Text>
          <Text style={styles.value}>
            {logs?.carbs_consumed || 0}g / {goals?.carbs_goal || 0}g
          </Text>
        </View>
        <View style={styles.nutrientBox}>
          <Text style={styles.label}>Fat</Text>
          <Text style={styles.value}>
            {logs?.fat_consumed || 0}g / {goals?.fat_goal || 0}g
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutrientBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 