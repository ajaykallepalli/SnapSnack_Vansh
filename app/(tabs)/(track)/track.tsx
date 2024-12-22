import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import React from 'react';
import { useNutritionContext } from '../../../services/nutritionContext';
import { DailyNutritionService } from '../../../services/dailyNutritionService';
import { NutritionTrackingService } from '../../../services/nutritionTracking';
import { MealCard } from '../../../components/MealCard';

export default function TrackScreen() {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [manualEntryVisible, setManualEntryVisible] = React.useState(false);
  const [selectedMeal, setSelectedMeal] = React.useState<'breakfast' | 'lunch' | 'snack' | 'dinner' | null>(null);
  const [foodEntry, setFoodEntry] = React.useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const { dailyNutritionLogs, dailyNutritionGoals } = useNutritionContext();

  const handleAddMeal = (meal: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const handleManualEntry = () => {
    setModalVisible(false);
    setManualEntryVisible(true);
  };

  const handleSaveEntry = async (entryMethod: 'manual' | 'scan' | 'search') => {
    const meal = {
      user_id: dailyNutritionLogs!.user_id,
      meal_type: selectedMeal!,
      food_name: foodEntry.name,
      calories: parseInt(foodEntry.calories),
      protein_g: parseInt(foodEntry.protein), 
      carbs_g: parseInt(foodEntry.carbs),
      fat_g: parseInt(foodEntry.fat),
      entry_method: entryMethod,
      eaten_at: new Date().toISOString(),
      logged_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    console.log('Meal to add:', meal);
    await NutritionTrackingService.addMealToDB(meal);
    setFoodEntry({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setManualEntryVisible(false);
  };

  const renderMealSection = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    title: string,
    icon: string
  ) => {
    const mealEntries = dailyNutritionLogs?.meals_data.filter(
      meal => meal.meal_type === mealType
    ) || [];

    return (
      <View key={mealType} style={styles.mealItem}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealIcon}>{icon}</Text>
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{title}</Text>
            {mealEntries.length === 0 && <Text style={styles.mealStatus}>No meals logged</Text>}
          </View>
          <Pressable onPress={() => handleAddMeal(mealType)}>
            <Text style={styles.addButton}>Add</Text>
          </Pressable>
        </View>
        
        {mealEntries.map((meal, index) => (
          <MealCard
            key={index}
            foodName={meal.food_name}
            calories={meal.calories}
            protein={meal.protein_g}
            carbs={meal.carbs_g}
            fat={meal.fat_g}
            time={new Date(meal.eaten_at).toLocaleTimeString([], { 
              hour: 'numeric', 
              minute: '2-digit'
            })}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <Text style={styles.caloriesLeft}>{dailyNutritionGoals?.calories_goal - dailyNutritionLogs?.calories_consumed} cals left</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.proteinBar, { width: `${(dailyNutritionGoals?.protein_goal - dailyNutritionLogs?.protein_consumed) / dailyNutritionGoals?.protein_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{dailyNutritionGoals?.protein_goal - dailyNutritionLogs?.protein_consumed}g left</Text>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.carbsBar, { width: `${(dailyNutritionGoals?.carbs_goal - dailyNutritionLogs?.carbs_consumed) / dailyNutritionGoals?.carbs_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{dailyNutritionGoals?.carbs_goal - dailyNutritionLogs?.carbs_consumed}g left</Text>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.fatBar, { width: `${(dailyNutritionGoals?.fat_goal - dailyNutritionLogs?.fat_consumed) / dailyNutritionGoals?.fat_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{dailyNutritionGoals?.fat_goal - dailyNutritionLogs?.fat_consumed}g left</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <View style={styles.mealList}>
            {renderMealSection('breakfast', 'Breakfast', '☕️')}
            {renderMealSection('lunch', 'Lunch', '🍽️')}
            {renderMealSection('snack', 'Snack', '🍩')}
            {renderMealSection('dinner', 'Dinner', '🌙')}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food To {selectedMeal?.charAt(0).toUpperCase() + selectedMeal?.slice(1)}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            
            <View style={styles.addOptions}>
              <Pressable style={styles.optionButton}>
                <Text style={styles.optionIcon}>📸</Text>
                <Text style={styles.optionText}>Scan Food</Text>
              </Pressable>
              
              <Pressable style={styles.optionButton}>
                <Text style={styles.optionIcon}>🔍</Text>
                <Text style={styles.optionText}>Search Food</Text>
              </Pressable>
              
              <Pressable style={styles.optionButton} onPress={handleManualEntry}>
                <Text style={styles.optionIcon}>✏️</Text>
                <Text style={styles.optionText}>Manual Entry</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={manualEntryVisible}
        onRequestClose={() => setManualEntryVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setManualEntryVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manual Food Entry</Text>
              <Pressable onPress={() => setManualEntryVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Food name"
                value={foodEntry.name}
                onChangeText={(text) => setFoodEntry(prev => ({ ...prev, name: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Calories"
                keyboardType="numeric"
                value={foodEntry.calories}
                onChangeText={(text) => setFoodEntry(prev => ({ ...prev, calories: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Protein (g)"
                keyboardType="numeric"
                value={foodEntry.protein}
                onChangeText={(text) => setFoodEntry(prev => ({ ...prev, protein: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Carbs (g)"
                keyboardType="numeric"
                value={foodEntry.carbs}
                onChangeText={(text) => setFoodEntry(prev => ({ ...prev, carbs: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Fat (g)"
                keyboardType="numeric"
                value={foodEntry.fat}
                onChangeText={(text) => setFoodEntry(prev => ({ ...prev, fat: text }))}
              />
              <Pressable style={styles.saveButton} onPress={() => handleSaveEntry('manual')}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  caloriesLeft: {
    color: '#007AFF',
    fontWeight: '500',
  },
  progressSection: {
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  macroLabel: {
    width: 60,
    fontSize: 14,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  proteinBar: {
    backgroundColor: '#007AFF',
  },
  carbsBar: {
    backgroundColor: '#34C759',
  },
  fatBar: {
    backgroundColor: '#FF9500',
  },
  macroValue: {
    width: 70,
    textAlign: 'right',
    fontSize: 14,
    color: '#666',
  },
  mealList: {
    gap: 16,
  },
  mealItem: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  mealStatus: {
    color: '#666',
  },
  addButton: {
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  addOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  optionButton: {
    alignItems: 'center',
    padding: 10,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 