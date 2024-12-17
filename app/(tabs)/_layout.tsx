import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';

export default function ChatTabsLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Snap Snack</Text>
        <View style={styles.caloriesBadge}>
          <Text style={styles.caloriesText}>1446 cals left</Text>
        </View>
      </View>
      
      <View style={styles.mainContent}>
        <Tabs 
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#666',
          }}
        >
          <Tabs.Screen 
            name="(chat)" 
            options={{
              title: 'Coach',
              tabBarLabel: ({ color }) => (
                <View style={styles.tabItem}>
                  <Text style={[styles.icon, { color }]}>💬</Text>
                  <Text style={[styles.tabLabel, { color }]}>Coach</Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen 
            name="(track)" 
            options={{
              title: 'Track',
              tabBarLabel: ({ color }) => (
                <View style={styles.tabItem}>
                  <Text style={[styles.icon, { color }]}>📊</Text>
                  <Text style={[styles.tabLabel, { color }]}>Track</Text>
                </View>
              ),
            }}
          />
          <Tabs.Screen 
            name="(plan)" 
            options={{
              title: 'Plan',
              tabBarLabel: ({ color }) => (
                <View style={styles.tabItem}>
                  <Text style={[styles.icon, { color }]}>📅</Text>
                  <Text style={[styles.tabLabel, { color }]}>Plan</Text>
                </View>
              ),
            }}
          />
        </Tabs>
        
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caloriesBadge: {
    backgroundColor: '#E5F1FF',
    padding: 8,
    borderRadius: 16,
  },
  caloriesText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  tabBar: {
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
    height: 69,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabLabel: {
    fontSize: 14,
    textTransform: 'none',
    fontWeight: '500',
  },
  icon: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
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
