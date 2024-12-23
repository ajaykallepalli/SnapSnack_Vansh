import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabase';

interface MealCardProps {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
  imageUrl?: string;
  foodId: string;
  onImageUploaded?: (url: string) => void;
}

export const MealCard = ({ foodName, calories, protein, carbs, fat, time, imageUrl, foodId, onImageUploaded }: MealCardProps) => {
  const handleImageUpload = async () => {
    Alert.alert(
      "Add Photo",
      "Choose a photo source",
      [
        {
          text: "Camera",
          onPress: () => launchCamera()
        },
        {
          text: "Photo Library",
          onPress: () => launchLibrary()
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const launchLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!foodId) {
      console.error('No foodId provided');
      Alert.alert('Error', 'Missing meal identifier');
      return;
    }

    const file = {
      uri,
      name: `meals/${foodId}-${Date.now()}.jpg`,
      type: 'image/jpeg',
    };

    try {
      console.log('Starting image upload...', file);
      const response = await fetch(file.uri);
      console.log('Fetch response:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);
      
      try {
        const { data, error } = await supabase.storage
          .from('food-images')
          .upload(file.name, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        console.log('Upload successful:', data);

        const { data: { publicUrl } } = supabase.storage
          .from('food-images')
          .getPublicUrl(file.name);

        console.log('Public URL:', publicUrl);
        if (onImageUploaded) {
          await onImageUploaded(publicUrl);
        }
      } catch (uploadError) {
        console.error('Supabase error:', uploadError);
        throw uploadError;
      }
    } catch (error) {
      console.error('Detailed upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload image. Please try again.'
      );
    }
  };

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <TouchableOpacity onPress={handleImageUpload} style={styles.uploadButton}>
          <Ionicons name="add" size={24} color="#666" />
        </TouchableOpacity>
      )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
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