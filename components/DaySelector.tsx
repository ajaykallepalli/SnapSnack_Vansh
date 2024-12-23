import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { format, addDays, startOfToday } from 'date-fns';

interface DayInfo {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
}

interface DaySelectorProps {
  onDateChange?: (date: Date) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ onDateChange }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(startOfToday());
  
  const days: DayInfo[] = Array.from({ length: 29 }, (_, i) => {
    const date = addDays(startOfToday(), i - 27);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: i === 27
    };
  });

  // Scroll to selected date when tab is focused
  useEffect(() => {
    const index = days.findIndex(day => 
      day.date.getTime() === selectedDay.getTime()
    );
    if (index !== -1) {
      const screenWidth = 48 * 5; // Approximate width showing ~5 days
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, (index * (48 + 8)) - screenWidth - (48 + 8)), // Show selected date second from right
        animated: true
      });
    }
  }, [selectedDay]);

  const handleDayClick = (date: Date): void => {
    setSelectedDay(date);
    onDateChange?.(date);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
        snapToInterval={48 + 8}
        decelerationRate="fast"
        snapToAlignment="center"
      >
        {days.map((day: DayInfo) => {
          const isSelected = day.date.getTime() === selectedDay.getTime();
          const isDisabled = day.date < addDays(startOfToday(), -27) || day.date > addDays(startOfToday(), 1);
          
          return (
            <Pressable
              key={day.date.toString()}
              onPress={() => !isDisabled && handleDayClick(day.date)}
              disabled={isDisabled}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDay,
                day.isToday && styles.today,
                isDisabled && styles.disabled
              ]}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedText]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.selectedText]}>
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  daysContainer: {
    paddingHorizontal: 8,
    gap: 8,
  },
  dayButton: {
    alignItems: 'center',
    width: 48,
    padding: 8,
    borderRadius: 24,
  },
  dayName: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#dbeafe',
  },
  selectedText: {
    color: '#2563eb',
  },
  today: {
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default DaySelector;