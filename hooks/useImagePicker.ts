// hooks/useImagePicker.ts
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

interface ImageAsset {
  uri: string;
  name: string;
  type: string;
}

interface UseImagePickerReturn {
  image: ImageAsset | null;
  pickImage: () => Promise<void>;
  clearImage: () => void;
  error: string | null;
}

export const useImagePicker = (): UseImagePickerReturn => {
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Permission to access gallery was denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const file: ImageAsset = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
        };
        setImage(file);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while picking image");
    }
  };

  const clearImage = () => {
    setImage(null);
    setError(null);
  };

  return { image, pickImage, clearImage, error };
};
