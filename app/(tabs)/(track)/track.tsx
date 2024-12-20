import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import React from 'react';
import { useNutritionContext } from '../../../services/nutritionContext';
import { DailyNutritionService } from '~/services/dailyNutritionService';
import { NutritionTrackingService } from '~/services/nutritionTracking';
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
  const { dailyNutritionLogs, dailyNutritionGoals, remainingNutrition } = useNutritionContext();

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

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <Text style={styles.caloriesLeft}>{remainingNutrition.calories_goal - remainingNutrition.calories_consumed} cals left</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.proteinBar, { width: `${(remainingNutrition.protein_goal - remainingNutrition.protein_consumed) / remainingNutrition.protein_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{remainingNutrition.protein_goal - remainingNutrition.protein_consumed}g left</Text>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.carbsBar, { width: `${(remainingNutrition.carbs_goal - remainingNutrition.carbs_consumed) / remainingNutrition.carbs_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{remainingNutrition.carbs_goal - remainingNutrition.carbs_consumed}g left</Text>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, styles.fatBar, { width: `${(remainingNutrition.fat_goal - remainingNutrition.fat_consumed) / remainingNutrition.fat_goal * 100}%` }]} />
              </View>
              <Text style={styles.macroValue}>{remainingNutrition.fat_goal - remainingNutrition.fat_consumed}g left</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <View style={styles.mealList}>
            {['breakfast', 'lunch', 'snack', 'dinner'].map((meal) => (
              <View key={meal} style={styles.mealItem}>
                <Text style={styles.mealIcon}>
                  {meal === 'breakfast' ? '☕️' : meal === 'lunch' ? '🍽️' : meal === 'snack' ? '🍩' : '🌙'}
                </Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTitle}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                  <Text style={styles.mealStatus}>No meals logged</Text>
                </View>
                <Pressable onPress={() => handleAddMeal(meal as any)}>
                  <Text style={styles.addButton}>Add</Text>
                </Pressable>
              </View>
            ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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