import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { onBoardingData } from '@/assets/svg/Onboarding/onboardingData';
import { scale, verticalScale } from 'react-native-size-matters';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

// Define the type for the animations object
type AnimationsType = {
  [key: number]: object;
};

// Static imports for Lottie animations
const animations: AnimationsType = {
  1: require('@/assets/lottie/animation1.json'),
  2: require('@/assets/lottie/animation2.json'),
  3: require('@/assets/lottie/animation3.json'),
  // Add more mappings as needed
};

export default function OnBoardingScreen() {
  let [fontsLoaded, fontError] = useFonts({
    SegoeUI: require('@/assets/fonts/segoeuithis.ttf'),
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / event.nativeEvent.layoutMeasurement.width);
    setActiveIndex(currentIndex);
  };

  const handleGetStarted = () => {
    console.log('Get Started pressed');
    router.push('/login');
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#4a90e2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        ref={scrollViewRef}>
        {onBoardingData.map((item: onBoardingDataType, index: number) => (
          <View key={index} style={styles.slide}>
            <LottieView
              autoPlay
              style={{
                width: 250,
                height: 250,
                marginVertical: verticalScale(30),
              }}
              source={animations[item.id]}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {onBoardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: activeIndex === index ? scale(16) : scale(8),
                opacity: activeIndex === index ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#333',
    fontSize: scale(23),
    fontFamily: 'SegoeUI',
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    width: scale(290),
    marginHorizontal: 'auto',
    color: '#666',
    fontSize: scale(14),
    fontFamily: 'SegoeUI',
    textAlign: 'center',
    fontWeight: '400',
    paddingTop: verticalScale(10),
  },
  paginationContainer: {
    position: 'absolute',
    bottom: verticalScale(130),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  dot: {
    height: scale(8),
    borderRadius: 100,
    backgroundColor: '#4a90e2',
    marginHorizontal: scale(2),
  },
  skipContainer: {
    position: 'absolute',
    top: verticalScale(45),
    right: scale(30),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    zIndex: 100,
  },
  skipText: {
    color: '#4a90e2',
    fontSize: scale(16),
    fontFamily: 'SegoeUI',
    fontWeight: '400',
  },
  getStartedButton: {
    position: 'absolute',
    bottom: verticalScale(50),
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(12),
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  getStartedText: {
    color: '#4a90e2',
    fontSize: scale(16),
    fontFamily: 'SegoeUI',
    fontWeight: '500',
  },
});
