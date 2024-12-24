import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNutritionContext } from '../services/nutritionContext';

export const TimeBasedCheckin = () => {
  const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();
  
  const getTimeBasedContent = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) {
      return {
        greeting: "Morning Check-in 😊",
        question: "Would you like to plan your lunch?",
        buttons: [
          { text: "Yes, suggest meals", action: () => console.log("Suggest meals") },
          { text: "Log breakfast first", action: () => console.log("Log breakfast") },
          { text: "Show my goals", action: () => console.log("Show goals") },
        ]
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: "Lunch Check-in 🍽️",
        question: "Ready for your afternoon plan?",
        buttons: [
          { text: "Plan dinner", action: () => console.log("Plan dinner") },
          { text: "Log lunch", action: () => console.log("Log lunch") },
          { text: "View progress", action: () => console.log("View progress") },
        ]
      };
    } else if (hour >= 15 && hour < 20) {
      return {
        greeting: "Evening Check-in 🌅",
        question: "Let's review your day:",
        buttons: [
          { text: "Plan dinner", action: () => console.log("Plan dinner") },
          { text: "Log snack", action: () => console.log("Log snack") },
          { text: "Daily summary", action: () => console.log("Daily summary") },
        ]
      };
    } else {
      return {
        greeting: "Night Check-in 🌙",
        question: "Before you end your day:",
        buttons: [
          { text: "Complete diary", action: () => console.log("Complete diary") },
          { text: "Plan tomorrow", action: () => console.log("Plan tomorrow") },
          { text: "View summary", action: () => console.log("View summary") },
        ]
      };
    }
  };

  const content = getTimeBasedContent();

  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>
        {content.greeting}{'\n'}
        Here's how you're doing so far:
      </Text>
      <Text style={styles.nutritionText}>
        🥩 Protein: {dailyNutritionGoals?.protein_goal - dailyNutritionLogs?.protein_consumed}g left{'\n'}
        🌾 Carbs: {dailyNutritionGoals?.carbs_goal - dailyNutritionLogs?.carbs_consumed}g left{'\n'} 
        🥑 Fat: {dailyNutritionGoals?.fat_goal - dailyNutritionLogs?.fat_consumed}g left
      </Text>
      <Text style={styles.questionText}>
        {content.question}
      </Text>
      <View style={styles.buttonContainer}>
        {content.buttons.map((button, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.button}
            onPress={button.action}
          >
            <Text style={styles.buttonText}>{button.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  nutritionText: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 