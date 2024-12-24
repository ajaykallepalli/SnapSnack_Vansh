import { Stack } from 'expo-router';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginLeft: 16 }}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
      ),
      headerTitle: "Profile & Settings",
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: '600',
      },
      headerTitleAlign: 'center',
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" />
    </Stack>
  );
} 