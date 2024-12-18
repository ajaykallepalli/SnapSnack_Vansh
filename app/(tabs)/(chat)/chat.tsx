import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect } from 'react';
import { useChatState } from '../../../services/openai';


export default function ChatScreen() {
  const { messages } = useChatState();
  useEffect(() => {
    console.log('Messages:', messages);
  }, [messages]);

  return (
    //TODO: Customize summary and smaller box
    <View style={styles.container}>
      <ScrollView style={styles.chat}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Morning Check-in 😊{'\n'}
            Here's how you're doing so far:
          </Text>
          <Text style={styles.nutritionText}>
            🥩 Protein: 108g left{'\n'}
            🌾 Carbs: 162g left{'\n'}
            🥑 Fat: 40g left
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

        {messages.map((msg, index) => (
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
        ))}
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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