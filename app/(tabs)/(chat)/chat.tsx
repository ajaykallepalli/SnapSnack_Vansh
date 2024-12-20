import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../../../services/chatContext';
import { useNutritionContext } from '../../../services/nutritionContext';

export default function ChatScreen() {
  const { messages } = useChatContext();
  const { remainingNutrition } = useNutritionContext();
  useEffect(() => {
    console.log('Chat screen messages:', messages);
  }, [messages]);

  const scrollViewRef = useRef<ScrollView>(null);
  const prevMessagesLength = useRef(messages?.length || 0);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messages?.length !== prevMessagesLength.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure message is rendered
    }
    prevMessagesLength.current = messages?.length || 0;
  }, [messages]);

  return (
    //TODO: Customize summary and smaller box, and minimize button
    <View style={styles.container}>
      <ScrollView style={styles.chat} 
      ref={scrollViewRef}
      onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {/* Morning check-in */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Morning Check-in 😊{'\n'}
            Here's how you're doing so far:
          </Text>
          <Text style={styles.nutritionText}>
            🥩 Protein: {remainingNutrition.protein_goal - remainingNutrition.protein_consumed}g left{'\n'}
            🌾 Carbs: {remainingNutrition.carbs_goal - remainingNutrition.carbs_consumed}g left{'\n'} 
            🥑 Fat: {remainingNutrition.fat_goal - remainingNutrition.fat_consumed}g left
          </Text>
          <Text style={styles.questionText}>
            Would you like to plan your lunch?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Yes, suggest meals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Log breakfast first</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Show my goals</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* TODO: Add a new chat button and reset screen to show new messages and create a new chat session */}
        {messages && messages.map((msg, index) => {
          return (
            <View 
              key={index}
              style={[
                styles.messageContainer,
                msg.role === 'user' ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.role === 'user' && styles.userMessageText
              ]}>
                  {msg.content}
              </Text>
            </View>
          );
        })}
        <View style={{ height: 25 }} />
      </ScrollView>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chat: {
    flex: 1,
    padding: 16,
  },
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
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F8FF',
  },
  userMessageText: {
    color: '#fff',
  }
}); 