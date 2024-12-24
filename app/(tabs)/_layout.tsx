// _layout.tsx
import React from 'react';
import { router, Tabs } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  FlatList
} from 'react-native';
import { useRef } from 'react';
import { useChatContext } from '../../services/chatContext';
import { useNutritionContext } from '../../services/nutritionContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

export default function ChatTabsLayout() {
  const [inputText, setInputText] = useState('');
  const { sendMessage, isLoading } = useChatContext();
  const listRef = useRef<FlatList>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  
  // Memoize the header component to prevent re-renders
  const Header = React.memo(() => {
    const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();
    return (
      <View style={styles.header}>
        <Text style={styles.title}>Snap Snack</Text>
        <View style={styles.headerRight}>
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesText}>
              {dailyNutritionGoals?.calories_goal - dailyNutritionLogs?.calories_consumed} cals left
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(profile)')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  });
  
  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      const messageToSend = inputText;
      setInputText('');
      Keyboard.dismiss();
      router.push('/(tabs)/(chat)');
      await sendMessage(messageToSend);
      if (listRef.current) {
        listRef.current.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Header />
        <View style={styles.contentContainer}>
          <Tabs 
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#666',
              tabBarLabelStyle: styles.tabLabelStyle,
            }}
          >
            <Tabs.Screen 
              name="(chat)" 
              options={{
                title: 'Coach',
                tabBarIcon: ({ color }) => (
                  <Text style={[styles.tabIcon, { color }]}>💬</Text>
                ),
                tabBarLabel: 'Coach',
              }}
            />
            <Tabs.Screen 
              name="(track)" 
              options={{
                title: 'Track',
                tabBarIcon: ({ color }) => (
                  <Text style={[styles.tabIcon, { color }]}>📊</Text>
                ),
                tabBarLabel: 'Track',
              }}
            />
            <Tabs.Screen 
              name="(plan)" 
              options={{
                title: 'Plan',
                tabBarIcon: ({ color }) => (
                  <Text style={[styles.tabIcon, { color }]}>📅</Text>
                ),
                tabBarLabel: 'Plan',
              }}
            />
          </Tabs>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsOptionsVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          <TextInput 
            style={styles.input}
            placeholder="Message your coach..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text style={styles.buttonIcon}>{isLoading ? '⏳' : '📤'}</Text>
          </TouchableOpacity>
        </View>

        <Modal
          isVisible={isOptionsVisible}
          onBackdropPress={() => setIsOptionsVisible(false)}
          style={styles.optionsModal}
          backdropTransitionOutTiming={0}
        >
          <View style={styles.optionsContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Food or Start Discussion</Text>
              <TouchableOpacity onPress={() => setIsOptionsVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Quick Start</Text>
            <View style={styles.optionsGrid}>
              <TouchableOpacity style={styles.optionCard}>
                <Text style={styles.optionIcon}>🍽️</Text>
                <Text style={styles.optionTitle}>Log a Meal</Text>
                <Text style={styles.optionSubtitle}>Track your food intake</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard}>
                <Text style={styles.optionIcon}>📋</Text>
                <Text style={styles.optionTitle}>Meal Planning</Text>
                <Text style={styles.optionSubtitle}>Plan your upcoming meals</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard}>
                <Text style={styles.optionIcon}>📊</Text>
                <Text style={styles.optionTitle}>Progress Check</Text>
                <Text style={styles.optionSubtitle}>Review your nutrition goals</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard}>
                <Text style={styles.optionIcon}>❓</Text>
                <Text style={styles.optionTitle}>Nutrition Advice</Text>
                <Text style={styles.optionSubtitle}>Get personalized guidance</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Custom Topic</Text>
            <TouchableOpacity style={styles.customTopicButton}>
              <Text style={styles.plusIcon}>+</Text>
              <View>
                <Text style={styles.customTopicTitle}>Start Custom Discussion</Text>
                <Text style={styles.customTopicSubtitle}>Choose your own topic</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  caloriesBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  caloriesText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 49,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    marginHorizontal: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
  sendButton: {
    padding: 8,
  },
  buttonIcon: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 24,
  },
  optionsModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  customTopicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  plusIcon: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 12,
  },
  customTopicTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  customTopicSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});