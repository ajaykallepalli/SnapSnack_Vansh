import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNutritionContext } from '../services/nutritionContext';
import { useChatContext } from '../services/chatContext';

export const TimeBasedCheckin = () => {
  const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();
  const { sendMessage } = useChatContext();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const getTimeBasedContent = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) {
      return {
        greeting: "Morning Check-in 😊",
        question: "Would you like to plan your lunch?",
        buttons: [
          { text: "Yes, suggest meals", message: "Can you suggest some healthy lunch options for today?" },
          { text: "Log breakfast first", message: "I'd like to log my breakfast first" },
          { text: "Show my goals", message: "Can you show me my nutritional goals for today?" },
        ]
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: "Lunch Check-in 🍽️",
        question: "Ready for your afternoon plan?",
        buttons: [
          { text: "Plan dinner", message: "Help me plan a healthy dinner for today" },
          { text: "Log lunch", message: "I want to log my lunch" },
          { text: "View progress", message: "Show me my progress for today" },
        ]
      };
    } else if (hour >= 15 && hour < 20) {
      return {
        greeting: "Evening Check-in 🌅",
        question: "Let's review your day:",
        buttons: [
          { text: "Plan dinner", message: "What should I have for dinner?" },
          { text: "Log snack", message: "I want to log a snack" },
          { text: "Daily summary", message: "Give me a summary of my day" },
        ]
      };
    } else {
      return {
        greeting: "Night Check-in 🌙",
        question: "Before you end your day:",
        buttons: [
          { text: "Complete diary", message: "Help me complete my food diary for today" },
          { text: "Plan tomorrow", message: "Let's plan tomorrow's meals" },
          { text: "View summary", message: "Show me today's nutrition summary" },
        ]
      };
    }
  };

  const content = getTimeBasedContent();

  const handleButtonPress = async (message: string) => {
    setIsExpanded(false);
    await sendMessage(message);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.messageContainer, !isExpanded && styles.minimizedContainer]}
      onPress={toggleExpanded}
      activeOpacity={0.8}
    >
      <Text style={styles.messageText}>
        {content.greeting}
      </Text>
      <Text style={styles.nutritionText}>
            🥩 Protein: {dailyNutritionGoals?.protein_goal && dailyNutritionLogs?.protein_consumed ? 
              `${dailyNutritionGoals.protein_goal - dailyNutritionLogs.protein_consumed}g left` : '--'}{'\n'}
            🌾 Carbs: {dailyNutritionGoals?.carbs_goal && dailyNutritionLogs?.carbs_consumed ?
              `${dailyNutritionGoals.carbs_goal - dailyNutritionLogs.carbs_consumed}g left` : '--'}{'\n'}
            🥑 Fat: {dailyNutritionGoals?.fat_goal && dailyNutritionLogs?.fat_consumed ?
              `${dailyNutritionGoals.fat_goal - dailyNutritionLogs.fat_consumed}g left` : '--'}
      </Text>
      
      {isExpanded && (
        <>
          <Text style={styles.questionText}>
            {content.question}
          </Text>
          <View style={styles.buttonContainer}>
            {content.buttons.map((button, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.button}
                onPress={() => handleButtonPress(button.message)}
              >
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  minimizedContainer: {
    paddingVertical: 8,
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