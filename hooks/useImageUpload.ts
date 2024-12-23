import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import React from 'react';
import { Platform, Alert } from 'react-native';
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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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
    console.log('uploadImage called with:', { pickedUri, foodId });

    if (!pickedUri || !foodId) {
      console.log('Missing URI or foodId:', { pickedUri, foodId });
      return null;
    }

    try {
      console.log('Fetching user data...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');
      console.log('User found:', user.id);

      const basePath = `${user.id}/${foodId}`;
      const timestamp = Date.now();

      console.log('Compressing images...');
      const [feedImage, thumbnail] = await Promise.all([
        compressImage(pickedUri, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.7,
        }),
        compressImage(pickedUri, {
          maxWidth: 300,
          maxHeight: 300,
          quality: 0.6,
        })
      ]);

      console.log('Reading base64...');
      const [feedBase64, thumbnailBase64] = await Promise.all([
        FileSystem.readAsStringAsync(feedImage, { encoding: FileSystem.EncodingType.Base64 }),
        FileSystem.readAsStringAsync(thumbnail, { encoding: FileSystem.EncodingType.Base64 }),
      ]);

      const fullPath = `${basePath}/full-${timestamp}.jpg`;
      const thumbPath = `${basePath}/thumb-${timestamp}.jpg`;
      console.log('Uploading to “food-images” bucket:', { fullPath, thumbPath });

      await Promise.all([
        supabase.storage.from('food-images').upload(fullPath, decode(feedBase64), {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        }),
        supabase.storage.from('food-images').upload(thumbPath, decode(thumbnailBase64), {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        }),
      ]);

      console.log('Retrieving public URLs...');
      const { data: { publicUrl: fullUrl } } = supabase
        .storage.from('food-images').getPublicUrl(fullPath);
      const { data: { publicUrl: thumbUrl } } = supabase
        .storage.from('food-images').getPublicUrl(thumbPath);
      console.log('URLs:', { fullUrl, thumbUrl });

      console.log('Updating DB “food_entries”...');
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

  const uploadImageDirect = async (fileUri: string, foodId: string) => {
    // 1. Prepare form data
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'uploaded.jpg',
    } as any);

    // 2. Upload with fetch if supabase-js doesn’t support direct file Uri
    const response = await fetch(
      `https://<your-supabase-api>/storage/v1/object/food-images/${foodId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer <token>`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );
    // 3. Check result, handle URLs, etc.
  };

  return {
    launchCamera,
    launchLibrary,
    uploadImage
  };
}; 