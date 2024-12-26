import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatContext } from '../services/chatContext';
import { useNutritionContext } from '../services/nutritionContext';
import { supabase } from '../utils/supabase';

export const TimeBasedCheckin = () => {
  const { sendMessage, handleCreateNewSession, setIsSessionModalVisible } = useChatContext();
  const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const checkTime = () => {
      const newHour = new Date().getHours();
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
        createNewSessionForTimeChange();
      }
    };

    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, [currentHour]);

  const createNewSessionForTimeChange = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      handleCreateNewSession();
    }
  };

  const handleButtonPress = async (message: string) => {
    setIsExpanded(false);
    await sendMessage(message);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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

  return (
    <TouchableOpacity 
      style={[styles.messageContainer, !isExpanded && styles.minimizedContainer]}
      onPress={toggleExpanded}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <Text style={styles.messageText}>{content.greeting}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            onPress={() => handleCreateNewSession()}
            style={styles.iconButton}
          >
            <Ionicons name="add-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsSessionModalVisible(true)}
            style={styles.iconButton}
          >
            <Ionicons name="time-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.nutritionText}>
        🥩 Protein: {dailyNutritionGoals?.protein_goal ? 
          `${dailyNutritionGoals.protein_goal - (dailyNutritionLogs?.protein_consumed || 0)}g left` : '--'}{'\n'}
        🌾 Carbs: {dailyNutritionGoals?.carbs_goal ?
          `${dailyNutritionGoals.carbs_goal - (dailyNutritionLogs?.carbs_consumed || 0)}g left` : '--'}{'\n'}
        🥑 Fat: {dailyNutritionGoals?.fat_goal ?
          `${dailyNutritionGoals.fat_goal - (dailyNutritionLogs?.fat_consumed || 0)}g left` : '--'}
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
    marginTop: 12,
    marginHorizontal: 12,
  },
  minimizedContainer: {
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  messageText: {
    fontSize: 16,
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