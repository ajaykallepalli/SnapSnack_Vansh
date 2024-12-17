import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

export default function TrackScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <Text style={styles.caloriesLeft}>1447 left</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, styles.proteinBar, { width: '60%' }]} />
            </View>
            <Text style={styles.macroValue}>108g left</Text>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, styles.carbsBar, { width: '75%' }]} />
            </View>
            <Text style={styles.macroValue}>162g left</Text>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.macroLabel}>Fat</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, styles.fatBar, { width: '45%' }]} />
            </View>
            <Text style={styles.macroValue}>40g left</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <View style={styles.mealList}>
          <View style={styles.mealItem}>
            <Text style={styles.mealIcon}>☕️</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle}>Breakfast</Text>
              <Text style={styles.mealStatus}>No meals logged</Text>
            </View>
            <Text style={styles.addButton}>Add</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
}); 