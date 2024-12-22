import { View, Text, StyleSheet } from "react-native";

interface MealCardProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

export const MealCard = ({ foodName, calories, protein, carbs, fat, time }: MealCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.foodName}>{foodName}</Text>
        <Text style={styles.calories}>{calories} cal</Text>
      </View>
      <View style={styles.macros}>
        <Text style={styles.macro}>P: {protein}g</Text>
        <Text style={styles.macro}>C: {carbs}g</Text>
        <Text style={styles.macro}>F: {fat}g</Text>
        {time && <Text style={styles.time}>{time}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  calories: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  macro: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 14,
    color: '#999',
    marginLeft: 'auto',
  },
}); 