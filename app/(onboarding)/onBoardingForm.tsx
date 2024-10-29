import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function OnboardingScreen() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [formData, setFormData] = useState({});

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      console.log('Onboarding complete', formData);
      // Here you would typically navigate to the main app or submit the data
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
    width: 60,
    height: 6,
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
