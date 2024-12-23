import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';
import { supabase } from '../utils/supabase';


export const useImageUpload = () => {
  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable camera access in your settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  };

  const launchLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable photo library access in your settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Library error:', error);
      Alert.alert('Error', 'Failed to select photo');
      return null;
    }
  };

  const getLocalUriIfNeeded = async (uri: string) => {
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      const localId = uri.replace('ph://', '');
      const assetInfo = await MediaLibrary.getAssetInfoAsync(localId);
      return assetInfo.localUri || uri;
    }
    return uri;
  };

  const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const compressImage = async (uri: string, options: { 
    maxWidth: number, 
    maxHeight: number, 
    quality: number 
  }) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: options.maxWidth, height: options.maxHeight } }],
      { compress: options.quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  };

  const uploadImage = async (pickedUri: string, foodId: string) => {
    if (!pickedUri || !foodId) {
      console.log('Missing URI or foodId:', { pickedUri, foodId });
      return null;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const basePath = `${user.id}/${foodId}`;
      const timestamp = Date.now();

      // Process images
      const fullImage = await compressImage(pickedUri, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8
      });
      
      const thumbnail = await compressImage(pickedUri, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.6
      });

      const [fullImageBase64, thumbnailBase64] = await Promise.all([
        FileSystem.readAsStringAsync(fullImage, { encoding: FileSystem.EncodingType.Base64 }),
        FileSystem.readAsStringAsync(thumbnail, { encoding: FileSystem.EncodingType.Base64 })
      ]);

      const fullPath = `${basePath}/full-${timestamp}.jpg`;
      const thumbPath = `${basePath}/thumb-${timestamp}.jpg`;

      // Upload both images
      await Promise.all([
        supabase.storage
          .from('food-images')
          .upload(fullPath, decode(fullImageBase64), {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          }),
        supabase.storage
          .from('food-images')
          .upload(thumbPath, decode(thumbnailBase64), {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          })
      ]);

      // Get public URLs
      const { data: { publicUrl: fullUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(fullPath);
        
      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(thumbPath);

      // Update food entry with public URLs
      const { error: updateError } = await supabase
        .from('food_entries')
        .update({ 
          image_url: fullUrl,
          thumbnail_url: thumbUrl,
          user_id: user.id
        })
        .eq('id', foodId);

      if (updateError) throw updateError;

      console.log('Successfully uploaded images and updated entry');
      return { fullUrl, thumbUrl };
    } catch (error) {
      console.error('Upload error details:', error);
      Alert.alert('Upload Failed', 'Please try again.');
      return null;
    }
  };

  return {
    launchCamera,
    launchLibrary,
    uploadImage
  };
}; 