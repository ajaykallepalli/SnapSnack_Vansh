import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ChatTabsLayout() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Your custom header */}
      <View style={styles.header}>
        <Text style={styles.title}>Snap Snack</Text>
        <View style={styles.caloriesBadge}>
          <Text style={styles.caloriesText}>1446 cals left</Text>
        </View>
      </View>
      
      {/* Tabs below header */}
      <Tabs 
        screenOptions={{
          // Using custom header, so hide the default one
          headerShown: false,
          
          // The tabBar is at the top by default for Expo Router 
          // if you're using <Tabs> as a top-level route. 
          // (No need for `tabBarPosition: 'top'` in Expo Router v2+)
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    // Custom header styling
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
    // This styles the actual tab bar container
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
});
