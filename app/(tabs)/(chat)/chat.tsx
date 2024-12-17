import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import React from 'react';

export default function ChatScreen() {
  return (
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
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Message your coach..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text>📤</Text>
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 24,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
}); 