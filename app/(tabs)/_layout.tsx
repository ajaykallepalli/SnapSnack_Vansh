// _layout.tsx
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

export default function ChatTabsLayout() {
  const { remainingNutrition } = useNutritionContext();
  const { sendMessage, isLoading } = useChatContext();
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);
  
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
        <View style={styles.header}>
          <Text style={styles.title}>Snap Snack</Text>
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesText}>{remainingNutrition.calories_goal - remainingNutrition.calories_consumed} cals left</Text>
          </View>
        </View>
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
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.buttonIcon}>➕</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 8,
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
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  buttonIcon: {
    fontSize: 20,
  },
});