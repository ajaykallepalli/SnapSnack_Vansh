import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealLog } from '../types/foodTypes';

interface MealsListProps {
  meals: MealLog[];
}

export const MealsList = ({ meals }: MealsListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Meals</Text>
      {meals.length === 0 ? (
        <Text style={styles.emptyText}>No meals logged yet today</Text>
      ) : (
        meals.map((meal, index) => (
          <View key={index} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{meal.food_name}</Text>
              <Text style={styles.mealTime}>{meal.eaten_at}</Text>
            </View>
            <View style={styles.nutritionInfo}>
              <Text style={styles.nutritionText}>🔥 {meal.calories} cal</Text>
              <Text style={styles.nutritionText}>🥩 {meal.protein_g}g</Text>
              <Text style={styles.nutritionText}>🌾 {meal.carbs_g}g</Text>
              <Text style={styles.nutritionText}>🥑 {meal.fat_g}g</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginVertical: 24,
  },
  mealCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealTime: {
    color: '#666',
  },
  nutritionInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionText: {
    fontSize: 14,
    color: '#444',
  },
}); 