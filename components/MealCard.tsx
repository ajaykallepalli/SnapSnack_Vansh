import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useImageUpload } from '../hooks/useImageUpload';
import { Alert } from 'react-native';

interface MealCardProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  foodId: string;
  onImageUploaded?: (urls: { fullUrl: string, thumbUrl: string }) => void;
  onDeleteMeal?: () => void;
}

export const MealCard = ({ 
  foodName, 
  calories, 
  protein, 
  carbs, 
  fat, 
  time, 
  imageUrl, 
  thumbnailUrl,
  foodId, 
  onImageUploaded,
  onDeleteMeal
}: MealCardProps) => {
  const { launchCamera, launchLibrary, uploadImage } = useImageUpload();

  const handleImageUpload = () => {
    Alert.alert(
      "Add Photo",
      "Choose a photo source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const uri = await launchCamera();
            if (uri) {
              const urls = await uploadImage(uri, foodId);
              if (urls && onImageUploaded) {
                onImageUploaded(urls);
              }
            }
          }
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const uri = await launchLibrary();
            if (uri) {
              const urls = await uploadImage(uri, foodId);
              if (urls && onImageUploaded) {
                onImageUploaded(urls);
              }
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDeleteMeal }
      ]
    );
  };

  console.log('Image Debug:', {
    thumbnailUrl,
    imageUrl,
    usingUrl: thumbnailUrl || imageUrl,
  });

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {(thumbnailUrl || imageUrl) ? (
          <Image 
            source={{ uri: thumbnailUrl || imageUrl }} 
            style={styles.image}
            resizeMode="cover"
            onError={() => console.log('Image failed to load:', thumbnailUrl || imageUrl)}
            defaultSource={require('../assets/placeholder-meal.png')}
          />
        ) : (
          <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton}>
            <Ionicons name="camera" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
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
      <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}>
        <Ionicons name="trash" size={24} color="#cc0000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  calories: {
    fontSize: 14,
    color: '#666',
  },
  macros: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  macro: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
}); 