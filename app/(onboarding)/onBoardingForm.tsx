import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';

const { width, height } = Dimensions.get('window');

const screens = [
  {
    title: "Let's Get Started !",
    inputs: [
      { label: 'Weight', key: 'weight' },
      { label: 'Height', key: 'height' },
    ],
  },
  {
    title: 'Tell Us More',
    inputs: [
      { label: 'Age', key: 'age' },
      { label: 'Gender', key: 'gender' },
    ],
  },
  {
    title: 'Almost Done',
    inputs: [
      { label: 'Activity Level', key: 'activityLevel' },
      { label: 'Goal', key: 'goal' },
    ],
  },
];

// Add types for form data
interface FormData {
  weight?: string;
  height?: string;
  age?: string;
  gender?: string;
  activityLevel?: string;
  goal?: string;
  [key: string]: string | undefined;
}

export default function OnboardingScreen() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (key: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };
  const saveUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check if profile exists
      const { data: existingProfile, error: existingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingProfile) {
        router.replace('/(tabs)/');
        return;
      }

      // Insert profile with better error handling
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          subscription_status: 'free'
        });

      if (profileError) {
        console.error('Profile insertion error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Insert metrics with better error handling
      const { error: metricsError } = await supabase
        .from('user_metrics')
        .insert({
          user_id: user.id,
          weight: parseFloat(formData.weight || '0'),
          height: parseFloat(formData.height || '0'),
          age: parseInt(formData.age || '0'),
          gender: formData.gender,
          activity_level: formData.activityLevel,
          goal_weight: parseFloat(formData.goal || '0'),
        });

      if (metricsError) {
        console.error('Metrics insertion error:', metricsError);
        throw new Error(`Failed to save metrics: ${metricsError.message}`);
      }

      router.replace('/(tabs)/');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save your information');
    }
  };

  const handleNext = async () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      await saveUserData();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  return (
    <>
      <View style={styles.blueSection}>
        <View style={styles.progressBar}>
          {screens.map((_, index) => (
            <View
              key={index}
              style={[styles.progressDot, index <= currentScreen ? styles.progressDotActive : {}]}
            />
          ))}
        </View>
        <Text style={styles.title}>{screens[currentScreen].title}</Text>
        {screens[currentScreen].inputs.map((input) => (
          <View key={input.key} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{input.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${input.label.toLowerCase()}`}
              placeholderTextColor="#FFFFFF80"
              onChangeText={(text) => handleInputChange(input.key, text)}
              value={formData[input.key]}
            />
          </View>
        ))}
      </View>
      <View style={styles.navigationSection}>
        <TouchableOpacity
          style={[styles.navigationButton, currentScreen === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentScreen === 0}>
          <Ionicons
            name="arrow-back"
            size={30}
            color={currentScreen === 0 ? '#CCCCCC' : '#FFFFFF'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationButton} onPress={handleNext}>
          <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  blueSection: {
    backgroundColor: '#007FFF',
    height: height * 0.55,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    padding: 20,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  progressDot: {
    width: 80,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#FFDAB9',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#FF7F50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  navigationButton: {
    padding: 15,
    backgroundColor: '#007FFF',
    borderRadius: 30,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});
