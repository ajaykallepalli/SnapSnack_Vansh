import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect } from 'react';
import { useChatContext } from '../../../services/chatContext';

export default function ChatScreen() {
  const { messages } = useChatContext();

  useEffect(() => {
    console.log('Chat screen messages:', messages);
  }, [messages]);

  return (
    //TODO: Add a new chat button and reset screen to show new messages and create a new chat session
    //TODO: Customize summary and smaller box, and minimize button
    <View style={styles.container}>
      <ScrollView style={styles.chat}>
        {/* Morning check-in */}
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
        {messages && messages.map((msg, index) => {
          console.log('Rendering message:', msg); // Debug log
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
    marginBottom: 0,
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
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F8FF',
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#fff',
  }
}); 